"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { generateTimeEntryHash } from "@/lib/time-verification"
import { updatePresence } from "@/lib/presence"

export async function createTimeEntry(formData: FormData) {
  const user = await requireUser()

  const projectId = formData.get("projectId") as string
  const taskId = formData.get("taskId") as string | null
  const date = formData.get("date") as string
  const startTime = formData.get("startTime") as string
  const endTime = formData.get("endTime") as string
  const description = formData.get("description") as string | null
  const billable = formData.get("billable") === "true"

  if (!projectId || !date || !startTime || !endTime) {
    throw new Error("Project, date, start time, and end time are required")
  }

  // Verify project belongs to user
  const project = await db.project.findFirst({
    where: { id: projectId, userId: user.id },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  // Parse times
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)
  const dateObj = new Date(date)

  const start = new Date(dateObj)
  start.setHours(startHour, startMin, 0, 0)

  const end = new Date(dateObj)
  end.setHours(endHour, endMin, 0, 0)

  // Handle overnight entries
  if (end <= start) {
    end.setDate(end.getDate() + 1)
  }

  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000)

  if (durationMinutes <= 0) {
    throw new Error("End time must be after start time")
  }

  // Generate verification hash for provably fair time tracking
  const verificationHash = generateTimeEntryHash({
    userId: user.id,
    projectId,
    startTime: start,
    endTime: end,
    durationMinutes,
    description: description || null,
    taskId: taskId || null,
  })

  await db.timeEntry.create({
    data: {
      userId: user.id,
      projectId,
      taskId: taskId || null,
      startTime: start,
      endTime: end,
      durationMinutes,
      source: "MANUAL",
      description: description || null,
      billable,
      verificationHash,
    },
  })

  // Update presence (user is actively working)
  updatePresence({
    userId: user.id,
    projectId,
    area: "Time Tracking",
    taskId: taskId || null,
  }).catch(console.error) // Fire and forget

  // Update task actual hours if linked
  if (taskId) {
    const existingEntries = await db.timeEntry.aggregate({
      where: { taskId },
      _sum: { durationMinutes: true },
    })
    const totalMinutes = existingEntries._sum.durationMinutes || 0
    await db.task.update({
      where: { id: taskId },
      data: { actualHours: totalMinutes / 60 },
    })
  }

  revalidatePath("/time")
  revalidatePath("/dashboard")
  revalidatePath(`/projects/${project.slug}`)
}

export async function updateTimeEntry(entryId: string, formData: FormData) {
  const user = await requireUser()

  const projectId = formData.get("projectId") as string
  const taskId = formData.get("taskId") as string | null
  const date = formData.get("date") as string
  const startTime = formData.get("startTime") as string
  const endTime = formData.get("endTime") as string
  const description = formData.get("description") as string | null
  const billable = formData.get("billable") === "true"

  const entry = await db.timeEntry.findUnique({
    where: { id: entryId },
    include: { project: true },
  })

  if (!entry || entry.userId !== user.id) {
    throw new Error("Time entry not found")
  }

  // Parse times
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)
  const dateObj = new Date(date)

  const start = new Date(dateObj)
  start.setHours(startHour, startMin, 0, 0)

  const end = new Date(dateObj)
  end.setHours(endHour, endMin, 0, 0)

  if (end <= start) {
    end.setDate(end.getDate() + 1)
  }

  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000)

  // Regenerate verification hash on update
  const verificationHash = generateTimeEntryHash({
    userId: user.id,
    projectId,
    startTime: start,
    endTime: end,
    durationMinutes,
    description: description || null,
    taskId: taskId || null,
  })

  await db.timeEntry.update({
    where: { id: entryId },
    data: {
      projectId,
      taskId: taskId || null,
      startTime: start,
      endTime: end,
      durationMinutes,
      description: description || null,
      billable,
      verificationHash,
      // Clear anchoring data since entry was modified
      anchoredAt: null,
      anchorTxHash: null,
      merkleProof: [],
    },
  })

  // Update presence
  updatePresence({
    userId: user.id,
    projectId,
    area: "Time Tracking",
    taskId: taskId || null,
  }).catch(console.error)

  revalidatePath("/time")
  revalidatePath("/dashboard")
}

export async function deleteTimeEntry(entryId: string) {
  const user = await requireUser()

  const entry = await db.timeEntry.findUnique({
    where: { id: entryId },
    include: { project: true },
  })

  if (!entry || entry.userId !== user.id) {
    throw new Error("Time entry not found")
  }

  await db.timeEntry.delete({
    where: { id: entryId },
  })

  revalidatePath("/time")
  revalidatePath("/dashboard")
  revalidatePath(`/projects/${entry.project.slug}`)
}

export async function toggleBillable(entryId: string) {
  const user = await requireUser()

  const entry = await db.timeEntry.findUnique({
    where: { id: entryId },
  })

  if (!entry || entry.userId !== user.id) {
    throw new Error("Time entry not found")
  }

  await db.timeEntry.update({
    where: { id: entryId },
    data: { billable: !entry.billable },
  })

  revalidatePath("/time")
}

// Quick time entry - simplified for keyboard shortcut usage
export async function quickCreateTimeEntry(data: {
  projectId: string
  taskId?: string | null
  durationMinutes: number
  description?: string | null
}) {
  const user = await requireUser()

  const { projectId, taskId, durationMinutes, description } = data

  if (!projectId || durationMinutes <= 0) {
    throw new Error("Project and duration are required")
  }

  // Verify project belongs to user
  const project = await db.project.findFirst({
    where: { id: projectId, userId: user.id },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  // Calculate times: entry ends "now", started durationMinutes ago
  const endTime = new Date()
  const startTime = new Date(endTime.getTime() - durationMinutes * 60 * 1000)

  // Generate verification hash
  const verificationHash = generateTimeEntryHash({
    userId: user.id,
    projectId,
    startTime,
    endTime,
    durationMinutes,
    description: description || null,
    taskId: taskId || null,
  })

  await db.timeEntry.create({
    data: {
      userId: user.id,
      projectId,
      taskId: taskId || null,
      startTime,
      endTime,
      durationMinutes,
      source: "MANUAL",
      description: description || null,
      billable: true,
      verificationHash,
    },
  })

  // Update presence
  updatePresence({
    userId: user.id,
    projectId,
    area: "Time Tracking",
    taskId: taskId || null,
  }).catch(console.error)

  // Update task actual hours if linked
  if (taskId) {
    const existingEntries = await db.timeEntry.aggregate({
      where: { taskId },
      _sum: { durationMinutes: true },
    })
    const totalMinutes = existingEntries._sum.durationMinutes || 0
    await db.task.update({
      where: { id: taskId },
      data: { actualHours: totalMinutes / 60 },
    })
  }

  revalidatePath("/time")
  revalidatePath("/dashboard")
  revalidatePath(`/projects/${project.slug}`)

  return { success: true, projectName: project.name }
}

// Get recent projects and their in-progress tasks for quick selection
export async function getQuickTimeEntryData() {
  const user = await requireUser()

  const projects = await db.project.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })

  // Get in-progress tasks across all projects
  const inProgressTasks = await db.task.findMany({
    where: {
      status: "IN_PROGRESS",
      sprint: { project: { userId: user.id } },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      sprint: {
        select: {
          project: {
            select: { id: true, name: true },
          },
        },
      },
    },
  })

  return { projects, inProgressTasks }
}
