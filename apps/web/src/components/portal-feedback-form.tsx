"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MessageSquare, Bug, Lightbulb, HelpCircle, ThumbsUp, Loader2, CheckCircle2 } from "lucide-react"
import { submitPortalFeedback } from "@/lib/actions/portal"

interface PortalFeedbackFormProps {
  projectId: string
  portalToken: string
}

const feedbackTypes = [
  { value: "BUG", label: "Bug", description: "Something's broken", icon: Bug },
  { value: "SUGGESTION", label: "Suggestion", description: "Improvement idea", icon: Lightbulb },
  { value: "QUESTION", label: "Question", description: "Need clarification", icon: HelpCircle },
  { value: "APPROVAL", label: "Approval", description: "Looks good!", icon: ThumbsUp },
]

export function PortalFeedbackForm({ projectId, portalToken }: PortalFeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [type, setType] = useState("SUGGESTION")

  async function handleSubmit(formData: FormData) {
    setPending(true)
    formData.set("type", type)
    formData.set("projectId", projectId)
    formData.set("portalToken", portalToken)

    try {
      await submitPortalFeedback(formData)
      setSubmitted(true)
      setTimeout(() => {
        setIsOpen(false)
        setSubmitted(false)
      }, 2000)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setPending(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 shadow-lg"
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Leave Feedback
      </Button>
    )
  }

  if (submitted) {
    return (
      <Card className="fixed bottom-6 right-6 w-[400px] shadow-lg">
        <CardContent className="pt-6 pb-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Thank you!</p>
          <p className="text-sm text-muted-foreground">Your feedback has been submitted.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[400px] shadow-lg max-h-[80vh] overflow-y-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Leave Feedback</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsOpen(false)}
          >
            &times;
          </Button>
        </div>
        <CardDescription>
          Help us improve by sharing your thoughts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="authorName">Your Name</Label>
            <Input
              id="authorName"
              name="authorName"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="authorEmail">Email (optional)</Label>
            <Input
              id="authorEmail"
              name="authorEmail"
              type="email"
              placeholder="john@example.com"
            />
          </div>

          <div className="grid gap-2">
            <Label>Type of Feedback</Label>
            <RadioGroup value={type} onValueChange={setType} className="grid grid-cols-2 gap-2">
              {feedbackTypes.map((ft) => (
                <div key={ft.value}>
                  <RadioGroupItem
                    value={ft.value}
                    id={ft.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={ft.value}
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <ft.icon className="mb-1 h-4 w-4" />
                    <span className="text-xs font-medium">{ft.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Your Feedback</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Describe your feedback in detail..."
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pageUrl">Page URL (optional)</Label>
            <Input
              id="pageUrl"
              name="pageUrl"
              placeholder="Which page is this about?"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
