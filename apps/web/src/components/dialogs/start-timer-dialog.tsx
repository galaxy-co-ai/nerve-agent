"use client"

import { useState, useEffect, useCallback } from "react"
import { useTimer } from "@/components/timer/timer-provider"
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
import { Loader2, Play, Clock } from "lucide-react"
import { getQuickTimeEntryData } from "@/lib/actions/time"

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

export function StartTimerDialog() {
  const { timerState, startTimer } = useTimer()
  const [open, setOpen] = useState(false)

  // Form state
  const [projectId, setProjectId] = useState("")
  const [taskId, setTaskId] = useState("")
  const [description, setDescription] = useState("")

  // Data for selects
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<InProgressTask[]>([])
  const [loading, setLoading] = useState(false)

  // Handle keyboard shortcut - Alt+Shift+T to start timer (different from Cmd+Shift+T for quick log)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+T to start timer (simpler shortcut)
      if (e.altKey && !e.shiftKey && !e.metaKey && !e.ctrlKey && e.key.toLowerCase() === "t") {
        e.preventDefault()
        if (!timerState.isRunning) {
          setOpen(true)
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [timerState.isRunning])

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
      const timeout = setTimeout(() => {
        setProjectId("")
        setTaskId("")
        setDescription("")
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

  const handleStart = useCallback(() => {
    if (!projectId) return

    const project = projects.find(p => p.id === projectId)
    const task = tasks.find(t => t.id === taskId)

    startTimer({
      projectId,
      projectName: project?.name || "Unknown",
      taskId: taskId || null,
      taskTitle: task?.title || null,
      description: description.trim() || null,
    })

    setOpen(false)
  }, [projectId, taskId, description, projects, tasks, startTimer])

  // Already running - don't show
  if (timerState.isRunning) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Start Timer
          </DialogTitle>
          <DialogDescription>
            Start tracking time. Press{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Alt+T</kbd>{" "}
            to open this.
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
                  <Label htmlFor="timer-task">Task (optional)</Label>
                  <Select value={taskId} onValueChange={handleTaskChange}>
                    <SelectTrigger id="timer-task">
                      <SelectValue placeholder="Select a task..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific task</SelectItem>
                      {tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Project */}
              <div className="grid gap-2">
                <Label htmlFor="timer-project">Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger id="timer-project">
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

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="timer-description">What are you working on? (optional)</Label>
                <Input
                  id="timer-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description..."
                  autoFocus
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleStart} disabled={!projectId || loading}>
            <Play className="mr-2 h-4 w-4" />
            Start Timer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
