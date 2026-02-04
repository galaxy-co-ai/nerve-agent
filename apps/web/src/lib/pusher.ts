// =============================================================================
// Pusher Server Client - Real-time Communication with Desktop App
// =============================================================================

import Pusher from "pusher"

// Singleton pattern for Pusher server instance (lazy initialization)
const globalForPusher = globalThis as unknown as {
  pusher: Pusher | undefined
}

function createPusherClient(): Pusher {
  const appId = process.env.PUSHER_APP_ID || "2109481"
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || "f919f7a62de70f654108"
  const secret = process.env.PUSHER_SECRET || "287f7cc9fb9796127f47"
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2"

  if (!appId || !key || !secret) {
    throw new Error(
      "Missing Pusher configuration. Set PUSHER_APP_ID, NEXT_PUBLIC_PUSHER_KEY, and PUSHER_SECRET."
    )
  }

  return new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  })
}

/**
 * Get the Pusher server client (lazy initialization to avoid build-time errors)
 */
export function getPusher(): Pusher {
  if (!globalForPusher.pusher) {
    globalForPusher.pusher = createPusherClient()
  }
  return globalForPusher.pusher
}

// Legacy export for backwards compatibility - lazy getter
export const pusher = {
  trigger: (...args: Parameters<Pusher["trigger"]>) => getPusher().trigger(...args),
  authorizeChannel: (...args: Parameters<Pusher["authorizeChannel"]>) => getPusher().authorizeChannel(...args),
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the private channel name for a user's desktop connection
 */
export function getDesktopChannelName(userId: string): string {
  return `private-desktop-${userId}`
}

/**
 * Send an event to a user's desktop app
 */
export async function sendToDesktop(
  userId: string,
  event: string,
  data: unknown
): Promise<void> {
  const channelName = getDesktopChannelName(userId)
  await getPusher().trigger(channelName, event, data)
}

/**
 * Authenticate a Pusher channel subscription
 */
export function authenticateChannel(
  socketId: string,
  channelName: string,
  presenceData?: { user_id: string; user_info?: Record<string, unknown> }
): { auth: string; channel_data?: string } {
  if (presenceData) {
    return getPusher().authorizeChannel(socketId, channelName, presenceData)
  }
  return getPusher().authorizeChannel(socketId, channelName)
}

// =============================================================================
// Pusher Event Names
// =============================================================================

export const PUSHER_EVENTS = {
  // Desktop → Web (client events, prefixed with "client-")
  DESKTOP_CONNECTED: "client-desktop-connected",
  DESKTOP_STATUS: "client-desktop-status",
  FILE_CHANGED: "client-file-changed",
  COMMAND_RESULT: "client-command-result",
  DESKTOP_ERROR: "client-error",
  DIRECTORY_SCANNED: "client-directory-scanned",
  DIRECTORY_SCAN_ERROR: "client-directory-scan-error",

  // Real-time Activity (Desktop → Web)
  ACTIVITY_EVENT: "client-activity-event",
  TIMER_STARTED: "client-timer-started",
  TIMER_STOPPED: "client-timer-stopped",
  TASK_STARTED: "client-task-started",
  TASK_COMPLETED: "client-task-completed",
  SYNC_COMPLETE: "client-sync-complete",
  SYNC_ERROR: "client-sync-error",

  // Presence (Server → Client)
  PRESENCE_CHANGED: "status:changed",

  // Client Portal (Server → Client)
  CLIENT_ACTIVITY_NEW: "activity:new",
  CLIENT_MILESTONE_UPDATED: "milestone:updated",
  CLIENT_BLOCKER_RESOLVED: "blocker:resolved",
  CLIENT_FEEDBACK_NEW: "feedback:new",
  CLIENT_COMMENT_NEW: "comment:new",

  // Web → Desktop (server events)
  READ_FILE: "web-read-file",
  WRITE_FILE: "web-write-file",
  LIST_DIRECTORY: "web-list-directory",
  SYSTEM_INFO: "web-system-info",
  NOTIFY: "web-notify",
  CLIPBOARD_READ: "web-clipboard-read",
  CLIPBOARD_WRITE: "web-clipboard-write",
  SCAN_DIRECTORY: "web-scan-directory",
} as const

// =============================================================================
// Type Definitions for Directory Sync
// =============================================================================

export interface DirectoryScanRequest {
  requestId: string
  projectId: string
  localPath: string
}

export interface DirectoryScanResult {
  requestId: string
  projectId: string
  localPath: string
  directoryTree: Record<string, unknown>
  fileStats: Record<string, number>
  totalFiles: number
  totalFolders: number
  totalSize: number
  techStack: string[]
  packageJson?: Record<string, unknown>
  readmeContent?: string
}

export interface DirectoryScanError {
  requestId: string
  projectId: string
  localPath: string
  error: string
}

// =============================================================================
// Type Definitions for Real-time Activity
// =============================================================================

export interface ActivityEventPayload {
  id: string
  eventType: string
  title: string
  description?: string
  projectId?: string
  projectName?: string
  metadata?: Record<string, unknown>
  occurredAt: string
}

export interface TimerEventPayload {
  taskId: string
  taskTitle: string
  projectId: string
  projectName: string
  startedAt?: string
  stoppedAt?: string
  durationMinutes?: number
}

export interface TaskEventPayload {
  taskId: string
  taskTitle: string
  projectId: string
  projectName: string
  sprintNumber?: number
  status: string
  completedAt?: string
}

export interface SyncEventPayload {
  syncType: "time" | "tasks" | "activity" | "full"
  itemCount: number
  success: boolean
  error?: string
  completedAt: string
}

// Union type for all activity events
export type RealTimeEvent =
  | { type: "activity"; payload: ActivityEventPayload }
  | { type: "timer_started"; payload: TimerEventPayload }
  | { type: "timer_stopped"; payload: TimerEventPayload }
  | { type: "task_started"; payload: TaskEventPayload }
  | { type: "task_completed"; payload: TaskEventPayload }
  | { type: "sync_complete"; payload: SyncEventPayload }
  | { type: "sync_error"; payload: SyncEventPayload }
