// =============================================================================
// Comment Notifications - Toast notifications for new comments
// =============================================================================

"use client"

import { useEffect, useCallback } from "react"
import { usePusher } from "@/lib/pusher-client"
import { useToast } from "@/hooks/use-toast"
import type { CommentWithAuthor } from "@/lib/comments"

// =============================================================================
// Types
// =============================================================================

interface CommentNotificationPayload {
  comment: CommentWithAuthor
  entityType: string
  entityId: string
  timestamp: string
}

// =============================================================================
// Hook - useCommentNotifications
// =============================================================================

interface UseCommentNotificationsOptions {
  entityType: string
  entityId: string
  currentUserId: string
  enabled?: boolean
}

/**
 * Subscribe to comment notifications for an entity and show toasts
 */
export function useCommentNotifications({
  entityType,
  entityId,
  currentUserId,
  enabled = true,
}: UseCommentNotificationsOptions) {
  const { addToast } = useToast()

  const handleNewComment = useCallback(
    (data: CommentNotificationPayload) => {
      // Don't notify for own comments
      if (data.comment.userId === currentUserId) return

      const authorName = data.comment.user.name || "Someone"
      const isReply = !!data.comment.parentId

      addToast({
        title: isReply ? "New Reply" : "New Comment",
        description: `${authorName}: ${truncate(data.comment.content, 60)}`,
        duration: 5000,
      })
    },
    [currentUserId, addToast]
  )

  const channelName = enabled ? `${entityType}-${entityId}` : undefined
  usePusher(channelName, "comment:new", handleNewComment)
}

// =============================================================================
// Component - CommentNotificationProvider
// =============================================================================

interface CommentNotificationProviderProps {
  entityType: string
  entityId: string
  currentUserId: string
  children: React.ReactNode
}

/**
 * Provider component that enables comment notifications for children
 */
export function CommentNotificationProvider({
  entityType,
  entityId,
  currentUserId,
  children,
}: CommentNotificationProviderProps) {
  useCommentNotifications({ entityType, entityId, currentUserId })
  return <>{children}</>
}

// =============================================================================
// Multi-entity Notifications (for dashboard)
// =============================================================================

interface EntitySubscription {
  entityType: string
  entityId: string
}

interface UseMultiCommentNotificationsOptions {
  entities: EntitySubscription[]
  currentUserId: string
  enabled?: boolean
}

/**
 * Subscribe to comment notifications for multiple entities
 */
export function useMultiCommentNotifications({
  entities,
  currentUserId,
  enabled = true,
}: UseMultiCommentNotificationsOptions) {
  const { addToast } = useToast()

  useEffect(() => {
    if (!enabled || entities.length === 0) return

    // Import pusher client dynamically to avoid SSR issues
    let cleanup: (() => void) | undefined

    const setupSubscriptions = async () => {
      const { getPusherClient } = await import("@/lib/pusher-client")
      const client = getPusherClient()
      const handlers: Array<{ channel: string; handler: (data: CommentNotificationPayload) => void }> = []

      for (const entity of entities) {
        const channelName = `${entity.entityType}-${entity.entityId}`
        const channel = client.subscribe(channelName)

        const handler = (data: CommentNotificationPayload) => {
          // Don't notify for own comments
          if (data.comment.userId === currentUserId) return

          const authorName = data.comment.user.name || "Someone"
          const isReply = !!data.comment.parentId

          addToast({
            title: isReply ? "New Reply" : "New Comment",
            description: `${authorName} on ${entity.entityType}: ${truncate(data.comment.content, 50)}`,
            duration: 5000,
          })
        }

        channel.bind("comment:new", handler)
        handlers.push({ channel: channelName, handler })
      }

      cleanup = () => {
        for (const { channel, handler } of handlers) {
          const ch = client.channel(channel)
          if (ch) {
            ch.unbind("comment:new", handler)
            client.unsubscribe(channel)
          }
        }
      }
    }

    setupSubscriptions()

    return () => cleanup?.()
  }, [entities, currentUserId, enabled, addToast])
}

// =============================================================================
// Utility
// =============================================================================

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + "..."
}
