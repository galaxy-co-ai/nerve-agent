"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

export async function createTask(
  projectSlug: string,
  sprintNumber: number,
  formData: FormData
) {
  const user = await requireUser()

  const title = formData.get("title") as string
  const description = formData.get("description") as string | null
  const estimatedHours = formData.get("estimatedHours") as string
  const category = formData.get("category") as string | null

  if (!title || !estimatedHours) {
    throw new Error("Title and estimated hours are required")
  }

  const project = await db.project.findFirst({
    where: { slug: projectSlug, userId: user.id },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  const sprint = await db.sprint.findUnique({
    where: {
      projectId_number: {
        projectId: project.id,
        number: sprintNumber,
      },
    },
    include: {
      tasks: {
        orderBy: { order: "desc" },
        take: 1,
      },
    },
  })

  if (!sprint) {
    throw new Error("Sprint not found")
  }

  // Get next task order
  const nextOrder = sprint.tasks.length > 0 ? sprint.tasks[0].order + 1 : 1

  await db.task.create({
    data: {
      sprintId: sprint.id,
      title,
      description: description || null,
      order: nextOrder,
      estimatedHours: parseFloat(estimatedHours),
      category: category || null,
    },
  })

  // Update sprint's estimated hours
  const allTasks = await db.task.findMany({
    where: { sprintId: sprint.id },
  })

  const totalEstimated = allTasks.reduce(
    (sum, task) => sum + Number(task.estimatedHours),
    parseFloat(estimatedHours)
  )

  await db.sprint.update({
    where: { id: sprint.id },
    data: { estimatedHours: totalEstimated },
  })

  revalidatePath(`/projects/${projectSlug}`)
  revalidatePath(`/projects/${projectSlug}/sprints/${sprintNumber}`)
}

export async function updateTask(taskId: string, formData: FormData) {
  const user = await requireUser()

  const title = formData.get("title") as string
  const description = formData.get("description") as string | null
  const estimatedHours = formData.get("estimatedHours") as string
  const category = formData.get("category") as string | null
  const status = formData.get("status") as string | null

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      sprint: {
        include: {
          project: true,
        },
      },
    },
  })

  if (!task || task.sprint.project.userId !== user.id) {
    throw new Error("Task not found")
  }

  const updateData: Record<string, unknown> = {
    title: title || task.title,
    description: description ?? task.description,
    estimatedHours: estimatedHours ? parseFloat(estimatedHours) : task.estimatedHours,
    category: category ?? task.category,
  }

  if (status) {
    updateData.status = status as any
    if (status === "COMPLETED" && !task.completedAt) {
      updateData.completedAt = new Date()
    }
  }

  await db.task.update({
    where: { id: taskId },
    data: updateData,
  })

  const projectSlug = task.sprint.project.slug
  const sprintNumber = task.sprint.number

  revalidatePath(`/projects/${projectSlug}`)
  revalidatePath(`/projects/${projectSlug}/sprints/${sprintNumber}`)
}

export async function updateTaskStatus(taskId: string, status: string) {
  const user = await requireUser()

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      sprint: {
        include: {
          project: true,
        },
      },
    },
  })

  if (!task || task.sprint.project.userId !== user.id) {
    throw new Error("Task not found")
  }

  const updateData: Record<string, unknown> = {
    status: status as any,
  }

  if (status === "COMPLETED" && !task.completedAt) {
    updateData.completedAt = new Date()
  }

  await db.task.update({
    where: { id: taskId },
    data: updateData,
  })

  const projectSlug = task.sprint.project.slug
  const sprintNumber = task.sprint.number

  revalidatePath(`/projects/${projectSlug}`)
  revalidatePath(`/projects/${projectSlug}/sprints/${sprintNumber}`)
  revalidatePath("/sprints")
}

export async function deleteTask(taskId: string) {
  const user = await requireUser()

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      sprint: {
        include: {
          project: true,
        },
      },
    },
  })

  if (!task || task.sprint.project.userId !== user.id) {
    throw new Error("Task not found")
  }

  await db.task.delete({
    where: { id: taskId },
  })

  const projectSlug = task.sprint.project.slug
  const sprintNumber = task.sprint.number

  revalidatePath(`/projects/${projectSlug}`)
  revalidatePath(`/projects/${projectSlug}/sprints/${sprintNumber}`)
}

export async function reorderTask(taskId: string, newOrder: number) {
  const user = await requireUser()

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      sprint: {
        include: {
          project: true,
        },
      },
    },
  })

  if (!task || task.sprint.project.userId !== user.id) {
    throw new Error("Task not found")
  }

  await db.task.update({
    where: { id: taskId },
    data: { order: newOrder },
  })

  const projectSlug = task.sprint.project.slug
  const sprintNumber = task.sprint.number

  revalidatePath(`/projects/${projectSlug}/sprints/${sprintNumber}`)
}
