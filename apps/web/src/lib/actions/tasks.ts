"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { createTaskSchema, completeTaskWithExtrasSchema } from "@/lib/validations"

export async function createTask(
  projectSlug: string,
  sprintNumber: number,
  formData: FormData
) {
  const user = await requireUser()

  // Validate input
  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    estimatedHours: formData.get("estimatedHours"),
    category: formData.get("category"),
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { title, description, estimatedHours, category } = parsed.data

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
      estimatedHours,
      category: category || null,
    },
  })

  // Update sprint's estimated hours
  const allTasks = await db.task.findMany({
    where: { sprintId: sprint.id },
  })

  const totalEstimated = allTasks.reduce(
    (sum, task) => sum + Number(task.estimatedHours),
    estimatedHours
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
  revalidatePath("/dashboard")
}

// Quick complete helper
export async function completeTask(taskId: string) {
  return updateTaskStatus(taskId, "COMPLETED")
}

// Complete task with extras: log time, add notes, start next task
export async function completeTaskWithExtras(data: {
  taskId: string
  projectId: string
  durationMinutes?: number
  notes?: string
  startNextTaskId?: string
}) {
  const user = await requireUser()

  // Validate input
  const parsed = completeTaskWithExtrasSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { taskId, projectId, durationMinutes, notes, startNextTaskId } = parsed.data

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

  // 1. Complete the task
  await db.task.update({
    where: { id: taskId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      description: notes
        ? `${task.description || ""}\n\n---\nCompletion notes:\n${notes}`.trim()
        : task.description,
    },
  })

  // 2. Log time if provided
  if (durationMinutes && durationMinutes > 0) {
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - durationMinutes * 60 * 1000)

    await db.timeEntry.create({
      data: {
        userId: user.id,
        projectId,
        taskId,
        startTime,
        endTime,
        durationMinutes,
        source: "MANUAL",
        description: `Completed: ${task.title}`,
        billable: true,
      },
    })

    // Update task actual hours
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

  // 3. Start next task if provided
  if (startNextTaskId) {
    const nextTask = await db.task.findUnique({
      where: { id: startNextTaskId },
      include: {
        sprint: {
          include: { project: true },
        },
      },
    })

    if (nextTask && nextTask.sprint.project.userId === user.id) {
      await db.task.update({
        where: { id: startNextTaskId },
        data: { status: "IN_PROGRESS" },
      })

      const nextProjectSlug = nextTask.sprint.project.slug
      const nextSprintNumber = nextTask.sprint.number
      revalidatePath(`/projects/${nextProjectSlug}`)
      revalidatePath(`/projects/${nextProjectSlug}/sprints/${nextSprintNumber}`)
    }
  }

  const projectSlug = task.sprint.project.slug
  const sprintNumber = task.sprint.number

  revalidatePath(`/projects/${projectSlug}`)
  revalidatePath(`/projects/${projectSlug}/sprints/${sprintNumber}`)
  revalidatePath("/sprints")
  revalidatePath("/dashboard")
  revalidatePath("/time")
}

// Get the next TODO task in the same sprint
export async function getNextTaskInSprint(taskId: string) {
  const user = await requireUser()

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      sprint: {
        include: {
          project: true,
          tasks: {
            where: { status: "TODO" },
            orderBy: { order: "asc" },
            take: 1,
          },
        },
      },
    },
  })

  if (!task || task.sprint.project.userId !== user.id) {
    return null
  }

  const nextTask = task.sprint.tasks[0]
  if (!nextTask) return null

  return {
    id: nextTask.id,
    title: nextTask.title,
    sprint: {
      number: task.sprint.number,
      project: {
        id: task.sprint.project.id,
        name: task.sprint.project.name,
        slug: task.sprint.project.slug,
      },
    },
  }
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
