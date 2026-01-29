"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  Timer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  PHASE_NAMES,
  formatTime,
  calculateProgress,
  type CheckpointWithDetails,
} from "@/lib/types/workspace"

interface ProgressTabProps {
  projectSlug: string
  checkpoints: CheckpointWithDetails[]
}

export function ProgressTab({ projectSlug, checkpoints }: ProgressTabProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1, 2, 3, 4]))
  const [expandedCheckpoints, setExpandedCheckpoints] = useState<Set<string>>(new Set())

  const togglePhase = (phase: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev)
      if (next.has(phase)) {
        next.delete(phase)
      } else {
        next.add(phase)
      }
      return next
    })
  }

  const toggleCheckpoint = (id: string) => {
    setExpandedCheckpoints((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Group checkpoints by phase
  const checkpointsByPhase = checkpoints.reduce(
    (acc, cp) => {
      if (!acc[cp.phase]) acc[cp.phase] = []
      acc[cp.phase].push(cp)
      return acc
    },
    {} as Record<number, CheckpointWithDetails[]>
  )

  const progress = calculateProgress(checkpoints)
  const totalEstimated = checkpoints.reduce((sum, cp) => sum + (cp.estimatedMins || 0), 0)
  const totalActual = checkpoints.reduce((sum, cp) => sum + cp.actualMins, 0)

  // Find current checkpoint (first IN_PROGRESS or first PENDING)
  const currentCheckpoint =
    checkpoints.find((c) => c.status === "IN_PROGRESS") ||
    checkpoints.find((c) => c.status === "PENDING")

  if (checkpoints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Timer className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No checkpoints yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Complete the MTS document to generate checkpoints
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="rounded-lg border border-border/40 p-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Est: {formatTime(totalEstimated)}</span>
          <span>Actual: {formatTime(totalActual)}</span>
        </div>
      </div>

      {/* Current checkpoint highlight */}
      {currentCheckpoint && (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <div className="flex items-center gap-2 text-xs text-blue-500 mb-1">
            <Play className="h-3 w-3" />
            <span>Current Focus</span>
          </div>
          <div className="font-medium text-sm">{currentCheckpoint.name}</div>
          {currentCheckpoint.status === "IN_PROGRESS" && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatTime(currentCheckpoint.actualMins)} elapsed</span>
            </div>
          )}
        </div>
      )}

      {/* Phase tree */}
      <div className="space-y-2">
        {Object.entries(checkpointsByPhase).map(([phase, cps]) => {
          const phaseNum = parseInt(phase)
          const isExpanded = expandedPhases.has(phaseNum)
          const phaseComplete = cps.every((c) => c.status === "COMPLETE")

          return (
            <div key={phase} className="space-y-1">
              <button
                onClick={() => togglePhase(phaseNum)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/50"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                )}
                {phaseComplete ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
                <span className="font-medium">
                  Phase {phase}: {PHASE_NAMES[phaseNum]}
                </span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {cps.filter((c) => c.status === "COMPLETE").length}/{cps.length}
                </Badge>
              </button>

              {isExpanded && (
                <div className="ml-4 space-y-0.5">
                  {cps.map((cp) => {
                    const isCheckpointExpanded = expandedCheckpoints.has(cp.id)

                    return (
                      <div key={cp.id}>
                        <button
                          onClick={() => toggleCheckpoint(cp.id)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent/50",
                            cp.status === "IN_PROGRESS" && "bg-blue-500/10"
                          )}
                        >
                          {cp.objectives.length > 0 ? (
                            isCheckpointExpanded ? (
                              <ChevronDown className="h-3 w-3 shrink-0" />
                            ) : (
                              <ChevronRight className="h-3 w-3 shrink-0" />
                            )
                          ) : (
                            <span className="w-3" />
                          )}
                          <StatusIcon status={cp.status} />
                          <span className="truncate flex-1 text-left">{cp.name}</span>
                          {cp.status === "IN_PROGRESS" && (
                            <Clock className="h-3 w-3 text-blue-500" />
                          )}
                        </button>

                        {isCheckpointExpanded && cp.objectives.length > 0 && (
                          <div className="ml-6 mt-0.5 space-y-0.5">
                            {cp.objectives.map((obj) => (
                              <div key={obj.id} className="text-xs">
                                <div className="flex items-center gap-2 px-2 py-0.5 text-muted-foreground">
                                  <StatusIcon status={obj.status} size="xs" />
                                  <span className="truncate">{obj.name}</span>
                                </div>
                                {obj.steps.length > 0 && (
                                  <div className="ml-4 space-y-0">
                                    {obj.steps.map((step) => (
                                      <div
                                        key={step.id}
                                        className="flex items-center gap-2 px-2 py-0.5 text-muted-foreground/70"
                                      >
                                        <StatusIcon status={step.status} size="xs" />
                                        <span className="truncate">{step.action}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatusIcon({
  status,
  size = "sm",
}: {
  status: string
  size?: "xs" | "sm"
}) {
  const sizeClass = size === "xs" ? "h-2.5 w-2.5" : "h-3.5 w-3.5"

  switch (status) {
    case "COMPLETE":
      return <CheckCircle2 className={cn(sizeClass, "text-green-500 shrink-0")} />
    case "IN_PROGRESS":
      return <Circle className={cn(sizeClass, "text-blue-500 fill-blue-500 shrink-0")} />
    default:
      return <Circle className={cn(sizeClass, "text-muted-foreground shrink-0")} />
  }
}
