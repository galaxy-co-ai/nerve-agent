"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Shuffle,
  Send,
  Loader2,
  Rocket,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getRandomIdeas, type ProjectIdea } from "@/lib/project-ideas"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface OnboardingLaunchpadProps {
  userName?: string
}

// The sample project for dogfooding
const SAMPLE_PROJECT = {
  name: "MyStride.ai",
  description:
    "AI training intelligence for distance runners. Predict injuries before they happen, synthesize personalized training plans from proven coaches, and connect all your running data—Garmin, Strava, Spotify—into one intelligent system that actually coaches you.",
}

export function OnboardingLaunchpad({ userName }: OnboardingLaunchpadProps) {
  const router = useRouter()
  const [ideas, setIdeas] = useState<ProjectIdea[]>([])
  const [seenIds, setSeenIds] = useState<string[]>([])
  const [customIdea, setCustomIdea] = useState("")
  const [isShuffling, setIsShuffling] = useState(false)

  // Conversation state
  const [mode, setMode] = useState<"select" | "chat">("select")
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [projectSlug, setProjectSlug] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize with random ideas
  useEffect(() => {
    const initial = getRandomIdeas([])
    setIdeas(initial)
    setSeenIds(initial.map((i) => i.id))
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when entering chat mode
  useEffect(() => {
    if (mode === "chat") {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [mode])

  const handleShuffle = () => {
    setIsShuffling(true)
    setTimeout(() => {
      const newIdeas = getRandomIdeas(seenIds)
      setIdeas(newIdeas)
      setSeenIds((prev) => [...prev, ...newIdeas.map((i) => i.id)])
      setIsShuffling(false)
    }, 300)
  }

  const startConversation = async (ideaText: string, ideaName?: string) => {
    setSelectedIdea(ideaName || ideaText)
    setMode("chat")

    // Initial AI message - co-founder energy
    const initialMessage: Message = {
      role: "assistant",
      content: `Love it! "${ideaName || ideaText}" sounds like a project worth building together.\n\nBefore we dive in, I need to understand the vision. A few quick questions:\n\n**Who is this for?** Who's the ideal user—and what's the pain point we're solving for them?`,
    }

    setMessages([initialMessage])
  }

  const handleIdeaClick = (idea: ProjectIdea) => {
    startConversation(idea.tagline, idea.name)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customIdea.trim()) return
    startConversation(customIdea.trim())
    setCustomIdea("")
  }

  const handleSampleProject = () => {
    setSelectedIdea(SAMPLE_PROJECT.name)
    setMode("chat")

    const initialMessage: Message = {
      role: "assistant",
      content: `Great choice! **${SAMPLE_PROJECT.name}** is a real project we can build together.\n\n> ${SAMPLE_PROJECT.description}\n\nLet me set this up as our test project. Ready to create it and jump into the workspace?`,
    }

    setMessages([initialMessage])
  }

  const handleChatSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage: Message = { role: "user", content: trimmed }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/onboarding/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          selectedIdea,
          isSampleProject: selectedIdea === SAMPLE_PROJECT.name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      // Check if a project was created
      if (data.projectSlug) {
        setProjectSlug(data.projectSlug)
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Something went wrong: ${error instanceof Error ? error.message : "Unknown error"}. Let's try that again.`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleChatSubmit()
    }
  }

  const handleGoToWorkspace = () => {
    if (projectSlug) {
      router.push(`/projects/${projectSlug}/workspace`)
    }
  }

  // Selection mode UI
  if (mode === "select") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-8">
          {/* Welcome header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary mb-4">
              <Rocket className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to NERVE AGENT
              {userName ? `, ${userName.split(" ")[0]}` : ""}
            </h1>
            <p className="text-lg text-muted-foreground">
              I'm your AI co-founder. Let's build something together.
            </p>
          </div>

          {/* Main card */}
          <Card className="border-2">
            <CardContent className="pt-6 space-y-6">
              {/* Question */}
              <div className="text-center">
                <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  What are we building?
                </h2>
              </div>

              {/* Idea chips */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 justify-center">
                  {ideas.map((idea) => (
                    <Button
                      key={idea.id}
                      variant="outline"
                      className={cn(
                        "h-auto py-2 px-4 text-left transition-all",
                        "hover:border-primary hover:bg-primary/5",
                        isShuffling && "opacity-50"
                      )}
                      onClick={() => handleIdeaClick(idea)}
                      disabled={isShuffling}
                    >
                      <span className="font-medium">{idea.name}</span>
                    </Button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShuffle}
                    disabled={isShuffling}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {isShuffling ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Shuffle className="h-4 w-4 mr-2" />
                    )}
                    Show different ideas
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Custom idea input */}
              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={customIdea}
                    onChange={(e) => setCustomIdea(e.target.value)}
                    placeholder="Describe your project idea..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!customIdea.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Sample project */}
              <div className="text-center">
                <Button
                  variant="secondary"
                  onClick={handleSampleProject}
                  className="gap-2"
                >
                  <Rocket className="h-4 w-4" />
                  Try a sample project (MyStride.ai)
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Experience the full workflow with a pre-built example
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Chat mode UI
  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span>Creating project</span>
          </div>
          <h1 className="text-2xl font-bold">{selectedIdea}</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-4 py-3",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <div className="whitespace-pre-wrap text-sm prose prose-sm dark:prose-invert max-w-none">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input or CTA */}
        {projectSlug ? (
          <div className="border-t pt-4">
            <Button
              onClick={handleGoToWorkspace}
              className="w-full gap-2"
              size="lg"
            >
              Open Workspace
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-t pt-4">
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={!input.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
