"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StickyNote, Send, Trash2, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ProjectWorkspaceNote } from "@prisma/client"

interface NotesTabProps {
  projectSlug: string
  notes: ProjectWorkspaceNote[]
}

export function NotesTab({ projectSlug, notes }: NotesTabProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${projectSlug}/workspace-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          author: "user",
        }),
      })

      if (res.ok) {
        setContent("")
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to create note:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (noteId: string) => {
    try {
      const res = await fetch(
        `/api/projects/${projectSlug}/workspace-notes?id=${noteId}`,
        { method: "DELETE" }
      )

      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to delete note:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-3">
      {/* Input */}
      <div className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a note..."
          className="min-h-[80px] text-sm resize-none"
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Cmd+Enter to save</span>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
          >
            <Send className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <StickyNote className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">No notes yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "group relative rounded-lg border p-2.5 text-sm",
                note.author === "claude"
                  ? "border-blue-500/20 bg-blue-500/5"
                  : "border-border/40"
              )}
            >
              <div className="flex items-start gap-2">
                {note.author === "claude" ? (
                  <Sparkles className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                ) : (
                  <User className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="whitespace-pre-wrap break-words">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(note.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={() => handleDelete(note.id)}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
