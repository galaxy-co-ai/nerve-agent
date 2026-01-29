"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronUp,
  ChevronDown,
  Send,
  Loader2,
  Sparkles,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface WorkspaceChatProps {
  projectSlug: string
  projectName: string
  currentContext?: string
}

export function WorkspaceChat({
  projectSlug,
  projectName,
  currentContext,
}: WorkspaceChatProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: "user", content: userMessage },
          ],
          context: {
            currentProject: { name: projectName, slug: projectSlug },
            currentContext,
          },
        }),
      })

      if (!res.ok) throw new Error("Failed to get response")

      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (!isExpanded) {
    return (
      <div className="border-t border-border/40 bg-background">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-accent/50"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span>Claude Chat</span>
            {messages.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {messages.length} messages
              </span>
            )}
          </div>
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-64 flex-col border-t border-border/40 bg-background">
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border/40 px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Claude</span>
          {currentContext && (
            <span className="text-xs text-muted-foreground">
              Context: {currentContext}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsExpanded(false)}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              <p>Ask Claude anything about this project.</p>
              <p className="text-xs mt-1">
                Claude can help with planning, coding questions, and more.
              </p>
            </div>
          ) : (
            messages.map((message, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  message.role === "assistant" ? "items-start" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    message.role === "assistant"
                      ? "bg-blue-500/10"
                      : "bg-muted"
                  )}
                >
                  {message.role === "assistant" ? (
                    <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
              </div>
              <div className="text-sm text-muted-foreground">Thinking...</div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="shrink-0 border-t border-border/40 p-3">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Claude..."
            className="min-h-[40px] max-h-[80px] resize-none text-sm"
            disabled={isLoading}
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
