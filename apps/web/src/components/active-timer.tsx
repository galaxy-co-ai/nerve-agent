"use client"

import { useState } from "react"
import { useTimer } from "@/components/timer-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Play, Pause, Square, Loader2, Clock, Trash2 } from "lucide-react"

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function ActiveTimer() {
  const { timerState, elapsedSeconds, stopTimer, discardTimer, isPending } = useTimer()
  const [showConfirm, setShowConfirm] = useState(false)

  if (!timerState.isRunning) {
    return null
  }

  const handleStop = async () => {
    await stopTimer()
    setShowConfirm(false)
  }

  const handleDiscard = () => {
    discardTimer()
    setShowConfirm(false)
  }

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-sm animate-pulse-subtle">
        <Clock className="h-3.5 w-3.5" />
        <div className="flex flex-col leading-tight">
          <span className="font-mono font-medium">{formatTime(elapsedSeconds)}</span>
          <span className="text-xs text-green-400/70 truncate max-w-[120px]">
            {timerState.taskTitle || timerState.projectName}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-green-500/20 text-green-400"
          onClick={() => setShowConfirm(true)}
        >
          <Square className="h-3.5 w-3.5 fill-current" />
        </Button>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Stop Timer?</DialogTitle>
            <DialogDescription>
              You've been working for{" "}
              <span className="font-mono font-medium text-foreground">
                {formatTime(elapsedSeconds)}
              </span>{" "}
              on{" "}
              <span className="font-medium text-foreground">
                {timerState.taskTitle || timerState.projectName}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{timerState.projectName}</p>
                  {timerState.taskTitle && (
                    <p className="text-sm text-muted-foreground">{timerState.taskTitle}</p>
                  )}
                </div>
                <div className="text-2xl font-mono font-bold">
                  {Math.max(1, Math.round(elapsedSeconds / 60))}m
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleDiscard}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Discard
            </Button>
            <div className="flex gap-2 flex-1 justify-end">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Keep Running
              </Button>
              <Button onClick={handleStop} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Square className="mr-2 h-4 w-4 fill-current" />
                    Stop & Save
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
