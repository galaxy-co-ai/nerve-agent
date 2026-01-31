"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send, Loader2, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface QAResponse {
  question: string
  answer: string
  id?: string
}

export function AiQa() {
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<QAResponse | null>(null)
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || isLoading) return

    setIsLoading(true)
    setResponse(null)
    setFeedback(null)

    try {
      const res = await fetch("/api/ai/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          context: "dashboard",
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to get answer")
      }

      const data = await res.json()
      setResponse({
        question: data.question,
        answer: data.answer,
        id: data.id,
      })
      setQuestion("")
    } catch (error) {
      console.error("Q&A error:", error)
      setResponse({
        question: question.trim(),
        answer: "Sorry, I couldn't process your question right now. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedback = async (isHelpful: boolean) => {
    setFeedback(isHelpful ? "helpful" : "not-helpful")

    if (response?.id) {
      try {
        await fetch("/api/ai/qa", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: response.id,
            isHelpful,
          }),
        })
      } catch (error) {
        console.error("Failed to save feedback:", error)
      }
    }
  }

  const handleReset = () => {
    setResponse(null)
    setFeedback(null)
    setQuestion("")
    inputRef.current?.focus()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          <CardTitle>Ask AI</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!response ? (
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative flex items-center">
                <Sparkles className="absolute left-4 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything about your projects..."
                  className="h-12 pl-11 pr-12 text-base"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 h-8 w-8"
                  disabled={!question.trim() || isLoading}
                  data-ax-intent="search:global"
                  data-ax-context="dashboard-widget"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
            <p className="text-xs text-center text-muted-foreground">
              Questions are saved to your FAQ for future reference
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm font-medium">{response.question}</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed">{response.answer}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Was this helpful?</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7",
                    feedback === "helpful" && "bg-green-500/10 text-green-500"
                  )}
                  onClick={() => handleFeedback(true)}
                  disabled={feedback !== null}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7",
                    feedback === "not-helpful" && "bg-red-500/10 text-red-500"
                  )}
                  onClick={() => handleFeedback(false)}
                  disabled={feedback !== null}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Ask another
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
