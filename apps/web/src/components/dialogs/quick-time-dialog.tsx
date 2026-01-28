"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Clock, Check } from "lucide-react"
import { quickCreateTimeEntry, getQuickTimeEntryData } from "@/lib/actions/time"

type Project = {
  id: string
  name: string
  slug: string
}

type InProgressTask = {
  id: string
  title: string
  sprint: {
    project: {
      id: string
      name: string
    }
  }
}

export function QuickTimeDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  // Form state
  const [projectId, setProjectId] = useState("")
  const [taskId, setTaskId] = useState("")
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("30")
  const [description, setDescription] = useState("")

  // Data for selects
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<InProgressTask[]>([])
  const [loading, setLoading] = useState(false)

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+T or Ctrl+Shift+T
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      setLoading(true)
      getQuickTimeEntryData()
        .then(({ projects, inProgressTasks }) => {
          setProjects(projects)
          setTasks(inProgressTasks)

          // Auto-select if there's an in-progress task
          if (inProgressTasks.length > 0) {
            const firstTask = inProgressTasks[0]
            setTaskId(firstTask.id)
            setProjectId(firstTask.sprint.project.id)
          } else if (projects.length > 0) {
            setProjectId(projects[0].id)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [open])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      // Delay reset to allow close animation
      const timeout = setTimeout(() => {
        setProjectId("")
        setTaskId("")
        setHours("")
        setMinutes("30")
        setDescription("")
        setSuccess(false)
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [open])

  // When task changes, update project
  const handleTaskChange = useCallback((newTaskId: string) => {
    setTaskId(newTaskId)
    if (newTaskId) {
      const task = tasks.find(t => t.id === newTaskId)
      if (task) {
        setProjectId(task.sprint.project.id)
      }
    }
  }, [tasks])

  // Filter tasks by selected project
  const filteredTasks = projectId
    ? tasks.filter(t => t.sprint.project.id === projectId)
    : tasks

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    const totalMinutes = (parseInt(hours || "0") * 60) + parseInt(minutes || "0")
    if (!projectId || totalMinutes <= 0) return

    startTransition(async () => {
      try {
        await quickCreateTimeEntry({
          projectId,
          taskId: taskId || null,
          durationMinutes: totalMinutes,
          description: description.trim() || null,
        })
        setSuccess(true)
        // Close after brief success state
        setTimeout(() => {
          setOpen(false)
          router.refresh()
        }, 800)
      } catch (error) {
        console.error("Failed to create time entry:", error)
      }
    })
  }, [projectId, taskId, hours, minutes, description, router])

  const totalMinutes = (parseInt(hours || "0") * 60) + parseInt(minutes || "0")
  const isValid = projectId && totalMinutes > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-lg font-medium">Time logged</p>
            <p className="text-sm text-muted-foreground">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m added
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quick Time Entry
              </DialogTitle>
              <DialogDescription>
                Log time without leaving your flow.{" "}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Cmd+Shift+T</kbd>
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Task (if any in progress) */}
                  {tasks.length > 0 && (
                    <div className="grid gap-2">
                      <Label htmlFor="task">Task (optional)</Label>
                      <Select value={taskId} onValueChange={handleTaskChange}>
                        <SelectTrigger id="task">
                          <SelectValue placeholder="Select a task..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No specific task</SelectItem>
                          {tasks.map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.title}
                              <span className="text-muted-foreground ml-2">
                                ({task.sprint.project.name})
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Project */}
                  <div className="grid gap-2">
                    <Label htmlFor="project">Project</Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Select a project..." />
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

                  {/* Duration */}
                  <div className="grid gap-2">
                    <Label>Duration</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
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
                      <div className="flex-1">
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          placeholder="30"
                          value={minutes}
                          onChange={(e) => setMinutes(e.target.value)}
                          className="text-center"
                          autoFocus
                        />
                        <p className="text-xs text-muted-foreground text-center mt-1">minutes</p>
                      </div>
                    </div>
                    {/* Quick duration buttons */}
                    <div className="flex gap-2 mt-1">
                      {[15, 30, 60, 90, 120].map((mins) => (
                        <Button
                          key={mins}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
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

                  {/* Description */}
                  <div className="grid gap-2">
                    <Label htmlFor="description">What did you work on? (optional)</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description..."
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !isValid || loading}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging...
                  </>
                ) : (
                  <>
                    Log {totalMinutes > 0 && `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
