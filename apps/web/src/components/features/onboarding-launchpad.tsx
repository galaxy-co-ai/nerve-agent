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
  Power,
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
]

type Mode = "suggest" | "ask" | "brainstorm"

export function OnboardingLaunchpad() {
  const router = useRouter()
  const [ideas, setIdeas] = useState<ProjectIdea[]>([])
  const [seenIds, setSeenIds] = useState<string[]>([])
  const [customIdea, setCustomIdea] = useState("")
  const [isShuffling, setIsShuffling] = useState(false)

  // Hardware unit state
  const [isOn, setIsOn] = useState(true)
  const [mode, setMode] = useState<Mode>("suggest")

  // Typing effect state
  const [typedPlaceholder, setTypedPlaceholder] = useState("")
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  // Conversation state
  const [isFlipped, setIsFlipped] = useState(false)
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
    if (isFlipped || customIdea || mode !== "ask") return

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
          }, 2000)
          return
        }
        timeout = setTimeout(type, 60)
      }
    }

    timeout = setTimeout(type, 500)
    return () => clearTimeout(timeout)
  }, [placeholderIndex, isFlipped, customIdea, mode])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when entering ask mode or chat
  useEffect(() => {
    if (mode === "ask" && !isFlipped) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    if (isFlipped) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [mode, isFlipped])

  const handleShuffle = () => {
    setIsShuffling(true)
    setTimeout(() => {
      const newIdeas = getRandomIdeas(seenIds)
      setIdeas(newIdeas)
      setSeenIds((prev) => [...prev, ...newIdeas.map((i) => i.id)])
      setTimeout(() => setIsShuffling(false), 100)
    }, 500)
  }

  const flipToChat = (ideaText: string, ideaName?: string) => {
    setSelectedIdea(ideaName || ideaText)
    setIsFlipped(true)

    const initialMessage: Message = {
      role: "assistant",
      content: `Love it! "${ideaName || ideaText}" sounds like a project worth building together.\n\nBefore we dive in, I need to understand the vision. A few quick questions:\n\n**Who is this for?** Who's the ideal user—and what's the pain point we're solving for them?`,
    }

    setMessages([initialMessage])
  }

  const flipBack = () => {
    setIsFlipped(false)
    setMessages([])
    setSelectedIdea(null)
    setProjectSlug(null)
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
    setIsFlipped(true)

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

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 min-h-screen">
      <div className="w-full max-w-2xl space-y-8">
        {/* Hardware Unit Container */}
        <div
          className="relative p-3 rounded-[20px] sm:rounded-[24px]"
          style={{
            backgroundColor: "#1c1c1f",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            borderBottom: "1px solid rgba(0,0,0,0.4)",
            borderLeft: "1px solid rgba(255,255,255,0.05)",
            borderRight: "1px solid rgba(0,0,0,0.3)",
            boxShadow: `
              0 25px 50px -12px rgba(0,0,0,0.5),
              0 12px 24px -8px rgba(0,0,0,0.4),
              0 4px 8px -2px rgba(0,0,0,0.3),
              inset 0 1px 0 rgba(255,255,255,0.05)
            `,
          }}
        >
          {/* Subtle brushed metal highlight */}
          <div
            className="absolute inset-0 rounded-[inherit] pointer-events-none"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 30%, rgba(0,0,0,0.1) 100%)",
            }}
          />

          {/* Header */}
          <div className="relative flex items-center justify-between px-2 py-3 mb-2">
            {/* Left: Power Toggle Switch */}
            <GlowSwitch isOn={isOn} onToggle={() => setIsOn(!isOn)} />

            {/* Center: NERVE AGENT neon title */}
            <NeonText isOn={isOn} />

            {/* Right: Power button */}
            <button
              onClick={() => setIsOn(!isOn)}
              className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                border: `2px solid ${isOn ? "#C9A84C" : "rgba(255,255,255,0.2)"}`,
                backgroundColor: "#0f0f11",
                boxShadow: isOn
                  ? "0 0 16px rgba(201, 168, 76, 0.25), inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.3)"
                  : "inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              <Power
                size={16}
                strokeWidth={2.5}
                style={{ color: isOn ? "#C9A84C" : "rgba(255,255,255,0.4)" }}
              />
            </button>
          </div>

          {/* Canvas Area - Recessed into dark metal housing */}
          <div className="relative rounded-xl" style={{ padding: "2px" }}>
            {/* Outer bezel - dark metal recess */}
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background: `linear-gradient(180deg,
                  rgba(0,0,0,0.5) 0%,
                  rgba(0,0,0,0.2) 30%,
                  rgba(255,255,255,0.02) 70%,
                  rgba(255,255,255,0.04) 100%
                )`,
              }}
            />
            {/* Inner screen */}
            <div
              className="relative overflow-hidden rounded-[10px] p-6 sm:p-8"
              style={{
                backgroundColor: "#08080a",
                boxShadow: `
                  inset 0 3px 12px rgba(0,0,0,0.9),
                  inset 0 1px 3px rgba(0,0,0,0.6),
                  inset 0 0 0 1px rgba(0,0,0,0.5)
                `,
                minHeight: "440px",
                opacity: isOn ? 1 : 0.3,
                transition: "opacity 500ms ease-out",
              }}
            >
              {/* Dot Grid */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  opacity: isOn ? 1 : 0.3,
                }}
              />

              {/* Content based on mode - with smooth transitions */}
              <div className="relative z-10 h-full">
                {/* Mode panels with cross-fade */}
                <div
                  className="absolute inset-0 transition-all duration-500 ease-out"
                  style={{
                    opacity: !isFlipped && mode === "suggest" ? 1 : 0,
                    transform: !isFlipped && mode === "suggest" ? "translateY(0)" : "translateY(8px)",
                    pointerEvents: !isFlipped && mode === "suggest" ? "auto" : "none",
                    willChange: "opacity, transform",
                  }}
                >
                  <SuggestMode
                    ideas={ideas}
                    isShuffling={isShuffling}
                    isOn={isOn}
                    onIdeaClick={handleIdeaClick}
                    onShuffle={handleShuffle}
                  />
                </div>

                <div
                  className="absolute inset-0 transition-all duration-500 ease-out"
                  style={{
                    opacity: !isFlipped && mode === "ask" ? 1 : 0,
                    transform: !isFlipped && mode === "ask" ? "translateY(0)" : "translateY(8px)",
                    pointerEvents: !isFlipped && mode === "ask" ? "auto" : "none",
                    willChange: "opacity, transform",
                  }}
                >
                  <AskMode
                    customIdea={customIdea}
                    setCustomIdea={setCustomIdea}
                    typedPlaceholder={typedPlaceholder}
                    inputRef={inputRef}
                    isOn={isOn}
                    onSubmit={handleCustomSubmit}
                  />
                </div>

                <div
                  className="absolute inset-0 transition-all duration-500 ease-out"
                  style={{
                    opacity: !isFlipped && mode === "brainstorm" ? 1 : 0,
                    transform: !isFlipped && mode === "brainstorm" ? "translateY(0)" : "translateY(8px)",
                    pointerEvents: !isFlipped && mode === "brainstorm" ? "auto" : "none",
                    willChange: "opacity, transform",
                  }}
                >
                  <BrainstormMode
                    isOn={isOn}
                    onBrainstorm={handleBrainstorm}
                  />
                </div>

                {/* Chat mode overlay */}
                <div
                  className="absolute inset-0 transition-all duration-500 ease-out"
                  style={{
                    opacity: isFlipped ? 1 : 0,
                    transform: isFlipped ? "translateY(0)" : "translateY(8px)",
                    pointerEvents: isFlipped ? "auto" : "none",
                    willChange: "opacity, transform",
                  }}
                >
                  <ChatMode
                    selectedIdea={selectedIdea}
                    messages={messages}
                    input={input}
                    setInput={setInput}
                    isLoading={isLoading}
                    projectSlug={projectSlug}
                    inputRef={inputRef}
                    messagesEndRef={messagesEndRef}
                    onBack={flipBack}
                    onSubmit={handleChatSubmit}
                    onKeyDown={handleKeyDown}
                    onGoToWorkspace={handleGoToWorkspace}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pill Toggle Footer - 3 modes */}
          <div
            className="mt-3 rounded-full"
            style={{
              padding: "2px",
              background: `linear-gradient(180deg,
                rgba(0,0,0,0.4) 0%,
                rgba(0,0,0,0.2) 40%,
                rgba(255,255,255,0.02) 100%
              )`,
            }}
          >
            <div
              className="relative flex items-center h-11 p-1.5 rounded-full"
              style={{
                backgroundColor: "#0f0f11",
                boxShadow: `
                  inset 0 2px 6px rgba(0,0,0,0.6),
                  inset 0 -1px 0 rgba(255,255,255,0.03)
                `,
                border: "1px solid rgba(0,0,0,0.3)",
              }}
            >
              {/* Sliding indicator */}
              <div
                className="absolute"
                style={{
                  width: "calc(33.333% - 6px)",
                  height: "calc(100% - 8px)",
                  borderRadius: "9999px",
                  backgroundColor: "#2a2a2e",
                  left: mode === "suggest"
                    ? "4px"
                    : mode === "ask"
                    ? "calc(33.333% + 0px)"
                    : "calc(66.666% - 4px)",
                  top: "4px",
                  boxShadow: `
                    0 2px 6px rgba(0,0,0,0.4),
                    inset 0 1px 0 rgba(255,255,255,0.08),
                    inset 0 -1px 0 rgba(0,0,0,0.2)
                  `,
                  transition: "left 350ms cubic-bezier(0.25, 1.15, 0.5, 1)",
                }}
              />

              {/* Options */}
              {[
                { value: "suggest" as Mode, label: "SUGGEST" },
                { value: "ask" as Mode, label: "ASK" },
                { value: "brainstorm" as Mode, label: "STORM" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setMode(option.value)
                    if (isFlipped) flipBack()
                  }}
                  disabled={!isOn}
                  className="relative z-10 flex-1 text-center font-semibold text-[11px] tracking-[0.08em] transition-colors duration-200 disabled:opacity-30"
                  style={{
                    color: option.value === mode ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-center text-sm tracking-widest text-white/30 font-mono">
          /build → /ship → /repeat
        </p>
      </div>
    </div>
  )
}

/**
 * Glow Toggle Switch
 */
function GlowSwitch({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  const padding = 3
  const handleSize = 34

  return (
    <button
      onClick={onToggle}
      className="relative h-10 w-20 rounded-full cursor-pointer transition-colors duration-300 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        backgroundColor: "#0a0a0c",
        boxShadow: `
          inset 0 2px 6px rgba(0,0,0,0.8),
          inset 0 1px 2px rgba(0,0,0,0.5),
          0 1px 0 rgba(255,255,255,0.05)
        `,
        border: "1px solid rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="absolute top-1/2 rounded-full"
        style={{
          width: handleSize,
          height: handleSize,
          left: isOn ? `calc(100% - ${handleSize + padding}px)` : `${padding}px`,
          transform: "translateY(-50%)",
          backgroundColor: "#2a2a2e",
          boxShadow: `
            0 2px 6px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.08),
            inset 0 -1px 0 rgba(0,0,0,0.2)
          `,
          transition: "left 300ms cubic-bezier(0.25, 1.15, 0.5, 1)",
        }}
      />
    </button>
  )
}

/**
 * NeonText - NERVE AGENT with neon effect
 */
function NeonText({ isOn }: { isOn: boolean }) {
  const [glowIntensity, setGlowIntensity] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const prevIsOn = useRef(isOn)

  useEffect(() => {
    if (isOn && !prevIsOn.current) {
      setIsAnimating(true)
      const sequence = [
        { intensity: 0.15, delay: 0 },
        { intensity: 0.25, delay: 150 },
        { intensity: 0.4, delay: 300 },
        { intensity: 0.6, delay: 500 },
        { intensity: 0.2, delay: 700 },
        { intensity: 0.85, delay: 780 },
        { intensity: 0.3, delay: 920 },
        { intensity: 1, delay: 1000 },
        { intensity: 0.92, delay: 1100 },
        { intensity: 1, delay: 1150 },
      ]
      sequence.forEach(({ intensity, delay }) => {
        setTimeout(() => setGlowIntensity(intensity), delay)
      })
      setTimeout(() => setIsAnimating(false), 1200)
    } else if (!isOn && prevIsOn.current) {
      setGlowIntensity(0)
    } else if (isOn && !isAnimating) {
      setGlowIntensity(1)
    }
    prevIsOn.current = isOn
  }, [isOn, isAnimating])

  useEffect(() => {
    if (isOn) setGlowIntensity(1)
  }, [])

  const neonGlow = glowIntensity > 0
    ? `
        0 -1px 1px rgba(0,0,0,0.6),
        0 1px 1px rgba(255,255,255,0.06),
        0 2px 3px rgba(0,0,0,0.4),
        0 0 ${1 * glowIntensity}px #C9A84C,
        0 0 ${2 * glowIntensity}px #C9A84C,
        0 0 ${4 * glowIntensity}px rgba(201, 168, 76, ${0.9 * glowIntensity}),
        0 0 ${6 * glowIntensity}px rgba(201, 168, 76, ${0.4 * glowIntensity})
      `
    : `
        0 -1px 1px rgba(0,0,0,0.6),
        0 1px 1px rgba(255,255,255,0.06),
        0 2px 3px rgba(0,0,0,0.4)
      `

  const textColor = glowIntensity > 0
    ? `rgba(212, 184, 120, ${0.3 + glowIntensity * 0.7})`
    : "#151517"

  return (
    <span
      className="text-2xl sm:text-3xl font-bold tracking-[0.35em]"
      style={{
        color: textColor,
        textShadow: neonGlow,
        transition: isAnimating ? "none" : "all 300ms ease-out",
      }}
    >
      NERVE
    </span>
  )
}

/**
 * Suggest Mode - Project idea chips
 */
function SuggestMode({
  ideas,
  isShuffling,
  isOn,
  onIdeaClick,
  onShuffle,
}: {
  ideas: ProjectIdea[]
  isShuffling: boolean
  isOn: boolean
  onIdeaClick: (idea: ProjectIdea) => void
  onShuffle: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-white/40 text-sm">Pick a project to build</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {ideas.map((idea, index) => (
          <button
            key={idea.id}
            onClick={() => onIdeaClick(idea)}
            disabled={isShuffling || !isOn}
            className={cn(
              "group relative w-full px-4 py-3 rounded-xl",
              "bg-white/[0.03] border border-white/[0.08]",
              "flex items-center gap-3",
              "hover:bg-white/[0.06] hover:border-white/[0.15]",
              "hover:shadow-[0_0_20px_rgba(201,168,76,0.1)]",
              "active:scale-[0.99]",
              "disabled:cursor-not-allowed disabled:opacity-40"
            )}
            style={{
              opacity: isShuffling ? 0 : 1,
              transform: isShuffling ? "translateY(-8px)" : "translateY(0)",
              transition: `opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) ${index * 80}ms, transform 400ms cubic-bezier(0.4, 0, 0.2, 1) ${index * 80}ms, background-color 200ms ease, border-color 200ms ease, box-shadow 200ms ease`,
              willChange: "opacity, transform",
            }}
          >
            <span
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] group-hover:bg-[#C9A84C]/20"
              style={{ transition: "background-color 200ms ease" }}
            >
              {categoryIcons[idea.category]}
            </span>
            <div className="flex flex-col items-start text-left">
              <span className="font-medium text-sm text-white/90">{idea.name}</span>
              <span className="text-xs text-white/40">{idea.tagline}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={onShuffle}
          disabled={isShuffling || !isOn}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "text-xs text-white/40",
            "bg-white/[0.02] border border-white/[0.06]",
            "hover:text-white/60 hover:bg-white/[0.04]",
            "disabled:opacity-30"
          )}
          style={{ transition: "all 200ms ease" }}
        >
          {isShuffling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Shuffle className="h-3.5 w-3.5" />
          )}
          Shuffle
        </button>
      </div>
    </div>
  )
}

/**
 * Ask Mode - Custom idea input
 */
function AskMode({
  customIdea,
  setCustomIdea,
  typedPlaceholder,
  inputRef,
  isOn,
  onSubmit,
}: {
  customIdea: string
  setCustomIdea: (v: string) => void
  typedPlaceholder: string
  inputRef: React.RefObject<HTMLInputElement | null>
  isOn: boolean
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[340px]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="text-white/40 text-sm mb-2">Describe your project idea</p>
          <p className="text-white/25 text-xs">Be specific about what you want to build</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={customIdea}
              onChange={(e) => setCustomIdea(e.target.value)}
              placeholder={typedPlaceholder || "Describe your project idea..."}
              disabled={!isOn}
              className={cn(
                "w-full px-5 py-4 rounded-xl",
                "bg-white/[0.03]",
                "border border-[#C9A84C]/20",
                "text-sm text-white placeholder:text-white/30",
                "focus:outline-none focus:border-[#C9A84C]/40",
                "focus:shadow-[0_0_20px_rgba(201,168,76,0.15)]",
                "disabled:opacity-40"
              )}
              style={{ transition: "border-color 300ms ease, box-shadow 300ms ease" }}
            />
          </div>
          <button
            type="submit"
            disabled={!customIdea.trim() || !isOn}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
              "bg-[#C9A84C]/10 border border-[#C9A84C]/30",
              "text-[#C9A84C] text-sm font-medium",
              "hover:bg-[#C9A84C]/20 hover:border-[#C9A84C]/50",
              "active:scale-[0.99]",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            style={{ transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            <Send className="h-4 w-4" />
            Start Building
          </button>
        </form>
      </div>
    </div>
  )
}

/**
 * Brainstorm Mode
 */
function BrainstormMode({
  isOn,
  onBrainstorm,
}: {
  isOn: boolean
  onBrainstorm: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[340px]">
      <div className="text-center space-y-8">
        <div>
          <Zap className="h-14 w-14 text-[#C9A84C]/60 mx-auto mb-4" />
          <p className="text-white/50 text-base mb-2">No idea yet?</p>
          <p className="text-white/30 text-sm max-w-sm mx-auto leading-relaxed">
            Let's brainstorm together. We'll explore a sample project to show you how NERVE works.
          </p>
        </div>

        <button
          onClick={onBrainstorm}
          disabled={!isOn}
          className={cn(
            "inline-flex items-center gap-2 px-8 py-4 rounded-xl",
            "bg-[#C9A84C]/10 border border-[#C9A84C]/30",
            "text-[#C9A84C] text-sm font-medium",
            "hover:bg-[#C9A84C]/20 hover:border-[#C9A84C]/50",
            "hover:shadow-[0_0_30px_rgba(201,168,76,0.2)]",
            "active:scale-[0.98]",
            "disabled:opacity-30"
          )}
          style={{ transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)" }}
        >
          <Sparkles className="h-4 w-4" />
          Start Brainstorming
        </button>
      </div>
    </div>
  )
}

/**
 * Chat Mode - Conversation after selecting an idea
 */
function ChatMode({
  selectedIdea,
  messages,
  input,
  setInput,
  isLoading,
  projectSlug,
  inputRef,
  messagesEndRef,
  onBack,
  onSubmit,
  onKeyDown,
  onGoToWorkspace,
}: {
  selectedIdea: string | null
  messages: Message[]
  input: string
  setInput: (v: string) => void
  isLoading: boolean
  projectSlug: string | null
  inputRef: React.RefObject<HTMLInputElement | null>
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  onBack: () => void
  onSubmit: (e?: React.FormEvent) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onGoToWorkspace: () => void
}) {
  return (
    <div className="flex flex-col h-full min-h-[340px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          disabled={isLoading}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
            "text-xs text-white/40",
            "hover:text-white/60 hover:bg-white/[0.03]"
          )}
          style={{ transition: "all 200ms ease" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <Sparkles className="h-3.5 w-3.5 text-[#C9A84C]" />
          <span className="truncate max-w-[180px]">{selectedIdea}</span>
        </div>
      </div>

      {/* Messages - with smooth scroll */}
      <div
        className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0 pr-1"
        style={{ scrollBehavior: "smooth" }}
      >
        {messages.map((message, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
            style={{
              opacity: 1,
              transform: "translateY(0)",
              animation: "messageSlideIn 400ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-xl px-4 py-3",
                message.role === "user"
                  ? "bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-white"
                  : "bg-white/[0.03] border border-white/[0.06] text-white/80"
              )}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div
            className="flex justify-start"
            style={{ animation: "messageSlideIn 300ms cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#C9A84C] animate-[pulse_1.5s_ease-in-out_infinite]" />
                <div className="h-2 w-2 rounded-full bg-[#C9A84C] animate-[pulse_1.5s_ease-in-out_infinite_200ms]" />
                <div className="h-2 w-2 rounded-full bg-[#C9A84C] animate-[pulse_1.5s_ease-in-out_infinite_400ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {projectSlug ? (
        <button
          onClick={onGoToWorkspace}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl",
            "bg-[#C9A84C]/20 border border-[#C9A84C]/40",
            "text-[#C9A84C] text-sm font-medium",
            "hover:bg-[#C9A84C]/30",
            "active:scale-[0.99]"
          )}
          style={{ transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)" }}
        >
          Open Workspace
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <form onSubmit={onSubmit} className="flex gap-3">
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your response..."
            disabled={isLoading}
            className={cn(
              "flex-1 px-4 py-3 rounded-xl",
              "bg-white/[0.03] border border-white/[0.06]",
              "text-sm text-white placeholder:text-white/30",
              "focus:outline-none focus:border-[#C9A84C]/30",
              "disabled:opacity-50"
            )}
            style={{ transition: "border-color 300ms ease, box-shadow 300ms ease" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "px-4 py-3 rounded-xl",
              "bg-[#C9A84C]/20 border border-[#C9A84C]/30",
              "text-[#C9A84C]",
              "hover:bg-[#C9A84C]/30",
              "active:scale-[0.98]",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            style={{ transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  )
}
