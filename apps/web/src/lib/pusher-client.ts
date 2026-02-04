// =============================================================================
// Pusher Client - Real-time Communication for Web App
// =============================================================================

"use client"

import { useEffect, useRef } from "react"
import PusherClient from "pusher-js"
import type { Channel } from "pusher-js"

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

// Real-time Activity Types
export type ActivityEventPayload = {
  id: string
  eventType: string
  title: string
  description?: string
  projectId?: string
  projectName?: string
  metadata?: Record<string, unknown>
  occurredAt: string
}

export type TimerEventPayload = {
  taskId: string
  taskTitle: string
  projectId: string
  projectName: string
  startedAt?: string
  stoppedAt?: string
  durationMinutes?: number
}

export type TaskEventPayload = {
  taskId: string
  taskTitle: string
  projectId: string
  projectName: string
  sprintNumber?: number
  status: string
  completedAt?: string
}

export type SyncEventPayload = {
  syncType: "time" | "tasks" | "activity" | "full"
  itemCount: number
  success: boolean
  error?: string
  completedAt: string
}

// Presence Types (Client Portal v2)
export type PresenceStatus =
  | "ONLINE"
  | "AWAY"
  | "OFFLINE"
  | "DEEP_WORK"
  | "IN_MEETING"
  | "AFTER_HOURS"
  | "CUSTOM"

export type PresencePayload = {
  userId: string
  status: PresenceStatus
  customStatus: string | null
  projectId: string | null
  projectName: string | null
  area: string | null
  userName: string | null
  avatarUrl: string | null
  lastActivityAt: string
}

// Client Portal Activity Types
export type ClientActivityPayload = {
  id: string
  type: string
  title: string
  description?: string
  timestamp: string
  visibleToClient: boolean
  clientMessage?: string
}

// Comment Types (Client Portal v2)
export type CommentPayload = {
  comment: {
    id: string
    userId: string
    entityType: string
    entityId: string
    parentId: string | null
    content: string
    reactions: unknown[]
    createdAt: string
    updatedAt: string
    user: {
      id: string
      name: string | null
      avatarUrl: string | null
      role: string
    }
  }
  entityType: string
  entityId: string
  timestamp: string
}

// =============================================================================
// React Hook - usePusher
// =============================================================================

/**
 * Subscribe to a Pusher channel and event
 * Automatically handles subscription cleanup
 */
export function usePusher<T = unknown>(
  channelName: string | undefined,
  eventName: string,
  callback: (data: T) => void
): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!channelName) return

    let channel: Channel | null = null

    try {
      const client = getPusherClient()
      channel = client.subscribe(channelName)

      const handler = (data: T) => {
        callbackRef.current(data)
      }

      channel.bind(eventName, handler)

      return () => {
        if (channel) {
          channel.unbind(eventName, handler)
          client.unsubscribe(channelName)
        }
      }
    } catch (error) {
      console.error("[Pusher] Subscription error:", error)
    }
  }, [channelName, eventName])
}

/**
 * Subscribe to multiple events on a channel
 */
export function usePusherMulti<T extends Record<string, unknown>>(
  channelName: string | undefined,
  events: { [K in keyof T]: (data: T[K]) => void }
): void {
  const eventsRef = useRef(events)
  eventsRef.current = events

  useEffect(() => {
    if (!channelName) return

    let channel: Channel | null = null

    try {
      const client = getPusherClient()
      channel = client.subscribe(channelName)

      const handlers: Array<{ event: string; handler: (data: unknown) => void }> = []

      for (const [eventName, callback] of Object.entries(eventsRef.current)) {
        const handler = (data: unknown) => {
          (callback as (data: unknown) => void)(data)
        }
        channel.bind(eventName, handler)
        handlers.push({ event: eventName, handler })
      }

      return () => {
        if (channel) {
          for (const { event, handler } of handlers) {
            channel.unbind(event, handler)
          }
          client.unsubscribe(channelName)
        }
      }
    } catch (error) {
      console.error("[Pusher] Subscription error:", error)
    }
  }, [channelName])
}
