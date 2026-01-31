/**
 * AX Staleness Computation
 *
 * Provides temporal awareness for the AX layer, enabling agents to detect
 * stale items needing attention based on age and context.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface AXStaleness {
  lastModified: string // ISO 8601
  ageInDays: number
  staleLevel: "fresh" | "aging" | "stale" | "critical"
  needsAttention: boolean
  attentionReason?: string
}

export const STALENESS_THRESHOLDS = {
  fresh: 2, // 0-2 days
  aging: 5, // 2-5 days
  stale: 14, // 5-14 days
  critical: 14, // 14+ days
} as const

// =============================================================================
// FUNCTIONS
// =============================================================================

/**
 * Compute stale level based on age in days
 */
export function computeStaleLevel(ageInDays: number): AXStaleness["staleLevel"] {
  if (ageInDays <= STALENESS_THRESHOLDS.fresh) {
    return "fresh"
  }
  if (ageInDays <= STALENESS_THRESHOLDS.aging) {
    return "aging"
  }
  if (ageInDays <= STALENESS_THRESHOLDS.stale) {
    return "stale"
  }
  return "critical"
}

export interface StalenessContext {
  hasBlockers?: boolean
  isBlocked?: boolean
  isInProgress?: boolean
  hasPendingBrief?: boolean
  hasUntaggedContent?: boolean
}

/**
 * Compute comprehensive staleness information for an entity
 */
export function computeStaleness(
  lastModified: Date,
  context?: StalenessContext
): AXStaleness {
  const now = new Date()
  const diffMs = now.getTime() - lastModified.getTime()
  const ageInDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const staleLevel = computeStaleLevel(ageInDays)

  // Determine if item needs attention and why
  let needsAttention = false
  let attentionReason: string | undefined

  // Critical items always need attention
  if (staleLevel === "critical") {
    needsAttention = true
    attentionReason = `Not updated in ${ageInDays} days`
  }

  // Blockers escalate attention
  if (context?.hasBlockers) {
    needsAttention = true
    attentionReason = attentionReason
      ? `${attentionReason}, has active blockers`
      : "Has active blockers"
  }

  // Blocked items need attention if aging
  if (context?.isBlocked && ageInDays >= STALENESS_THRESHOLDS.fresh) {
    needsAttention = true
    attentionReason = attentionReason
      ? `${attentionReason}, blocked for ${ageInDays} days`
      : `Blocked for ${ageInDays} days`
  }

  // In-progress items that are stale need attention
  if (context?.isInProgress && staleLevel !== "fresh") {
    needsAttention = true
    attentionReason = attentionReason
      ? `${attentionReason}, in progress but stale`
      : `In progress but not updated in ${ageInDays} days`
  }

  // Calls with pending briefs need attention
  if (context?.hasPendingBrief) {
    needsAttention = true
    attentionReason = attentionReason
      ? `${attentionReason}, brief not generated`
      : "Brief not generated"
  }

  // Notes with no tags need organization
  if (context?.hasUntaggedContent && ageInDays >= STALENESS_THRESHOLDS.aging) {
    needsAttention = true
    attentionReason = attentionReason
      ? `${attentionReason}, untagged content`
      : "Untagged content needs organization"
  }

  return {
    lastModified: lastModified.toISOString(),
    ageInDays,
    staleLevel,
    needsAttention,
    attentionReason,
  }
}

/**
 * Compute age in days from a date (utility for display)
 */
export function computeAgeInDays(date: Date): number {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Format age as a human-readable string
 */
export function formatAge(date: Date): string {
  const ageInDays = computeAgeInDays(date)

  if (ageInDays === 0) return "Today"
  if (ageInDays === 1) return "1 day ago"
  if (ageInDays < 7) return `${ageInDays} days ago`
  if (ageInDays < 14) return "1 week ago"
  return `${Math.floor(ageInDays / 7)} weeks ago`
}
