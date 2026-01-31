// =============================================================================
// Pusher Client - Real-time Communication for Web App
// =============================================================================

import PusherClient from "pusher-js"

// Singleton pattern for Pusher client instance
let pusherClient: PusherClient | null = null

export function getPusherClient(): PusherClient {
  if (pusherClient) {
    return pusherClient
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2"

  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_PUSHER_KEY environment variable")
  }

  pusherClient = new PusherClient(key, {
    cluster,
    authEndpoint: "/api/pusher/auth",
    authTransport: "ajax",
  })

  return pusherClient
}

// =============================================================================
// Event Types
// =============================================================================

export const PUSHER_EVENTS = {
  // Desktop → Web (client events)
  DESKTOP_CONNECTED: "client-desktop-connected",
  DESKTOP_STATUS: "client-desktop-status",
  FILE_CHANGED: "client-file-changed",
  COMMAND_RESULT: "client-command-result",
  DESKTOP_ERROR: "client-error",
} as const

export type DesktopConnectedPayload = {
  deviceId: string
  name: string
  platform: string
  timestamp: string
}

export type DesktopStatusPayload = {
  deviceId: string
  status: "online" | "offline"
  timestamp: string
}
