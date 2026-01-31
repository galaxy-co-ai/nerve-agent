/**
 * AX Server-side utilities
 * These functions run on the server and fetch data for the AX state provider
 */

import { db } from "@/lib/db"
import type { AXWorkspace, AXUser, AXStalenessOverview } from "./types"
import { computeStaleness, computeAgeInDays } from "./staleness"
import { buildRelationshipMap, type AXRelationshipMap } from "./relationships"

export interface AXExtendedData {
  workspace: AXWorkspace
  staleness: AXStalenessOverview
  relationships: AXRelationshipMap
}

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

/**
 * Fetch extended AX data including staleness and relationships
 */
export async function fetchAXExtendedData(userId: string): Promise<AXExtendedData> {
  const workspace = await fetchAXWorkspaceData(userId)
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

  // Fetch additional data for staleness and relationships
  const [
    blockersWithTasks,
    stuckTasks,
    allProjects,
    allNotes,
    allCalls,
  ] = await Promise.all([
    // Blockers with blocked tasks
    db.blocker.findMany({
      where: { project: { userId }, status: "ACTIVE" },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        tasks: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    // Stuck tasks (IN_PROGRESS for 3+ days)
    db.task.findMany({
      where: {
        sprint: { project: { userId } },
        status: "IN_PROGRESS",
        updatedAt: { lt: threeDaysAgo },
      },
      include: {
        sprint: { include: { project: { select: { id: true, name: true, slug: true } } } },
      },
    }),
    // All projects for relationship mapping
    db.project.findMany({
      where: { userId },
      select: { id: true, name: true, slug: true, updatedAt: true },
    }),
    // All notes for relationship mapping
    db.note.findMany({
      where: { userId },
      select: { id: true, title: true, projectId: true, updatedAt: true },
    }),
    // All calls for relationship mapping
    db.call.findMany({
      where: { userId },
      select: { id: true, title: true, projectId: true, createdAt: true },
    }),
  ])

  // Compute staleness overview
  let freshCount = 0
  let agingCount = 0
  let staleCount = 0
  let criticalCount = 0
  const criticalItems: AXStalenessOverview["criticalItems"] = []

  // Check projects
  for (const project of workspace.projects) {
    const staleness = computeStaleness(new Date(project.lastActivity), {
      hasBlockers: project.hasBlockers,
    })
    switch (staleness.staleLevel) {
      case "fresh":
        freshCount++
        break
      case "aging":
        agingCount++
        break
      case "stale":
        staleCount++
        break
      case "critical":
        criticalCount++
        criticalItems.push({
          type: "project",
          id: project.id,
          title: project.name,
          ageInDays: staleness.ageInDays,
          reason: staleness.attentionReason || "Not updated in 14+ days",
        })
        break
    }
  }

  // Check blockers
  for (const blocker of blockersWithTasks) {
    const ageInDays = computeAgeInDays(blocker.createdAt)
    if (ageInDays >= 14) {
      criticalCount++
      criticalItems.push({
        type: "blocker",
        id: blocker.id,
        title: blocker.title,
        ageInDays,
        reason: `Active blocker for ${ageInDays} days`,
      })
    } else if (ageInDays >= 5) {
      staleCount++
    } else if (ageInDays >= 2) {
      agingCount++
    } else {
      freshCount++
    }
  }

  // Find oldest unresolved blocker
  const oldestUnresolvedBlocker =
    blockersWithTasks.length > 0
      ? {
          id: blockersWithTasks[0].id,
          title: blockersWithTasks[0].title,
          projectName: blockersWithTasks[0].project.name,
          ageInDays: computeAgeInDays(blockersWithTasks[0].createdAt),
        }
      : null

  // Map stuck tasks
  const stuckTasksList: AXStalenessOverview["stuckTasks"] = stuckTasks.map((task) => ({
    id: task.id,
    title: task.title,
    projectName: task.sprint.project.name,
    stuckDays: computeAgeInDays(task.updatedAt),
  }))

  // Build relationship map
  const relationships = buildRelationshipMap({
    projects: allProjects,
    tasks: stuckTasks.map((t) => ({
      id: t.id,
      title: t.title,
      projectId: t.sprint.project.id,
      sprintId: t.sprintId,
      updatedAt: t.updatedAt,
    })),
    blockers: blockersWithTasks.map((b) => ({
      id: b.id,
      title: b.title,
      projectId: b.projectId,
      tasks: b.tasks,
      createdAt: b.createdAt,
    })),
    notes: allNotes,
    calls: allCalls,
  })

  return {
    workspace,
    staleness: {
      freshCount,
      agingCount,
      staleCount,
      criticalCount,
      criticalItems,
      oldestUnresolvedBlocker,
      stuckTasks: stuckTasksList,
    },
    relationships,
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
