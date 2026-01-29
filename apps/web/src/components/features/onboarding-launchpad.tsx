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
  saas: <Briefcase className="h-4 w-4" />,
  developer: <Code className="h-4 w-4" />,
  productivity: <Clock className="h-4 w-4" />,
  health: <Heart className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  marketplace: <Store className="h-4 w-4" />,
  ecommerce: <ShoppingCart className="h-4 w-4" />,
  creative: <Palette className="h-4 w-4" />,
  finance: <DollarSign className="h-4 w-4" />,
  mobile: <Smartphone className="h-4 w-4" />,
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

// Typing effect placeholder ideas
const PLACEHOLDER_IDEAS = [
  "A habit tracker that actually works...",
  "AI-powered invoice generator...",
  "Recipe app with smart grocery lists...",
  "Fitness app for busy parents...",
  "Client portal for freelancers...",
  "Personal CRM for networking...",
  "Meditation app with progress tracking...",
  "Code snippet library for developers...",
  "Expense tracker for small teams...",
  "Appointment scheduler with payments...",
  "Language learning through conversations...",
  "Portfolio builder for designers...",
  "Meal prep planner with macros...",
  "Reading list app with notes...",
  "Time tracker that bills automatically...",
  "Social media scheduler for creators...",
  "Workout planner with AI coaching...",
  "Plant care app with reminders...",
]

export function OnboardingLaunchpad() {
  const router = useRouter()
  const [ideas, setIdeas] = useState<ProjectIdea[]>([])
  const [seenIds, setSeenIds] = useState<string[]>([])
  const [customIdea, setCustomIdea] = useState("")
  const [isShuffling, setIsShuffling] = useState(false)

  // Typing effect state
  const [typedPlaceholder, setTypedPlaceholder] = useState("")
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

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

  // Typing effect for placeholder
  useEffect(() => {
    if (mode !== "select" || customIdea) return

    const currentIdea = PLACEHOLDER_IDEAS[placeholderIndex]
    let charIndex = 0
    let isDeleting = false
    let timeout: NodeJS.Timeout

    const type = () => {
      if (isDeleting) {
        setTypedPlaceholder(currentIdea.substring(0, charIndex))
        charIndex--
        if (charIndex < 0) {
          isDeleting = false
          setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_IDEAS.length)
          return
        }
        timeout = setTimeout(type, 30)
      } else {
        setTypedPlaceholder(currentIdea.substring(0, charIndex + 1))
        charIndex++
        if (charIndex >= currentIdea.length) {
          timeout = setTimeout(() => {
            isDeleting = true
            type()
          }, 2000) // Pause before deleting
          return
        }
        timeout = setTimeout(type, 60)
      }
    }

    timeout = setTimeout(type, 500)
    return () => clearTimeout(timeout)
  }, [placeholderIndex, mode, customIdea])

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
    // Fade out, then swap, then cascade in
    setTimeout(() => {
      const newIdeas = getRandomIdeas(seenIds)
      setIdeas(newIdeas)
      setSeenIds((prev) => [...prev, ...newIdeas.map((i) => i.id)])
      setTimeout(() => setIsShuffling(false), 50)
    }, 400)
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
            {/* Idea chips - cascade animation */}
            <div className="space-y-3">
              <div className="flex flex-col gap-2 items-center">
                {ideas.map((idea, index) => (
                  <button
                    key={idea.id}
                    onClick={() => handleIdeaClick(idea)}
                    disabled={isShuffling}
                    style={{
                      animationDelay: isShuffling ? '0ms' : `${index * 100}ms`,
                    }}
                    className={cn(
                      "group relative w-full max-w-md px-4 py-2.5 rounded-xl",
                      "bg-white/[0.02] border border-white/[0.06]",
                      "backdrop-blur-sm",
                      "flex items-center justify-center gap-3",
                      "transition-all duration-300 ease-out",
                      "hover:bg-white/[0.05] hover:border-white/[0.12]",
                      "hover:shadow-[0_0_30px_rgba(255,107,53,0.08)]",
                      "active:scale-[0.99]",
                      isShuffling
                        ? "opacity-0 -translate-y-2"
                        : "animate-[fadeSlideIn_0.4s_ease-out_forwards] opacity-0",
                      "disabled:cursor-not-allowed"
                    )}
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 group-hover:shadow-[0_0_12px_rgba(255,107,53,0.3)] transition-all duration-200">
                      {categoryIcons[idea.category]}
                    </span>
                    <div className="flex flex-col items-center text-center">
                      <span className="font-medium text-sm text-foreground/90">{idea.name}</span>
                      <span className="text-[11px] text-muted-foreground/50">{idea.tagline}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-center pt-1">
                <button
                  onClick={handleShuffle}
                  disabled={isShuffling}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md",
                    "text-xs text-muted-foreground/60",
                    "transition-all duration-200",
                    "hover:text-foreground/70 hover:bg-white/[0.03]",
                    "disabled:opacity-40"
                  )}
                >
                  {isShuffling ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Shuffle className="h-3 w-3" />
                  )}
                  Shuffle
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
                  placeholder={typedPlaceholder || "Describe your project idea..."}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-xl",
                    "bg-white/[0.03]",
                    "border border-orange-500/20",
                    "shadow-[0_0_10px_rgba(255,107,53,0.08)]",
                    "text-sm text-white font-medium placeholder:text-muted-foreground/40",
                    "transition-all duration-150",
                    "focus:outline-none focus:border-orange-500/40",
                    "focus:shadow-[0_0_15px_rgba(255,107,53,0.15)]"
                  )}
                />
                <button
                  type="submit"
                  disabled={!customIdea.trim()}
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
              </div>
            </form>

            {/* Subtle divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Brainstorm CTA - iOS liquid glass */}
            <div className="text-center">
              <button
                onClick={handleSampleProject}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-2xl",
                  "bg-white/[0.04] backdrop-blur-xl",
                  "border border-white/[0.08]",
                  "text-sm font-medium text-foreground/70",
                  "shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]",
                  "transition-all duration-300",
                  "hover:bg-white/[0.07] hover:text-foreground/90",
                  "hover:border-white/[0.12]",
                  "hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_0_20px_rgba(255,255,255,0.03)]",
                  "active:scale-[0.98]"
                )}
              >
                <Zap className="h-4 w-4 text-orange-400/80 group-hover:text-orange-400" />
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
