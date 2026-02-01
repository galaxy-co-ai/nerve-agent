"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AIEditor } from "@/components/features/ai-editor"
import { NoteTagSuggester } from "@/components/features/note-tag-suggester"
import { updateNote } from "@/lib/actions/notes"
import Link from "next/link"

interface EditNoteFormProps {
  note: {
    slug: string
    title: string
    content: string
    projectId: string | null
    folderId: string | null
    tags: string[]
  }
  projects: { id: string; name: string }[]
  folders: { id: string; name: string; slug: string }[]
}

export function EditNoteForm({ note, projects, folders }: EditNoteFormProps) {
  const [pending, setPending] = useState(false)
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [projectId, setProjectId] = useState(note.projectId || "")
  const [folderId, setFolderId] = useState(note.folderId || "")
  const [tags, setTags] = useState<string[]>(note.tags)
  const formRef = useRef<HTMLFormElement>(null)

  const selectedProject = projects.find((p) => p.id === projectId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)

    const formData = new FormData()
    formData.set("title", title)
    formData.set("content", content)
    formData.set("projectId", projectId)
    formData.set("folderId", folderId)
    formData.set("tags", JSON.stringify(tags))

    try {
      await updateNote(note.slug, formData)
    } catch (error) {
      console.error("Failed to update note:", error)
      setPending(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {projects.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="projectId">Project (optional)</Label>
              <Select value={projectId} onValueChange={setProjectId}>
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

          {folders.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="folderId">Folder</Label>
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <AIEditor
              id="content"
              value={content}
              onChange={setContent}
              placeholder="Start writing..."
              context={{
                title,
                projectName: selectedProject?.name,
              }}
            />
          </div>

          <Separator />

          <NoteTagSuggester
            tags={tags}
            onChange={setTags}
            title={title}
            content={content}
            projectName={selectedProject?.name}
          />
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
