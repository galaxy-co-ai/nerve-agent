"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getPusherClient,
  PUSHER_EVENTS,
  type PresencePayload,
  type PresenceStatus,
} from "@/lib/pusher-client"
import type { Channel } from "pusher-js"

// =============================================================================
// Types
// =============================================================================

export interface PresenceData {
  userId: string
  status: PresenceStatus
  customStatus: string | null
  projectId: string | null
  projectName: string | null
  area: string | null
  userName: string | null
  avatarUrl: string | null
  lastActivityAt: Date
  display: {
    emoji: string
    label: string
    color: string
  }
  message: string
}

// =============================================================================
// Hook: Subscribe to a user's presence (for clients watching dev)
// =============================================================================

export function usePresence(userId: string | undefined) {
  const [presence, setPresence] = useState<PresenceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch current presence from API
  const refreshPresence = useCallback(async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/presence?userId=${userId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch presence")
      }
      const data = await response.json()

      if (data.exists && data.presence) {
        setPresence({
          ...data.presence,
          lastActivityAt: new Date(data.presence.lastActivityAt),
        })
      } else {
        setPresence(null)
      }
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Subscribe to Pusher channel for real-time updates
  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    // Initial fetch
    refreshPresence()

    // Set up Pusher subscription
    let channel: Channel | null = null
    try {
      const pusher = getPusherClient()
      const channelName = `presence-${userId}`
      channel = pusher.subscribe(channelName)

      // Handle presence updates
      channel.bind(PUSHER_EVENTS.PRESENCE_CHANGED, (data: PresencePayload) => {
        setPresence({
          userId: data.userId,
          status: data.status,
          customStatus: data.customStatus,
          projectId: data.projectId,
          projectName: data.projectName,
          area: data.area,
          userName: data.userName,
          avatarUrl: data.avatarUrl,
          lastActivityAt: new Date(data.lastActivityAt),
          display: getStatusDisplay(data.status),
          message: formatPresenceMessage(data),
        })
      })
    } catch (err) {
      console.error("[Pusher] Presence subscription error:", err)
    }

    // Cleanup
    return () => {
      if (channel) {
        channel.unbind_all()
        try {
          const pusher = getPusherClient()
          pusher.unsubscribe(`presence-${userId}`)
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }, [userId, refreshPresence])

  return {
    presence,
    isLoading,
    error,
    refreshPresence,
  }
}

// =============================================================================
// Hook: Update own presence (for dev heartbeat)
// =============================================================================

export function usePresenceHeartbeat(userId: string | undefined) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const updatePresence = useCallback(
    async (data: {
      projectId?: string
      area?: string
      taskId?: string
      customStatus?: string
    }) => {
      if (!userId) return

      try {
        const response = await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (response.ok) {
          setLastUpdate(new Date())
        }
      } catch (err) {
        console.error("[Presence] Heartbeat failed:", err)
      }
    },
    [userId]
  )

  // Auto-heartbeat every 5 minutes to maintain online status
  useEffect(() => {
    if (!userId) return

    const interval = setInterval(
      () => {
        updatePresence({})
      },
      5 * 60 * 1000
    ) // 5 minutes

    // Initial heartbeat
    updatePresence({})

    return () => clearInterval(interval)
  }, [userId, updatePresence])

  return {
    updatePresence,
    lastUpdate,
  }
}

// =============================================================================
// Display Utilities (duplicated from server for client-side use)
// =============================================================================

function getStatusDisplay(status: PresenceStatus): {
  emoji: string
  label: string
  color: string
} {
  switch (status) {
    case "ONLINE":
      return { emoji: "🟢", label: "Online", color: "text-green-500" }
    case "AWAY":
      return { emoji: "🟡", label: "Away", color: "text-yellow-500" }
    case "OFFLINE":
      return { emoji: "🔴", label: "Offline", color: "text-gray-500" }
    case "DEEP_WORK":
      return { emoji: "🎯", label: "Deep Work", color: "text-purple-500" }
    case "IN_MEETING":
      return { emoji: "📞", label: "In Meeting", color: "text-blue-500" }
    case "AFTER_HOURS":
      return { emoji: "💤", label: "After Hours", color: "text-gray-400" }
    case "CUSTOM":
      return { emoji: "✨", label: "Custom", color: "text-indigo-500" }
    default:
      return { emoji: "⚪", label: "Unknown", color: "text-gray-400" }
  }
}

function formatPresenceMessage(presence: PresencePayload): string {
  const { emoji } = getStatusDisplay(presence.status)

  if (presence.customStatus) {
    return `${emoji} ${presence.customStatus}`
  }

  if (presence.projectName && presence.area) {
    return `${emoji} Working on ${presence.projectName} → ${presence.area}`
  }

  if (presence.projectName) {
    return `${emoji} Working on ${presence.projectName}`
  }

  const { label } = getStatusDisplay(presence.status)
  return `${emoji} ${label}`
}
