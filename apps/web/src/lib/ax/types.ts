/**
 * AX (Agent Experience) Foundation Types
 *
 * This module defines the type system for the AX layer, enabling AI agents
 * to understand and interact with the Nerve Agent workspace.
 */

// =============================================================================
// STATE GRAPH TYPES
// =============================================================================

export interface AXStateGraph {
  timestamp: string // ISO 8601
  user: AXUser
  workspace: AXWorkspace
  currentView: AXCurrentView
  staleness?: AXStalenessOverview
  relationships?: import("./relationships").AXRelationshipMap
}

export interface AXUser {
  id: string
  timezone: string
  quietHours: { start: string; end: string } | null
  preferences: Record<string, unknown>
}

export interface AXWorkspace {
  projects: AXProject[]
  inbox: AXInbox
  notes: AXNotes
  calls: AXCalls
  library: AXLibrary
}

export interface AXProject {
  id: string
  name: string
  slug: string
  status: "active" | "paused" | "completed"
  lastActivity: string
  hasBlockers: boolean
  blockerCount: number
  taskCount: {
    total: number
    completed: number
    stuck: number
  }
}

export interface AXInbox {
  pendingCount: number
  oldestItemAge: string // e.g., "2d", "5h"
  items: AXInboxItem[]
}

export interface AXInboxItem {
  id: string
  type: string
  title: string
  createdAt: string
  priority: "low" | "medium" | "high"
}

export interface AXNotes {
  total: number
  recentCount: number // last 7 days
  untaggedCount: number
  byTag: Record<string, number>
}

export interface AXCalls {
  total: number
  pendingBriefs: number
  recentTranscripts: number // last 7 days
}

export interface AXLibrary {
  designSystems: number
  blocks: number
  patterns: number
  queries: number
}

export interface AXCurrentView {
  page: string // e.g., "/dashboard", "/projects"
  activeModal: string | null
  activeDrawer: "inbox" | "chat" | "actions" | "memory" | null
}

// =============================================================================
// STALENESS TYPES
// =============================================================================

export interface AXStalenessOverview {
  freshCount: number
  agingCount: number
  staleCount: number
  criticalCount: number
  criticalItems: Array<{
    type: string
    id: string
    title: string
    ageInDays: number
    reason: string
  }>
  oldestUnresolvedBlocker: {
    id: string
    title: string
    projectName: string
    ageInDays: number
  } | null
  stuckTasks: Array<{
    id: string
    title: string
    projectName: string
    stuckDays: number
  }>
}

// =============================================================================
// INTENT SIGNAL TYPES
// =============================================================================

/**
 * Intent vocabulary for AX-annotated elements.
 * Format: "verb:target" where verb describes the action and target is what's affected.
 */
export type AXIntent =
  // Navigation
  | "navigate:dashboard"
  | "navigate:projects"
  | "navigate:library"
  | "navigate:notes"
  | "navigate:calls"
  | "navigate:settings"
  | "navigate:project-detail"
  | "navigate:note-detail"
  | "navigate:call-detail"

  // CRUD operations
  | "create:project"
  | "create:note"
  | "create:call"
  | "create:task"
  | "create:blocker"
  | "import:codebase"
  | "add:library-item"
  | "add:design-system"
  | "edit:project"
  | "edit:note"
  | "delete:item"

  // Drawer actions
  | "open:drawer"
  | "close:drawer"
  | "switch:drawer-tab"

  // Inbox actions
  | "approve:suggestion"
  | "edit:suggestion"
  | "dismiss:suggestion"
  | "clear:inbox"

  // Agent actions
  | "generate:client-update"
  | "generate:weekly-summary"
  | "generate:standup-notes"
  | "analyze:blockers"
  | "analyze:scope"
  | "automate:follow-ups"
  | "send:chat-message"

  // Settings
  | "toggle:setting"
  | "save:profile"
  | "toggle:memory-setting"

  // Dashboard
  | "select:project-suggestion"
  | "shuffle:suggestions"
  | "start:brainstorm"
  | "submit:project-idea"
  | "switch:dashboard-mode"

  // Timer
  | "start:timer"
  | "pause:timer"
  | "stop:timer"

  // Search & Filter
  | "open:command-palette"
  | "search:global"
  | "filter:items"
  | "clear:filter"

  // Quick actions
  | "quick:new-note"
  | "quick:new-idea"
  | "quick:save-url"
  | "quick:search"

// =============================================================================
// CONTEXT TYPES
// =============================================================================

/**
 * Context describes WHERE an intent-bearing element is located.
 * Helps agents understand the same action in different contexts.
 */
export type AXContext =
  | "sidebar"
  | "sidebar-collapsed"
  | "header-action"
  | "empty-state"
  | "list-item"
  | "card-action"
  | "drawer-tab"
  | "drawer-action"
  | "drawer-inbox"
  | "modal"
  | "command-palette"
  | "quick-actions"
  | "dashboard-widget"
  | "page-header"
  | "inline-action"

// =============================================================================
// HELPER TYPES
// =============================================================================

/**
 * Props for components that support AX annotations
 */
export interface AXProps {
  "data-ax-intent"?: AXIntent
  "data-ax-context"?: AXContext
}

/**
 * Type-safe helper for creating AX attributes
 */
export function axAttrs(intent: AXIntent, context?: AXContext): AXProps {
  const attrs: AXProps = { "data-ax-intent": intent }
  if (context) {
    attrs["data-ax-context"] = context
  }
  return attrs
}

// =============================================================================
// ENTITY ATTRIBUTE TYPES
// =============================================================================

export type AXEntityType =
  | "project"
  | "task"
  | "blocker"
  | "note"
  | "call"
  | "library-item"

export interface AXEntityProps {
  "data-ax-entity"?: AXEntityType
  "data-ax-entity-id"?: string
  "data-ax-stale-level"?: "fresh" | "aging" | "stale" | "critical"
  "data-ax-stale-days"?: string
  "data-ax-needs-attention"?: "true" | "false"
  "data-ax-attention-reason"?: string
  "data-ax-relationships"?: string // JSON stringified
}

export interface AXStalenessInput {
  staleLevel: "fresh" | "aging" | "stale" | "critical"
  ageInDays: number
  needsAttention: boolean
  attentionReason?: string
}

export interface AXRelationshipInput {
  type: string
  entity: string
  id: string
  name?: string
}

/**
 * Type-safe helper for creating AX entity attributes
 */
export function axEntityAttrs(
  entity: AXEntityType,
  id: string,
  staleness?: AXStalenessInput,
  relationships?: AXRelationshipInput[]
): AXEntityProps {
  const attrs: AXEntityProps = {
    "data-ax-entity": entity,
    "data-ax-entity-id": id,
  }

  if (staleness) {
    attrs["data-ax-stale-level"] = staleness.staleLevel
    attrs["data-ax-stale-days"] = String(staleness.ageInDays)
    attrs["data-ax-needs-attention"] = staleness.needsAttention ? "true" : "false"
    if (staleness.attentionReason) {
      attrs["data-ax-attention-reason"] = staleness.attentionReason
    }
  }

  if (relationships && relationships.length > 0) {
    attrs["data-ax-relationships"] = JSON.stringify(relationships)
  }

  return attrs
}
