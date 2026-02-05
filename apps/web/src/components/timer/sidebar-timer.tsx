"use client"

import { useTimer } from "@/components/timer/timer-provider"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Square, Loader2, Trash2 } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function SidebarTimer() {
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
      <SidebarGroup className="py-0">
        <SidebarGroupContent>
          <div className="mx-2 mb-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium uppercase tracking-wide">Timer Running</span>
            </div>
            <div className="font-mono text-2xl font-bold text-green-400 mb-1">
              {formatTime(elapsedSeconds)}
            </div>
            <div className="text-sm text-green-400/80 truncate mb-3">
              {timerState.taskTitle || timerState.projectName}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-green-500/30 text-green-400 hover:bg-green-500/20 hover:text-green-300"
              onClick={() => setShowConfirm(true)}
            >
              <Square className="mr-2 h-3.5 w-3.5 fill-current" />
              Stop Timer
            </Button>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Stop Timer?</DialogTitle>
            <DialogDescription>
              You've been working for{" "}
              <span className="font-mono font-medium text-foreground">
                {formatTime(elapsedSeconds)}
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
