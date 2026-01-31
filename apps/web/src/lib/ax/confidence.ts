/**
 * AX Action Confidence
 *
 * Computes confidence scores for agent suggestions based on user patterns,
 * historical success, and context relevance.
 */

import type { AXIntent, AXStateGraph } from "./types"
import type { AXUserPatterns } from "./patterns"
import { isGoodTimeForSuggestions, isSuggestionTypeIgnored } from "./patterns"

// =============================================================================
// TYPES
// =============================================================================

export interface AXActionConfidence {
  score: number // 0-1
  level: "low" | "medium" | "high" | "very-high"
  reasoning: string[]
  historicalAccuracy: number | null // if this action type has been suggested before
  factors: {
    patternMatch: number // how well this matches user patterns
    historicalSuccess: number // past approval rate for this type
    contextRelevance: number // how relevant to current state
    timingScore: number // is this a good time to suggest this
  }
}

export interface AXAgentBehaviorHint {
  shouldSurface: boolean
  surfaceUrgency: "immediate" | "next-session" | "when-relevant" | "hold"
  suggestedTone: "assertive" | "neutral" | "tentative" | "questioning"
  requiresConfirmation: boolean
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const CONFIDENCE_THRESHOLDS = {
  "very-high": 0.85,
  high: 0.70,
  medium: 0.50,
  low: 0.30,
} as const

const FACTOR_WEIGHTS = {
  patternMatch: 0.25,
  historicalSuccess: 0.35,
  contextRelevance: 0.25,
  timingScore: 0.15,
} as const

// =============================================================================
// SCORE COMPUTATION
// =============================================================================

function scoreToLevel(score: number): AXActionConfidence["level"] {
  if (score >= CONFIDENCE_THRESHOLDS["very-high"]) return "very-high"
  if (score >= CONFIDENCE_THRESHOLDS.high) return "high"
  if (score >= CONFIDENCE_THRESHOLDS.medium) return "medium"
  return "low"
}

function weightedAverage(
  factors: AXActionConfidence["factors"],
  weights: typeof FACTOR_WEIGHTS
): number {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0)
  const weightedSum =
    factors.patternMatch * weights.patternMatch +
    factors.historicalSuccess * weights.historicalSuccess +
    factors.contextRelevance * weights.contextRelevance +
    factors.timingScore * weights.timingScore

  return weightedSum / totalWeight
}

// =============================================================================
// FACTOR COMPUTATION
// =============================================================================

/**
 * Compute how well an action matches user patterns
 */
function computePatternMatch(action: AXIntent, patterns: AXUserPatterns): number {
  let score = 0.5 // Neutral baseline

  // Check if action category matches user's work style
  const isTaskAction =
    action.includes("task") || action.includes("project") || action.includes("create")
  const isUpdateAction =
    action.includes("update") || action.includes("generate") || action.includes("summary")

  if (patterns.preferences.workStyle === "maker" && isTaskAction) {
    score += 0.2
  } else if (patterns.preferences.workStyle === "manager" && isUpdateAction) {
    score += 0.2
  }

  // Check if action aligns with preferred features
  const featureName = action.split(":")[1] || action
  const featureUsage = patterns.featureUsage[featureName]
  if (featureUsage) {
    if (featureUsage.frequency === "daily") score += 0.3
    else if (featureUsage.frequency === "weekly") score += 0.15
  }

  // Penalty if this suggestion type is ignored
  if (isSuggestionTypeIgnored(patterns, action)) {
    score -= 0.4
  }

  return Math.max(0, Math.min(1, score))
}

/**
 * Compute historical success rate for similar actions
 */
function computeHistoricalSuccess(
  action: AXIntent,
  patterns: AXUserPatterns
): { score: number; accuracy: number | null } {
  // Use overall approval rate as baseline
  const baseApprovalRate = patterns.interactions.approvalRate

  // Check if this specific suggestion type has been ignored
  const actionCategory = action.split(":")[0] || action
  const isIgnored = patterns.ignored.suggestionTypes.some(
    (type) => type.includes(actionCategory) || actionCategory.includes(type)
  )

  if (isIgnored) {
    return { score: 0.2, accuracy: 0.1 }
  }

  // Higher approval rate = higher confidence
  return {
    score: baseApprovalRate,
    accuracy: patterns._meta.eventCount > 10 ? baseApprovalRate : null,
  }
}

/**
 * Compute context relevance score
 */
function computeContextRelevance(action: AXIntent, context: AXStateGraph): number {
  let score = 0.5

  // Check action against current state
  const workspace = context.workspace

  // Navigation actions
  if (action.startsWith("navigate:")) {
    // Always relevant
    return 0.7
  }

  // Project-related actions
  if (action.includes("project") || action.includes("task") || action.includes("blocker")) {
    // More relevant if there are active projects with issues
    const hasActiveProjects = workspace.projects.some((p) => p.status === "active")
    const hasBlockers = workspace.projects.some((p) => p.hasBlockers)
    const hasStuckTasks = context.staleness?.stuckTasks?.length ?? 0 > 0

    if (hasActiveProjects) score += 0.15
    if (hasBlockers && action.includes("blocker")) score += 0.25
    if (hasStuckTasks && action.includes("task")) score += 0.2
  }

  // Note actions
  if (action.includes("note")) {
    const hasUntagged = workspace.notes.untaggedCount > 0
    if (hasUntagged && action.includes("edit")) score += 0.2
    if (workspace.notes.total > 0) score += 0.1
  }

  // Call actions
  if (action.includes("call")) {
    const hasPendingBriefs = workspace.calls.pendingBriefs > 0
    if (hasPendingBriefs && action.includes("generate")) score += 0.3
    if (workspace.calls.total > 0) score += 0.1
  }

  // Summary/update actions
  if (action.includes("summary") || action.includes("update")) {
    const hasCriticalItems = (context.staleness?.criticalCount ?? 0) > 0
    const hasStaleItems = (context.staleness?.staleCount ?? 0) > 0

    if (hasCriticalItems) score += 0.25
    if (hasStaleItems) score += 0.15
  }

  // Inbox actions
  if (action.includes("inbox") || action.includes("suggestion")) {
    const hasInboxItems = workspace.inbox.pendingCount > 0
    if (hasInboxItems) score += 0.25
  }

  return Math.max(0, Math.min(1, score))
}

/**
 * Compute timing score
 */
function computeTimingScore(patterns: AXUserPatterns): number {
  if (isGoodTimeForSuggestions(patterns)) {
    return 0.9
  }

  // Not in typical active hours/days - lower score
  return 0.4
}

// =============================================================================
// REASONING GENERATION
// =============================================================================

function generateReasoning(
  action: AXIntent,
  factors: AXActionConfidence["factors"],
  patterns: AXUserPatterns,
  context: AXStateGraph
): string[] {
  const reasons: string[] = []

  // Pattern match reasons
  if (factors.patternMatch >= 0.7) {
    reasons.push(`Matches user's ${patterns.preferences.workStyle} work style`)
  } else if (factors.patternMatch <= 0.3) {
    reasons.push("Does not align with typical usage patterns")
  }

  // Historical success reasons
  if (factors.historicalSuccess >= 0.8) {
    reasons.push(`User approves ${Math.round(patterns.interactions.approvalRate * 100)}% of similar suggestions`)
  } else if (factors.historicalSuccess <= 0.4) {
    reasons.push("Similar suggestions often dismissed")
  }

  // Context relevance reasons
  if (factors.contextRelevance >= 0.7) {
    if (action.includes("blocker") && context.staleness?.oldestUnresolvedBlocker) {
      reasons.push(`${context.staleness.stuckTasks.length} stuck tasks need attention`)
    }
    if (action.includes("call") && context.workspace.calls.pendingBriefs > 0) {
      reasons.push(`${context.workspace.calls.pendingBriefs} calls pending briefs`)
    }
    if (action.includes("summary") && (context.staleness?.criticalCount ?? 0) > 0) {
      reasons.push(`${context.staleness?.criticalCount} critical items require attention`)
    }
  }

  // Timing reasons
  if (factors.timingScore >= 0.8) {
    reasons.push("Currently in typical active hours")
  } else if (factors.timingScore <= 0.5) {
    reasons.push("Outside typical active hours")
  }

  // If no specific reasons, add generic one
  if (reasons.length === 0) {
    reasons.push("Standard suggestion based on current context")
  }

  return reasons
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Compute action confidence for a given intent
 */
export function computeActionConfidence(
  action: AXIntent,
  context: AXStateGraph,
  patterns: AXUserPatterns
): AXActionConfidence {
  const patternMatch = computePatternMatch(action, patterns)
  const { score: historicalSuccess, accuracy: historicalAccuracy } = computeHistoricalSuccess(
    action,
    patterns
  )
  const contextRelevance = computeContextRelevance(action, context)
  const timingScore = computeTimingScore(patterns)

  const factors = {
    patternMatch,
    historicalSuccess,
    contextRelevance,
    timingScore,
  }

  const score = weightedAverage(factors, FACTOR_WEIGHTS)
  const level = scoreToLevel(score)
  const reasoning = generateReasoning(action, factors, patterns, context)

  return {
    score: Math.round(score * 100) / 100,
    level,
    reasoning,
    historicalAccuracy,
    factors: {
      patternMatch: Math.round(patternMatch * 100) / 100,
      historicalSuccess: Math.round(historicalSuccess * 100) / 100,
      contextRelevance: Math.round(contextRelevance * 100) / 100,
      timingScore: Math.round(timingScore * 100) / 100,
    },
  }
}

/**
 * Get agent behavior hint based on confidence
 */
export function getAgentBehaviorHint(confidence: AXActionConfidence): AXAgentBehaviorHint {
  const { score, level } = confidence

  // Determine if should surface
  const shouldSurface = score >= CONFIDENCE_THRESHOLDS.low

  // Determine urgency
  let surfaceUrgency: AXAgentBehaviorHint["surfaceUrgency"] = "when-relevant"
  if (level === "very-high") {
    surfaceUrgency = "immediate"
  } else if (level === "high") {
    surfaceUrgency = "when-relevant"
  } else if (level === "medium") {
    surfaceUrgency = "next-session"
  } else {
    surfaceUrgency = "hold"
  }

  // Determine tone
  let suggestedTone: AXAgentBehaviorHint["suggestedTone"] = "neutral"
  if (level === "very-high") {
    suggestedTone = "assertive"
  } else if (level === "high") {
    suggestedTone = "neutral"
  } else if (level === "medium") {
    suggestedTone = "tentative"
  } else {
    suggestedTone = "questioning"
  }

  // Determine if confirmation needed
  const requiresConfirmation = score < CONFIDENCE_THRESHOLDS.high

  return {
    shouldSurface,
    surfaceUrgency,
    suggestedTone,
    requiresConfirmation,
  }
}

/**
 * Compute confidence for multiple actions and return sorted by score
 */
export function rankActionsByConfidence(
  actions: AXIntent[],
  context: AXStateGraph,
  patterns: AXUserPatterns
): Array<{ action: AXIntent; confidence: AXActionConfidence }> {
  return actions
    .map((action) => ({
      action,
      confidence: computeActionConfidence(action, context, patterns),
    }))
    .sort((a, b) => b.confidence.score - a.confidence.score)
}

/**
 * Check if an action should be auto-approved based on confidence and patterns
 */
export function shouldAutoApprove(
  confidence: AXActionConfidence,
  patterns: AXUserPatterns
): boolean {
  // Only auto-approve if:
  // 1. Confidence is very high
  // 2. User has high approval rate
  // 3. Historical accuracy is good
  return (
    confidence.level === "very-high" &&
    patterns.interactions.approvalRate >= 0.85 &&
    (confidence.historicalAccuracy === null || confidence.historicalAccuracy >= 0.9)
  )
}

// =============================================================================
// DOM ATTRIBUTE HELPERS
// =============================================================================

export interface AXConfidenceAttrs {
  "data-ax-confidence"?: string
  "data-ax-confidence-level"?: AXActionConfidence["level"]
  "data-ax-confidence-reasoning"?: string
}

/**
 * Generate DOM attributes for confidence display
 */
export function axConfidenceAttrs(confidence: AXActionConfidence): AXConfidenceAttrs {
  return {
    "data-ax-confidence": String(confidence.score),
    "data-ax-confidence-level": confidence.level,
    "data-ax-confidence-reasoning": JSON.stringify(confidence.reasoning),
  }
}
