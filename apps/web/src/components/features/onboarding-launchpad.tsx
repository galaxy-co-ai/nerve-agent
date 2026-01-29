"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Shuffle,
  Send,
  Loader2,
  Zap,
  Sparkles,
  ArrowRight,
  Briefcase,
  Code,
  Clock,
  Heart,
  GraduationCap,
  Store,
  ShoppingCart,
  Palette,
  DollarSign,
  Smartphone,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getRandomIdeas, type ProjectIdea, type ProjectCategory } from "@/lib/project-ideas"

// Map categories to icons
const categoryIcons: Record<ProjectCategory, React.ReactNode> = {
  saas: <Briefcase className="h-3.5 w-3.5" />,
  developer: <Code className="h-3.5 w-3.5" />,
  productivity: <Clock className="h-3.5 w-3.5" />,
  health: <Heart className="h-3.5 w-3.5" />,
  education: <GraduationCap className="h-3.5 w-3.5" />,
  marketplace: <Store className="h-3.5 w-3.5" />,
  ecommerce: <ShoppingCart className="h-3.5 w-3.5" />,
  creative: <Palette className="h-3.5 w-3.5" />,
  finance: <DollarSign className="h-3.5 w-3.5" />,
  mobile: <Smartphone className="h-3.5 w-3.5" />,
}

interface Message {
  role: "user" | "assistant"
  content: string
}

// The sample project for dogfooding
const SAMPLE_PROJECT = {
  name: "MyStride.ai",
  description:
    "AI training intelligence for distance runners. Predict injuries before they happen, synthesize personalized training plans from proven coaches, and connect all your running data—Garmin, Strava, Spotify—into one intelligent system that actually coaches you.",
}

export function OnboardingLaunchpad() {
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
      <div className="flex flex-1 flex-col items-center justify-center p-6 min-h-screen">
        <div className="w-full max-w-xl space-y-8">
          {/* Welcome header */}
          <div className="text-center space-y-3">
            {/* Brand title with bottom glow */}
            <h1 className="relative text-4xl font-bold tracking-[0.25em] uppercase">
              <span className="relative z-10 bg-gradient-to-t from-orange-500 via-white/90 to-white bg-clip-text text-transparent">
                NERVE AGENT
              </span>
              {/* Subtle glow underneath */}
              <span className="absolute inset-0 bg-gradient-to-t from-orange-500/40 via-transparent to-transparent blur-sm -z-10 translate-y-1" aria-hidden="true">
                NERVE AGENT
              </span>
            </h1>
            <p className="text-sm tracking-widest text-muted-foreground font-mono">
              /build → /ship → /repeat
            </p>
          </div>

          {/* Main glass card */}
          <div className="glass-elevated rounded-2xl p-8 space-y-8">
            {/* Question */}
            <div className="text-center">
              <h2 className="text-lg font-medium flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-400" />
                <span>What are we building?</span>
              </h2>
            </div>

            {/* Idea chips */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {ideas.map((idea) => (
                  <button
                    key={idea.id}
                    onClick={() => handleIdeaClick(idea)}
                    disabled={isShuffling}
                    className={cn(
                      "glass px-4 py-2 rounded-lg",
                      "inline-flex items-center gap-2",
                      "text-sm font-medium text-foreground/90",
                      "transition-all duration-150",
                      "hover:bg-white/[0.06] hover:border-white/10",
                      "hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]",
                      "active:scale-[0.98]",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <span className="text-orange-400">{categoryIcons[idea.category]}</span>
                    {idea.name}
                  </button>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleShuffle}
                  disabled={isShuffling}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md",
                    "text-xs text-muted-foreground",
                    "transition-all duration-150",
                    "hover:text-foreground hover:bg-white/[0.03]",
                    "disabled:opacity-50"
                  )}
                >
                  {isShuffling ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Shuffle className="h-3 w-3" />
                  )}
                  Show different ideas
                </button>
              </div>
            </div>

            {/* Subtle divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Custom idea input */}
            <form onSubmit={handleCustomSubmit}>
              <div className="flex gap-2">
                <input
                  value={customIdea}
                  onChange={(e) => setCustomIdea(e.target.value)}
                  placeholder="Describe your project idea..."
                  className={cn(
                    "flex-1 px-4 py-2.5 rounded-lg",
                    "bg-white/[0.03]",
                    "border border-orange-500/20",
                    "shadow-[0_0_10px_rgba(255,107,53,0.08)]",
                    "text-sm text-foreground placeholder:text-muted-foreground/50",
                    "transition-all duration-150",
                    "focus:outline-none focus:border-orange-500/40",
                    "focus:shadow-[0_0_15px_rgba(255,107,53,0.15)]"
                  )}
                />
                <button
                  type="submit"
                  disabled={!customIdea.trim()}
                  className={cn(
                    "px-4 py-2.5 rounded-lg",
                    "accent-smolder text-white font-medium",
                    "transition-all duration-150",
                    "hover:accent-smolder-glow",
                    "active:scale-[0.98]",
                    "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Subtle divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Brainstorm CTA */}
            <div className="text-center">
              <button
                onClick={handleSampleProject}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg",
                  "glass text-sm font-medium",
                  "transition-all duration-150",
                  "hover:bg-white/[0.06] hover:border-white/10",
                  "active:scale-[0.98]"
                )}
              >
                <Zap className="h-4 w-4 text-orange-400" />
                Click to Brainstorm
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Chat mode UI
  return (
    <div className="flex flex-1 flex-col p-6 min-h-screen">
      <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Sparkles className="h-4 w-4 text-orange-400" />
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
                  "max-w-[85%] rounded-xl px-4 py-3 transition-all duration-150",
                  message.role === "user"
                    ? "accent-smolder text-white"
                    : "glass"
                )}
              >
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="glass rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                  <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse [animation-delay:150ms]" />
                  <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input or CTA */}
        {projectSlug ? (
          <div className="pt-4">
            <button
              onClick={handleGoToWorkspace}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl",
                "accent-smolder text-white font-medium",
                "transition-all duration-150",
                "hover:accent-smolder-glow",
                "active:scale-[0.99]"
              )}
            >
              Open Workspace
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="pt-4">
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response..."
                disabled={isLoading}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl",
                  "bg-white/[0.03] border border-white/[0.06]",
                  "text-sm text-foreground placeholder:text-muted-foreground/50",
                  "transition-all duration-150",
                  "focus:outline-none focus:border-white/10",
                  "focus:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_0_20px_rgba(255,255,255,0.05)]",
                  "disabled:opacity-50"
                )}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "px-4 py-3 rounded-xl",
                  "accent-smolder text-white font-medium",
                  "transition-all duration-150",
                  "hover:accent-smolder-glow",
                  "active:scale-[0.98]",
                  "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="text-xs text-muted-foreground/50 mt-2 text-center">
              Press Enter to send
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
