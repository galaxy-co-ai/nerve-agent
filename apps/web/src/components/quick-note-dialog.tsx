"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, FileText } from "lucide-react"
import { quickCreateNote } from "@/lib/actions/notes"

export function QuickNoteDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+N or Ctrl+Shift+N
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "n") {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setPending(true)
    try {
      const note = await quickCreateNote(title.trim(), content.trim())
      setOpen(false)
      setTitle("")
      setContent("")
      router.push(`/notes/${note.slug}`)
    } catch (error) {
      console.error("Failed to create note:", error)
    } finally {
      setPending(false)
    }
  }, [title, content, router])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTitle("")
      setContent("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quick Note
            </DialogTitle>
            <DialogDescription>
              Capture a thought quickly. Press{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Cmd+Shift+N</kbd>{" "}
              from anywhere.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quick-title">Title</Label>
              <Input
                id="quick-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's this about?"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quick-content">Content</Label>
              <Textarea
                id="quick-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts...

Use [[Note Title]] to link to other notes."
                className="min-h-[150px] font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || !title.trim() || !content.trim()}
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Note"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
