"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Pencil } from "lucide-react"
import { updateTimeEntry } from "@/lib/actions/time"

interface Project {
  id: string
  name: string
  slug: string
}

interface TimeEntry {
  id: string
  projectId: string
  startTime: Date
  endTime: Date | null
  description: string | null
  billable: boolean
}

interface EditTimeEntryDialogProps {
  entry: TimeEntry
  projects: Project[]
  trigger?: React.ReactNode
}

function formatTimeForInput(date: Date): string {
  return date.toTimeString().slice(0, 5)
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function EditTimeEntryDialog({ entry, projects, trigger }: EditTimeEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [selectedProject, setSelectedProject] = useState(entry.projectId)
  const [billable, setBillable] = useState(entry.billable)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    try {
      await updateTimeEntry(entry.id, formData)
      setOpen(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form action={handleSubmit}>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !selectedProject}>
              {pending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
