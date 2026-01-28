"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sparkles, Search, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface LibraryItem {
  id: string
  title: string
  description: string | null
  code: string
  language: string
  type: string
  usageCount: number
}

interface LibraryAISearchProps {
  type?: "BLOCK" | "PATTERN" | "QUERY"
  onResults: (results: LibraryItem[] | null) => void
  className?: string
}

export function LibraryAISearch({ type, onResults, className }: LibraryAISearchProps) {
  const [query, setQuery] = useState("")
  const [isAIMode, setIsAIMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      onResults(null)
      return
    }

    if (!isAIMode) {
      // Regular search handled by parent via query param
      onResults(null)
      return
    }

    // AI search
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, type }),
      })

      if (!response.ok) throw new Error("Search failed")

      const data = await response.json()
      onResults(data.results)
    } catch (error) {
      console.error("AI search failed:", error)
      onResults(null)
    } finally {
      setIsLoading(false)
    }
  }, [query, isAIMode, type, onResults])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setQuery("")
    onResults(null)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={isAIMode ? "Ask: find code that handles..." : "Search by title, description, code..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Button
        variant={isAIMode ? "default" : "outline"}
        size="icon"
        onClick={() => setIsAIMode(!isAIMode)}
        title={isAIMode ? "AI search enabled" : "Enable AI search"}
        className={cn(isAIMode && "bg-primary")}
      >
        <Sparkles className="h-4 w-4" />
      </Button>

      {isAIMode && (
        <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      )}
    </div>
  )
}
