// =============================================================================
// Comment Hooks - React hooks for comment system
// =============================================================================

"use client"

import { useState, useEffect, useCallback } from "react"
import { usePusher } from "@/lib/pusher-client"
import type { CommentEntityType, CommentWithAuthor, Reaction } from "@/lib/comments"

// =============================================================================
// useComments - Fetch and manage comments for an entity
// =============================================================================

interface UseCommentsOptions {
  limit?: number
  includeReplies?: boolean
}

export function useComments(
  entityType: CommentEntityType,
  entityId: string,
  options?: UseCommentsOptions
) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { limit = 50, includeReplies = true } = options || {}

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        entityType,
        entityId,
        limit: limit.toString(),
        includeReplies: includeReplies.toString(),
      })

      const res = await fetch(`/api/comments?${params}`)
      if (!res.ok) throw new Error("Failed to fetch comments")

      const data = await res.json()
      setComments(data.comments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch comments")
    } finally {
      setLoading(false)
    }
  }, [entityType, entityId, limit, includeReplies])

  // Initial fetch
  useEffect(() => {
    if (entityType && entityId) {
      fetchComments()
    }
  }, [fetchComments, entityType, entityId])

  // Subscribe to real-time updates via Pusher
  const channelName = `${entityType}-${entityId}`
  usePusher(channelName, "comment:new", (data: { comment: CommentWithAuthor }) => {
    // Add new comment to list (or add as reply if it has parentId)
    setComments((prev) => {
      if (data.comment.parentId) {
        // It's a reply - find parent and add to replies
        return prev.map((c) => {
          if (c.id === data.comment.parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), data.comment],
              _count: { replies: (c._count?.replies || 0) + 1 },
            }
          }
          return c
        })
      }
      // It's a top-level comment - add to beginning
      return [data.comment, ...prev]
    })
  })

  // Create comment
  const createComment = useCallback(
    async (content: string, parentId?: string | null) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, content, parentId }),
      })

      if (!res.ok) throw new Error("Failed to create comment")

      const data = await res.json()
      // Comment will be added via Pusher, but return it for immediate use
      return data.comment as CommentWithAuthor
    },
    [entityType, entityId]
  )

  // Update comment
  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) throw new Error("Failed to update comment")

      const data = await res.json()

      // Update in local state
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) return data.comment
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId ? data.comment : r
              ),
            }
          }
          return c
        })
      )

      return data.comment as CommentWithAuthor
    },
    []
  )

  // Delete comment
  const deleteComment = useCallback(async (commentId: string) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
    })

    if (!res.ok) throw new Error("Failed to delete comment")

    // Remove from local state
    setComments((prev) =>
      prev
        .filter((c) => c.id !== commentId)
        .map((c) => ({
          ...c,
          replies: c.replies?.filter((r) => r.id !== commentId),
        }))
    )
  }, [])

  // Add reaction
  const addReaction = useCallback(
    async (commentId: string, emoji: string) => {
      const res = await fetch(`/api/comments/${commentId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      })

      if (!res.ok) throw new Error("Failed to add reaction")

      const data = await res.json()

      // Update in local state
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) return { ...c, reactions: data.comment.reactions }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId ? { ...r, reactions: data.comment.reactions } : r
              ),
            }
          }
          return c
        })
      )

      return data.comment as CommentWithAuthor
    },
    []
  )

  // Remove reaction
  const removeReaction = useCallback(async (commentId: string, emoji: string) => {
    const res = await fetch(`/api/comments/${commentId}/reactions?emoji=${encodeURIComponent(emoji)}`, {
      method: "DELETE",
    })

    if (!res.ok) throw new Error("Failed to remove reaction")

    const data = await res.json()

    // Update in local state
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) return { ...c, reactions: data.comment.reactions }
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === commentId ? { ...r, reactions: data.comment.reactions } : r
            ),
          }
        }
        return c
      })
    )

    return data.comment as CommentWithAuthor
  }, [])

  return {
    comments,
    loading,
    error,
    refetch: fetchComments,
    createComment,
    updateComment,
    deleteComment,
    addReaction,
    removeReaction,
  }
}

// =============================================================================
// useCommentCount - Get comment count for an entity
// =============================================================================

export function useCommentCount(entityType: CommentEntityType, entityId: string) {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!entityType || !entityId) return

    const fetchCount = async () => {
      try {
        const params = new URLSearchParams({ entityType, entityId, limit: "1" })
        const res = await fetch(`/api/comments?${params}`)
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setCount(data.count || 0)
      } catch {
        // Ignore errors for count
      } finally {
        setLoading(false)
      }
    }

    fetchCount()
  }, [entityType, entityId])

  // Subscribe to new comments to update count
  const channelName = `${entityType}-${entityId}`
  usePusher(channelName, "comment:new", () => {
    setCount((c) => c + 1)
  })

  return { count, loading }
}

// =============================================================================
// Reaction helpers
// =============================================================================

export const COMMON_REACTIONS = ["👍", "❤️", "🎉", "🤔", "👀", "🚀"]

export function groupReactions(reactions: Reaction[]): Map<string, Reaction[]> {
  const grouped = new Map<string, Reaction[]>()
  for (const reaction of reactions) {
    const existing = grouped.get(reaction.emoji) || []
    grouped.set(reaction.emoji, [...existing, reaction])
  }
  return grouped
}

export function hasUserReacted(reactions: Reaction[], userId: string, emoji: string): boolean {
  return reactions.some((r) => r.userId === userId && r.emoji === emoji)
}
