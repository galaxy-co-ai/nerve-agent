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
import { Plus } from "lucide-react"
import { createTimeEntry } from "@/lib/actions/time"

interface Project {
  id: string
  name: string
  slug: string
}

interface AddTimeEntryDialogProps {
  projects: Project[]
}

export function AddTimeEntryDialog({ projects }: AddTimeEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>("")

  // Default to today's date
  const today = new Date().toISOString().split("T")[0]

  async function handleSubmit(formData: FormData) {
    setPending(true)
    try {
      await createTimeEntry(formData)
      setOpen(false)
      setSelectedProject("")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Log Time
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log Time Entry</DialogTitle>
            <DialogDescription>
              Manually record time spent on a project.
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
                defaultValue={today}
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
                  defaultValue="09:00"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  defaultValue="10:00"
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
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="billable"
                name="billable"
                value="true"
                defaultChecked
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
              {pending ? "Saving..." : "Log Time"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
