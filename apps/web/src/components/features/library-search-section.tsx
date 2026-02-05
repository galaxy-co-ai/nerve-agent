"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Search, Loader2, X, Blocks } from "lucide-react"
import { LibraryItemCard } from "@/components/features/library-item-card"
import { cn } from "@/lib/utils"

interface LibraryItem {
  id: string
  title: string
  description: string | null
  code: string
  language: string
  type: "BLOCK" | "PATTERN" | "QUERY"
  usageCount: number
  lastUsedAt: Date | null
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
  tags: { id: string; name: string; color: string }[]
  project: { id: string; name: string; slug: string } | null
}

interface LibrarySearchSectionProps {
  type: "BLOCK" | "PATTERN" | "QUERY"
  items: LibraryItem[]
  emptyIcon: typeof Blocks
  emptyTitle: string
  emptyDescription: string
  searchPlaceholder: string
  children?: React.ReactNode
}

export function LibrarySearchSection({
  type,
  items,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDescription,
  searchPlaceholder,
  children,
}: LibrarySearchSectionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const [isAIMode, setIsAIMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [aiResults, setAiResults] = useState<LibraryItem[] | null>(null)

  const handleRegularSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (isAIMode) return

    const params = new URLSearchParams()
    if (query.trim()) {
      params.set("q", query.trim())
    }
    router.push(`?${params.toString()}`)
  }, [query, isAIMode, router])

  const handleAISearch = useCallback(async () => {
    if (!query.trim()) {
      setAiResults(null)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, type }),
      })

      if (!response.ok) throw new Error("Search failed")

      const data = await response.json()
      setAiResults(data.results)
    } catch (error) {
      console.error("AI search failed:", error)
      setAiResults([])
    } finally {
      setIsLoading(false)
    }
  }, [query, type])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isAIMode) {
      e.preventDefault()
      handleAISearch()
    }
  }

  const clearSearch = () => {
    setQuery("")
    setAiResults(null)
    if (!isAIMode) {
      router.push("?")
    }
  }

  const toggleAIMode = () => {
    setIsAIMode(!isAIMode)
    setAiResults(null)
    if (!isAIMode) {
      // Switching to AI mode - clear URL search
      router.push("?")
    }
  }

  // Determine which items to display
  const displayItems = isAIMode && aiResults !== null ? aiResults : items
  const hasQuery = isAIMode ? aiResults !== null : !!searchParams.get("q")

  return (
    <>
      {/* Search */}
      <form onSubmit={handleRegularSearch} className="flex items-center gap-2 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder={isAIMode ? "Ask: find code that handles..." : searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          type="button"
          variant={isAIMode ? "default" : "outline"}
          size="icon"
          onClick={toggleAIMode}
          title={isAIMode ? "AI search enabled - click to use regular search" : "Enable AI semantic search"}
          className={cn(isAIMode && "bg-primary")}
        >
          <Sparkles className="h-4 w-4" />
        </Button>

        {isAIMode ? (
          <Button type="button" onClick={handleAISearch} disabled={isLoading || !query.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        ) : (
          <Button type="submit" variant="secondary">
            Search
          </Button>
        )}
      </form>

      {isAIMode && (
        <p className="text-xs text-muted-foreground -mt-4">
          AI search understands natural language queries like "authentication with JWT" or "form validation helper"
        </p>
      )}

      {displayItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <EmptyIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">
              {hasQuery ? `No ${type.toLowerCase()}s found` : emptyTitle}
            </h3>
            <p className="text-muted-foreground text-sm mb-4 text-center max-w-sm">
              {hasQuery
                ? `Try a different search term${isAIMode ? " or switch to regular search" : ""}.`
                : emptyDescription}
            </p>
            {!hasQuery && children}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((item) => (
            <LibraryItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  )
}
