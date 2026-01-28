"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { updateTimeEntry, deleteTimeEntry, toggleBillable } from "@/lib/actions/time"

interface Project {
  id: string
  name: string
  slug: string
}

interface TimeEntryRowProps {
  entry: {
    id: string
    projectId: string
    startTime: Date
    endTime: Date | null
    durationMinutes: number
    description: string | null
    billable: boolean
    source: string
    project: {
      name: string
      slug: string
    }
    task?: {
      title: string
    } | null
  }
  projects: Project[]
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

function formatTimeForInput(date: Date): string {
  return date.toTimeString().slice(0, 5)
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function TimeEntryRow({ entry, projects }: TimeEntryRowProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [selectedProject, setSelectedProject] = useState(entry.projectId)
  const [billable, setBillable] = useState(entry.billable)

  async function handleUpdate(formData: FormData) {
    setPending(true)
    try {
      await updateTimeEntry(entry.id, formData)
      setEditOpen(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border p-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${entry.project.slug}`}
              className="font-medium hover:underline truncate"
            >
              {entry.project.name}
            </Link>
            {entry.billable && (
              <Badge variant="outline" className="text-xs">
                billable
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {formatTime(entry.startTime)} – {entry.endTime ? formatTime(entry.endTime) : "now"}
            </span>
            {entry.task && (
              <>
                <span>·</span>
                <span className="truncate">{entry.task.title}</span>
              </>
            )}
          </div>
          {entry.description && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {entry.description}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="font-medium">{formatDuration(entry.durationMinutes)}</div>
          <div className="text-xs text-muted-foreground">
            {entry.source.toLowerCase()}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <form action={toggleBillable.bind(null, entry.id)}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full cursor-pointer">
                  {entry.billable ? "Mark Non-Billable" : "Mark Billable"}
                </button>
              </DropdownMenuItem>
            </form>
            <DropdownMenuSeparator />
            <form action={deleteTimeEntry.bind(null, entry.id)}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full cursor-pointer text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form action={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Time Entry</DialogTitle>
              <DialogDescription>
                Update the details of this time entry.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="projectId">Project</Label>
                <Select
                  name="projectId"
                  value={selectedProject}
                  onValueChange={setSelectedProject}
                  required
                >
                  <SelectTrigger id="projectId">
                    <SelectValue placeholder="Select project" />
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
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={formatDateForInput(entry.startTime)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    defaultValue={formatTimeForInput(entry.startTime)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    defaultValue={entry.endTime ? formatTimeForInput(entry.endTime) : ""}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Notes (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="What did you work on?"
                  defaultValue={entry.description || ""}
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="billable"
                  name="billable"
                  value="true"
                  checked={billable}
                  onChange={(e) => setBillable(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="billable" className="text-sm font-normal">
                  Billable time
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending || !selectedProject}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
