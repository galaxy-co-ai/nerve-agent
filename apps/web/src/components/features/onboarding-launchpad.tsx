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
  ArrowLeft,
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

  // Conversation state - flip card instead of mode switch
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
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
    if (isFlipped || customIdea) return

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
  }, [placeholderIndex, isFlipped, customIdea])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when card flips to chat
  useEffect(() => {
    if (isFlipped) {
      // Wait for flip animation (900ms) to complete before focusing
      setTimeout(() => inputRef.current?.focus(), 950)
    }
  }, [isFlipped])

  const handleShuffle = () => {
    setIsShuffling(true)
    // Slow fade out, then swap, then cascade in
    setTimeout(() => {
      const newIdeas = getRandomIdeas(seenIds)
      setIdeas(newIdeas)
      setSeenIds((prev) => [...prev, ...newIdeas.map((i) => i.id)])
      setTimeout(() => setIsShuffling(false), 100)
    }, 500)
  }

  const flipToChat = (ideaText: string, ideaName?: string) => {
    setSelectedIdea(ideaName || ideaText)
    setIsFlipping(true)

    // Trigger flip
    setTimeout(() => {
      setIsFlipped(true)
    }, 50)

    // Clear flipping state after animation (900ms)
    setTimeout(() => {
      setIsFlipping(false)
    }, 950)

    const initialMessage: Message = {
      role: "assistant",
      content: `Love it! "${ideaName || ideaText}" sounds like a project worth building together.\n\nBefore we dive in, I need to understand the vision. A few quick questions:\n\n**Who is this for?** Who's the ideal user—and what's the pain point we're solving for them?`,
    }

    setMessages([initialMessage])
  }

  const flipBack = () => {
    setIsFlipping(true)
    setIsFlipped(false)
    setTimeout(() => {
      setIsFlipping(false)
      setMessages([])
      setSelectedIdea(null)
      setProjectSlug(null)
    }, 950)
  }

  const handleIdeaClick = (idea: ProjectIdea) => {
    flipToChat(idea.tagline, idea.name)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customIdea.trim()) return
    flipToChat(customIdea.trim())
    setCustomIdea("")
  }

  const handleBrainstorm = () => {
    setSelectedIdea(SAMPLE_PROJECT.name)
    setIsFlipping(true)

    setTimeout(() => {
      setIsFlipped(true)
    }, 50)

    setTimeout(() => {
      setIsFlipping(false)
    }, 950)

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

  // Card dimensions for flip
  const CARD_HEIGHT = 520

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

        {/* Flip Card Container */}
        <div className="flip-card" style={{ height: CARD_HEIGHT }}>
          <div className={cn("flip-card-inner", isFlipped && "flipped", isFlipping && "flipping")}>

            {/* FRONT: Selection Mode */}
            <div className="flip-card-front">
              <div className="glass-elevated rounded-2xl p-8 space-y-6 h-full flex flex-col">
                {/* Idea chips - cascade animation */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-col gap-2 items-center">
                    {ideas.map((idea, index) => (
                      <button
                        key={idea.id}
                        onClick={() => handleIdeaClick(idea)}
                        disabled={isShuffling || isFlipping}
                        style={{
                          animationDelay: isShuffling ? '0ms' : `${index * 150}ms`,
                        }}
                        className={cn(
                          "group relative w-full max-w-md px-4 py-2.5 rounded-xl",
                          "bg-white/[0.02] border border-white/[0.06]",
                          "backdrop-blur-sm",
                          "flex items-center justify-center",
                          "transition-all duration-500 ease-out",
                          "hover:bg-white/[0.05] hover:border-white/[0.12]",
                          "hover:shadow-[0_0_30px_rgba(255,107,53,0.08)]",
                          "active:scale-[0.99]",
                          isShuffling
                            ? "opacity-0 -translate-y-2"
                            : "animate-[fadeSlideIn_0.6s_ease-out_forwards] opacity-0",
                          "disabled:cursor-not-allowed"
                        )}
                      >
                        {/* Centered group: icon + text left-aligned within */}
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 group-hover:shadow-[0_0_12px_rgba(255,107,53,0.3)] transition-all duration-300">
                            {categoryIcons[idea.category]}
                          </span>
                          <div className="flex flex-col items-start text-left">
                            <span className="font-medium text-sm text-foreground/90">{idea.name}</span>
                            <span className="text-[11px] text-muted-foreground/50">{idea.tagline}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center pt-1">
                    <button
                      onClick={handleShuffle}
                      disabled={isShuffling || isFlipping}
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
                      disabled={isFlipping}
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
                      disabled={!customIdea.trim() || isFlipping}
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

                {/* Brainstorm CTA */}
                <div className="text-center">
                  <button
                    onClick={handleBrainstorm}
                    disabled={isFlipping}
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
                    <Zap className="h-4 w-4 text-orange-400/80" />
                    Click to Brainstorm
                  </button>
                </div>
              </div>
            </div>

            {/* BACK: Chat Mode */}
            <div className="flip-card-back">
              <div className="glass-elevated rounded-2xl p-6 h-full flex flex-col">
                {/* Header with back button */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={flipBack}
                    disabled={isFlipping || isLoading}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-lg",
                      "text-xs text-muted-foreground/60",
                      "transition-all duration-200",
                      "hover:text-foreground/70 hover:bg-white/[0.03]"
                    )}
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back
                  </button>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-orange-400" />
                    <span className="truncate max-w-[180px]">{selectedIdea}</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-0">
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
                          "max-w-[90%] rounded-xl px-3 py-2 transition-all duration-150",
                          message.role === "user"
                            ? "accent-smolder text-white"
                            : "bg-white/[0.03] border border-white/[0.06]"
                        )}
                      >
                        <div className="whitespace-pre-wrap text-xs leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                          <div className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse [animation-delay:150ms]" />
                          <div className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input or CTA */}
                {projectSlug ? (
                  <button
                    onClick={handleGoToWorkspace}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl",
                      "accent-smolder text-white text-sm font-medium",
                      "transition-all duration-150",
                      "hover:accent-smolder-glow",
                      "active:scale-[0.99]"
                    )}
                  >
                    Open Workspace
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your response..."
                      disabled={isLoading}
                      className={cn(
                        "flex-1 px-3 py-2.5 rounded-xl",
                        "bg-white/[0.03] border border-white/[0.06]",
                        "text-sm text-foreground placeholder:text-muted-foreground/50",
                        "transition-all duration-150",
                        "focus:outline-none focus:border-orange-500/30",
                        "focus:shadow-[0_0_15px_rgba(255,107,53,0.1)]",
                        "disabled:opacity-50"
                      )}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className={cn(
                        "px-3 py-2.5 rounded-xl",
                        "accent-smolder text-white font-medium",
                        "transition-all duration-150",
                        "hover:accent-smolder-glow",
                        "active:scale-[0.98]",
                        "disabled:opacity-30 disabled:cursor-not-allowed"
                      )}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
