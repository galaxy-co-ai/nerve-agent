"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
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
import { createLibraryItem } from "@/lib/actions/library"

const languages = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "tsx", label: "TSX" },
  { value: "jsx", label: "JSX" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "html", label: "HTML" },
  { value: "sql", label: "SQL" },
  { value: "prisma", label: "Prisma" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "bash", label: "Bash" },
  { value: "markdown", label: "Markdown" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "other", label: "Other" },
]

interface AddLibraryItemDialogProps {
  tags: { id: string; name: string; color: string }[]
  projects: { id: string; name: string }[]
  defaultType?: "BLOCK" | "PATTERN" | "QUERY"
}

export function AddLibraryItemDialog({ tags, projects, defaultType }: AddLibraryItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  async function handleSubmit(formData: FormData) {
    setPending(true)
    try {
      // Add selected tags to form data
      selectedTags.forEach(tagId => {
        formData.append("tagIds", tagId)
      })
      await createLibraryItem(formData)
      setOpen(false)
      setSelectedTags([])
    } finally {
      setPending(false)
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add to Library
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add to Library</DialogTitle>
            <DialogDescription>
              Save reusable code to your personal library.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., useDebounce hook"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue={defaultType || "PATTERN"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BLOCK">Block (large implementation)</SelectItem>
                    <SelectItem value="PATTERN">Pattern (snippet/utility)</SelectItem>
                    <SelectItem value="QUERY">Query (database pattern)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select name="language" defaultValue="typescript">
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                name="description"
                placeholder="What does this code do?"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Textarea
                id="code"
                name="code"
                placeholder="Paste your code here..."
                className="font-mono min-h-[200px]"
                required
              />
            </div>

            {projects.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="projectId">Associated Project (optional)</Label>
                <Select name="projectId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No project</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {tags.length > 0 && (
              <div className="grid gap-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        selectedTags.includes(tag.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                      style={
                        selectedTags.includes(tag.id)
                          ? { backgroundColor: tag.color, borderColor: tag.color }
                          : { borderColor: tag.color, color: tag.color }
                      }
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save to Library"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
