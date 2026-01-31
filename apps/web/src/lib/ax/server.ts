/**
 * AX Server-side utilities
 * These functions run on the server and fetch data for the AX state provider
 */

import { db } from "@/lib/db"
import type { AXWorkspace, AXUser } from "./types"

export async function fetchAXWorkspaceData(userId: string): Promise<AXWorkspace> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Fetch all data in parallel
  const [
    projects,
    notes,
    notesByTag,
    untaggedNotes,
    calls,
    pendingBriefCalls,
    recentCalls,
    designSystems,
    blocks,
    patterns,
    queries,
  ] = await Promise.all([
    // Projects with blocker and task counts
    db.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { blockers: { where: { status: "ACTIVE" } } },
        },
        sprints: {
          include: {
            _count: {
              select: { tasks: true },
            },
            tasks: {
              select: { status: true },
            },
          },
        },
      },
    }),
    // Notes total
    db.note.count({ where: { userId } }),
    // Notes by tag (simplified - get all notes with tags that aren't empty)
    db.note.findMany({
      where: { userId, NOT: { tags: { equals: [] } } },
      select: { tags: true },
    }),
    // Untagged notes (tags = empty array)
    db.note.count({ where: { userId, tags: { equals: [] } } }),
    // Calls total
    db.call.count({ where: { userId } }),
    // Calls with summary not yet generated (no summary = pending brief)
    db.call.count({ where: { userId, summary: null } }),
    // Recent calls (last 7 days)
    db.call.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
    // Library counts
    db.designSystem.count({ where: { userId } }),
    db.libraryItem.count({ where: { userId, type: "BLOCK" } }),
    db.libraryItem.count({ where: { userId, type: "PATTERN" } }),
    db.libraryItem.count({ where: { userId, type: "QUERY" } }),
  ])

  // Process projects
  const mappedProjects = projects.map((p) => {
    const allTasks = p.sprints.flatMap((s) => s.tasks)
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter((t) => t.status === "COMPLETED").length
    const stuckTasks = allTasks.filter((t) => t.status === "BLOCKED").length

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      status: (p.status.toLowerCase() === "active"
        ? "active"
        : p.status.toLowerCase() === "paused"
          ? "paused"
          : "completed") as "active" | "paused" | "completed",
      lastActivity: p.updatedAt.toISOString(),
      hasBlockers: p._count.blockers > 0,
      blockerCount: p._count.blockers,
      taskCount: {
        total: totalTasks,
        completed: completedTasks,
        stuck: stuckTasks,
      },
    }
  })

  // Process tags - tags is Json type, cast to string[]
  const tagCounts: Record<string, number> = {}
  notesByTag.forEach((note) => {
    const tags = note.tags as string[] | null
    if (tags && Array.isArray(tags)) {
      tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    }
  })

  // Recent notes count
  const recentNotes = await db.note.count({
    where: { userId, updatedAt: { gte: sevenDaysAgo } },
  })

  return {
    projects: mappedProjects,
    inbox: {
      // We'll update this when we have actual inbox items
      pendingCount: 0,
      oldestItemAge: "0h",
      items: [],
    },
    notes: {
      total: notes,
      recentCount: recentNotes,
      untaggedCount: untaggedNotes,
      byTag: tagCounts,
    },
    calls: {
      total: calls,
      pendingBriefs: pendingBriefCalls,
      recentTranscripts: recentCalls,
    },
    library: {
      designSystems,
      blocks,
      patterns,
      queries,
    },
  }
}

export function buildAXUser(user: {
  id: string
  workingHoursStart: string | null
  workingHoursEnd: string | null
  theme?: string | null
  weekStartsOn?: number | null
}): AXUser {
  return {
    id: user.id,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    quietHours:
      user.workingHoursStart && user.workingHoursEnd
        ? null // Quiet hours are the inverse of working hours
        : null,
    preferences: {
      theme: user.theme || "dark",
      weekStartsOn: user.weekStartsOn || 1,
    },
  }
}
