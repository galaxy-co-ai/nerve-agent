// @ts-nocheck
// TODO: Fix type - description null handling
import { db } from "@/lib/db"
import {
  getEstimateAccuracy,
  getVelocityTrend,
  getCommunicationHealth,
  getPatternsForDisplay,
} from "./memory"

// =============================================================================
// Context Builder
// Gathers user state for the agent to understand the current situation
// Enhanced with estimate accuracy, velocity trends, and communication health
// =============================================================================

export interface AgentContext {
  user: {
    id: string
    name: string
    email: string
    timezone: string
    workingHoursStart: string
    workingHoursEnd: string
    preferredStyle: string
  }
  projects: {
    id: string
    name: string
    slug: string
    clientName: string
    status: string
    phase: string
    activeSprint: string | null
    blockerCount: number
    taskCount: number
  }[]
  blockers: {
    id: string
    title: string
    description: string
    projectName: string
    waitingOn: string
    createdAt: Date
    daysSinceCreated: number
  }[]
  stuckTasks: {
    id: string
    title: string
    projectName: string
    sprintName: string
    daysSinceUpdate: number
  }[]
  recentActivity: {
    type: string
    description: string
    timestamp: Date
  }[]
  stats: {
    totalProjects: number
    activeBlockers: number
    inProgressTasks: number
    completedTasksThisWeek: number
  }

  // Enhanced context (new)
  estimateAccuracy: {
    averageOverrun: number
    recentMisses: number
    hasData: boolean
  }
  velocityTrend: {
    thisWeek: number
    lastWeek: number
    trend: "up" | "down" | "stable"
  }
  communicationHealth: {
    daysSinceLastClientUpdate: Record<string, number>
    pendingFollowUps: number
    projectsNeedingUpdate: string[]
  }
  learnedPatterns: string[]
}

export async function buildAgentContext(userId: string): Promise<AgentContext> {
  const now = new Date()
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Fetch user with preferences
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      agentPreferences: true,
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  // Fetch projects with counts
  const projects = await db.project.findMany({
    where: { userId, status: { in: ["ACTIVE", "PLANNING"] } },
    include: {
      sprints: {
        where: { status: "IN_PROGRESS" },
        take: 1,
      },
      _count: {
        select: {
          blockers: { where: { status: "ACTIVE" } },
          sprints: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  // Fetch active blockers with age
  const blockers = await db.blocker.findMany({
    where: {
      status: "ACTIVE",
      project: { userId },
    },
    include: {
      project: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  // Fetch stuck tasks (in_progress for > 2 days with no time logged)
  const stuckTasks = await db.task.findMany({
    where: {
      status: "IN_PROGRESS",
      updatedAt: { lt: threeDaysAgo },
      sprint: { project: { userId } },
    },
    include: {
      sprint: {
        include: {
          project: { select: { name: true } },
        },
      },
    },
    take: 10,
  })

  // Count in-progress tasks
  const inProgressCount = await db.task.count({
    where: {
      status: "IN_PROGRESS",
      sprint: { project: { userId } },
    },
  })

  // Count completed tasks this week
  const completedThisWeek = await db.task.count({
    where: {
      status: "COMPLETED",
      completedAt: { gte: weekAgo },
      sprint: { project: { userId } },
    },
  })

  // Fetch enhanced context data in parallel
  const [estimateData, velocityData, commHealthData, learnedPatterns] =
    await Promise.all([
      getEstimateAccuracy(userId).catch(() => ({
        averageOverrun: 0,
        recentMisses: 0,
        calibrations: [],
      })),
      getVelocityTrend(userId).catch(() => ({
        thisWeek: 0,
        lastWeek: 0,
        trend: "stable" as const,
        weeklyData: [],
      })),
      getCommunicationHealth(userId).catch(() => ({
        daysSinceLastClientUpdate: {},
        pendingFollowUps: 0,
        projectsNeedingUpdate: [],
      })),
      getPatternsForDisplay(userId).catch(() => []),
    ])

  // Build formatted context
  return {
    user: {
      id: user.id,
      name: user.name || "there",
      email: user.email,
      timezone: user.agentPreferences?.timezone || "America/New_York",
      workingHoursStart: user.workingHoursStart,
      workingHoursEnd: user.workingHoursEnd,
      preferredStyle: user.agentPreferences?.preferredStyle || "concise",
    },
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      clientName: p.clientName,
      status: p.status,
      phase: p.phase,
      activeSprint: p.sprints[0]?.name || null,
      blockerCount: p._count.blockers,
      taskCount: p._count.sprints,
    })),
    blockers: blockers.map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      projectName: b.project.name,
      waitingOn: b.waitingOn,
      createdAt: b.createdAt,
      daysSinceCreated: Math.floor(
        (now.getTime() - b.createdAt.getTime()) / (24 * 60 * 60 * 1000)
      ),
    })),
    stuckTasks: stuckTasks.map((t) => ({
      id: t.id,
      title: t.title,
      projectName: t.sprint.project.name,
      sprintName: t.sprint.name,
      daysSinceUpdate: Math.floor(
        (now.getTime() - t.updatedAt.getTime()) / (24 * 60 * 60 * 1000)
      ),
    })),
    recentActivity: [], // TODO: Implement activity feed
    stats: {
      totalProjects: projects.length,
      activeBlockers: blockers.length,
      inProgressTasks: inProgressCount,
      completedTasksThisWeek: completedThisWeek,
    },

    // Enhanced context
    estimateAccuracy: {
      averageOverrun: estimateData.averageOverrun,
      recentMisses: estimateData.recentMisses,
      hasData: estimateData.calibrations.length > 0,
    },
    velocityTrend: {
      thisWeek: velocityData.thisWeek,
      lastWeek: velocityData.lastWeek,
      trend: velocityData.trend,
    },
    communicationHealth: {
      daysSinceLastClientUpdate: commHealthData.daysSinceLastClientUpdate,
      pendingFollowUps: commHealthData.pendingFollowUps,
      projectsNeedingUpdate: commHealthData.projectsNeedingUpdate,
    },
    learnedPatterns,
  }
}

// =============================================================================
// Format context for prompts
// =============================================================================

export function formatContextForPrompt(context: AgentContext): string {
  const lines: string[] = []

  lines.push(`## User: ${context.user.name}`)
  lines.push(`Timezone: ${context.user.timezone}`)
  lines.push(`Working hours: ${context.user.workingHoursStart} - ${context.user.workingHoursEnd}`)
  lines.push(`Prefers: ${context.user.preferredStyle} responses`)
  lines.push("")

  lines.push(`## Projects (${context.projects.length})`)
  for (const p of context.projects) {
    lines.push(
      `- **${p.name}** (${p.clientName}) - ${p.status}, ${p.phase} phase, ${p.blockerCount} blockers`
    )
  }
  lines.push("")

  if (context.blockers.length > 0) {
    lines.push(`## Active Blockers (${context.blockers.length})`)
    for (const b of context.blockers) {
      const urgencyMarker = b.daysSinceCreated > 3 ? "⚠️ " : ""
      lines.push(
        `- ${urgencyMarker}**${b.title}** [${b.projectName}] - waiting on ${b.waitingOn}, ${b.daysSinceCreated} days old`
      )
    }
    lines.push("")
  }

  if (context.stuckTasks.length > 0) {
    lines.push(`## Stuck Tasks (${context.stuckTasks.length})`)
    for (const t of context.stuckTasks) {
      lines.push(
        `- **${t.title}** [${t.projectName}] - no activity for ${t.daysSinceUpdate} days`
      )
    }
    lines.push("")
  }

  lines.push(`## Stats`)
  lines.push(`- ${context.stats.totalProjects} active projects`)
  lines.push(`- ${context.stats.activeBlockers} unresolved blockers`)
  lines.push(`- ${context.stats.inProgressTasks} tasks in progress`)
  lines.push(`- ${context.stats.completedTasksThisWeek} tasks completed this week`)
  lines.push("")

  // Enhanced context sections
  if (context.estimateAccuracy.hasData) {
    lines.push(`## Estimate Accuracy`)
    if (context.estimateAccuracy.averageOverrun > 0.2) {
      lines.push(
        `⚠️ Estimates tend to run ${Math.round(context.estimateAccuracy.averageOverrun * 100)}% over`
      )
    } else if (context.estimateAccuracy.averageOverrun < -0.1) {
      lines.push(
        `✅ Estimates tend to be conservative (${Math.round(Math.abs(context.estimateAccuracy.averageOverrun) * 100)}% under)`
      )
    } else {
      lines.push(`✅ Estimates are generally accurate`)
    }
    if (context.estimateAccuracy.recentMisses > 0) {
      lines.push(`- ${context.estimateAccuracy.recentMisses} significant misses recently`)
    }
    lines.push("")
  }

  lines.push(`## Velocity`)
  lines.push(`- This week: ${context.velocityTrend.thisWeek} tasks completed`)
  lines.push(`- Last week: ${context.velocityTrend.lastWeek} tasks completed`)
  if (context.velocityTrend.trend === "down") {
    lines.push(`📉 Velocity is trending down`)
  } else if (context.velocityTrend.trend === "up") {
    lines.push(`📈 Velocity is trending up`)
  }
  lines.push("")

  if (context.communicationHealth.projectsNeedingUpdate.length > 0) {
    lines.push(`## Communication Health`)
    lines.push(
      `⚠️ Projects needing client update: ${context.communicationHealth.projectsNeedingUpdate.join(", ")}`
    )
    if (context.communicationHealth.pendingFollowUps > 0) {
      lines.push(
        `- ${context.communicationHealth.pendingFollowUps} blockers need follow-up`
      )
    }
    lines.push("")
  }

  if (context.learnedPatterns.length > 0) {
    lines.push(`## Learned Patterns`)
    for (const pattern of context.learnedPatterns) {
      lines.push(`- ${pattern}`)
    }
    lines.push("")
  }

  return lines.join("\n")
}

// =============================================================================
// Check if in quiet hours
// =============================================================================

export function isInQuietHours(
  timezone: string,
  quietStart: string,
  quietEnd: string
): boolean {
  // Get current time in user's timezone
  const now = new Date()
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const currentTime = formatter.format(now)
  const [currentHour, currentMin] = currentTime.split(":").map(Number)
  const currentMinutes = currentHour * 60 + currentMin

  const [startHour, startMin] = quietStart.split(":").map(Number)
  const [endHour, endMin] = quietEnd.split(":").map(Number)
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  // Handle overnight quiet hours (e.g., 22:00 - 08:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes
}

// =============================================================================
// Quick context for chat prompt
// =============================================================================

export function buildQuickContext(context: AgentContext) {
  return {
    name: context.user.name,
    timezone: context.user.timezone,
    preferredStyle: context.user.preferredStyle,
    projectCount: context.stats.totalProjects,
    activeBlockers: context.stats.activeBlockers,
    estimateAccuracy: context.estimateAccuracy.hasData
      ? {
          averageOverrun: context.estimateAccuracy.averageOverrun,
          recentMisses: context.estimateAccuracy.recentMisses,
        }
      : undefined,
    velocityTrend: {
      thisWeek: context.velocityTrend.thisWeek,
      lastWeek: context.velocityTrend.lastWeek,
      trend: context.velocityTrend.trend,
    },
    daysSinceLastClientUpdate:
      context.communicationHealth.projectsNeedingUpdate.length > 0
        ? Math.max(...Object.values(context.communicationHealth.daysSinceLastClientUpdate))
        : undefined,
  }
}
