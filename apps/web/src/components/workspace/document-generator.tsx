"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Loader2,
  Sparkles,
  Check,
  RefreshCw,
  ArrowRight,
  MessageSquare,
  Save,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DOCUMENT_TEMPLATES } from "@/lib/framework-templates"
import { FRAMEWORK_DOCS } from "@/lib/types/workspace"

interface DocumentGeneratorProps {
  projectSlug: string
  projectName: string
  docNumber: number
  existingContent?: string
  onComplete: () => void
  onCancel: () => void
}

type GenerationState = "idle" | "generating" | "reviewing" | "revising"

interface ApprovedSection {
  title: string
  content: string
}

export function DocumentGenerator({
  projectSlug,
  projectName: _projectName,
  docNumber,
  existingContent: _existingContent,
  onComplete,
  onCancel,
}: DocumentGeneratorProps) {
  const router = useRouter()
  const template = DOCUMENT_TEMPLATES[docNumber]
  const docMeta = FRAMEWORK_DOCS.find((d) => d.number === docNumber)

  const [state, setState] = useState<GenerationState>("idle")
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentContent, setCurrentContent] = useState("")
  const [approvedSections, setApprovedSections] = useState<ApprovedSection[]>([])
  const [userContext, setUserContext] = useState("")
  const [feedback, setFeedback] = useState("")
  const [error, setError] = useState<string | null>(null)

  const totalSections = template?.sections.length || 0
  const progress = totalSections > 0 ? (approvedSections.length / totalSections) * 100 : 0

  const generateSection = useCallback(async () => {
    if (!template) return

    setState("generating")
    setError(null)

    try {
      const previousSections = approvedSections
        .map((s) => `### ${s.title}\n${s.content}`)
        .join("\n\n")

      const res = await fetch(`/api/projects/${projectSlug}/framework/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docNumber,
          sectionIndex: currentSectionIndex,
          userContext: userContext || undefined,
          previousSections: previousSections || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to generate section")
      }

      const data = await res.json()
      setCurrentContent(data.content)
      setState("reviewing")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed")
      setState("idle")
    }
  }, [projectSlug, docNumber, currentSectionIndex, userContext, approvedSections, template])

  const regenerateWithFeedback = useCallback(async () => {
    if (!template || !feedback.trim()) return

    setState("revising")
    setError(null)

    try {
      const previousSections = approvedSections
        .map((s) => `### ${s.title}\n${s.content}`)
        .join("\n\n")

      const res = await fetch(`/api/projects/${projectSlug}/framework/generate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docNumber,
          sectionIndex: currentSectionIndex,
          currentContent,
          feedback,
          userContext: userContext || undefined,
          previousSections: previousSections || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to regenerate section")
      }

      const data = await res.json()
      setCurrentContent(data.content)
      setFeedback("")
      setState("reviewing")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regeneration failed")
      setState("reviewing")
    }
  }, [projectSlug, docNumber, currentSectionIndex, currentContent, feedback, userContext, approvedSections, template])

  const approveSection = useCallback(() => {
    if (!template) return

    const section = template.sections[currentSectionIndex]
    setApprovedSections((prev) => [...prev, { title: section.title, content: currentContent }])
    setCurrentContent("")

    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex((prev) => prev + 1)
      setState("idle")
    } else {
      // All sections complete - save the document
      saveDocument()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSectionIndex, currentContent, totalSections, template])

  const saveDocument = useCallback(async () => {
    setState("generating") // Reuse for saving state

    try {
      // Combine all sections into final document
      const finalContent = approvedSections
        .map((s) => s.content)
        .join("\n\n---\n\n")

      // Add the last approved section
      const section = template?.sections[currentSectionIndex]
      const fullContent = section
        ? [...approvedSections, { title: section.title, content: currentContent }]
            .map((s) => s.content)
            .join("\n\n---\n\n")
        : finalContent

      const res = await fetch(`/api/projects/${projectSlug}/framework`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docNumber,
          content: fullContent,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save document")
      }

      router.refresh()
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
      setState("reviewing")
    }
  }, [projectSlug, docNumber, approvedSections, currentSectionIndex, currentContent, template, router, onComplete])

  if (!template || !docMeta) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Document template not available for AI generation yet.</p>
      </div>
    )
  }

  const currentSection = template.sections[currentSectionIndex]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Document Generator
          </h2>
          <p className="text-sm text-muted-foreground">
            {String(docNumber).padStart(2, "0")} - {docMeta.name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Section {currentSectionIndex + 1} of {totalSections}
          </div>
          <Progress value={progress} className="w-32 h-2" />
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Previously approved sections (collapsed) */}
              {approvedSections.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Completed Sections
                  </div>
                  {approvedSections.map((section, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{section.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Current section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-blue-500 border-blue-500/30">
                    Current Section
                  </Badge>
                  <span className="font-medium">{currentSection?.title}</span>
                </div>

                {state === "idle" && (
                  <div className="rounded-lg border border-dashed border-border/60 p-8 text-center space-y-4">
                    <Sparkles className="h-8 w-8 text-blue-500 mx-auto" />
                    <div>
                      <p className="font-medium">Ready to generate "{currentSection?.title}"</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add context below or click generate to start
                      </p>
                    </div>
                    <div className="max-w-md mx-auto space-y-3">
                      <Textarea
                        value={userContext}
                        onChange={(e) => setUserContext(e.target.value)}
                        placeholder="Add any specific context, requirements, or details for this section..."
                        className="min-h-[80px] text-sm"
                      />
                      <Button onClick={generateSection} className="w-full">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Section
                      </Button>
                    </div>
                  </div>
                )}

                {(state === "generating" || state === "revising") && (
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-8 text-center space-y-4">
                    <Loader2 className="h-8 w-8 text-blue-500 mx-auto animate-spin" />
                    <div>
                      <p className="font-medium">
                        {state === "revising" ? "Revising" : "Generating"} "{currentSection?.title}"
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Claude is working on this section...
                      </p>
                    </div>
                  </div>
                )}

                {state === "reviewing" && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                        {currentContent}
                      </pre>
                    </div>

                    {error && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">
                        {error}
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          Request changes (optional)
                        </div>
                        <Textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Describe what you'd like changed..."
                          className="min-h-[60px] text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="outline"
                        onClick={regenerateWithFeedback}
                        disabled={!feedback.trim()}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Revise
                      </Button>
                      <Button onClick={approveSection}>
                        {currentSectionIndex < totalSections - 1 ? (
                          <>
                            Approve & Continue
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Document
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Sidebar - section preview */}
        <div className="w-64 border-l border-border/40 bg-muted/30 p-4">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Document Sections
          </div>
          <div className="space-y-1">
            {template.sections.map((section, i) => {
              const isComplete = i < currentSectionIndex || approvedSections[i]
              const isCurrent = i === currentSectionIndex
              const isPending = i > currentSectionIndex

              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                    isCurrent && "bg-blue-500/10 text-blue-500",
                    isComplete && "text-green-500",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <Check className="h-3.5 w-3.5 shrink-0" />
                  ) : isCurrent ? (
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border border-current shrink-0" />
                  )}
                  <span className="truncate">{section.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
