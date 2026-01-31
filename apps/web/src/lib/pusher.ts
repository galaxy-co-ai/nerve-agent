// =============================================================================
// Pusher Server Client - Real-time Communication with Desktop App
// =============================================================================

import Pusher from "pusher"

// Singleton pattern for Pusher server instance
const globalForPusher = globalThis as unknown as {
  pusher: Pusher | undefined
}

function createPusherClient(): Pusher {
  const appId = process.env.PUSHER_APP_ID
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const secret = process.env.PUSHER_SECRET
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

export const pusher =
  globalForPusher.pusher ?? createPusherClient()

if (process.env.NODE_ENV !== "production") {
  globalForPusher.pusher = pusher
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
  await pusher.trigger(channelName, event, data)
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
    return pusher.authorizeChannel(socketId, channelName, presenceData)
  }
  return pusher.authorizeChannel(socketId, channelName)
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

  // Web → Desktop (server events)
  READ_FILE: "web-read-file",
  WRITE_FILE: "web-write-file",
  LIST_DIRECTORY: "web-list-directory",
  SYSTEM_INFO: "web-system-info",
  NOTIFY: "web-notify",
  CLIPBOARD_READ: "web-clipboard-read",
  CLIPBOARD_WRITE: "web-clipboard-write",
} as const
