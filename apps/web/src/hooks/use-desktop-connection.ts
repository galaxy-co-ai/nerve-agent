"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getPusherClient,
  PUSHER_EVENTS,
  type DesktopConnectedPayload,
  type DesktopStatusPayload,
} from "@/lib/pusher-client"
import type { Channel } from "pusher-js"

// =============================================================================
// Types
// =============================================================================

export interface DesktopDevice {
  id: string
  deviceId: string
  name: string | null
  platform: string
  lastSeenAt: string
  isOnline?: boolean
}

export interface DesktopStatus {
  connected: boolean
  devices: DesktopDevice[]
}

// =============================================================================
// Hook
// =============================================================================

export function useDesktopConnection(userId: string | undefined) {
  const [status, setStatus] = useState<DesktopStatus>({
    connected: false,
    devices: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch current status from API
  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/desktop/status")
      if (!response.ok) {
        throw new Error("Failed to fetch desktop status")
      }
      const data = await response.json()
      setStatus(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Subscribe to Pusher channel for real-time updates
  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    // Initial fetch
    refreshStatus()

    // Set up Pusher subscription
    let channel: Channel | null = null
    try {
      const pusher = getPusherClient()
      const channelName = `private-desktop-${userId}`
      channel = pusher.subscribe(channelName)

      // Handle desktop app connecting
      channel.bind(
        PUSHER_EVENTS.DESKTOP_CONNECTED,
        (data: DesktopConnectedPayload) => {
          console.log("[Pusher] Desktop connected:", data)
          // Refresh to get updated device list
          refreshStatus()
        }
      )

      // Handle status updates (online/offline)
      channel.bind(
        PUSHER_EVENTS.DESKTOP_STATUS,
        (data: DesktopStatusPayload) => {
          console.log("[Pusher] Desktop status update:", data)
          setStatus((prev) => ({
            ...prev,
            connected: data.status === "online" || prev.devices.some((d) => d.isOnline),
            devices: prev.devices.map((device) =>
              device.deviceId === data.deviceId
                ? { ...device, isOnline: data.status === "online" }
                : device
            ),
          }))
        }
      )
    } catch (err) {
      console.error("[Pusher] Subscription error:", err)
    }

    // Cleanup
    return () => {
      if (channel) {
        channel.unbind_all()
        try {
          const pusher = getPusherClient()
          pusher.unsubscribe(`private-desktop-${userId}`)
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }, [userId, refreshStatus])

  // Unpair a device
  const unpairDevice = useCallback(async (deviceId: string) => {
    try {
      const response = await fetch(`/api/desktop/device/${deviceId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to unpair device")
      }
      // Refresh to get updated device list
      await refreshStatus()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unpair device")
      return false
    }
  }, [refreshStatus])

  return {
    status,
    isLoading,
    error,
    refreshStatus,
    unpairDevice,
  }
}
