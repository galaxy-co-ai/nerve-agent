// =============================================================================
// NERVE AGENT MEMORY SYSTEM
// Learns patterns from user behavior to inform future suggestions
// =============================================================================

import { db } from "@/lib/db"

// =============================================================================
// Types
// =============================================================================

export type PatternType =
  | "estimate"
  | "blocker"
  | "communication"
  | "workflow"
  | "productivity"

export type ConfidenceLevel = "high" | "medium" | "low"

export interface LearnedPattern {
  id: string
  userId: string
  type: PatternType
  pattern: string
  confidence: ConfidenceLevel
  occurrences: number
  evidence: string[]
  actionableInsight: string
  lastSeen: Date
  createdAt: Date
}

export interface EstimateCalibration {
  userId: string
  taskType: string
  averageOverrun: number // e.g., 0.5 = 50% over estimate
  sampleSize: number
  recentMisses: {
    taskId: string
    taskTitle: string
    estimated: number
    actual: number
    overrunPercent: number
  }[]
}

// =============================================================================
// Pattern Recording
// =============================================================================

/**
 * Record a new pattern or update an existing one
 */
export async function recordPattern(
  userId: string,
  input: {
    type: PatternType
    pattern: string
    confidence: ConfidenceLevel
    evidence?: string
    actionableInsight?: string
  }
): Promise<{ created: boolean; pattern: LearnedPattern | null }> {
  // Check for existing similar pattern
  const existingPatterns = await db.agentLearnedPattern.findMany({
    where: {
      userId,
      type: input.type,
    },
  })

  // Simple similarity check - if pattern text is very similar, update existing
  const similarPattern = existingPatterns.find((p: { pattern: string }) =>
    isSimilarPattern(p.pattern, input.pattern)
  )

  if (similarPattern) {
    // Update existing pattern
    const updatedEvidence = similarPattern.evidence as string[]
    if (input.evidence && !updatedEvidence.includes(input.evidence)) {
      updatedEvidence.push(input.evidence)
    }

    // Increase confidence if we're seeing it again
    const newConfidence = upgradeConfidence(
      similarPattern.confidence as ConfidenceLevel,
      similarPattern.occurrences + 1
    )

    const updated = await db.agentLearnedPattern.update({
      where: { id: similarPattern.id },
      data: {
        occurrences: { increment: 1 },
        confidence: newConfidence,
        evidence: updatedEvidence,
        lastSeen: new Date(),
        actionableInsight: input.actionableInsight || similarPattern.actionableInsight,
      },
    })

    return { created: false, pattern: updated as unknown as LearnedPattern }
  }

  // Create new pattern
  const created = await db.agentLearnedPattern.create({
    data: {
      userId,
      type: input.type,
      pattern: input.pattern,
      confidence: input.confidence,
      occurrences: 1,
      evidence: input.evidence ? [input.evidence] : [],
      actionableInsight: input.actionableInsight || "",
      lastSeen: new Date(),
    },
  })

  return { created: true, pattern: created as unknown as LearnedPattern }
}

/**
 * Get patterns relevant to the current context
 */
export async function getRelevantPatterns(
  userId: string,
  options?: {
    type?: PatternType | "all"
    minConfidence?: ConfidenceLevel
    limit?: number
  }
): Promise<LearnedPattern[]> {
  const { type = "all", minConfidence = "low", limit = 10 } = options || {}

  const confidenceOrder: Record<ConfidenceLevel, number> = {
    low: 1,
    medium: 2,
    high: 3,
  }
  const minConfidenceValue = confidenceOrder[minConfidence]

  const patterns = await db.agentLearnedPattern.findMany({
    where: {
      userId,
      ...(type !== "all" ? { type } : {}),
    },
    orderBy: [
      { occurrences: "desc" },
      { lastSeen: "desc" },
    ],
    take: limit * 2, // Fetch more to filter by confidence
  })

  // Filter by confidence and limit
  return patterns
    .filter((p: { confidence: string }) => confidenceOrder[p.confidence as ConfidenceLevel] >= minConfidenceValue)
    .slice(0, limit) as unknown as LearnedPattern[]
}

/**
 * Get patterns formatted for display in the Memory tab
 */
export async function getPatternsForDisplay(userId: string): Promise<string[]> {
  const patterns = await getRelevantPatterns(userId, {
    minConfidence: "medium",
    limit: 5,
  })

  return patterns.map((p) => formatPatternForDisplay(p))
}

// =============================================================================
// Estimate Calibration
// =============================================================================

/**
 * Update estimate calibration after a task is completed
 */
export async function updateCalibration(
  userId: string,
  taskId: string,
  actualHours: number
): Promise<void> {
  // Get the task with its estimate
  const task = await db.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      title: true,
      estimatedHours: true,
      tags: true,
    },
  })

  if (!task || !task.estimatedHours) return

  const estimatedHours = Number(task.estimatedHours)
  const overrunPercent = (actualHours - estimatedHours) / estimatedHours
  const taskType = (task.tags as string[])?.[0] || "general"

  // Record or update calibration
  const existing = await db.agentEstimateCalibration.findFirst({
    where: { userId, taskType },
  })

  if (existing) {
    // Update running average
    const newSampleSize = existing.sampleSize + 1
    const newAverageOverrun =
      (existing.averageOverrun * existing.sampleSize + overrunPercent) / newSampleSize

    // Keep recent misses (last 5)
    const recentMisses = existing.recentMisses as unknown as EstimateCalibration["recentMisses"]
    if (Math.abs(overrunPercent) > 0.2) {
      recentMisses.unshift({
        taskId: task.id,
        taskTitle: task.title,
        estimated: estimatedHours,
        actual: actualHours,
        overrunPercent,
      })
      if (recentMisses.length > 5) recentMisses.pop()
    }

    await db.agentEstimateCalibration.update({
      where: { id: existing.id },
      data: {
        averageOverrun: newAverageOverrun,
        sampleSize: newSampleSize,
        recentMisses: recentMisses,
        lastUpdated: new Date(),
      },
    })
  } else {
    // Create new calibration record
    await db.agentEstimateCalibration.create({
      data: {
        userId,
        taskType,
        averageOverrun: overrunPercent,
        sampleSize: 1,
        recentMisses:
          Math.abs(overrunPercent) > 0.2
            ? [
                {
                  taskId: task.id,
                  taskTitle: task.title,
                  estimated: estimatedHours,
                  actual: actualHours,
                  overrunPercent,
                },
              ]
            : [],
      },
    })
  }

  // If significant overrun, record as pattern
  if (overrunPercent > 0.3) {
    await recordPattern(userId, {
      type: "estimate",
      pattern: `Tasks like "${task.title}" tend to take longer than estimated`,
      confidence: "medium",
      evidence: `Task took ${Math.round(overrunPercent * 100)}% longer than estimated`,
      actionableInsight: `Consider adding ${Math.round(overrunPercent * 100)}% buffer to similar estimates`,
    })
  }
}

/**
 * Get estimate accuracy data for the agent context
 */
export async function getEstimateAccuracy(
  userId: string,
  options?: { taskType?: string; days?: number }
): Promise<{
  averageOverrun: number
  recentMisses: number
  calibrations: EstimateCalibration[]
}> {
  const { taskType, days = 30 } = options || {}
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const calibrations = await db.agentEstimateCalibration.findMany({
    where: {
      userId,
      ...(taskType ? { taskType } : {}),
      lastUpdated: { gte: since },
    },
    orderBy: { sampleSize: "desc" },
  })

  if (calibrations.length === 0) {
    return { averageOverrun: 0, recentMisses: 0, calibrations: [] }
  }

  // Calculate weighted average
  const totalSamples = calibrations.reduce(
    (sum: number, c: { sampleSize: number }) => sum + c.sampleSize,
    0
  )
  const weightedOverrun = calibrations.reduce(
    (sum: number, c: { averageOverrun: number; sampleSize: number }) =>
      sum + c.averageOverrun * c.sampleSize,
    0
  )
  const averageOverrun = totalSamples > 0 ? weightedOverrun / totalSamples : 0

  // Count recent misses
  const recentMisses = calibrations.reduce(
    (sum: number, c: { recentMisses: unknown }) => {
      const misses = c.recentMisses as EstimateCalibration["recentMisses"]
      return sum + misses.length
    },
    0
  )

  return {
    averageOverrun,
    recentMisses,
    calibrations: calibrations as unknown as EstimateCalibration[],
  }
}

// =============================================================================
// Velocity Tracking
// =============================================================================

/**
 * Get velocity trend comparing recent weeks
 */
export async function getVelocityTrend(
  userId: string,
  options?: { weeks?: number; projectId?: string }
): Promise<{
  thisWeek: number
  lastWeek: number
  trend: "up" | "down" | "stable"
  weeklyData: { week: number; completed: number }[]
}> {
  const { weeks = 4, projectId } = options || {}
  const now = new Date()

  const weeklyData: { week: number; completed: number }[] = []

  for (let i = 0; i < weeks; i++) {
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000)

    const completed = await db.task.count({
      where: {
        status: "COMPLETED",
        completedAt: {
          gte: weekStart,
          lt: weekEnd,
        },
        sprint: {
          project: {
            userId,
            ...(projectId ? { id: projectId } : {}),
          },
        },
      },
    })

    weeklyData.unshift({ week: weeks - i, completed })
  }

  const thisWeek = weeklyData[weeklyData.length - 1]?.completed || 0
  const lastWeek = weeklyData[weeklyData.length - 2]?.completed || 0

  let trend: "up" | "down" | "stable" = "stable"
  if (thisWeek > lastWeek * 1.1) trend = "up"
  else if (thisWeek < lastWeek * 0.9) trend = "down"

  return { thisWeek, lastWeek, trend, weeklyData }
}

// =============================================================================
// Communication Health
// =============================================================================

/**
 * Check communication health across projects
 */
export async function getCommunicationHealth(
  userId: string,
  projectId?: string
): Promise<{
  daysSinceLastClientUpdate: Record<string, number>
  pendingFollowUps: number
  projectsNeedingUpdate: string[]
}> {
  const projects = await db.project.findMany({
    where: {
      userId,
      status: "ACTIVE",
      ...(projectId ? { id: projectId } : {}),
    },
    select: {
      id: true,
      name: true,
      updatedAt: true, // Use updatedAt as proxy for last activity
    },
  })

  const now = Date.now()
  const daysSinceLastClientUpdate: Record<string, number> = {}
  const projectsNeedingUpdate: string[] = []

  for (const project of projects) {
    // Use updatedAt as a proxy for last client update
    // In a real implementation, you'd track client communication separately
    const daysSince = Math.floor(
      (now - project.updatedAt.getTime()) / (24 * 60 * 60 * 1000)
    )

    daysSinceLastClientUpdate[project.name] = daysSince

    if (daysSince > 5) {
      projectsNeedingUpdate.push(project.name)
    }
  }

  // Count stale blockers that need follow-up
  const staleBlockers = await db.blocker.count({
    where: {
      status: "ACTIVE",
      createdAt: {
        lt: new Date(now - 3 * 24 * 60 * 60 * 1000),
      },
      project: {
        userId,
        ...(projectId ? { id: projectId } : {}),
      },
    },
  })

  return {
    daysSinceLastClientUpdate,
    pendingFollowUps: staleBlockers,
    projectsNeedingUpdate,
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

function isSimilarPattern(existing: string, incoming: string): boolean {
  // Simple similarity: lowercase, remove punctuation, compare
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim()

  const a = normalize(existing)
  const b = normalize(incoming)

  // Check for high overlap
  const wordsA = new Set(a.split(" "))
  const wordsB = new Set(b.split(" "))

  let overlap = 0
  for (const word of wordsA) {
    if (wordsB.has(word)) overlap++
  }

  const similarity = overlap / Math.max(wordsA.size, wordsB.size)
  return similarity > 0.7
}

function upgradeConfidence(
  current: ConfidenceLevel,
  occurrences: number
): ConfidenceLevel {
  if (occurrences >= 5 || current === "high") return "high"
  if (occurrences >= 3 || current === "medium") return "medium"
  return "low"
}

function formatPatternForDisplay(pattern: LearnedPattern): string {
  const confidenceEmoji =
    pattern.confidence === "high"
      ? "🔒"
      : pattern.confidence === "medium"
      ? "📊"
      : "🌱"

  return `${confidenceEmoji} ${pattern.pattern} (seen ${pattern.occurrences}x)`
}

// =============================================================================
// Scope Drift Detection
// =============================================================================

export interface ScopeDriftResult {
  driftDetected: boolean
  severity: "none" | "minor" | "moderate" | "severe"
  summary: string
  originalTaskCount: number
  currentTaskCount: number
  additions: { title: string; addedAt: Date }[]
  removals: { title: string; removedAt: Date }[]
}

/**
 * Detect scope drift in a sprint or project
 */
export async function detectScopeDrift(
  sprintId?: string,
  projectId?: string
): Promise<ScopeDriftResult> {
  if (sprintId) {
    return detectSprintScopeDrift(sprintId)
  }

  if (projectId) {
    return detectProjectScopeDrift(projectId)
  }

  return {
    driftDetected: false,
    severity: "none",
    summary: "No sprint or project specified",
    originalTaskCount: 0,
    currentTaskCount: 0,
    additions: [],
    removals: [],
  }
}

async function detectSprintScopeDrift(sprintId: string): Promise<ScopeDriftResult> {
  const sprint = await db.sprint.findUnique({
    where: { id: sprintId },
    include: {
      tasks: {
        select: {
          id: true,
          title: true,
          createdAt: true,
          status: true,
        },
      },
    },
  })

  if (!sprint) {
    return {
      driftDetected: false,
      severity: "none",
      summary: "Sprint not found",
      originalTaskCount: 0,
      currentTaskCount: 0,
      additions: [],
      removals: [],
    }
  }

  // Consider tasks added after sprint start as additions
  const sprintStartDate = sprint.createdAt
  const originalTasks = sprint.tasks.filter((t) => {
    const diff = t.createdAt.getTime() - sprintStartDate.getTime()
    return diff < 24 * 60 * 60 * 1000 // Added within first day
  })
  const addedTasks = sprint.tasks.filter((t) => {
    const diff = t.createdAt.getTime() - sprintStartDate.getTime()
    return diff >= 24 * 60 * 60 * 1000 // Added after first day
  })

  const originalCount = originalTasks.length
  const currentCount = sprint.tasks.length
  const addedCount = addedTasks.length

  // Calculate severity
  let severity: ScopeDriftResult["severity"] = "none"
  const driftPercent = originalCount > 0 ? addedCount / originalCount : 0

  if (driftPercent > 0.5) severity = "severe"
  else if (driftPercent > 0.3) severity = "moderate"
  else if (driftPercent > 0.1) severity = "minor"

  return {
    driftDetected: addedCount > 0,
    severity,
    summary:
      addedCount > 0
        ? `${addedCount} tasks added after sprint start (${Math.round(driftPercent * 100)}% scope increase)`
        : "No scope drift detected",
    originalTaskCount: originalCount,
    currentTaskCount: currentCount,
    additions: addedTasks.map((t) => ({ title: t.title, addedAt: t.createdAt })),
    removals: [], // Would need task history tracking for this
  }
}

async function detectProjectScopeDrift(projectId: string): Promise<ScopeDriftResult> {
  // For projects, look at all active sprints
  const sprints = await db.sprint.findMany({
    where: {
      projectId,
      status: "IN_PROGRESS",
    },
    include: {
      tasks: {
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
      },
    },
  })

  let totalOriginal = 0
  let totalAdded = 0
  const allAdditions: { title: string; addedAt: Date }[] = []

  for (const sprint of sprints) {
    const sprintStart = sprint.createdAt
    for (const task of sprint.tasks) {
      const diff = task.createdAt.getTime() - sprintStart.getTime()
      if (diff < 24 * 60 * 60 * 1000) {
        totalOriginal++
      } else {
        totalAdded++
        allAdditions.push({ title: task.title, addedAt: task.createdAt })
      }
    }
  }

  const driftPercent = totalOriginal > 0 ? totalAdded / totalOriginal : 0
  let severity: ScopeDriftResult["severity"] = "none"

  if (driftPercent > 0.5) severity = "severe"
  else if (driftPercent > 0.3) severity = "moderate"
  else if (driftPercent > 0.1) severity = "minor"

  return {
    driftDetected: totalAdded > 0,
    severity,
    summary:
      totalAdded > 0
        ? `${totalAdded} tasks added across active sprints (${Math.round(driftPercent * 100)}% scope increase)`
        : "No scope drift detected",
    originalTaskCount: totalOriginal,
    currentTaskCount: totalOriginal + totalAdded,
    additions: allAdditions.slice(0, 10), // Limit to 10
    removals: [],
  }
}

// =============================================================================
// Similar Task Finder
// =============================================================================

export interface SimilarTask {
  id: string
  title: string
  estimatedHours: number | null
  actualHours: number | null
  projectName: string
  completedAt: Date | null
  overrunPercent: number | null
}

/**
 * Find similar tasks from history
 */
export async function findSimilarTasks(
  userId: string,
  taskTitle: string,
  taskDescription?: string,
  limit: number = 5
): Promise<SimilarTask[]> {
  // Get completed tasks for comparison
  const completedTasks = await db.task.findMany({
    where: {
      status: "COMPLETED",
      sprint: {
        project: { userId },
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      estimatedHours: true,
      actualHours: true,
      completedAt: true,
      sprint: {
        select: {
          project: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { completedAt: "desc" },
    take: 100, // Search in recent 100 tasks
  })

  // Score similarity
  const searchTerms = extractKeywords(taskTitle + " " + (taskDescription || ""))

  const scoredTasks = completedTasks.map((task) => {
    const taskTerms = extractKeywords(task.title + " " + (task.description || ""))
    const similarity = calculateSimilarity(searchTerms, taskTerms)

    const estimatedHours = task.estimatedHours ? Number(task.estimatedHours) : null
    const actualHours = task.actualHours ? Number(task.actualHours) : null

    let overrunPercent: number | null = null
    if (estimatedHours && actualHours) {
      overrunPercent = (actualHours - estimatedHours) / estimatedHours
    }

    return {
      task: {
        id: task.id,
        title: task.title,
        estimatedHours,
        actualHours,
        projectName: task.sprint.project.name,
        completedAt: task.completedAt,
        overrunPercent,
      },
      similarity,
    }
  })

  // Sort by similarity and return top matches
  return scoredTasks
    .filter((s) => s.similarity > 0.2)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map((s) => s.task)
}

function extractKeywords(text: string): Set<string> {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "it",
    "this",
    "that",
    "as",
  ])

  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
  )
}

function calculateSimilarity(setA: Set<string>, setB: Set<string>): number {
  let overlap = 0
  for (const word of setA) {
    if (setB.has(word)) overlap++
  }
  const union = new Set([...setA, ...setB]).size
  return union > 0 ? overlap / union : 0
}
