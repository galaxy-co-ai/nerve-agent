/**
 * AX Agent Scratchpad
 *
 * Persistent memory layer for AI agents to store observations, pending actions,
 * learned preferences, and project-specific notes between sessions.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface AXScratchpadObservation {
  id: string
  createdAt: string
  expiresAt: string | null
  category: "user" | "project" | "pattern" | "context" | "reminder"
  content: string
  confidence: number // 0-1
  source: string // e.g., "user-feedback", "pattern-detection", "explicit-note"
}

export interface AXScratchpadPendingAction {
  id: string
  action: string
  reason: string
  triggerCondition: string
  createdAt: string
  priority: "low" | "medium" | "high"
}

export interface AXScratchpadConversationMemory {
  lastTopics: string[]
  unresolvedQuestions: string[]
  userSentiment: "positive" | "neutral" | "frustrated" | "unknown"
  lastInteractionSummary: string
}

export interface AXScratchpadProjectNotes {
  agentSummary: string
  knownRisks: string[]
  suggestedNextSteps: string[]
  userPreferencesForProject: string[]
}

export interface AXScratchpadLearnedPreference {
  preference: string
  learnedFrom: string
  learnedAt: string
  confidence: number // 0-1
}

export interface AXScratchpad {
  version: number
  lastUpdated: string

  observations: AXScratchpadObservation[]
  pendingActions: AXScratchpadPendingAction[]
  conversationMemory: AXScratchpadConversationMemory
  projectNotes: Record<string, AXScratchpadProjectNotes>
  learnedPreferences: AXScratchpadLearnedPreference[]
}

// State graph summary (for embedding in state graph)
export interface AXScratchpadSummary {
  observationCount: number
  pendingActionCount: number
  hasUnresolvedQuestions: boolean
  lastUserSentiment: string
  recentObservations: AXScratchpadObservation[] // last 5
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY = "ax-scratchpad"
const SCRATCHPAD_VERSION = 1
const MAX_OBSERVATIONS = 100
const MAX_PENDING_ACTIONS = 50
const MAX_LEARNED_PREFERENCES = 100
const DEFAULT_OBSERVATION_TTL_DAYS = 30

// =============================================================================
// STORAGE
// =============================================================================

function createDefaultScratchpad(): AXScratchpad {
  return {
    version: SCRATCHPAD_VERSION,
    lastUpdated: new Date().toISOString(),
    observations: [],
    pendingActions: [],
    conversationMemory: {
      lastTopics: [],
      unresolvedQuestions: [],
      userSentiment: "unknown",
      lastInteractionSummary: "",
    },
    projectNotes: {},
    learnedPreferences: [],
  }
}

function loadScratchpad(): AXScratchpad {
  if (typeof window === "undefined") {
    return createDefaultScratchpad()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return createDefaultScratchpad()
    }

    const parsed = JSON.parse(stored) as AXScratchpad

    // Handle version migration
    if (parsed.version !== SCRATCHPAD_VERSION) {
      // For now, reset on version mismatch
      return createDefaultScratchpad()
    }

    return parsed
  } catch {
    return createDefaultScratchpad()
  }
}

function saveScratchpad(scratchpad: AXScratchpad): void {
  if (typeof window === "undefined") return

  try {
    scratchpad.lastUpdated = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scratchpad))
  } catch (error) {
    // Storage quota exceeded - prune more aggressively
    console.warn("[AX Scratchpad] Failed to save, pruning:", error)
    const pruned = pruneScratchpad(scratchpad)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned))
  }
}

function pruneScratchpad(scratchpad: AXScratchpad): AXScratchpad {
  return {
    ...scratchpad,
    observations: scratchpad.observations.slice(-MAX_OBSERVATIONS / 2),
    pendingActions: scratchpad.pendingActions.slice(-MAX_PENDING_ACTIONS / 2),
    learnedPreferences: scratchpad.learnedPreferences.slice(-MAX_LEARNED_PREFERENCES / 2),
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() < Date.now()
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Get the current scratchpad
 */
export function getAXScratchpad(): AXScratchpad {
  const scratchpad = loadScratchpad()
  // Auto-clear expired observations on read
  clearExpiredObservations(scratchpad)
  return scratchpad
}

/**
 * Update the scratchpad with partial data
 */
export function updateAXScratchpad(updates: Partial<AXScratchpad>): AXScratchpad {
  const current = loadScratchpad()
  const updated: AXScratchpad = {
    ...current,
    ...updates,
    version: SCRATCHPAD_VERSION,
    lastUpdated: new Date().toISOString(),
  }
  saveScratchpad(updated)
  return updated
}

/**
 * Add an observation to the scratchpad
 */
export function addObservation(
  category: AXScratchpadObservation["category"],
  content: string,
  options: {
    confidence?: number
    source?: string
    ttlDays?: number | null
  } = {}
): AXScratchpadObservation {
  const scratchpad = loadScratchpad()
  const now = new Date()

  const observation: AXScratchpadObservation = {
    id: generateId(),
    createdAt: now.toISOString(),
    expiresAt:
      options.ttlDays === null
        ? null
        : new Date(
            now.getTime() + (options.ttlDays ?? DEFAULT_OBSERVATION_TTL_DAYS) * 24 * 60 * 60 * 1000
          ).toISOString(),
    category,
    content,
    confidence: options.confidence ?? 0.5,
    source: options.source ?? "agent",
  }

  scratchpad.observations.push(observation)

  // Prune if over limit
  if (scratchpad.observations.length > MAX_OBSERVATIONS) {
    scratchpad.observations = scratchpad.observations.slice(-MAX_OBSERVATIONS)
  }

  saveScratchpad(scratchpad)
  return observation
}

/**
 * Remove an observation by ID
 */
export function removeObservation(id: string): boolean {
  const scratchpad = loadScratchpad()
  const initialLength = scratchpad.observations.length
  scratchpad.observations = scratchpad.observations.filter((o) => o.id !== id)
  const removed = scratchpad.observations.length < initialLength
  if (removed) {
    saveScratchpad(scratchpad)
  }
  return removed
}

/**
 * Add a pending action
 */
export function addPendingAction(
  action: string,
  reason: string,
  triggerCondition: string,
  priority: AXScratchpadPendingAction["priority"] = "medium"
): AXScratchpadPendingAction {
  const scratchpad = loadScratchpad()

  const pendingAction: AXScratchpadPendingAction = {
    id: generateId(),
    action,
    reason,
    triggerCondition,
    createdAt: new Date().toISOString(),
    priority,
  }

  scratchpad.pendingActions.push(pendingAction)

  // Prune if over limit
  if (scratchpad.pendingActions.length > MAX_PENDING_ACTIONS) {
    scratchpad.pendingActions = scratchpad.pendingActions.slice(-MAX_PENDING_ACTIONS)
  }

  saveScratchpad(scratchpad)
  return pendingAction
}

/**
 * Remove a pending action by ID
 */
export function removePendingAction(id: string): boolean {
  const scratchpad = loadScratchpad()
  const initialLength = scratchpad.pendingActions.length
  scratchpad.pendingActions = scratchpad.pendingActions.filter((a) => a.id !== id)
  const removed = scratchpad.pendingActions.length < initialLength
  if (removed) {
    saveScratchpad(scratchpad)
  }
  return removed
}

/**
 * Complete a pending action (removes it from the list)
 */
export function completePendingAction(id: string): boolean {
  return removePendingAction(id)
}

/**
 * Get project notes for a specific project
 */
export function getProjectNotes(projectId: string): AXScratchpadProjectNotes | null {
  const scratchpad = loadScratchpad()
  return scratchpad.projectNotes[projectId] || null
}

/**
 * Update project notes
 */
export function updateProjectNotes(
  projectId: string,
  notes: Partial<AXScratchpadProjectNotes>
): AXScratchpadProjectNotes {
  const scratchpad = loadScratchpad()

  const existing = scratchpad.projectNotes[projectId] || {
    agentSummary: "",
    knownRisks: [],
    suggestedNextSteps: [],
    userPreferencesForProject: [],
  }

  scratchpad.projectNotes[projectId] = {
    ...existing,
    ...notes,
  }

  saveScratchpad(scratchpad)
  return scratchpad.projectNotes[projectId]
}

/**
 * Update conversation memory
 */
export function updateConversationMemory(
  updates: Partial<AXScratchpadConversationMemory>
): AXScratchpadConversationMemory {
  const scratchpad = loadScratchpad()
  scratchpad.conversationMemory = {
    ...scratchpad.conversationMemory,
    ...updates,
  }
  saveScratchpad(scratchpad)
  return scratchpad.conversationMemory
}

/**
 * Add a learned preference
 */
export function addLearnedPreference(
  preference: string,
  learnedFrom: string,
  confidence: number = 0.5
): AXScratchpadLearnedPreference {
  const scratchpad = loadScratchpad()

  const learned: AXScratchpadLearnedPreference = {
    preference,
    learnedFrom,
    learnedAt: new Date().toISOString(),
    confidence,
  }

  // Check if this preference already exists (by content) and update if so
  const existingIndex = scratchpad.learnedPreferences.findIndex(
    (p) => p.preference.toLowerCase() === preference.toLowerCase()
  )

  if (existingIndex >= 0) {
    // Update existing preference
    scratchpad.learnedPreferences[existingIndex] = {
      ...scratchpad.learnedPreferences[existingIndex],
      confidence: Math.min(1, scratchpad.learnedPreferences[existingIndex].confidence + 0.1),
      learnedAt: new Date().toISOString(),
    }
  } else {
    scratchpad.learnedPreferences.push(learned)

    // Prune if over limit
    if (scratchpad.learnedPreferences.length > MAX_LEARNED_PREFERENCES) {
      // Remove lowest confidence preferences
      scratchpad.learnedPreferences.sort((a, b) => b.confidence - a.confidence)
      scratchpad.learnedPreferences = scratchpad.learnedPreferences.slice(0, MAX_LEARNED_PREFERENCES)
    }
  }

  saveScratchpad(scratchpad)
  return learned
}

/**
 * Remove a learned preference
 */
export function removeLearnedPreference(preference: string): boolean {
  const scratchpad = loadScratchpad()
  const initialLength = scratchpad.learnedPreferences.length
  scratchpad.learnedPreferences = scratchpad.learnedPreferences.filter(
    (p) => p.preference.toLowerCase() !== preference.toLowerCase()
  )
  const removed = scratchpad.learnedPreferences.length < initialLength
  if (removed) {
    saveScratchpad(scratchpad)
  }
  return removed
}

/**
 * Clear expired observations
 */
export function clearExpiredObservations(scratchpad?: AXScratchpad): number {
  const pad = scratchpad || loadScratchpad()
  const initialLength = pad.observations.length

  pad.observations = pad.observations.filter((o) => !isExpired(o.expiresAt))

  const cleared = initialLength - pad.observations.length

  if (cleared > 0 && !scratchpad) {
    // Only save if we loaded it ourselves
    saveScratchpad(pad)
  }

  return cleared
}

/**
 * Get observations by category
 */
export function getObservationsByCategory(
  category: AXScratchpadObservation["category"]
): AXScratchpadObservation[] {
  const scratchpad = loadScratchpad()
  return scratchpad.observations.filter((o) => o.category === category && !isExpired(o.expiresAt))
}

/**
 * Get pending actions by priority
 */
export function getPendingActionsByPriority(
  priority?: AXScratchpadPendingAction["priority"]
): AXScratchpadPendingAction[] {
  const scratchpad = loadScratchpad()
  if (priority) {
    return scratchpad.pendingActions.filter((a) => a.priority === priority)
  }
  // Return sorted by priority (high first)
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return [...scratchpad.pendingActions].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  )
}

/**
 * Get high-confidence learned preferences
 */
export function getConfidentPreferences(minConfidence: number = 0.7): AXScratchpadLearnedPreference[] {
  const scratchpad = loadScratchpad()
  return scratchpad.learnedPreferences.filter((p) => p.confidence >= minConfidence)
}

/**
 * Get a summary for the state graph
 */
export function getScratchpadSummary(): AXScratchpadSummary {
  const scratchpad = loadScratchpad()

  // Clear expired and get valid observations
  const validObservations = scratchpad.observations.filter((o) => !isExpired(o.expiresAt))

  return {
    observationCount: validObservations.length,
    pendingActionCount: scratchpad.pendingActions.length,
    hasUnresolvedQuestions: scratchpad.conversationMemory.unresolvedQuestions.length > 0,
    lastUserSentiment: scratchpad.conversationMemory.userSentiment,
    recentObservations: validObservations.slice(-5),
  }
}

/**
 * Clear the entire scratchpad
 */
export function clearAXScratchpad(): void {
  saveScratchpad(createDefaultScratchpad())
}

// =============================================================================
// AGENT WRITE INTERFACE
// =============================================================================

/**
 * Process agent writes to the scratchpad
 * This is called when an agent modifies the scratchpad textarea
 */
export function processAgentScratchpadWrite(jsonString: string): boolean {
  try {
    const updates = JSON.parse(jsonString)

    // Validate the structure
    if (typeof updates !== "object" || updates === null) {
      console.warn("[AX Scratchpad] Invalid write: not an object")
      return false
    }

    // Merge observations (append new ones)
    if (Array.isArray(updates.observations)) {
      for (const obs of updates.observations) {
        if (obs.content && obs.category) {
          addObservation(obs.category, obs.content, {
            confidence: obs.confidence,
            source: obs.source,
            ttlDays: obs.ttlDays,
          })
        }
      }
    }

    // Merge pending actions (append new ones)
    if (Array.isArray(updates.pendingActions)) {
      for (const action of updates.pendingActions) {
        if (action.action && action.triggerCondition) {
          addPendingAction(action.action, action.reason || "", action.triggerCondition, action.priority)
        }
      }
    }

    // Update conversation memory
    if (updates.conversationMemory) {
      updateConversationMemory(updates.conversationMemory)
    }

    // Update project notes
    if (updates.projectNotes && typeof updates.projectNotes === "object") {
      for (const [projectId, notes] of Object.entries(updates.projectNotes)) {
        updateProjectNotes(projectId, notes as Partial<AXScratchpadProjectNotes>)
      }
    }

    // Add learned preferences
    if (Array.isArray(updates.learnedPreferences)) {
      for (const pref of updates.learnedPreferences) {
        if (pref.preference && pref.learnedFrom) {
          addLearnedPreference(pref.preference, pref.learnedFrom, pref.confidence)
        }
      }
    }

    return true
  } catch (error) {
    console.error("[AX Scratchpad] Failed to process write:", error)
    return false
  }
}
