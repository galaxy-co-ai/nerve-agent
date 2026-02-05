// =============================================================================
// Comment Thread - Threaded comments with reactions
// =============================================================================

"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MessageSquare,
  MoreHorizontal,
  Edit2,
  Trash2,
  SmilePlus,
  Reply,
  Loader2,
  Send,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import {
  useComments,
  COMMON_REACTIONS,
  groupReactions,
  hasUserReacted,
} from "@/hooks/use-comments"
import type { CommentEntityType, CommentWithAuthor, Reaction } from "@/lib/comments"
import { cn } from "@/lib/utils"

// =============================================================================
// Comment Thread Container
// =============================================================================

interface CommentThreadProps {
  entityType: CommentEntityType
  entityId: string
  currentUserId: string
  className?: string
}

export function CommentThread({
  entityType,
  entityId,
  currentUserId,
  className,
}: CommentThreadProps) {
  const {
    comments,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment,
    addReaction,
    removeReaction,
  } = useComments(entityType, entityId)

  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || submitting) return

    setSubmitting(true)
    try {
      await createComment(newComment.trim())
      setNewComment("")
    } catch {
      // Error handled by hook
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("text-sm text-red-500", className)}>
        Failed to load comments: {error}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>Me</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Comment
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onUpdate={updateComment}
              onDelete={deleteComment}
              onAddReaction={addReaction}
              onRemoveReaction={removeReaction}
              onReply={createComment}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Individual Comment
// =============================================================================

interface CommentItemProps {
  comment: CommentWithAuthor
  currentUserId: string
  depth?: number
  onUpdate: (id: string, content: string) => Promise<CommentWithAuthor>
  onDelete: (id: string) => Promise<void>
  onAddReaction: (id: string, emoji: string) => Promise<CommentWithAuthor>
  onRemoveReaction: (id: string, emoji: string) => Promise<CommentWithAuthor>
  onReply: (content: string, parentId?: string | null) => Promise<CommentWithAuthor>
}

function CommentItem({
  comment,
  currentUserId,
  depth = 0,
  onUpdate,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  onReply,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [replying, setReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [showReplies, setShowReplies] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const isOwner = comment.userId === currentUserId
  const hasReplies = comment.replies && comment.replies.length > 0

  const handleSaveEdit = async () => {
    if (!editContent.trim() || submitting) return
    setSubmitting(true)
    try {
      await onUpdate(comment.id, editContent.trim())
      setEditing(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || submitting) return
    setSubmitting(true)
    try {
      await onReply(replyContent.trim(), comment.id)
      setReplyContent("")
      setReplying(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleReaction = async (emoji: string) => {
    if (hasUserReacted(comment.reactions, currentUserId, emoji)) {
      await onRemoveReaction(comment.id, emoji)
    } else {
      await onAddReaction(comment.id, emoji)
    }
  }

  return (
    <div className={cn("group", depth > 0 && "ml-8 border-l-2 border-muted pl-4")}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.user.avatarUrl || undefined} />
          <AvatarFallback>
            {comment.user.name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {comment.user.name || "Unknown"}
            </span>
            {comment.user.role === "DEV" && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                Dev
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* Content */}
          {editing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(false)
                    setEditContent(comment.content)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          )}

          {/* Reactions */}
          <ReactionBar
            reactions={comment.reactions}
            currentUserId={currentUserId}
            onToggle={handleToggleReaction}
          />

          {/* Actions */}
          {!editing && (
            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {depth < 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setReplying(!replying)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}

              <ReactionPicker onSelect={handleToggleReaction} />

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(comment.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* Reply Input */}
          {replying && (
            <div className="mt-3 flex gap-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="resize-none"
                autoFocus
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReplying(false)
                    setReplyContent("")
                  }}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {hasReplies && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? (
                  <ChevronDown className="h-3 w-3 mr-1" />
                ) : (
                  <ChevronRight className="h-3 w-3 mr-1" />
                )}
                {comment.replies!.length} {comment.replies!.length === 1 ? "reply" : "replies"}
              </Button>

              {showReplies && (
                <div className="mt-2 space-y-3">
                  {comment.replies!.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      currentUserId={currentUserId}
                      depth={depth + 1}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onAddReaction={onAddReaction}
                      onRemoveReaction={onRemoveReaction}
                      onReply={onReply}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Reaction Bar
// =============================================================================

interface ReactionBarProps {
  reactions: Reaction[]
  currentUserId: string
  onToggle: (emoji: string) => void
}

function ReactionBar({ reactions, currentUserId, onToggle }: ReactionBarProps) {
  if (reactions.length === 0) return null

  const grouped = groupReactions(reactions)

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {Array.from(grouped.entries()).map(([emoji, users]) => {
        const hasReacted = users.some((r) => r.userId === currentUserId)
        return (
          <Button
            key={emoji}
            variant={hasReacted ? "secondary" : "ghost"}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => onToggle(emoji)}
          >
            {emoji} {users.length}
          </Button>
        )
      })}
    </div>
  )
}

// =============================================================================
// Reaction Picker
// =============================================================================

interface ReactionPickerProps {
  onSelect: (emoji: string) => void
}

function ReactionPicker({ onSelect }: ReactionPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          <SmilePlus className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex gap-1">
          {COMMON_REACTIONS.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-lg"
              onClick={() => {
                onSelect(emoji)
                setOpen(false)
              }}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// =============================================================================
// Skeleton
// =============================================================================

function CommentSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

// =============================================================================
// Compact Comment Count Badge
// =============================================================================

interface CommentCountProps {
  entityType: CommentEntityType
  entityId: string
  className?: string
}

export function CommentCount({ entityType, entityId, className }: CommentCountProps) {
  const { comments, loading } = useComments(entityType, entityId, { limit: 100 })

  // Count all comments including replies
  const totalCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  )

  if (loading) {
    return <Skeleton className="h-5 w-8" />
  }

  return (
    <div className={cn("flex items-center gap-1 text-muted-foreground", className)}>
      <MessageSquare className="h-4 w-4" />
      <span className="text-sm">{totalCount}</span>
    </div>
  )
}
