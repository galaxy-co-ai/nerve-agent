"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { WorkspaceDrawer } from "./workspace-drawer"
import { WorkspaceChat } from "./workspace-chat"
import { DocumentViewer } from "./document-viewer"
import { DocumentGenerator } from "./document-generator"
import { Button } from "@/components/ui/button"
import { ArrowRight, Rocket, Sparkles } from "lucide-react"
import type { FrameworkDoc, CheckpointWithDetails } from "@/lib/types/workspace"
import type { ProjectWorkspaceNote } from "@prisma/client"
import { FRAMEWORK_DOCS } from "@/lib/types/workspace"
import { DOCUMENT_TEMPLATES } from "@/lib/framework-templates"

interface ProjectWorkspaceProps {
  projectSlug: string
  projectName: string
  frameworkDocs: FrameworkDoc[]
  checkpoints: CheckpointWithDetails[]
  techStack: string | null
  notes: ProjectWorkspaceNote[]
}

export function ProjectWorkspace({
  projectSlug,
  projectName,
  frameworkDocs,
  checkpoints,
  techStack,
  notes,
}: ProjectWorkspaceProps) {
  const router = useRouter()
  const [currentDocNumber, setCurrentDocNumber] = useState<number | null>(() => {
    // Start with first incomplete doc, or first doc if all complete
    const incompleteDoc = FRAMEWORK_DOCS.find((meta) => {
      const doc = frameworkDocs.find((d) => d.docNumber === meta.number)
      return !doc || doc.status !== "LOCKED"
    })
    return incompleteDoc?.number || 1
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const currentDoc = currentDocNumber
    ? frameworkDocs.find((d) => d.docNumber === currentDocNumber) || null
    : null

  const handleDocSelect = useCallback((docNumber: number) => {
    setCurrentDocNumber(docNumber)
    setIsGenerating(false)
  }, [])

  const handleDocChange = useCallback(() => {
    // After a doc change (like locking), potentially move to next doc
    if (currentDocNumber && currentDocNumber < 12) {
      // Check if current doc is now locked
      // This will be updated by the refresh, but we can optimistically move
    }
  }, [currentDocNumber])

  const handleStartGenerate = useCallback(() => {
    setIsGenerating(true)
  }, [])

  const handleGenerateComplete = useCallback(() => {
    setIsGenerating(false)
    router.refresh()
  }, [router])

  const handleGenerateCancel = useCallback(() => {
    setIsGenerating(false)
  }, [])

  // Check if this is a fresh project (no docs started)
  const hasStarted = frameworkDocs.some((d) => d.content.length > 0)

  // Get current context for chat
  const currentContext = currentDocNumber
    ? FRAMEWORK_DOCS.find((d) => d.number === currentDocNumber)?.name
    : undefined

  // Check if current doc has AI template available
  const hasAITemplate = currentDocNumber ? !!DOCUMENT_TEMPLATES[currentDocNumber] : false

  return (
    <div className="flex h-full">
      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!hasStarted && !isGenerating ? (
          // Empty state - project just started
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <div className="max-w-md text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-blue-500/10 p-4">
                  <Rocket className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Ready to begin?</h2>
              <p className="text-muted-foreground">
                Every successful project starts with validation. The Idea Audit
                helps ensure your project is worth building before you invest
                time and energy.
              </p>
              <div className="pt-4 space-y-3">
                <Button
                  size="lg"
                  onClick={() => {
                    setCurrentDocNumber(1)
                    setIsGenerating(true)
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start with AI
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setCurrentDocNumber(1)}
                  className="w-full"
                >
                  Write Manually
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pt-4">
                The framework will guide you through 12 documents that guarantee
                project completion. No skipping allowed.
              </p>
            </div>
          </div>
        ) : isGenerating && currentDocNumber ? (
          // AI Generation mode
          <DocumentGenerator
            projectSlug={projectSlug}
            projectName={projectName}
            docNumber={currentDocNumber}
            existingContent={currentDoc?.content}
            onComplete={handleGenerateComplete}
            onCancel={handleGenerateCancel}
          />
        ) : (
          // Document view
          <>
            <div className="flex-1 overflow-hidden">
              {currentDocNumber ? (
                <DocumentViewer
                  projectSlug={projectSlug}
                  doc={currentDoc}
                  docNumber={currentDocNumber}
                  onDocChange={handleDocChange}
                  onStartGenerate={hasAITemplate ? handleStartGenerate : undefined}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Select a document from the Framework tab
                </div>
              )}
            </div>

            {/* Chat panel */}
            <WorkspaceChat
              projectSlug={projectSlug}
              projectName={projectName}
              currentContext={currentContext}
            />
          </>
        )}
      </div>

      {/* Right drawer */}
      <WorkspaceDrawer
        projectSlug={projectSlug}
        frameworkDocs={frameworkDocs}
        checkpoints={checkpoints}
        techStack={techStack}
        notes={notes}
        onDocSelect={handleDocSelect}
        currentDocNumber={currentDocNumber}
      />
    </div>
  )
}
