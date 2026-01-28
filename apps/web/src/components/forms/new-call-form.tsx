"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Sparkles, CheckCircle } from "lucide-react"
import { createCall } from "@/lib/actions/calls"

interface Project {
  id: string
  name: string
  clientName: string
}

interface NewCallFormProps {
  projects: Project[]
}

interface ProcessedCallData {
  summary: string
  actionItems: Array<{ text: string; assignedTo: string; dueDate?: string }>
  decisions: Array<{ text: string; decidedBy: string }>
  sentiment: "POSITIVE" | "NEUTRAL" | "CONCERNED"
  followUps?: Array<{
    title: string
    description?: string
    sourceQuote?: string
    dueDate?: string
  }>
}

export function NewCallForm({ projects }: NewCallFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<"input" | "processing" | "review">("input")
  const [selectedProject, setSelectedProject] = useState("")
  const [transcript, setTranscript] = useState("")
  const [title, setTitle] = useState("")
  const [callDate, setCallDate] = useState(new Date().toISOString().split("T")[0])
  const [participants, setParticipants] = useState("")
  const [processedData, setProcessedData] = useState<ProcessedCallData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedProjectData = projects.find((p) => p.id === selectedProject)

  async function handleProcess() {
    if (!transcript.trim() || !selectedProject) {
      setError("Please select a project and enter a transcript")
      return
    }

    setStep("processing")
    setError(null)

    try {
      const response = await fetch("/api/ai/process-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          projectName: selectedProjectData?.name,
          clientName: selectedProjectData?.clientName,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process transcript")
      }

      const data: ProcessedCallData = await response.json()
      setProcessedData(data)
      setStep("review")

      // Auto-generate title if not set
      if (!title && data.summary) {
        const autoTitle = data.summary.split(".")[0].slice(0, 60)
        setTitle(autoTitle)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process transcript")
      setStep("input")
    }
  }

  async function handleSubmit() {
    if (!processedData) return

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.set("projectId", selectedProject)
      formData.set("title", title || "Untitled Call")
      formData.set("callDate", callDate)
      formData.set("participants", participants)
      formData.set("transcript", transcript)

      await createCall(formData, processedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save call")
      setIsSubmitting(false)
    }
  }

  if (step === "processing") {
    return (
      <Card className="max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500" />
          </div>
          <h3 className="font-semibold mt-4 mb-2">Analyzing Transcript</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Claude is extracting key insights, action items, and decisions from your call...
          </p>
        </CardContent>
      </Card>
    )
  }

  if (step === "review" && processedData) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Call Processed
            </CardTitle>
            <CardDescription>Review the extracted information before saving</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Call title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="callDate">Date</Label>
                <Input
                  id="callDate"
                  type="date"
                  value={callDate}
                  onChange={(e) => setCallDate(e.target.value)}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label>Summary</Label>
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm">{processedData.summary}</p>
              </div>
            </div>

            {/* Sentiment */}
            <div className="space-y-2">
              <Label>Client Sentiment</Label>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    processedData.sentiment === "POSITIVE"
                      ? "bg-green-500/20 text-green-500"
                      : processedData.sentiment === "CONCERNED"
                        ? "bg-orange-500/20 text-orange-500"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {processedData.sentiment.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Action Items */}
            {processedData.actionItems.length > 0 && (
              <div className="space-y-2">
                <Label>Action Items ({processedData.actionItems.length})</Label>
                <div className="rounded-lg border divide-y">
                  {processedData.actionItems.map((item, i) => (
                    <div key={i} className="p-3 flex items-start gap-3">
                      <div
                        className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.assignedTo === "me"
                            ? "bg-blue-500/20 text-blue-500"
                            : "bg-purple-500/20 text-purple-500"
                        }`}
                      >
                        {item.assignedTo}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{item.text}</p>
                        {item.dueDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {item.dueDate}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decisions */}
            {processedData.decisions.length > 0 && (
              <div className="space-y-2">
                <Label>Decisions ({processedData.decisions.length})</Label>
                <div className="rounded-lg border divide-y">
                  {processedData.decisions.map((decision, i) => (
                    <div key={i} className="p-3">
                      <p className="text-sm">{decision.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Decided by: {decision.decidedBy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-ups */}
            {processedData.followUps && processedData.followUps.length > 0 && (
              <div className="space-y-2">
                <Label>Follow-ups ({processedData.followUps.length})</Label>
                <p className="text-xs text-muted-foreground">
                  These will be added as suggested follow-ups you can accept or dismiss
                </p>
                <div className="rounded-lg border divide-y">
                  {processedData.followUps.map((followUp, i) => (
                    <div key={i} className="p-3">
                      <p className="text-sm font-medium">{followUp.title}</p>
                      {followUp.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {followUp.description}
                        </p>
                      )}
                      {followUp.sourceQuote && (
                        <p className="text-xs text-muted-foreground mt-2 italic border-l-2 pl-2">
                          &ldquo;{followUp.sourceQuote}&rdquo;
                        </p>
                      )}
                      {followUp.dueDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {followUp.dueDate}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Call"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("input")
                  setProcessedData(null)
                }}
              >
                Back to Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Input step
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Add Call Transcript</CardTitle>
        <CardDescription>
          Paste your call transcript and let Claude extract key insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger id="project">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="callDate">Call Date</Label>
            <Input
              id="callDate"
              type="date"
              value={callDate}
              onChange={(e) => setCallDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Auto-generated if left empty"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="participants">Participants (optional)</Label>
            <Input
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="e.g., John, Sarah"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transcript">Transcript</Label>
          <Textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your call transcript here...

Supported formats:
- Plain text from any source
- Otter.ai exports
- Zoom transcripts
- Fireflies.ai exports"
            rows={12}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {transcript.length > 0
              ? `${transcript.split(/\s+/).filter(Boolean).length} words`
              : "Paste your call transcript to get started"}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button
            onClick={handleProcess}
            disabled={!selectedProject || !transcript.trim()}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Process with Claude
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/calls")}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
