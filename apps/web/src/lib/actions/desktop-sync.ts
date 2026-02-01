"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import type { TaskStatus, TimeSource } from "@prisma/client"

// ============================================================================
// Types for Desktop Sync
// ============================================================================

interface TimeEntrySyncInput {
  id?: string // Desktop-generated ID for deduplication
  projectId: string
  taskId?: string
  startTime: Date
  endTime?: Date
  durationMinutes: number
  source: TimeSource
  appName?: string
  windowTitle?: string
  description?: string
  billable?: boolean
}

interface TaskSyncInput {
  id: string // Task ID from web
  status?: TaskStatus
  actualHours?: number
  completedAt?: Date
}

interface ActivityEventInput {
  projectId?: string
  eventType: string
  title: string
  description?: string
  metadata?: Record<string, unknown>
  occurredAt?: Date
}

// ============================================================================
// Auth Helper for Desktop
// ============================================================================

async function requireDesktopAuth(authToken: string) {
  const device = await db.desktopDevice.findUnique({
    where: { authToken },
    include: { user: true },
  })

  if (!device) {
    throw new Error("Invalid auth token")
  }

  // Update last seen
  await db.desktopDevice.update({
    where: { id: device.id },
    data: { lastSeenAt: new Date() },
  })

  return { device, user: device.user }
}

// ============================================================================
// Time Entry Sync
// ============================================================================

export async function syncTimeEntries(authToken: string, entries: TimeEntrySyncInput[]) {
  const { user } = await requireDesktopAuth(authToken)

  const results: { created: number; updated: number; errors: string[] } = {
    created: 0,
    updated: 0,
    errors: [],
  }

  for (const entry of entries) {
    try {
      // Verify project belongs to user
      const project = await db.project.findFirst({
        where: { id: entry.projectId, userId: user.id },
      })

      if (!project) {
        results.errors.push(`Project ${entry.projectId} not found`)
        continue
      }

      // Verify task if provided
      if (entry.taskId) {
        const task = await db.task.findFirst({
          where: { id: entry.taskId },
          include: { sprint: { include: { project: true } } },
        })

        if (!task || task.sprint.project.userId !== user.id) {
          results.errors.push(`Task ${entry.taskId} not found`)
          continue
        }
      }

      // Check if entry with this desktop ID already exists (for deduplication)
      if (entry.id) {
        const existing = await db.timeEntry.findFirst({
          where: {
            userId: user.id,
            projectId: entry.projectId,
            startTime: entry.startTime,
            source: "AUTO",
          },
        })

        if (existing) {
          // Update existing entry
          await db.timeEntry.update({
            where: { id: existing.id },
            data: {
              endTime: entry.endTime || existing.endTime,
              durationMinutes: entry.durationMinutes,
              appName: entry.appName ?? existing.appName,
              windowTitle: entry.windowTitle ?? existing.windowTitle,
            },
          })
          results.updated++
          continue
        }
      }

      // Create new entry
      await db.timeEntry.create({
        data: {
          userId: user.id,
          projectId: entry.projectId,
          taskId: entry.taskId || null,
          startTime: entry.startTime,
          endTime: entry.endTime || null,
          durationMinutes: entry.durationMinutes,
          source: entry.source,
          appName: entry.appName || null,
          windowTitle: entry.windowTitle || null,
          description: entry.description || null,
          billable: entry.billable ?? true,
        },
      })
      results.created++

      // Update task actual hours if linked
      if (entry.taskId) {
        const totalMinutes = await db.timeEntry.aggregate({
          where: { taskId: entry.taskId },
          _sum: { durationMinutes: true },
        })

        await db.task.update({
          where: { id: entry.taskId },
          data: {
            actualHours: (totalMinutes._sum.durationMinutes || 0) / 60,
          },
        })
      }
    } catch (error) {
      results.errors.push(`Error syncing entry: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  // Record activity event for sync
  if (results.created > 0 || results.updated > 0) {
    await recordActivityEvent(authToken, {
      eventType: "TIME_SYNCED",
      title: `Synced ${results.created + results.updated} time entries`,
      description: `Created: ${results.created}, Updated: ${results.updated}`,
      metadata: results,
    })
  }

  revalidatePath("/dashboard")
  return results
}

// ============================================================================
// Task Sync
// ============================================================================

export async function syncTasks(authToken: string, tasks: TaskSyncInput[]) {
  const { user } = await requireDesktopAuth(authToken)

  const results: { updated: number; errors: string[] } = {
    updated: 0,
    errors: [],
  }

  for (const taskUpdate of tasks) {
    try {
      // Verify task belongs to user's project
      const task = await db.task.findFirst({
        where: { id: taskUpdate.id },
        include: { sprint: { include: { project: true } } },
      })

      if (!task || task.sprint.project.userId !== user.id) {
        results.errors.push(`Task ${taskUpdate.id} not found or not authorized`)
        continue
      }

      const updateData: Record<string, unknown> = {}

      if (taskUpdate.status) {
        updateData.status = taskUpdate.status
      }

      if (taskUpdate.actualHours !== undefined) {
        updateData.actualHours = taskUpdate.actualHours
      }

      if (taskUpdate.completedAt) {
        updateData.completedAt = taskUpdate.completedAt
      } else if (taskUpdate.status === "COMPLETED" && !task.completedAt) {
        updateData.completedAt = new Date()
      }

      await db.task.update({
        where: { id: taskUpdate.id },
        data: updateData,
      })

      results.updated++

      // Record activity if task was completed
      if (taskUpdate.status === "COMPLETED" && task.status !== "COMPLETED") {
        await recordActivityEvent(authToken, {
          projectId: task.sprint.projectId,
          eventType: "TASK_COMPLETED",
          title: `Completed: ${task.title}`,
          metadata: { taskId: task.id, sprintId: task.sprintId },
        })
      }
    } catch (error) {
      results.errors.push(`Error syncing task ${taskUpdate.id}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/projects")
  return results
}

// ============================================================================
// Activity Events
// ============================================================================

export async function recordActivityEvent(authToken: string, event: ActivityEventInput) {
  const { device, user } = await requireDesktopAuth(authToken)

  // Verify project if provided
  if (event.projectId) {
    const project = await db.project.findFirst({
      where: { id: event.projectId, userId: user.id },
    })

    if (!project) {
      throw new Error("Project not found")
    }
  }

  const activityEvent = await db.activityEvent.create({
    data: {
      userId: user.id,
      projectId: event.projectId || null,
      deviceId: device.id,
      eventType: event.eventType,
      title: event.title,
      description: event.description || null,
      metadata: event.metadata ? JSON.parse(JSON.stringify(event.metadata)) : undefined,
      occurredAt: event.occurredAt || new Date(),
    },
  })

  // Don't revalidate for every activity event - too noisy
  return activityEvent
}

export async function recordBulkActivityEvents(authToken: string, events: ActivityEventInput[]) {
  const { device, user } = await requireDesktopAuth(authToken)

  const results: { created: number; errors: string[] } = {
    created: 0,
    errors: [],
  }

  for (const event of events) {
    try {
      // Verify project if provided
      if (event.projectId) {
        const project = await db.project.findFirst({
          where: { id: event.projectId, userId: user.id },
        })

        if (!project) {
          results.errors.push(`Project ${event.projectId} not found`)
          continue
        }
      }

      await db.activityEvent.create({
        data: {
          userId: user.id,
          projectId: event.projectId || null,
          deviceId: device.id,
          eventType: event.eventType,
          title: event.title,
          description: event.description || null,
          metadata: event.metadata ? JSON.parse(JSON.stringify(event.metadata)) : undefined,
          occurredAt: event.occurredAt || new Date(),
        },
      })

      results.created++
    } catch (error) {
      results.errors.push(`Error creating event: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return results
}

// ============================================================================
// Sync Status & Queries
// ============================================================================

export async function getSyncStatus(authToken: string) {
  const { device, user } = await requireDesktopAuth(authToken)

  // Get latest sync info
  const [latestTimeEntry, latestActivity, projectCount] = await Promise.all([
    db.timeEntry.findFirst({
      where: { userId: user.id, source: "AUTO" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    db.activityEvent.findFirst({
      where: { userId: user.id, deviceId: device.id },
      orderBy: { occurredAt: "desc" },
      select: { occurredAt: true },
    }),
    db.project.count({
      where: { userId: user.id, status: "ACTIVE" },
    }),
  ])

  return {
    deviceId: device.deviceId,
    deviceName: device.name,
    lastSeenAt: device.lastSeenAt,
    lastTimeSync: latestTimeEntry?.createdAt || null,
    lastActivitySync: latestActivity?.occurredAt || null,
    activeProjects: projectCount,
  }
}

export async function getProjectsForDesktop(authToken: string) {
  const { user } = await requireDesktopAuth(authToken)

  return db.project.findMany({
    where: {
      userId: user.id,
      status: { in: ["ACTIVE", "PLANNING"] },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      clientName: true,
      hourlyRate: true,
      localDirectory: {
        select: {
          localPath: true,
          lastSyncedAt: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getActiveTasksForDesktop(authToken: string, projectId?: string) {
  const { user } = await requireDesktopAuth(authToken)

  return db.task.findMany({
    where: {
      sprint: {
        project: {
          userId: user.id,
          ...(projectId && { id: projectId }),
        },
        status: "IN_PROGRESS",
      },
      status: { in: ["TODO", "IN_PROGRESS"] },
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      estimatedHours: true,
      actualHours: true,
      sprint: {
        select: {
          id: true,
          number: true,
          name: true,
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: [
      { status: "asc" }, // IN_PROGRESS first
      { order: "asc" },
    ],
  })
}

// ============================================================================
// Full Project Sync (Desktop pulls full state)
// ============================================================================

export async function getFullProjectSync(authToken: string, projectId: string) {
  const { user } = await requireDesktopAuth(authToken)

  const project = await db.project.findFirst({
    where: { id: projectId, userId: user.id },
    include: {
      sprints: {
        include: {
          tasks: true,
        },
        orderBy: { number: "asc" },
      },
      blockers: {
        where: { status: "ACTIVE" },
      },
      followUps: {
        where: { status: { in: ["SUGGESTED", "SCHEDULED", "PENDING"] } },
      },
      deliverables: {
        orderBy: { sortOrder: "asc" },
      },
      localDirectory: true,
    },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  return project
}

// ============================================================================
// Notes for Desktop
// ============================================================================

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function getNotesForDesktop(authToken: string) {
  const { user } = await requireDesktopAuth(authToken)

  return db.note.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      projectId: true,
      folderId: true,
      tags: true,
      isPinned: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy: [
      { isPinned: "desc" },
      { updatedAt: "desc" },
    ],
    take: 100, // Limit for desktop sync
  })
}

export async function createNoteForDesktop(
  authToken: string,
  data: { title: string; content: string; projectId?: string }
) {
  const { user } = await requireDesktopAuth(authToken)

  // Generate unique slug
  const baseSlug = generateSlug(data.title)
  let slug = baseSlug
  let counter = 1

  while (await db.note.findFirst({ where: { userId: user.id, slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  const note = await db.note.create({
    data: {
      userId: user.id,
      title: data.title,
      slug,
      content: data.content,
      projectId: data.projectId || null,
    },
  })

  return note
}

export async function updateNoteForDesktop(
  authToken: string,
  noteId: string,
  data: { title?: string; content?: string; projectId?: string | null }
) {
  const { user } = await requireDesktopAuth(authToken)

  const note = await db.note.findFirst({
    where: { id: noteId, userId: user.id },
  })

  if (!note) {
    throw new Error("Note not found")
  }

  // Generate new slug if title changed
  let newSlug = note.slug
  if (data.title && data.title !== note.title) {
    const baseSlug = generateSlug(data.title)
    newSlug = baseSlug
    let counter = 1

    while (await db.note.findFirst({ where: { userId: user.id, slug: newSlug, id: { not: note.id } } })) {
      newSlug = `${baseSlug}-${counter}`
      counter++
    }
  }

  const updated = await db.note.update({
    where: { id: note.id },
    data: {
      ...(data.title ? { title: data.title, slug: newSlug } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.projectId !== undefined ? { projectId: data.projectId } : {}),
    },
  })

  return updated
}

// ============================================================================
// Time Entries for Desktop (GET)
// ============================================================================

export async function getTimeEntriesForDesktop(authToken: string, options?: {
  projectId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
}) {
  const { user } = await requireDesktopAuth(authToken)

  const where: Record<string, unknown> = { userId: user.id }

  if (options?.projectId) {
    where.projectId = options.projectId
  }

  if (options?.startDate || options?.endDate) {
    where.startTime = {}
    if (options.startDate) {
      (where.startTime as Record<string, unknown>).gte = options.startDate
    }
    if (options.endDate) {
      (where.startTime as Record<string, unknown>).lte = options.endDate
    }
  }

  return db.timeEntry.findMany({
    where,
    select: {
      id: true,
      projectId: true,
      taskId: true,
      startTime: true,
      endTime: true,
      durationMinutes: true,
      source: true,
      appName: true,
      windowTitle: true,
      description: true,
      billable: true,
    },
    orderBy: { startTime: "desc" },
    take: options?.limit || 100,
  })
}

// ============================================================================
// Task Update for Desktop (single task)
// ============================================================================

export async function updateTaskForDesktop(
  authToken: string,
  taskId: string,
  data: { status?: TaskStatus; actualHours?: number }
) {
  const { user } = await requireDesktopAuth(authToken)

  // Verify task belongs to user's project
  const task = await db.task.findFirst({
    where: { id: taskId },
    include: { sprint: { include: { project: true } } },
  })

  if (!task || task.sprint.project.userId !== user.id) {
    throw new Error("Task not found or not authorized")
  }

  const updateData: Record<string, unknown> = {}

  if (data.status) {
    updateData.status = data.status
    if (data.status === "COMPLETED" && !task.completedAt) {
      updateData.completedAt = new Date()
    }
  }

  if (data.actualHours !== undefined) {
    updateData.actualHours = data.actualHours
  }

  const updated = await db.task.update({
    where: { id: taskId },
    data: updateData,
    select: {
      id: true,
      title: true,
      status: true,
      estimatedHours: true,
      actualHours: true,
      sprint: {
        select: {
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  })

  return updated
}
