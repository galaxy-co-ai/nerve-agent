/**
 * AX Quiet Signals
 *
 * Real-time signals about user state for timing suggestions and awareness.
 * Tracks flow state, interruptibility, and situational context.
 */

import { getAXEvents, getCurrentSessionDuration, type AXTrackableEvent } from "./tracking"

// =============================================================================
// TYPES
// =============================================================================

export interface AXQuietSignals {
  time: {
    currentHour: number
    isQuietHours: boolean
    isTypicalActiveTime: boolean
    minutesSinceLastActivity: number
  }

  flow: {
    isInFlow: boolean
    flowStartedAt: string | null
    flowDuration: number // minutes
    actionVelocity: number // actions per minute
    flowType: "coding" | "writing" | "reviewing" | "navigating" | "unknown" | null
  }

  interruptibility: {
    level: "available" | "focused" | "deep-focus" | "away"
    canInterrupt: boolean
    shouldDefer: boolean
    deferUntil: string | null
    reason: string
  }

  session: {
    startedAt: string
    duration: number // minutes
    pagesVisited: string[]
    actionsPerformed: number
    isNewSession: boolean
    isEndingSession: boolean
  }

  attention: {
    currentFocus: string | null // entity ID or page
    focusDuration: number // minutes
    recentFocusHistory: Array<{ entityId: string; duration: number }>
    isMultitasking: boolean
  }
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const FLOW_THRESHOLDS = {
  minActionsForFlow: 5,
  flowWindowMinutes: 3,
  velocityForDeepFocus: 4, // actions/min
  velocityForFocus: 2, // actions/min
  idleMinutesForAway: 5,
  idleMinutesForAvailable: 2,
  newSessionThresholdMinutes: 5,
  endingSessionThresholdMinutes: 30,
  multitaskingThresholdSwitches: 5, // switches in last 3 mins
} as const

const QUIET_HOURS_DEFAULT = { start: 22, end: 7 } // 10pm to 7am

// =============================================================================
// HELPERS
// =============================================================================

function getEventsInWindow(events: AXTrackableEvent[], windowMinutes: number): AXTrackableEvent[] {
  const cutoff = Date.now() - windowMinutes * 60 * 1000
  return events.filter((e) => new Date(e.timestamp).getTime() > cutoff)
}

function getLastEventTime(events: AXTrackableEvent[]): Date | null {
  if (events.length === 0) return null
  return new Date(events[events.length - 1].timestamp)
}

function inferFlowType(events: AXTrackableEvent[]): AXQuietSignals["flow"]["flowType"] {
  if (events.length === 0) return null

  // Count event types in recent window
  const typeCounts: Record<string, number> = {}

  for (const event of events) {
    if (event.type === "action:taken") {
      const intent = event.intent
      if (intent.includes("note") || intent.includes("edit")) {
        typeCounts["writing"] = (typeCounts["writing"] || 0) + 1
      } else if (intent.includes("navigate")) {
        typeCounts["navigating"] = (typeCounts["navigating"] || 0) + 1
      } else if (intent.includes("task") || intent.includes("review")) {
        typeCounts["reviewing"] = (typeCounts["reviewing"] || 0) + 1
      }
    } else if (event.type === "note:created") {
      typeCounts["writing"] = (typeCounts["writing"] || 0) + 2
    } else if (event.type === "navigation") {
      typeCounts["navigating"] = (typeCounts["navigating"] || 0) + 1
    } else if (event.type === "shortcut:used") {
      typeCounts["coding"] = (typeCounts["coding"] || 0) + 1
    }
  }

  // Find dominant type
  let maxType: AXQuietSignals["flow"]["flowType"] = "unknown"
  let maxCount = 0

  for (const [type, count] of Object.entries(typeCounts)) {
    if (count > maxCount) {
      maxCount = count
      maxType = type as AXQuietSignals["flow"]["flowType"]
    }
  }

  return maxType
}

function computeActionVelocity(events: AXTrackableEvent[], windowMinutes: number): number {
  const recentEvents = getEventsInWindow(events, windowMinutes)
  if (recentEvents.length === 0) return 0
  return Math.round((recentEvents.length / windowMinutes) * 100) / 100
}

function getUniquePages(events: AXTrackableEvent[]): string[] {
  const pages = new Set<string>()
  for (const event of events) {
    if (event.type === "navigation") {
      pages.add(event.to)
    }
  }
  return Array.from(pages)
}

function countRecentPageSwitches(events: AXTrackableEvent[], windowMinutes: number): number {
  const recentNavs = getEventsInWindow(events, windowMinutes).filter(
    (e) => e.type === "navigation"
  )
  return recentNavs.length
}

function getCurrentFocus(events: AXTrackableEvent[]): { focus: string | null; duration: number } {
  // Look at recent navigation events to determine current focus
  const recentNavs = events.filter((e) => e.type === "navigation") as Array<
    AXTrackableEvent & { type: "navigation" }
  >

  if (recentNavs.length === 0) {
    return { focus: null, duration: 0 }
  }

  const lastNav = recentNavs[recentNavs.length - 1]
  const focusPage = lastNav.to
  const focusStartTime = new Date(lastNav.timestamp).getTime()
  const duration = Math.round((Date.now() - focusStartTime) / (60 * 1000))

  return { focus: focusPage, duration }
}

function getRecentFocusHistory(
  events: AXTrackableEvent[]
): Array<{ entityId: string; duration: number }> {
  const navEvents = events.filter((e) => e.type === "navigation") as Array<
    AXTrackableEvent & { type: "navigation" }
  >

  if (navEvents.length < 2) return []

  const history: Array<{ entityId: string; duration: number }> = []

  for (let i = 0; i < navEvents.length - 1; i++) {
    const current = navEvents[i]
    const next = navEvents[i + 1]
    const duration = Math.round(
      (new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime()) / (60 * 1000)
    )

    if (duration > 0) {
      history.push({ entityId: current.to, duration })
    }
  }

  // Return last 5
  return history.slice(-5)
}

// =============================================================================
// MAIN COMPUTATION
// =============================================================================

/**
 * Parse time string (e.g., "22:00") to hour number
 */
function parseTimeToHour(time: string): number {
  const [hours] = time.split(":").map(Number)
  return hours || 0
}

/**
 * Compute current quiet signals
 */
export function computeQuietSignals(
  quietHours?: { start: string; end: string } | null,
  mostActiveHours?: number[]
): AXQuietSignals {
  const now = new Date()
  const currentHour = now.getHours()
  const allEvents = getAXEvents()
  const sessionDuration = getCurrentSessionDuration()

  // Time signals - parse string times to hours
  const hours = quietHours
    ? { start: parseTimeToHour(quietHours.start), end: parseTimeToHour(quietHours.end) }
    : QUIET_HOURS_DEFAULT
  const isQuietHours =
    hours.start > hours.end
      ? currentHour >= hours.start || currentHour < hours.end // e.g., 22-7 wraps midnight
      : currentHour >= hours.start && currentHour < hours.end

  const isTypicalActiveTime = !mostActiveHours?.length || mostActiveHours.includes(currentHour)

  const lastEventTime = getLastEventTime(allEvents)
  const minutesSinceLastActivity = lastEventTime
    ? Math.round((Date.now() - lastEventTime.getTime()) / (60 * 1000))
    : 999

  // Flow signals
  const recentEvents = getEventsInWindow(allEvents, FLOW_THRESHOLDS.flowWindowMinutes)
  const actionVelocity = computeActionVelocity(allEvents, FLOW_THRESHOLDS.flowWindowMinutes)
  const isInFlow =
    recentEvents.length >= FLOW_THRESHOLDS.minActionsForFlow &&
    actionVelocity >= FLOW_THRESHOLDS.velocityForFocus

  let flowStartedAt: string | null = null
  let flowDuration = 0

  if (isInFlow && recentEvents.length > 0) {
    // Find when flow started (first event in the continuous activity window)
    flowStartedAt = recentEvents[0].timestamp
    flowDuration = Math.round((Date.now() - new Date(flowStartedAt).getTime()) / (60 * 1000))
  }

  const flowType = isInFlow ? inferFlowType(recentEvents) : null

  // Interruptibility
  let level: AXQuietSignals["interruptibility"]["level"] = "available"
  let reason = "No recent activity detected"

  if (minutesSinceLastActivity >= FLOW_THRESHOLDS.idleMinutesForAway) {
    level = "away"
    reason = "No activity for extended period"
  } else if (actionVelocity >= FLOW_THRESHOLDS.velocityForDeepFocus) {
    level = "deep-focus"
    reason = `High activity velocity (${actionVelocity} actions/min)`
  } else if (isInFlow) {
    level = "focused"
    reason = `In flow state for ${flowDuration} minutes`
  } else if (minutesSinceLastActivity < FLOW_THRESHOLDS.idleMinutesForAvailable) {
    level = "focused"
    reason = "Recent activity detected"
  }

  const canInterrupt = level === "available" || level === "away"
  const shouldDefer = level === "deep-focus" || (isInFlow && flowDuration > 5)

  let deferUntil: string | null = null
  if (shouldDefer && flowDuration > 0) {
    // Suggest deferring until flow naturally breaks (estimate 15 more minutes)
    const deferTime = new Date(Date.now() + 15 * 60 * 1000)
    deferUntil = deferTime.toISOString()
  }

  // Session signals
  const sessionMinutes = sessionDuration ? Math.round(sessionDuration / 60) : 0
  const isNewSession = sessionMinutes < FLOW_THRESHOLDS.newSessionThresholdMinutes
  const isEndingSession =
    minutesSinceLastActivity > 1 && sessionMinutes > FLOW_THRESHOLDS.endingSessionThresholdMinutes

  const sessionEvents = allEvents.filter((e) => {
    if (!sessionDuration) return false
    const sessionStart = Date.now() - sessionDuration * 1000
    return new Date(e.timestamp).getTime() > sessionStart
  })

  const pagesVisited = getUniquePages(sessionEvents)
  const actionsPerformed = sessionEvents.length

  // Attention signals
  const { focus: currentFocus, duration: focusDuration } = getCurrentFocus(allEvents)
  const recentFocusHistory = getRecentFocusHistory(allEvents)
  const recentSwitches = countRecentPageSwitches(
    allEvents,
    FLOW_THRESHOLDS.flowWindowMinutes
  )
  const isMultitasking = recentSwitches >= FLOW_THRESHOLDS.multitaskingThresholdSwitches

  return {
    time: {
      currentHour,
      isQuietHours,
      isTypicalActiveTime,
      minutesSinceLastActivity,
    },
    flow: {
      isInFlow,
      flowStartedAt,
      flowDuration,
      actionVelocity,
      flowType,
    },
    interruptibility: {
      level,
      canInterrupt,
      shouldDefer,
      deferUntil,
      reason,
    },
    session: {
      startedAt: sessionDuration
        ? new Date(Date.now() - sessionDuration * 1000).toISOString()
        : new Date().toISOString(),
      duration: sessionMinutes,
      pagesVisited,
      actionsPerformed,
      isNewSession,
      isEndingSession,
    },
    attention: {
      currentFocus,
      focusDuration,
      recentFocusHistory,
      isMultitasking,
    },
  }
}

/**
 * Get body data attributes for quiet signals
 */
export function getQuietSignalBodyAttrs(signals: AXQuietSignals): Record<string, string> {
  return {
    "data-ax-interruptibility": signals.interruptibility.level,
    "data-ax-can-interrupt": String(signals.interruptibility.canInterrupt),
    "data-ax-flow-state": String(signals.flow.isInFlow),
    "data-ax-flow-type": signals.flow.flowType || "none",
    "data-ax-flow-duration": String(signals.flow.flowDuration),
    "data-ax-minutes-idle": String(signals.time.minutesSinceLastActivity),
    "data-ax-is-quiet-hours": String(signals.time.isQuietHours),
  }
}

/**
 * Check if it's a good time to show a suggestion
 */
export function isGoodTimeToInterrupt(signals: AXQuietSignals): boolean {
  // Don't interrupt during quiet hours
  if (signals.time.isQuietHours) return false

  // Don't interrupt deep focus
  if (signals.interruptibility.level === "deep-focus") return false

  // Don't interrupt long flow sessions
  if (signals.flow.isInFlow && signals.flow.flowDuration > 10) return false

  // User is away - might as well wait
  if (signals.interruptibility.level === "away") return false

  return signals.interruptibility.canInterrupt
}

/**
 * Get a human-readable status for the current signals
 */
export function getQuietSignalsStatus(signals: AXQuietSignals): string {
  if (signals.interruptibility.level === "away") {
    return "User appears to be away"
  }

  if (signals.flow.isInFlow) {
    const flowDesc = signals.flow.flowType ? ` (${signals.flow.flowType})` : ""
    return `User in flow state${flowDesc} for ${signals.flow.flowDuration} minutes`
  }

  if (signals.time.isQuietHours) {
    return "Currently in quiet hours"
  }

  if (signals.session.isNewSession) {
    return "User just started a new session"
  }

  if (signals.attention.isMultitasking) {
    return "User appears to be multitasking"
  }

  return `User is ${signals.interruptibility.level}`
}
