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

interface CommandPaletteProps {
  projects?: { id: string; name: string; slug: string }[]
  notes?: { id: string; title: string; slug: string }[]
}

export function CommandPalette({ projects = [], notes = [] }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

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

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Daily Driver</span>
            <CommandShortcut>Dashboard</CommandShortcut>
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
            onSelect={() => runCommand(() => router.push("/settings"))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/projects/new"))}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>New Project</span>
            <CommandShortcut>Create</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/time?action=add"))}
          >
            <Calculator className="mr-2 h-4 w-4" />
            <span>Log Time Entry</span>
            <CommandShortcut>Add time</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard/blockers"))}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>View Blockers</span>
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
      </CommandList>
    </CommandDialog>
  )
}
