"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Lock,
  Unlock,
  Save,
  Loader2,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { DOCUMENT_TEMPLATES } from "@/lib/framework-templates"
import { cn } from "@/lib/utils"
import { FRAMEWORK_DOCS, type FrameworkDoc } from "@/lib/types/workspace"

interface DocumentViewerProps {
  projectSlug: string
  doc: FrameworkDoc | null
  docNumber: number
  onDocChange: (content: string) => void
  onStartGenerate?: () => void
}

export function DocumentViewer({
  projectSlug,
  doc,
  docNumber,
  onDocChange,
  onStartGenerate,
}: DocumentViewerProps) {
  const router = useRouter()
  const [content, setContent] = useState(doc?.content || "")
  const [isSaving, setIsSaving] = useState(false)
  const [isLocking, setIsLocking] = useState(false)

  const docMeta = FRAMEWORK_DOCS.find((d) => d.number === docNumber)
  const isLocked = doc?.status === "LOCKED"
  const hasAITemplate = !!DOCUMENT_TEMPLATES[docNumber]
  const isEmpty = !content.trim()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/projects/${projectSlug}/framework`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docNumber, content }),
      })

      if (res.ok) {
        onDocChange(content)
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to save document:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLockToggle = async () => {
    setIsLocking(true)
    try {
      const res = await fetch(`/api/projects/${projectSlug}/framework`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docNumber,
          status: isLocked ? "DRAFT" : "LOCKED",
        }),
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to update document status:", error)
    } finally {
      setIsLocking(false)
    }
  }

  if (!docMeta) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Invalid document</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Document header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-6">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-semibold">
              {String(docNumber).padStart(2, "0")} - {docMeta.name}
            </h2>
            <p className="text-xs text-muted-foreground">{docMeta.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isLocked ? "default" : "outline"}>
            {isLocked ? (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </>
            ) : (
              <>
                <Unlock className="h-3 w-3 mr-1" />
                Draft
              </>
            )}
          </Badge>
          {!isLocked && hasAITemplate && onStartGenerate && isEmpty && (
            <Button
              variant="default"
              size="sm"
              onClick={onStartGenerate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              AI Generate
            </Button>
          )}
          {!isLocked && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || content === (doc?.content || "")}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          )}
          <Button
            variant={isLocked ? "outline" : "default"}
            size="sm"
            onClick={handleLockToggle}
            disabled={isLocking || (!isLocked && !content.trim())}
          >
            {isLocking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLocked ? (
              <>
                <Unlock className="h-4 w-4 mr-1" />
                Unlock
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-1" />
                Lock
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Document content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {isLocked ? (
            <div className="prose prose-sm prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-muted/30 p-4 rounded-lg">
                {content || "No content"}
              </pre>
            </div>
          ) : (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Start writing your ${docMeta.name}...`}
              className="min-h-[500px] font-mono text-sm resize-none border-0 focus-visible:ring-0 p-0 bg-transparent"
            />
          )}
        </div>
      </ScrollArea>

      {/* Navigation hint */}
      {docNumber < 12 && (
        <div className="shrink-0 border-t border-border/40 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {isLocked ? "Document locked." : "Save your changes, then lock when complete."}
            </span>
            {isLocked && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDocChange("")}
                className="text-blue-500"
              >
                Next: {FRAMEWORK_DOCS[docNumber]?.name || ""}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
