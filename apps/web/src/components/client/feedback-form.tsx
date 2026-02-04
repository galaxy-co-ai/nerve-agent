// =============================================================================
// Client Feedback Form - Submit feedback from client portal
// =============================================================================

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bug, Lightbulb, HelpCircle, CheckCircle, Loader2, Send } from "lucide-react"

// =============================================================================
// Types
// =============================================================================

type FeedbackType = "BUG" | "SUGGESTION" | "QUESTION" | "APPROVAL"

interface FeedbackFormProps {
  projectId: string
  projectName?: string
  entityType?: string
  entityId?: string
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

// =============================================================================
// Feedback Type Config
// =============================================================================

const FEEDBACK_TYPES: {
  value: FeedbackType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}[] = [
  {
    value: "BUG",
    label: "Bug Report",
    description: "Something isn't working as expected",
    icon: Bug,
    color: "text-red-500",
  },
  {
    value: "SUGGESTION",
    label: "Feature Request",
    description: "An idea for improvement",
    icon: Lightbulb,
    color: "text-yellow-500",
  },
  {
    value: "QUESTION",
    label: "Question",
    description: "Need clarification on something",
    icon: HelpCircle,
    color: "text-blue-500",
  },
  {
    value: "APPROVAL",
    label: "Approval",
    description: "Approve a deliverable or milestone",
    icon: CheckCircle,
    color: "text-green-500",
  },
]

// =============================================================================
// Component
// =============================================================================

export function FeedbackForm({
  projectId,
  projectName,
  entityType,
  entityId,
  onSuccess,
  onCancel,
  className,
}: FeedbackFormProps) {
  const [type, setType] = useState<FeedbackType>("SUGGESTION")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const selectedType = FEEDBACK_TYPES.find((t) => t.value === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      // If entityType/entityId provided, create as comment
      // Otherwise create as portal feedback
      if (entityType && entityId) {
        const res = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType,
            entityId,
            content: `[${type}] ${content}`,
          }),
        })

        if (!res.ok) throw new Error("Failed to submit feedback")
      } else {
        // Create portal feedback (legacy path)
        // For now, create as comment on project
        const res = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType: "project",
            entityId: projectId,
            content: `[${type}] ${content}`,
          }),
        })

        if (!res.ok) throw new Error("Failed to submit feedback")
      }

      setSuccess(true)
      setContent("")
      onSuccess?.()

      // Reset success state after a moment
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium">Feedback Submitted</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Thank you for your feedback!
          </p>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => setSuccess(false)}
          >
            Submit Another
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Submit Feedback</CardTitle>
          {projectName && (
            <Badge variant="secondary" className="font-normal">
              {projectName}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Feedback Type Selection */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as FeedbackType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_TYPES.map((ft) => {
                  const Icon = ft.icon
                  return (
                    <SelectItem key={ft.value} value={ft.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${ft.color}`} />
                        <span>{ft.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="text-xs text-muted-foreground">
                {selectedType.description}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              {type === "BUG"
                ? "What happened?"
                : type === "QUESTION"
                ? "Your question"
                : type === "APPROVAL"
                ? "What are you approving?"
                : "Your feedback"}
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === "BUG"
                  ? "Describe the issue you encountered..."
                  : type === "QUESTION"
                  ? "What would you like to know?"
                  : type === "APPROVAL"
                  ? "Specify what you're approving..."
                  : "Share your idea or suggestion..."
              }
              rows={4}
              required
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={submitting || !content.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Compact Feedback Button - Opens feedback form in a dialog
// =============================================================================

interface FeedbackButtonProps {
  projectId: string
  projectName?: string
  entityType?: string
  entityId?: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
}

export function FeedbackButton({
  projectId,
  projectName,
  entityType,
  entityId,
  variant = "outline",
  size = "sm",
}: FeedbackButtonProps) {
  const [open, setOpen] = useState(false)

  if (open) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-lg mx-4">
          <FeedbackForm
            projectId={projectId}
            projectName={projectName}
            entityType={entityType}
            entityId={entityId}
            onSuccess={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <Button variant={variant} size={size} onClick={() => setOpen(true)}>
      <HelpCircle className="h-4 w-4 mr-2" />
      Feedback
    </Button>
  )
}
