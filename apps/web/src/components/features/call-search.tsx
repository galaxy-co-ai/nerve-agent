"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, Search, Loader2, X, Phone, Calendar, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import Link from "next/link"

interface CallSearchResult {
  callId: string
  title: string
  callDate: string
  projectName: string
  relevance: number
  context: string
}

interface CallSearchProps {
  projectId?: string
}

export function CallSearch({ projectId }: CallSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isAIMode, setIsAIMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<CallSearchResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAISearch = useCallback(async () => {
    if (!query.trim()) {
      setResults(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/search-calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, projectId }),
      })

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setResults(data.results)
    } catch (err) {
      console.error("AI search failed:", err)
      setError("Search failed. Please try again.")
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [query, projectId])

  const handleRegularSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (isAIMode) return

    const params = new URLSearchParams()
    if (query.trim()) {
      params.set("q", query.trim())
    }
    router.push(`/calls?${params.toString()}`)
  }, [query, isAIMode, router])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isAIMode) {
      e.preventDefault()
      handleAISearch()
    }
  }

  const clearSearch = () => {
    setQuery("")
    setResults(null)
    setError(null)
    if (!isAIMode) {
      router.push("/calls")
    }
  }

  const toggleAIMode = () => {
    setIsAIMode(!isAIMode)
    setResults(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <form onSubmit={handleRegularSearch} className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            placeholder={isAIMode ? "Ask: find discussions about..." : "Search calls by title..."}
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
          title={isAIMode ? "AI search enabled" : "Enable AI semantic search"}
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
        <p className="text-xs text-muted-foreground">
          AI search understands natural language like "discussions about authentication" or "what did the client say about pricing"
        </p>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}

      {/* AI Search Results */}
      {isAIMode && results !== null && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Phone className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">
                  No calls found matching your query
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Found {results.length} relevant call{results.length !== 1 ? "s" : ""}
              </p>
              <div className="grid gap-3">
                {results.map((result) => (
                  <Link key={result.callId} href={`/calls/${result.callId}`}>
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">
                              {result.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                {result.projectName}
                              </span>
                              <span className="flex items-center gap-1 text-xs">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(result.callDate), "MMM d, yyyy")}
                              </span>
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-xs">
                              {Math.round(result.relevance * 10)}% match
                            </span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.context}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
