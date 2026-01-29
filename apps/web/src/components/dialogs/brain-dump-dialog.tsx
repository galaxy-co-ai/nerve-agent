"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, FileText, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

// 5 predefined categories for auto-tagging
const CATEGORIES = [
  { id: "idea", label: "Idea", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { id: "task", label: "Task", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { id: "reference", label: "Reference", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { id: "insight", label: "Insight", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { id: "decision", label: "Decision", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
]

interface ParsedNote {
  title: string
  content: string
  tag: string
}

interface BrainDumpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BrainDumpDialog({ open, onOpenChange }: BrainDumpDialogProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [isParsing, setIsParsing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [parsedNotes, setParsedNotes] = useState<ParsedNote[]>([])
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"input" | "preview" | "done">("input")
  const [createdCount, setCreatedCount] = useState(0)

  const handleParse = async () => {
    if (!content.trim()) return

    setIsParsing(true)
    setError(null)

    try {
      const response = await fetch("/api/notes/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to parse notes")
      }

      const data = await response.json()
      setParsedNotes(data.notes)
      setStep("preview")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsParsing(false)
    }
  }

  const handleCreate = async () => {
    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch("/api/notes/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: parsedNotes }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create notes")
      }

      const data = await response.json()
      setCreatedCount(data.created)
      setStep("done")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setContent("")
    setParsedNotes([])
    setError(null)
    setStep("input")
    setCreatedCount(0)
    onOpenChange(false)
  }

  const handleBack = () => {
    setStep("input")
    setParsedNotes([])
  }

  const getCategoryStyle = (tag: string) => {
    const category = CATEGORIES.find((c) => c.id === tag)
    return category?.color || "bg-muted text-muted-foreground"
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-400" />
            Brain Dump
          </DialogTitle>
          <DialogDescription>
            {step === "input" && "Dump your thoughts. AI will split them into organized notes."}
            {step === "preview" && `Found ${parsedNotes.length} notes. Review before creating.`}
            {step === "done" && `Created ${createdCount} notes successfully!`}
          </DialogDescription>
        </DialogHeader>

        {/* Categories legend */}
        {step === "input" && (
          <div className="flex flex-wrap gap-2 py-2">
            {CATEGORIES.map((cat) => (
              <Badge key={cat.id} variant="outline" className={cn("text-xs", cat.color)}>
                {cat.label}
              </Badge>
            ))}
          </div>
        )}

        {step === "input" && (
          <div className="flex-1 min-h-0">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Dump your thoughts here...

Example:
---
Need to implement auth flow for the app. Should use Clerk for simplicity.

Learned that Next.js 15 requires Suspense boundaries around useSearchParams. Got burned by this on Vercel deploy.

TODO: Set up Stripe integration for payments
TODO: Write tests for the API endpoints

The dashboard should show daily stats at the top - time tracked, tasks completed, active blockers.
---

AI will split this into separate notes and auto-tag them.`}
              className="min-h-[300px] h-full resize-none font-mono text-sm"
              autoFocus
            />
          </div>
        )}

        {step === "preview" && (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 py-2">
            {parsedNotes.map((note, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border bg-card/50 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm">{note.title}</h4>
                  <Badge variant="outline" className={cn("text-xs shrink-0", getCategoryStyle(note.tag))}>
                    {note.tag}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {step === "done" && (
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-green-500/20 p-4 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-lg font-medium mb-2">Notes Created!</p>
            <p className="text-sm text-muted-foreground">
              {createdCount} notes have been added to your collection.
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <DialogFooter>
          {step === "input" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleParse} disabled={!content.trim() || isParsing}>
                {isParsing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Parse with AI
                  </>
                )}
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Create {parsedNotes.length} Notes
                  </>
                )}
              </Button>
            </>
          )}

          {step === "done" && (
            <Button onClick={handleClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
