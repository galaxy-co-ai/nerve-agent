"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Home,
  FolderKanban,
  Layers,
  Clock,
  Code2,
  FileText,
  Settings,
  Plus,
  Calculator,
  AlertCircle,
  Play,
  Square,
  CheckCircle2,
  Timer,
  Phone,
  Keyboard,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useTimer } from "@/components/timer-provider"
import { completeTask } from "@/lib/actions/tasks"

interface CommandPaletteProps {
  projects?: { id: string; name: string; slug: string }[]
  notes?: { id: string; title: string; slug: string }[]
  inProgressTasks?: {
    id: string
    title: string
    sprint: {
      number: number
      project: { name: string; slug: string }
    }
  }[]
}

export function CommandPalette({
  projects = [],
  notes = [],
  inProgressTasks = [],
}: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const timer = useTimer()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void | Promise<void>) => {
    setOpen(false)
    command()
  }, [])

  // Keyboard shortcut to open quick time dialog
  const openQuickTime = React.useCallback(() => {
    const event = new KeyboardEvent("keydown", {
      key: "t",
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }, [])

  // Keyboard shortcut to open quick note dialog
  const openQuickNote = React.useCallback(() => {
    const event = new KeyboardEvent("keydown", {
      key: "n",
      metaKey: true,
      shiftKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }, [])

  // Keyboard shortcut to open start timer dialog
  const openStartTimer = React.useCallback(() => {
    const event = new KeyboardEvent("keydown", {
      key: "t",
      altKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }, [])

  const handleCompleteTask = React.useCallback(async (taskId: string) => {
    try {
      await completeTask(taskId)
      router.refresh()
    } catch (error) {
      console.error("Failed to complete task:", error)
    }
  }, [router])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Timer Actions - show prominently when timer running */}
        {timer.timerState.isRunning && (
          <>
            <CommandGroup heading="Active Timer">
              <CommandItem
                onSelect={() => runCommand(async () => {
                  await timer.stopTimer()
                  router.refresh()
                })}
                className="text-green-400"
              >
                <Square className="mr-2 h-4 w-4 fill-current" />
                <span>Stop Timer & Save</span>
                <CommandShortcut>
                  {Math.floor(timer.elapsedSeconds / 60)}m
                </CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Quick Actions - most important */}
        <CommandGroup heading="Quick Actions">
          {!timer.timerState.isRunning && (
            <CommandItem onSelect={() => runCommand(openStartTimer)}>
              <Play className="mr-2 h-4 w-4" />
              <span>Start Timer</span>
              <CommandShortcut>Alt+T</CommandShortcut>
            </CommandItem>
          )}
          <CommandItem onSelect={() => runCommand(openQuickTime)}>
            <Timer className="mr-2 h-4 w-4" />
            <span>Log Time</span>
            <CommandShortcut>Cmd+Shift+T</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(openQuickNote)}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Quick Note</span>
            <CommandShortcut>Cmd+Shift+N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/projects/new"))}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>New Project</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/calls/new"))}
          >
            <Phone className="mr-2 h-4 w-4" />
            <span>Add Call Transcript</span>
          </CommandItem>
        </CommandGroup>

        {/* In-Progress Tasks - complete directly from palette */}
        {inProgressTasks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="In Progress Tasks">
              {inProgressTasks.slice(0, 5).map((task) => (
                <CommandItem
                  key={task.id}
                  onSelect={() => runCommand(() => handleCompleteTask(task.id))}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{task.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {task.sprint.project.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Daily Driver</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/projects"))}
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            <span>Projects</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/sprints"))}
          >
            <Layers className="mr-2 h-4 w-4" />
            <span>Sprint Stack</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/time"))}
          >
            <Clock className="mr-2 h-4 w-4" />
            <span>Time Tracking</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/library"))}
          >
            <Code2 className="mr-2 h-4 w-4" />
            <span>Library</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/notes"))}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Notes</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/calls"))}
          >
            <Phone className="mr-2 h-4 w-4" />
            <span>Calls</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard/blockers"))}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>Blockers</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/settings"))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>

        {/* Projects */}
        {projects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Projects">
              {projects.slice(0, 5).map((project) => (
                <CommandItem
                  key={project.id}
                  onSelect={() => runCommand(() => router.push(`/projects/${project.slug}`))}
                >
                  <FolderKanban className="mr-2 h-4 w-4" />
                  <span>{project.name}</span>
                </CommandItem>
              ))}
              {projects.length > 5 && (
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/projects"))}
                >
                  <span className="text-muted-foreground">View all {projects.length} projects...</span>
                </CommandItem>
              )}
            </CommandGroup>
          </>
        )}

        {/* Notes */}
        {notes.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Notes">
              {notes.slice(0, 5).map((note) => (
                <CommandItem
                  key={note.id}
                  onSelect={() => runCommand(() => router.push(`/notes/${note.slug}`))}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{note.title}</span>
                </CommandItem>
              ))}
              {notes.length > 5 && (
                <CommandItem
                  onSelect={() => runCommand(() => router.push("/notes"))}
                >
                  <span className="text-muted-foreground">View all {notes.length} notes...</span>
                </CommandItem>
              )}
            </CommandGroup>
          </>
        )}

        {/* Keyboard Shortcuts Reference */}
        <CommandSeparator />
        <CommandGroup heading="Keyboard Shortcuts">
          <CommandItem disabled className="opacity-60">
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Cmd+K</span>
            <CommandShortcut>This menu</CommandShortcut>
          </CommandItem>
          <CommandItem disabled className="opacity-60">
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Cmd+Shift+T</span>
            <CommandShortcut>Log time</CommandShortcut>
          </CommandItem>
          <CommandItem disabled className="opacity-60">
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Cmd+Shift+N</span>
            <CommandShortcut>Quick note</CommandShortcut>
          </CommandItem>
          <CommandItem disabled className="opacity-60">
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Alt+T</span>
            <CommandShortcut>Start timer</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
