"use client"

import { CheckCircle2, Circle, Lock, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  FRAMEWORK_DOCS,
  PHASE_NAMES,
  getDocsByPhase,
  type FrameworkDoc,
} from "@/lib/types/workspace"

interface FrameworkTabProps {
  frameworkDocs: FrameworkDoc[]
  onDocSelect: (docNumber: number) => void
  currentDocNumber: number | null
}

export function FrameworkTab({
  frameworkDocs,
  onDocSelect,
  currentDocNumber,
}: FrameworkTabProps) {
  const docMap = new Map(frameworkDocs.map((d) => [d.docNumber, d]))

  const phases = [1, 2, 3, 4, 5, 6]

  return (
    <div className="space-y-4">
      {phases.map((phase) => {
        const docs = getDocsByPhase(phase)
        if (docs.length === 0) return null

        return (
          <div key={phase} className="space-y-1">
            <div className="flex items-center gap-2 py-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Phase {phase}: {PHASE_NAMES[phase]}
              </span>
            </div>

            <div className="space-y-0.5">
              {docs.map((docMeta) => {
                const doc = docMap.get(docMeta.number)
                const isLocked = doc?.status === "LOCKED"
                const hasContent = doc && doc.content.length > 0
                const isActive = currentDocNumber === docMeta.number

                return (
                  <button
                    key={docMeta.number}
                    onClick={() => onDocSelect(docMeta.number)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    )}
                  >
                    {isLocked ? (
                      <Lock className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    ) : hasContent ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate">
                      {String(docMeta.number).padStart(2, "0")} {docMeta.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="pt-2 border-t border-border/40">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Circle className="h-3 w-3" />
          <span>Empty</span>
          <CheckCircle2 className="h-3 w-3 text-blue-500 ml-2" />
          <span>Draft</span>
          <Lock className="h-3 w-3 text-green-500 ml-2" />
          <span>Locked</span>
        </div>
      </div>
    </div>
  )
}
