"use client"

import { useState, useEffect, useCallback } from "react"
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  Timer,
  AlertCircle,
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

export function ProgressTab({ projectSlug, checkpoints: initialCheckpoints }: ProgressTabProps) {
  const [checkpoints, setCheckpoints] = useState(initialCheckpoints)
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1, 2, 3, 4]))
  const [expandedCheckpoints, setExpandedCheckpoints] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Live timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  // Find current checkpoint with active session
  const currentCheckpoint =
    checkpoints.find((c) => c.status === "IN_PROGRESS") ||
    checkpoints.find((c) => c.status === "PENDING")

  // Check if there's an active (open) session
  const activeSession = currentCheckpoint?.sessions?.find((s) => !s.endedAt)

  // Initialize timer from active session
  useEffect(() => {
    if (activeSession) {
      const sessionStart = new Date(activeSession.startedAt).getTime()
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000)
      setElapsedSeconds(elapsed)
      setTimerActive(true)
    } else {
      setTimerActive(false)
    }
  }, [activeSession])

  // Live timer tick
  useEffect(() => {
    if (!timerActive) return

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive])

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

  // Start timer for a checkpoint
  const startTimer = useCallback(async (checkpoint: CheckpointWithDetails) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/projects/${projectSlug}/checkpoints/${checkpoint.checkpointId}/sessions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to start timer")
      }

      const newSession = await response.json()

      // Update local state
      setCheckpoints((prev) =>
        prev.map((cp) => {
          if (cp.id === checkpoint.id) {
            return {
              ...cp,
              status: "IN_PROGRESS",
              sessions: [...(cp.sessions || []), newSession],
            }
          }
          return cp
        })
      )

      setElapsedSeconds(0)
      setTimerActive(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start timer")
    } finally {
      setIsLoading(false)
    }
  }, [projectSlug])

  // Pause timer for a checkpoint
  const pauseTimer = useCallback(async (checkpoint: CheckpointWithDetails) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/projects/${projectSlug}/checkpoints/${checkpoint.checkpointId}/sessions`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to pause timer")
      }

      const updatedSession = await response.json()

      // Update local state - close the session and add duration
      setCheckpoints((prev) =>
        prev.map((cp) => {
          if (cp.id === checkpoint.id) {
            const updatedSessions = cp.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            )
            const totalMins = updatedSessions.reduce(
              (sum, s) => sum + (s.durationMins || 0),
              0
            )
            return {
              ...cp,
              sessions: updatedSessions,
              actualMins: totalMins,
            }
          }
          return cp
        })
      )

      setTimerActive(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pause timer")
    } finally {
      setIsLoading(false)
    }
  }, [projectSlug])

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

  // Format elapsed seconds as mm:ss or hh:mm:ss
  const formatElapsed = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate current checkpoint total time (sessions + live)
  const getCurrentCheckpointTime = (cp: CheckpointWithDetails): number => {
    const sessionMins = cp.actualMins || 0
    const liveMins = timerActive && activeSession ? Math.floor(elapsedSeconds / 60) : 0
    return sessionMins + liveMins
  }

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
      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

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
          {totalEstimated > 0 && (
            <span
              className={cn(
                totalActual > totalEstimated ? "text-red-500" : "text-green-500"
              )}
            >
              {totalActual > totalEstimated ? "+" : ""}
              {formatTime(totalActual - totalEstimated)}
            </span>
          )}
        </div>
      </div>

      {/* Current checkpoint highlight with timer controls */}
      {currentCheckpoint && (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-blue-500">
              {timerActive ? (
                <div className="flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span>Recording</span>
                </div>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  <span>Current Focus</span>
                </>
              )}
            </div>

            {/* Timer controls */}
            <div className="flex items-center gap-2">
              {timerActive ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  onClick={() => pauseTimer(currentCheckpoint)}
                  disabled={isLoading}
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20"
                  onClick={() => startTimer(currentCheckpoint)}
                  disabled={isLoading}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Start
                </Button>
              )}
            </div>
          </div>

          <div className="font-medium text-sm">{currentCheckpoint.name}</div>

          {/* Time display */}
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded bg-background/50 p-1.5 text-center">
              <div className="text-muted-foreground">Est</div>
              <div className="font-mono font-medium">
                {formatTime(currentCheckpoint.estimatedMins || 0)}
              </div>
            </div>
            <div className="rounded bg-background/50 p-1.5 text-center">
              <div className="text-muted-foreground">Actual</div>
              <div className={cn(
                "font-mono font-medium",
                timerActive && "text-blue-500"
              )}>
                {timerActive ? formatElapsed(elapsedSeconds + (currentCheckpoint.actualMins * 60)) : formatTime(currentCheckpoint.actualMins)}
              </div>
            </div>
            <div className="rounded bg-background/50 p-1.5 text-center">
              <div className="text-muted-foreground">Variance</div>
              <div className={cn(
                "font-mono font-medium",
                getCurrentCheckpointTime(currentCheckpoint) > (currentCheckpoint.estimatedMins || 0)
                  ? "text-red-500"
                  : "text-green-500"
              )}>
                {getCurrentCheckpointTime(currentCheckpoint) > (currentCheckpoint.estimatedMins || 0) ? "+" : ""}
                {formatTime(getCurrentCheckpointTime(currentCheckpoint) - (currentCheckpoint.estimatedMins || 0))}
              </div>
            </div>
          </div>

          {/* Session count */}
          {currentCheckpoint.sessions && currentCheckpoint.sessions.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              {currentCheckpoint.sessions.length} session{currentCheckpoint.sessions.length !== 1 ? "s" : ""} logged
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
                    const isCurrentCheckpoint = currentCheckpoint?.id === cp.id

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
                          {cp.status === "IN_PROGRESS" && timerActive && isCurrentCheckpoint && (
                            <span className="font-mono text-xs text-blue-500">
                              {formatElapsed(elapsedSeconds)}
                            </span>
                          )}
                          {cp.status === "IN_PROGRESS" && !timerActive && isCurrentCheckpoint && (
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
