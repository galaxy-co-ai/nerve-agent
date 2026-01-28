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
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, Sparkles, Plus, X } from "lucide-react"
import { quickCreateNote } from "@/lib/actions/notes"

export function QuickNoteDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)

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

  const generateTitle = useCallback(async (noteContent: string): Promise<string> => {
    const response = await fetch("/api/ai/writing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate-title",
        content: noteContent,
      }),
    })
    if (!response.ok) throw new Error("Failed to generate title")
    const data = await response.json()
    return data.result?.trim() || "Untitled Note"
  }, [])

  const suggestTags = useCallback(async () => {
    if (!content.trim()) return
    setIsLoadingTags(true)
    try {
      const response = await fetch("/api/ai/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggest-tags",
          content,
          context: { title: title || "Quick Note" },
        }),
      })
      if (!response.ok) throw new Error("Failed to get suggestions")
      const data = await response.json()
      const suggestions = Array.isArray(data.result) ? data.result : []
      setSuggestedTags(suggestions.filter((t: string) => !tags.includes(t)))
    } catch (error) {
      console.error("Failed to suggest tags:", error)
    } finally {
      setIsLoadingTags(false)
    }
  }, [content, title, tags])

  const addTag = (tag: string) => {
    const normalized = tag.toLowerCase().trim().replace(/\s+/g, "-")
    if (normalized && !tags.includes(normalized)) {
      setTags([...tags, normalized])
      setSuggestedTags((prev) => prev.filter((t) => t !== normalized))
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setPending(true)
    try {
      // Generate title if empty
      let finalTitle = title.trim()
      if (!finalTitle) {
        finalTitle = await generateTitle(content.trim())
      }

      const note = await quickCreateNote(finalTitle, content.trim(), undefined, tags)
      setOpen(false)
      setTitle("")
      setContent("")
      setTags([])
      setSuggestedTags([])
      router.push(`/notes/${note.slug}`)
    } catch (error) {
      console.error("Failed to create note:", error)
    } finally {
      setPending(false)
    }
  }, [title, content, tags, router, generateTitle])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTitle("")
      setContent("")
      setTags([])
      setSuggestedTags([])
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
              Capture a thought quickly. Leave title empty and AI will generate one.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quick-title">Title (optional)</Label>
              <Input
                id="quick-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Leave empty for AI-generated title"
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
                className="min-h-[120px] font-mono text-sm"
              />
            </div>

            {/* Tags Section */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Tags</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={suggestTags}
                  disabled={isLoadingTags || !content.trim()}
                  className="h-7 text-xs"
                >
                  {isLoadingTags ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  Suggest Tags
                </Button>
              </div>

              {/* Current Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-0.5 hover:text-destructive"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* AI Suggested Tags */}
              {suggestedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {suggestedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 text-xs border-dashed"
                      onClick={() => addTag(tag)}
                    >
                      <Plus className="h-2.5 w-2.5 mr-0.5" />
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
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
              disabled={pending || !content.trim()}
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {!title.trim() ? "Generating title..." : "Creating..."}
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
