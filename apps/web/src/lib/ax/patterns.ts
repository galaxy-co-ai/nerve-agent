/**
 * AX User Patterns
 *
 * Computes behavioral patterns from tracked events to help agents
 * personalize their approach and timing.
 */

import { getAXEvents, getAXEventsByType, type AXTrackableEvent } from "./tracking"

// =============================================================================
// TYPES
// =============================================================================

export interface AXUserPatterns {
  // Activity rhythms
  activity: {
    mostActiveHours: number[] // 24h format, e.g., [9, 10, 14, 15]
    mostActiveDays: string[] // e.g., ["monday", "tuesday", "wednesday"]
    averageSessionLength: number // minutes
    lastActiveAt: string // ISO 8601
    currentStreak: number // consecutive active days
  }

  // Interaction tendencies
  interactions: {
    approvalRate: number // 0-1, how often they approve suggestions without editing
    editRate: number // 0-1, how often they edit before approving
    dismissRate: number // 0-1, how often they dismiss suggestions
    averageResponseTime: number // seconds from suggestion surfaced to action
    prefersKeyboard: boolean // inferred from shortcut usage
  }

  // Content preferences
  preferences: {
    preferredNoteTypes: string[] // most created note types
    ignoredNoteTypes: string[] // rarely interacted with
    projectFocusPattern: "single" | "multi" // works on one project or switches often
    communicationStyle: "brief" | "detailed" // based on note/message length
    workStyle: "maker" | "manager" // lots of tasks vs lots of calls/updates
  }

  // Feature usage
  featureUsage: Record<
    string,
    {
      useCount: number
      lastUsed: string
      frequency: "daily" | "weekly" | "rarely" | "never"
    }
  >

  // Things they consistently ignore
  ignored: {
    suggestionTypes: string[] // suggestion types dismissed 3+ times
    features: string[] // features never clicked
    notifications: string[] // notification types always dismissed
  }

  // Metadata
  _meta: {
    computedAt: string
    eventCount: number
    dataSpanDays: number
  }
}

// =============================================================================
// HELPERS
// =============================================================================

const DAYS_OF_WEEK = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

function getHourFromTimestamp(timestamp: string): number {
  return new Date(timestamp).getHours()
}

function getDayFromTimestamp(timestamp: string): string {
  return DAYS_OF_WEEK[new Date(timestamp).getDay()]
}

function countOccurrences<T>(arr: T[]): Map<T, number> {
  const counts = new Map<T, number>()
  for (const item of arr) {
    counts.set(item, (counts.get(item) || 0) + 1)
  }
  return counts
}

function getTopN<T>(counts: Map<T, number>, n: number): T[] {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([item]) => item)
}

function getBottomN<T>(counts: Map<T, number>, n: number, minCount: number = 1): T[] {
  return Array.from(counts.entries())
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => a[1] - b[1])
    .slice(0, n)
    .map(([item]) => item)
}

function computeDataSpanDays(events: AXTrackableEvent[]): number {
  if (events.length === 0) return 0

  const timestamps = events.map((e) => new Date(e.timestamp).getTime())
  const oldest = Math.min(...timestamps)
  const newest = Math.max(...timestamps)

  return Math.ceil((newest - oldest) / (1000 * 60 * 60 * 24))
}

function computeStreak(events: AXTrackableEvent[]): number {
  if (events.length === 0) return 0

  // Get unique dates with activity
  const activeDates = new Set(
    events.map((e) => new Date(e.timestamp).toISOString().split("T")[0])
  )

  const sortedDates = Array.from(activeDates).sort().reverse() // Most recent first

  // Check consecutive days from today
  let streak = 0
  const today = new Date().toISOString().split("T")[0]

  // If no activity today, start from yesterday
  const startDate = activeDates.has(today)
    ? new Date()
    : new Date(Date.now() - 24 * 60 * 60 * 1000)

  for (let i = 0; i < sortedDates.length; i++) {
    const checkDate = new Date(startDate)
    checkDate.setDate(checkDate.getDate() - i)
    const checkDateStr = checkDate.toISOString().split("T")[0]

    if (activeDates.has(checkDateStr)) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// =============================================================================
// MAIN COMPUTATION
// =============================================================================

/**
 * Compute user patterns from tracked events
 */
export function computeUserPatterns(events?: AXTrackableEvent[]): AXUserPatterns {
  const allEvents = events || getAXEvents()

  // Default patterns for new users
  const defaultPatterns: AXUserPatterns = {
    activity: {
      mostActiveHours: [],
      mostActiveDays: [],
      averageSessionLength: 0,
      lastActiveAt: new Date().toISOString(),
      currentStreak: 0,
    },
    interactions: {
      approvalRate: 0.5, // Neutral default
      editRate: 0.2,
      dismissRate: 0.3,
      averageResponseTime: 30,
      prefersKeyboard: false,
    },
    preferences: {
      preferredNoteTypes: [],
      ignoredNoteTypes: [],
      projectFocusPattern: "single",
      communicationStyle: "brief",
      workStyle: "maker",
    },
    featureUsage: {},
    ignored: {
      suggestionTypes: [],
      features: [],
      notifications: [],
    },
    _meta: {
      computedAt: new Date().toISOString(),
      eventCount: 0,
      dataSpanDays: 0,
    },
  }

  if (allEvents.length === 0) {
    return defaultPatterns
  }

  // Compute activity patterns
  const hourCounts = countOccurrences(allEvents.map((e) => getHourFromTimestamp(e.timestamp)))
  const dayCounts = countOccurrences(allEvents.map((e) => getDayFromTimestamp(e.timestamp)))

  const sessionEvents = allEvents.filter(
    (e): e is Extract<AXTrackableEvent, { type: "session:ended" }> => e.type === "session:ended"
  )
  const avgSessionLength =
    sessionEvents.length > 0
      ? Math.round(sessionEvents.reduce((sum, e) => sum + e.duration, 0) / sessionEvents.length / 60)
      : 0

  // Compute interaction patterns
  const suggestionApprovals = getAXEventsByType("suggestion:approved")
  const suggestionDismissals = getAXEventsByType("suggestion:dismissed")
  const totalSuggestionInteractions = suggestionApprovals.length + suggestionDismissals.length

  let approvalRate = 0.5
  let editRate = 0.2
  let dismissRate = 0.3

  if (totalSuggestionInteractions > 0) {
    approvalRate = suggestionApprovals.length / totalSuggestionInteractions
    dismissRate = suggestionDismissals.length / totalSuggestionInteractions
    editRate =
      suggestionApprovals.filter((e) => e.editedBeforeApprove).length /
      Math.max(suggestionApprovals.length, 1)
  }

  // Compute keyboard preference
  const shortcutEvents = getAXEventsByType("shortcut:used")
  const navigationEvents = getAXEventsByType("navigation")
  const prefersKeyboard =
    shortcutEvents.length > 0 && shortcutEvents.length >= navigationEvents.length * 0.3

  // Compute note preferences
  const noteEvents = getAXEventsByType("note:created")
  const noteTypeCounts = countOccurrences(noteEvents.map((e) => e.noteType))
  const avgWordCount =
    noteEvents.length > 0
      ? noteEvents.reduce((sum, e) => sum + e.wordCount, 0) / noteEvents.length
      : 0

  // Compute feature usage
  const featureEvents = getAXEventsByType("feature:used")
  const featureUsage: AXUserPatterns["featureUsage"] = {}

  const featureCounts = countOccurrences(featureEvents.map((e) => e.feature))
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const weekMs = 7 * dayMs

  for (const [feature, count] of featureCounts.entries()) {
    const featureEventsForThis = featureEvents.filter((e) => e.feature === feature)
    const lastUsed = featureEventsForThis[featureEventsForThis.length - 1]?.timestamp || ""
    const lastUsedTime = new Date(lastUsed).getTime()

    let frequency: "daily" | "weekly" | "rarely" | "never" = "rarely"

    if (count >= 7 && now - lastUsedTime < dayMs) {
      frequency = "daily"
    } else if (count >= 3 && now - lastUsedTime < weekMs) {
      frequency = "weekly"
    }

    featureUsage[feature] = { useCount: count, lastUsed, frequency }
  }

  // Compute ignored items
  const dismissalCounts = countOccurrences(suggestionDismissals.map((e) => e.suggestionType))
  const ignoredSuggestionTypes = Array.from(dismissalCounts.entries())
    .filter(([, count]) => count >= 3)
    .map(([type]) => type)

  // Determine project focus pattern (simple heuristic based on navigation)
  const projectNavigations = navigationEvents.filter(
    (e) => e.to.includes("/projects/") && !e.to.endsWith("/projects")
  )
  const uniqueProjectsVisited = new Set(
    projectNavigations.map((e) => e.to.split("/projects/")[1]?.split("/")[0])
  ).size
  const projectFocusPattern: "single" | "multi" =
    projectNavigations.length > 5 && uniqueProjectsVisited <= 2 ? "single" : "multi"

  // Determine work style
  const actionEvents = getAXEventsByType("action:taken")
  const taskActions = actionEvents.filter((e) => e.intent.includes("task"))
  const callActions = actionEvents.filter((e) => e.intent.includes("call") || e.intent.includes("update"))
  const workStyle: "maker" | "manager" =
    taskActions.length >= callActions.length ? "maker" : "manager"

  return {
    activity: {
      mostActiveHours: getTopN(hourCounts, 4),
      mostActiveDays: getTopN(dayCounts, 3),
      averageSessionLength: avgSessionLength,
      lastActiveAt: allEvents[allEvents.length - 1]?.timestamp || new Date().toISOString(),
      currentStreak: computeStreak(allEvents),
    },
    interactions: {
      approvalRate: Math.round(approvalRate * 100) / 100,
      editRate: Math.round(editRate * 100) / 100,
      dismissRate: Math.round(dismissRate * 100) / 100,
      averageResponseTime: 30, // TODO: Compute from response time events when available
      prefersKeyboard,
    },
    preferences: {
      preferredNoteTypes: getTopN(noteTypeCounts, 3),
      ignoredNoteTypes: getBottomN(noteTypeCounts, 2, 1),
      projectFocusPattern,
      communicationStyle: avgWordCount > 100 ? "detailed" : "brief",
      workStyle,
    },
    featureUsage,
    ignored: {
      suggestionTypes: ignoredSuggestionTypes,
      features: [], // Would need more tracking to determine
      notifications: [], // Would need notification tracking
    },
    _meta: {
      computedAt: new Date().toISOString(),
      eventCount: allEvents.length,
      dataSpanDays: computeDataSpanDays(allEvents),
    },
  }
}

/**
 * Get a summary of user patterns for quick access
 */
export function getPatternSummary(patterns: AXUserPatterns): {
  style: "maker" | "manager"
  approvalRate: number
  prefersKeyboard: boolean
  mostActiveHours: string
} {
  return {
    style: patterns.preferences.workStyle,
    approvalRate: patterns.interactions.approvalRate,
    prefersKeyboard: patterns.interactions.prefersKeyboard,
    mostActiveHours: patterns.activity.mostActiveHours.join(","),
  }
}

/**
 * Check if now is a good time to surface suggestions based on patterns
 */
export function isGoodTimeForSuggestions(patterns: AXUserPatterns): boolean {
  const currentHour = new Date().getHours()
  const currentDay = DAYS_OF_WEEK[new Date().getDay()]

  const isActiveHour =
    patterns.activity.mostActiveHours.length === 0 ||
    patterns.activity.mostActiveHours.includes(currentHour)

  const isActiveDay =
    patterns.activity.mostActiveDays.length === 0 ||
    patterns.activity.mostActiveDays.includes(currentDay)

  return isActiveHour && isActiveDay
}

/**
 * Check if a suggestion type is ignored by the user
 */
export function isSuggestionTypeIgnored(patterns: AXUserPatterns, suggestionType: string): boolean {
  return patterns.ignored.suggestionTypes.includes(suggestionType)
}
