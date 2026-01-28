"use client"

import { useState, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, CheckCircle2, Clock, FileText, ArrowRight } from "lucide-react"
import { completeTaskWithExtras } from "@/lib/actions/tasks"

interface Task {
  id: string
  title: string
  sprint: {
    number: number
    project: {
      id: string
      name: string
      slug: string
    }
  }
}

interface TaskCompletionDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  nextTask?: Task | null
}

export function TaskCompletionDialog({
  task,
  open,
  onOpenChange,
  nextTask,
}: TaskCompletionDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form state
  const [logTime, setLogTime] = useState(true)
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("30")
  const [addNotes, setAddNotes] = useState(false)
  const [notes, setNotes] = useState("")
  const [startNext, setStartNext] = useState(false)

  const handleComplete = useCallback(() => {
    const durationMinutes = logTime
      ? (parseInt(hours || "0") * 60) + parseInt(minutes || "0")
      : 0

    startTransition(async () => {
      try {
        await completeTaskWithExtras({
          taskId: task.id,
          projectId: task.sprint.project.id,
          durationMinutes: durationMinutes > 0 ? durationMinutes : undefined,
          notes: addNotes && notes.trim() ? notes.trim() : undefined,
          startNextTaskId: startNext && nextTask ? nextTask.id : undefined,
        })

        onOpenChange(false)
        router.refresh()

        // Reset form
        setLogTime(true)
        setHours("")
        setMinutes("30")
        setAddNotes(false)
        setNotes("")
        setStartNext(false)
      } catch (error) {
        console.error("Failed to complete task:", error)
      }
    })
  }, [task, logTime, hours, minutes, addNotes, notes, startNext, nextTask, onOpenChange, router])

  const totalMinutes = (parseInt(hours || "0") * 60) + parseInt(minutes || "0")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Complete Task
          </DialogTitle>
          <DialogDescription className="truncate">
            {task.title}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Log Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="log-time"
                checked={logTime}
                onCheckedChange={(checked) => setLogTime(checked === true)}
              />
              <Label htmlFor="log-time" className="flex items-center gap-2 cursor-pointer">
                <Clock className="h-4 w-4" />
                Log time for this task
              </Label>
            </div>
            {logTime && (
              <div className="ml-6 flex items-center gap-2">
                <div className="w-20">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    placeholder="0"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center mt-1">hours</p>
                </div>
                <span className="text-lg text-muted-foreground">:</span>
                <div className="w-20">
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="30"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="text-center"
                  />
                  <p className="text-xs text-muted-foreground text-center mt-1">minutes</p>
                </div>
                {/* Quick buttons */}
                <div className="flex gap-1 ml-2">
                  {[15, 30, 60].map((mins) => (
                    <Button
                      key={mins}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => {
                        setHours(Math.floor(mins / 60).toString())
                        setMinutes((mins % 60).toString())
                      }}
                    >
                      {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add Notes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="add-notes"
                checked={addNotes}
                onCheckedChange={(checked) => setAddNotes(checked === true)}
              />
              <Label htmlFor="add-notes" className="flex items-center gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                Add completion notes
              </Label>
            </div>
            {addNotes && (
              <div className="ml-6">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you accomplish? Any learnings or next steps?"
                  className="min-h-[80px]"
                />
              </div>
            )}
          </div>

          {/* Start Next Task */}
          {nextTask && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="start-next"
                  checked={startNext}
                  onCheckedChange={(checked) => setStartNext(checked === true)}
                />
                <Label htmlFor="start-next" className="flex items-center gap-2 cursor-pointer">
                  <ArrowRight className="h-4 w-4" />
                  Start next task
                </Label>
              </div>
              {startNext && (
                <div className="ml-6 rounded-md border bg-muted/50 p-2 text-sm">
                  <p className="font-medium">{nextTask.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {nextTask.sprint.project.name}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete
                {logTime && totalMinutes > 0 && ` (+${totalMinutes}m)`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
