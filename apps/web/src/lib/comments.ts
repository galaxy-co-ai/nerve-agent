// =============================================================================
// Comment System - Threaded Comments with Reactions
// =============================================================================
//
// Features:
// - Polymorphic: comments on any entity (project, deliverable, feedback, etc.)
// - Threading: nested replies
// - Reactions: emoji reactions with user tracking
// - Real-time: Pusher broadcasts for new comments
//
// =============================================================================

import { db } from "@/lib/db"
import { getPusher, PUSHER_EVENTS } from "@/lib/pusher"
import type { Prisma } from "@prisma/client"

// =============================================================================
// Types
// =============================================================================

export type CommentEntityType =
  | "project"
  | "deliverable"
  | "feedback"
  | "activity"
  | "blocker"

export interface Reaction {
  emoji: string
  userId: string
  createdAt: string
}

export interface CommentWithAuthor {
  id: string
  userId: string
  entityType: string
  entityId: string
  parentId: string | null
  content: string
  reactions: Reaction[]
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string | null
    avatarUrl: string | null
    role: string
  }
  replies?: CommentWithAuthor[]
  _count?: {
    replies: number
  }
}

// Helper to safely cast JSON to Reaction[]
function toReactions(json: Prisma.JsonValue): Reaction[] {
  if (!json || !Array.isArray(json)) return []
  return json as unknown as Reaction[]
}

// =============================================================================
// Comment Operations
// =============================================================================

interface CreateCommentParams {
  userId: string
  entityType: CommentEntityType
  entityId: string
  content: string
  parentId?: string | null
}

/**
 * Create a new comment and broadcast via Pusher
 */
export async function createComment(params: CreateCommentParams): Promise<CommentWithAuthor> {
  const { userId, entityType, entityId, content, parentId } = params

  const comment = await db.comment.create({
    data: {
      userId,
      entityType,
      entityId,
      content,
      parentId: parentId || null,
      reactions: [],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
        },
      },
      _count: {
        select: { replies: true },
      },
    },
  })

  const result: CommentWithAuthor = {
    id: comment.id,
    userId: comment.userId,
    entityType: comment.entityType,
    entityId: comment.entityId,
    parentId: comment.parentId,
    content: comment.content,
    reactions: toReactions(comment.reactions),
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    user: comment.user,
    _count: comment._count,
  }

  // Broadcast new comment via Pusher
  await broadcastNewComment(entityType, entityId, result)

  return result
}

/**
 * Get comments for an entity with nested replies
 */
export async function getComments(
  entityType: CommentEntityType,
  entityId: string,
  options?: {
    limit?: number
    cursor?: string
    includeReplies?: boolean
  }
): Promise<CommentWithAuthor[]> {
  const { limit = 50, cursor, includeReplies = true } = options || {}

  // Get top-level comments with replies
  if (includeReplies) {
    const comments = await db.comment.findMany({
      where: {
        entityType,
        entityId,
        parentId: null, // Only top-level
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        },
        _count: {
          select: { replies: true },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                role: true,
              },
            },
            _count: {
              select: { replies: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    })

    return comments.map((c) => ({
      id: c.id,
      userId: c.userId,
      entityType: c.entityType,
      entityId: c.entityId,
      parentId: c.parentId,
      content: c.content,
      reactions: toReactions(c.reactions),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      user: c.user,
      _count: c._count,
      replies: c.replies.map((r) => ({
        id: r.id,
        userId: r.userId,
        entityType: r.entityType,
        entityId: r.entityId,
        parentId: r.parentId,
        content: r.content,
        reactions: toReactions(r.reactions),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: r.user,
        _count: r._count,
      })),
    }))
  }

  // Get top-level comments without replies
  const comments = await db.comment.findMany({
    where: {
      entityType,
      entityId,
      parentId: null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
        },
      },
      _count: {
        select: { replies: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
  })

  return comments.map((c) => ({
    id: c.id,
    userId: c.userId,
    entityType: c.entityType,
    entityId: c.entityId,
    parentId: c.parentId,
    content: c.content,
    reactions: toReactions(c.reactions),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    user: c.user,
    _count: c._count,
  }))
}

/**
 * Get a single comment by ID
 */
export async function getComment(commentId: string): Promise<CommentWithAuthor | null> {
  const comment = await db.comment.findUnique({
    where: { id: commentId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
        },
      },
      _count: {
        select: { replies: true },
      },
    },
  })

  if (!comment) return null

  return {
    id: comment.id,
    userId: comment.userId,
    entityType: comment.entityType,
    entityId: comment.entityId,
    parentId: comment.parentId,
    content: comment.content,
    reactions: toReactions(comment.reactions),
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    user: comment.user,
    _count: comment._count,
  }
}

/**
 * Update a comment's content
 */
export async function updateComment(
  commentId: string,
  userId: string,
  content: string
): Promise<CommentWithAuthor | null> {
  // Verify ownership
  const existing = await db.comment.findUnique({
    where: { id: commentId },
  })

  if (!existing || existing.userId !== userId) {
    return null
  }

  const comment = await db.comment.update({
    where: { id: commentId },
    data: { content },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
        },
      },
      _count: {
        select: { replies: true },
      },
    },
  })

  return {
    id: comment.id,
    userId: comment.userId,
    entityType: comment.entityType,
    entityId: comment.entityId,
    parentId: comment.parentId,
    content: comment.content,
    reactions: toReactions(comment.reactions),
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    user: comment.user,
    _count: comment._count,
  }
}

/**
 * Delete a comment (and its replies via cascade)
 */
export async function deleteComment(commentId: string, userId: string): Promise<boolean> {
  // Verify ownership
  const existing = await db.comment.findUnique({
    where: { id: commentId },
  })

  if (!existing || existing.userId !== userId) {
    return false
  }

  await db.comment.delete({
    where: { id: commentId },
  })

  return true
}

// =============================================================================
// Reactions
// =============================================================================

/**
 * Add a reaction to a comment
 */
export async function addReaction(
  commentId: string,
  userId: string,
  emoji: string
): Promise<CommentWithAuthor | null> {
  const comment = await db.comment.findUnique({
    where: { id: commentId },
  })

  if (!comment) return null

  const reactions = toReactions(comment.reactions)

  // Check if user already reacted with this emoji
  const existingIndex = reactions.findIndex(
    (r) => r.userId === userId && r.emoji === emoji
  )

  if (existingIndex >= 0) {
    // Already has this reaction, do nothing
    return getComment(commentId)
  }

  // Add reaction
  const newReaction: Reaction = {
    emoji,
    userId,
    createdAt: new Date().toISOString(),
  }

  const newReactions = [...reactions, newReaction]

  const updated = await db.comment.update({
    where: { id: commentId },
    data: {
      reactions: newReactions as unknown as Prisma.InputJsonValue,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
        },
      },
      _count: {
        select: { replies: true },
      },
    },
  })

  return {
    id: updated.id,
    userId: updated.userId,
    entityType: updated.entityType,
    entityId: updated.entityId,
    parentId: updated.parentId,
    content: updated.content,
    reactions: toReactions(updated.reactions),
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    user: updated.user,
    _count: updated._count,
  }
}

/**
 * Remove a reaction from a comment
 */
export async function removeReaction(
  commentId: string,
  userId: string,
  emoji: string
): Promise<CommentWithAuthor | null> {
  const comment = await db.comment.findUnique({
    where: { id: commentId },
  })

  if (!comment) return null

  const reactions = toReactions(comment.reactions)

  // Filter out the user's reaction
  const filteredReactions = reactions.filter(
    (r) => !(r.userId === userId && r.emoji === emoji)
  )

  const updated = await db.comment.update({
    where: { id: commentId },
    data: {
      reactions: filteredReactions as unknown as Prisma.InputJsonValue,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
        },
      },
      _count: {
        select: { replies: true },
      },
    },
  })

  return {
    id: updated.id,
    userId: updated.userId,
    entityType: updated.entityType,
    entityId: updated.entityId,
    parentId: updated.parentId,
    content: updated.content,
    reactions: toReactions(updated.reactions),
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    user: updated.user,
    _count: updated._count,
  }
}

// =============================================================================
// Pusher Broadcasting
// =============================================================================

/**
 * Broadcast new comment to subscribers
 */
async function broadcastNewComment(
  entityType: string,
  entityId: string,
  comment: CommentWithAuthor
): Promise<void> {
  const pusher = getPusher()

  // Broadcast to entity-specific channel
  const channelName = `${entityType}-${entityId}`
  await pusher.trigger(channelName, PUSHER_EVENTS.CLIENT_COMMENT_NEW, {
    comment,
    entityType,
    entityId,
    timestamp: new Date().toISOString(),
  })
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get comment count for an entity
 */
export async function getCommentCount(
  entityType: CommentEntityType,
  entityId: string
): Promise<number> {
  return db.comment.count({
    where: { entityType, entityId },
  })
}

/**
 * Get recent comments across all entities for a user (for notifications)
 */
export async function getRecentCommentsForUser(
  userId: string,
  options?: { limit?: number; since?: Date }
): Promise<CommentWithAuthor[]> {
  const { limit = 20, since } = options || {}

  // Get comments on entities the user owns or has commented on
  // For now, just get all recent comments (would need entity ownership check in production)
  const comments = await db.comment.findMany({
    where: {
      ...(since && { createdAt: { gte: since } }),
      NOT: { userId }, // Exclude user's own comments
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return comments.map((c) => ({
    id: c.id,
    userId: c.userId,
    entityType: c.entityType,
    entityId: c.entityId,
    parentId: c.parentId,
    content: c.content,
    reactions: toReactions(c.reactions),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    user: c.user,
  }))
}
