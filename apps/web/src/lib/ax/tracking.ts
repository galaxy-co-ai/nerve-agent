/**
 * AX Event Tracking
 *
 * Lightweight event system for tracking user behavior patterns.
 * Events are stored in localStorage and used to compute user patterns.
 */

// =============================================================================
// TYPES
// =============================================================================

// Base event types (without timestamp - added automatically)
export type AXTrackableEventInput =
  | { type: "suggestion:approved"; suggestionType: string; editedBeforeApprove: boolean }
  | { type: "suggestion:dismissed"; suggestionType: string }
  | { type: "feature:used"; feature: string }
  | { type: "note:created"; noteType: string; wordCount: number }
  | { type: "session:started" }
  | { type: "session:ended"; duration: number }
  | { type: "shortcut:used"; shortcut: string }
  | { type: "navigation"; from: string; to: string }
  | { type: "action:taken"; intent: string; context: string }
  | { type: "suggestion:response-time"; suggestionId: string; responseTimeMs: number }

// Stored event types (with timestamp)
export type AXTrackableEvent = AXTrackableEventInput & { timestamp: string }

export interface AXEventStore {
  events: AXTrackableEvent[]
  lastUpdated: string
  version: number
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY = "ax-event-store"
const STORE_VERSION = 1
const MAX_EVENTS = 1000 // Keep last 1000 events
const MAX_AGE_DAYS = 90 // Events older than 90 days are pruned

// =============================================================================
// STORAGE
// =============================================================================

function getEventStore(): AXEventStore {
  if (typeof window === "undefined") {
    return { events: [], lastUpdated: new Date().toISOString(), version: STORE_VERSION }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { events: [], lastUpdated: new Date().toISOString(), version: STORE_VERSION }
    }

    const parsed = JSON.parse(stored) as AXEventStore

    // Handle version migration if needed
    if (parsed.version !== STORE_VERSION) {
      // For now, just reset on version mismatch
      return { events: [], lastUpdated: new Date().toISOString(), version: STORE_VERSION }
    }

    return parsed
  } catch {
    return { events: [], lastUpdated: new Date().toISOString(), version: STORE_VERSION }
  }
}

function saveEventStore(store: AXEventStore): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch (error) {
    // Storage quota exceeded or other error - prune more aggressively
    console.warn("[AX Tracking] Failed to save events, pruning:", error)
    const pruned = pruneEvents(store.events, MAX_EVENTS / 2)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        events: pruned,
        lastUpdated: new Date().toISOString(),
        version: STORE_VERSION,
      })
    )
  }
}

function pruneEvents(events: AXTrackableEvent[], maxCount: number): AXTrackableEvent[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS)
  const cutoffTime = cutoffDate.getTime()

  // Filter old events and keep only recent ones
  const filtered = events.filter((e) => new Date(e.timestamp).getTime() > cutoffTime)

  // If still over limit, keep only the most recent
  if (filtered.length > maxCount) {
    return filtered.slice(-maxCount)
  }

  return filtered
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Track an AX event
 */
export function trackAXEvent(event: AXTrackableEventInput): void {
  const store = getEventStore()
  const timestampedEvent: AXTrackableEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  }

  store.events.push(timestampedEvent)

  // Prune if over limit
  if (store.events.length > MAX_EVENTS) {
    store.events = pruneEvents(store.events, MAX_EVENTS)
  }

  store.lastUpdated = new Date().toISOString()
  saveEventStore(store)
}

/**
 * Get all tracked events
 */
export function getAXEvents(): AXTrackableEvent[] {
  return getEventStore().events
}

/**
 * Get events within a time range
 */
export function getAXEventsInRange(startDate: Date, endDate: Date): AXTrackableEvent[] {
  const events = getEventStore().events
  const startTime = startDate.getTime()
  const endTime = endDate.getTime()

  return events.filter((e) => {
    const eventTime = new Date(e.timestamp).getTime()
    return eventTime >= startTime && eventTime <= endTime
  })
}

/**
 * Get events of a specific type
 */
export function getAXEventsByType<T extends AXTrackableEvent["type"]>(
  type: T
): Extract<AXTrackableEvent, { type: T }>[] {
  const events = getEventStore().events
  return events.filter((e) => e.type === type) as Extract<AXTrackableEvent, { type: T }>[]
}

/**
 * Clear all tracked events
 */
export function clearAXEvents(): void {
  saveEventStore({
    events: [],
    lastUpdated: new Date().toISOString(),
    version: STORE_VERSION,
  })
}

/**
 * Get event store metadata
 */
export function getAXEventStoreInfo(): { eventCount: number; lastUpdated: string; oldestEvent: string | null } {
  const store = getEventStore()
  return {
    eventCount: store.events.length,
    lastUpdated: store.lastUpdated,
    oldestEvent: store.events.length > 0 ? store.events[0].timestamp : null,
  }
}

// =============================================================================
// CONVENIENCE TRACKING FUNCTIONS
// =============================================================================

/**
 * Track when a suggestion is approved
 */
export function trackSuggestionApproved(suggestionType: string, editedBeforeApprove: boolean): void {
  trackAXEvent({
    type: "suggestion:approved",
    suggestionType,
    editedBeforeApprove,
  })
}

/**
 * Track when a suggestion is dismissed
 */
export function trackSuggestionDismissed(suggestionType: string): void {
  trackAXEvent({
    type: "suggestion:dismissed",
    suggestionType,
  })
}

/**
 * Track feature usage
 */
export function trackFeatureUsed(feature: string): void {
  trackAXEvent({
    type: "feature:used",
    feature,
  })
}

/**
 * Track note creation
 */
export function trackNoteCreated(noteType: string, wordCount: number): void {
  trackAXEvent({
    type: "note:created",
    noteType,
    wordCount,
  })
}

/**
 * Track navigation
 */
export function trackNavigation(from: string, to: string): void {
  trackAXEvent({
    type: "navigation",
    from,
    to,
  })
}

/**
 * Track shortcut usage
 */
export function trackShortcutUsed(shortcut: string): void {
  trackAXEvent({
    type: "shortcut:used",
    shortcut,
  })
}

/**
 * Track action taken (for intent tracking)
 */
export function trackActionTaken(intent: string, context: string): void {
  trackAXEvent({
    type: "action:taken",
    intent,
    context,
  })
}

// =============================================================================
// SESSION TRACKING
// =============================================================================

let sessionStartTime: number | null = null

/**
 * Start a session (call on app mount)
 */
export function startAXSession(): void {
  if (sessionStartTime !== null) return // Already started

  sessionStartTime = Date.now()
  trackAXEvent({
    type: "session:started",
  })
}

/**
 * End a session (call on app unmount/tab close)
 */
export function endAXSession(): void {
  if (sessionStartTime === null) return

  const duration = Math.floor((Date.now() - sessionStartTime) / 1000) // seconds
  trackAXEvent({
    type: "session:ended",
    duration,
  })

  sessionStartTime = null
}

/**
 * Get current session duration in seconds (or null if no active session)
 */
export function getCurrentSessionDuration(): number | null {
  if (sessionStartTime === null) return null
  return Math.floor((Date.now() - sessionStartTime) / 1000)
}
