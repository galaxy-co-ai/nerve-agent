"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
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
import { updateNote } from "@/lib/actions/notes"
import Link from "next/link"

interface EditNoteFormProps {
  note: {
    slug: string
    title: string
    content: string
    projectId: string | null
  }
  projects: { id: string; name: string }[]
}

export function EditNoteForm({ note, projects }: EditNoteFormProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    try {
      await updateNote(note.slug, formData)
    } catch (error) {
      setPending(false)
    }
  }

  return (
    <form action={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={note.title}
              required
            />
          </div>

          {projects.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="projectId">Project (optional)</Label>
              <Select name="projectId" defaultValue={note.projectId || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={note.content}
              className="min-h-[400px] font-mono"
              required
            />
            <p className="text-xs text-muted-foreground">
              Tip: Use [[Note Title]] to create wiki-style links to other notes.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button asChild variant="outline">
            <Link href={`/notes/${note.slug}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
