"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNoteOrganization } from "@/hooks/use-note-organization"

interface Project {
  id: string
  name: string
}

interface NoteComposerProps {
  projects: Project[]
}

export function NoteComposer({ projects }: NoteComposerProps) {
  const router = useRouter()
  const { organizeNote } = useNoteOrganization()
  const [isExpanded, setIsExpanded] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [projectId, setProjectId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  // Auto-focus title when expanded
  useEffect(() => {
    if (isExpanded && titleRef.current) {
      titleRef.current.focus()
    }
  }, [isExpanded])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`
    }
  }, [content])

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return

    setIsSubmitting(true)
    const noteTitle = title.trim()
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noteTitle,
          content: content.trim(),
          projectId: projectId || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create note")
      }

      const note = await response.json()

      // Reset form
      setTitle("")
      setContent("")
      setProjectId("")
      setIsExpanded(false)

      // Trigger AI organization (shows toast automatically based on confidence)
      organizeNote(note.id, noteTitle).catch((err) => {
        // Silent fail - organization is not critical to note creation
        console.error("Organization failed:", err)
      })

      // Navigate to the new note
      router.push(`/notes/${note.slug}`)
    } catch (error) {
      console.error("Error creating note:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setTitle("")
    setContent("")
    setProjectId("")
    setIsExpanded(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
    // Escape to cancel
    if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (!isExpanded) {
    return (
      <Card
        className="cursor-text border-dashed hover:border-solid hover:border-primary/50 transition-all"
        onClick={() => setIsExpanded(true)}
      >
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <span className="text-muted-foreground">Start writing a new note...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/50">
      <CardContent className="p-4 space-y-4" onKeyDown={handleKeyDown}>
        <Input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="text-lg font-semibold border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
        />

        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing... Use [[wiki links]] to connect ideas."
          className={cn(
            "min-h-[120px] resize-none border-0 px-0 focus-visible:ring-0",
            "placeholder:text-muted-foreground/50"
          )}
        />

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {projects.length > 0 && (
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="w-[180px] h-8 text-sm">
                  <SelectValue placeholder="Link to project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Ctrl+Enter to save
            </span>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Note"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
