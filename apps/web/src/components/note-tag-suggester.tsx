"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sparkles, Loader2, X, Plus, Tag } from "lucide-react"

interface NoteTagSuggesterProps {
  tags: string[]
  onChange: (tags: string[]) => void
  title: string
  content: string
  projectName?: string
}

export function NoteTagSuggester({
  tags,
  onChange,
  title,
  content,
  projectName,
}: NoteTagSuggesterProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const generateSuggestions = useCallback(async () => {
    if (!content.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggest-tags",
          content,
          context: { title, projectName },
        }),
      })

      if (!response.ok) throw new Error("Failed to get suggestions")

      const data = await response.json()
      const suggestedTags = Array.isArray(data.result) ? data.result : []
      // Filter out tags that are already added
      setSuggestions(suggestedTags.filter((t: string) => !tags.includes(t)))
    } catch (error) {
      console.error("Failed to generate tag suggestions:", error)
    } finally {
      setIsLoading(false)
    }
  }, [content, title, projectName, tags])

  const addTag = useCallback((tag: string) => {
    const normalized = tag.toLowerCase().trim().replace(/\s+/g, "-")
    if (normalized && !tags.includes(normalized)) {
      onChange([...tags, normalized])
      setSuggestions((prev) => prev.filter((t) => t !== normalized))
    }
  }, [tags, onChange])

  const removeTag = useCallback((tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }, [tags, onChange])

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTag.trim()) {
      addTag(newTag)
      setNewTag("")
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Tags</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateSuggestions}
          disabled={isLoading || !content.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3 mr-1" />
          )}
          Suggest Tags
        </Button>
      </div>

      {/* Current Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-3 rounded-md border border-dashed border-primary/50 bg-primary/5">
          <p className="text-xs text-muted-foreground mb-2">AI suggested tags:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => addTag(tag)}
              >
                <Plus className="h-3 w-3 mr-1" />
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Tag */}
      <form onSubmit={handleAddCustomTag} className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add custom tag..."
          className="h-8 text-sm"
        />
        <Button type="submit" size="sm" variant="outline" disabled={!newTag.trim()}>
          Add
        </Button>
      </form>
    </div>
  )
}
