"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  X,
  Inbox,
  MessageSquare,
  Zap,
  Brain,
  Send,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Calendar,
  Edit3,
  AlertTriangle,
  FileText,
  Mail,
  TrendingUp,
  Coffee,
  Moon,
  Eye,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { H4, Muted } from "@/components/ui/typography"
import { Badge } from "@/components/ui/badge"

// =============================================================================
// DESIGN TOKENS - Nerve Agent Premium Dark Metal Aesthetic
// =============================================================================

const AGENT_COLORS = {
  // Housing - Dark gunmetal base
  housing: "#1c1c1f",
  surface: "#141416",
  recessed: "#08080a",
  elevated: "#242428",

  // Edge lighting
  edgeLight: "rgba(255,255,255,0.08)",
  edgeDark: "rgba(0,0,0,0.4)",

  // Gold accent
  gold: "#C9A84C",
  goldMuted: "rgba(201,168,76,0.6)",
  goldSubtle: "rgba(201,168,76,0.2)",
  goldGlow: "rgba(201,168,76,0.25)",
  goldGlowStrong: "rgba(201,168,76,0.4)",

  // Text
  textPrimary: "#F0F0F2",
  textSecondary: "#A0A0A8",
  textMuted: "#68687A",
}

// Animation config for premium feel
const SPRING_CONFIG = { damping: 28, stiffness: 280 }
const OVERSHOOT_EASE = [0.25, 1.15, 0.5, 1] as const

type AgentTab = "inbox" | "chat" | "actions" | "memory"

interface TabConfig {
  id: AgentTab
  label: string
  icon: React.ReactNode
  badge?: number
}

interface Suggestion {
  id: string
  triggerType: string
  title: string
  description: string
  proposedAction: string
  projectName?: string
  urgency: string
  createdAt: string
}

interface ChatMessage {
  id: string
  role: "user" | "agent"
  content: string
  timestamp: string
}

interface AgentPreferences {
  proactiveEnabled: boolean
  autoDraftFollowups: boolean
  morningBriefEnabled: boolean
  morningBriefTime: string
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
  preferredStyle: string
  timezone: string
  learnedPatterns: string[]
}

export function AgentDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<AgentTab>("inbox")
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Data state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [preferences, setPreferences] = useState<AgentPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [, setActionResult] = useState<{ type: string; content: unknown } | null>(null)

  // Fetch suggestions when drawer opens
  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch("/api/agent/suggestions")
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data)
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error)
    }
  }, [])

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    try {
      const res = await fetch("/api/agent/preferences")
      if (res.ok) {
        const data = await res.json()
        setPreferences(data)
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error)
    }
  }, [])

  // Load data when drawer opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      Promise.all([fetchSuggestions(), fetchPreferences()]).finally(() => {
        setIsLoading(false)
      })
    }
  }, [isOpen, fetchSuggestions, fetchPreferences])

  const inboxCount = suggestions.length

  const TABS: TabConfig[] = [
    { id: "inbox", label: "INBOX", icon: <Inbox className="h-3.5 w-3.5" />, badge: inboxCount },
    { id: "chat", label: "CHAT", icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { id: "actions", label: "ACTIONS", icon: <Zap className="h-3.5 w-3.5" /> },
    { id: "memory", label: "MEMORY", icon: <Brain className="h-3.5 w-3.5" /> },
  ]

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Handle chat submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isSending) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setActiveTab("chat")
    setIsSending(true)

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      })

      if (res.ok) {
        const data = await res.json()
        const agentMessage: ChatMessage = {
          id: `agent-${Date.now()}`,
          role: "agent",
          content: data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages((prev) => [...prev, agentMessage])
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  // Handle suggestion actions
  const handleSuggestionAction = async (suggestionId: string, action: "approve" | "dismiss") => {
    try {
      const res = await fetch("/api/agent/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionId, action }),
      })

      if (res.ok) {
        setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
      }
    } catch (error) {
      console.error("Failed to handle suggestion:", error)
    }
  }

  // Handle suggestion edit - opens in chat for modification
  const handleSuggestionEdit = (suggestion: Suggestion) => {
    const agentMessage: ChatMessage = {
      id: `edit-${Date.now()}`,
      role: "agent",
      content: `Here's the suggestion for "${suggestion.title}":\n\n**Proposed Action:** ${suggestion.proposedAction}\n\nYou can tell me how you'd like to modify this, or type a new version.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, agentMessage])
    setInputValue(`Edit suggestion: `)
    setActiveTab("chat")
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // Handle preference toggle
  const handlePreferenceToggle = async (key: keyof AgentPreferences, value: boolean) => {
    if (!preferences) return

    const updated = { ...preferences, [key]: value }
    setPreferences(updated)

    try {
      await fetch("/api/agent/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      })
    } catch (error) {
      console.error("Failed to update preference:", error)
      setPreferences(preferences)
    }
  }

  // Handle action results - convert to chat message
  const handleActionResult = (result: { type: string; content: unknown }) => {
    setActionResult(result)

    let content: string
    if (typeof result.content === "string") {
      content = result.content
    } else {
      content = JSON.stringify(result.content, null, 2)
    }

    const agentMessage: ChatMessage = {
      id: `action-${Date.now()}`,
      role: "agent",
      content: `**${result.type.replace(/-/g, " ").toUpperCase()}**\n\n${content}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, agentMessage])
    setActiveTab("chat")
  }

  return (
    <>
      {/* =====================================================================
          TRIGGER BUTTON - Hardware power button style
          ===================================================================== */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed right-4 bottom-6 z-40",
          "flex items-center justify-center",
          "w-14 h-14 rounded-full",
          "transition-all duration-300",
          "group",
          isOpen && "opacity-0 pointer-events-none"
        )}
        style={{
          background: `linear-gradient(145deg, ${AGENT_COLORS.elevated} 0%, ${AGENT_COLORS.recessed} 100%)`,
          border: `2px solid ${AGENT_COLORS.goldMuted}`,
          boxShadow: `
            0 4px 20px rgba(0,0,0,0.5),
            inset 0 1px 0 ${AGENT_COLORS.edgeLight},
            inset 0 -1px 0 ${AGENT_COLORS.edgeDark}
          `,
        }}
        whileHover={{
          scale: 1.05,
          boxShadow: `
            0 4px 20px rgba(0,0,0,0.5),
            0 0 24px ${AGENT_COLORS.goldGlow},
            inset 0 1px 0 ${AGENT_COLORS.edgeLight},
            inset 0 -1px 0 ${AGENT_COLORS.edgeDark}
          `,
        }}
        whileTap={{ scale: 0.95 }}
      >
        <Bot className="h-6 w-6" style={{ color: AGENT_COLORS.gold }} />

        {/* Inbox count badge */}
        {inboxCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-lg"
            style={{
              background: AGENT_COLORS.gold,
              color: AGENT_COLORS.recessed,
            }}
          >
            {inboxCount}
          </span>
        )}
      </motion.button>

      {/* =====================================================================
          BACKDROP
          ===================================================================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* =====================================================================
          DRAWER - Premium dark metal housing
          ===================================================================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", ...SPRING_CONFIG }}
            className="fixed right-0 top-2 bottom-2 z-50 w-full max-w-md flex flex-col overflow-hidden"
            style={{
              background: AGENT_COLORS.housing,
              borderRadius: "12px 0 0 12px",
              border: `1px solid ${AGENT_COLORS.edgeLight}`,
              borderRight: "none",
              boxShadow: `
                -4px 0 24px rgba(0,0,0,0.4),
                -8px 4px 32px rgba(0,0,0,0.3),
                inset 1px 0 0 ${AGENT_COLORS.edgeLight},
                inset 0 1px 0 ${AGENT_COLORS.edgeLight},
                inset 0 -1px 0 ${AGENT_COLORS.edgeDark}
              `,
            }}
          >
            {/* ===============================================================
                HEADER - Hardware unit aesthetic
                =============================================================== */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{
                borderBottom: `1px solid ${AGENT_COLORS.edgeLight}`,
                background: `linear-gradient(180deg, ${AGENT_COLORS.elevated} 0%, ${AGENT_COLORS.housing} 100%)`,
                borderTopLeftRadius: "12px",
              }}
            >
              <div className="flex items-center gap-3">
                {/* Agent icon with gold gradient */}
                <div
                  className="relative p-2.5 rounded-xl"
                  style={{
                    background: `linear-gradient(145deg, ${AGENT_COLORS.surface} 0%, ${AGENT_COLORS.recessed} 100%)`,
                    border: `1px solid ${AGENT_COLORS.goldSubtle}`,
                    boxShadow: `
                      inset 0 1px 0 ${AGENT_COLORS.edgeLight},
                      0 2px 8px rgba(0,0,0,0.3)
                    `,
                  }}
                >
                  <Bot className="h-5 w-5" style={{ color: AGENT_COLORS.gold }} />

                  {/* Status indicator - gold glow */}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full"
                    style={{
                      background: AGENT_COLORS.gold,
                      boxShadow: `0 0 8px ${AGENT_COLORS.goldGlowStrong}`,
                      border: `2px solid ${AGENT_COLORS.housing}`,
                    }}
                  />
                </div>

                <div>
                  <H4
                    className="text-base leading-none mb-0.5 font-semibold"
                    style={{ color: AGENT_COLORS.textPrimary }}
                  >
                    Nerve <span style={{ color: AGENT_COLORS.gold }}>Agent</span>
                  </H4>
                  <Muted className="text-xs" style={{ color: AGENT_COLORS.textMuted }}>
                    Watching 3 projects
                  </Muted>
                </div>
              </div>

              {/* Close button - dark metal style */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-9 w-9 rounded-lg transition-colors"
                style={{
                  background: AGENT_COLORS.surface,
                  border: `1px solid ${AGENT_COLORS.edgeLight}`,
                  color: AGENT_COLORS.textMuted,
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* ===============================================================
                PILL TOGGLE TABS - Recessed track with sliding indicator
                =============================================================== */}
            <div className="px-4 py-3">
              <div
                className="relative flex rounded-xl p-1 gap-0.5"
                style={{
                  background: AGENT_COLORS.recessed,
                  boxShadow: `
                    inset 0 2px 6px rgba(0,0,0,0.8),
                    inset 0 0 0 1px rgba(0,0,0,0.3)
                  `,
                }}
              >
                {/* Sliding indicator */}
                <motion.div
                  className="absolute rounded-lg pointer-events-none"
                  style={{
                    background: `linear-gradient(145deg, ${AGENT_COLORS.elevated} 0%, ${AGENT_COLORS.surface} 100%)`,
                    border: `1px solid ${AGENT_COLORS.edgeLight}`,
                    boxShadow: `0 2px 8px rgba(0,0,0,0.4)`,
                    top: "4px",
                    bottom: "4px",
                    width: "calc(25% - 5px)",
                  }}
                  animate={{
                    left: `calc(${TABS.findIndex(t => t.id === activeTab) * 25}% + 4px)`,
                  }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                />

                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg",
                      "text-[11px] font-semibold tracking-wider uppercase",
                      "transition-colors duration-200 z-10",
                      "min-h-[36px]" // Ensure adequate tap target
                    )}
                    style={{
                      color: activeTab === tab.id ? AGENT_COLORS.gold : AGENT_COLORS.textMuted,
                    }}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>

                    {/* Badge */}
                    {tab.badge && tab.badge > 0 && (
                      <span
                        className="absolute -top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold"
                        style={{
                          background: AGENT_COLORS.gold,
                          color: AGENT_COLORS.recessed,
                        }}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ===============================================================
                CONTENT AREA
                =============================================================== */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin" style={{ color: AGENT_COLORS.gold }} />
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: OVERSHOOT_EASE }}
                    >
                      {activeTab === "inbox" && (
                        <InboxTab
                          suggestions={suggestions}
                          onAction={handleSuggestionAction}
                          onEdit={handleSuggestionEdit}
                          quietHours={preferences?.quietHoursEnabled ? {
                            start: preferences.quietHoursStart,
                            end: preferences.quietHoursEnd,
                          } : null}
                        />
                      )}
                      {activeTab === "chat" && (
                        <ChatTab messages={messages} isSending={isSending} />
                      )}
                      {activeTab === "actions" && (
                        <ActionsTab onActionResult={handleActionResult} />
                      )}
                      {activeTab === "memory" && (
                        <MemoryTab
                          preferences={preferences}
                          onToggle={handlePreferenceToggle}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>

            {/* ===============================================================
                INPUT FIELD - Gold accented
                =============================================================== */}
            <div
              className="p-4"
              style={{
                borderTop: `1px solid ${AGENT_COLORS.edgeLight}`,
                background: AGENT_COLORS.housing,
                borderBottomLeftRadius: "12px",
              }}
            >
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask anything..."
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all outline-none"
                    style={{
                      background: AGENT_COLORS.recessed,
                      border: `1px solid ${AGENT_COLORS.goldSubtle}`,
                      color: AGENT_COLORS.textPrimary,
                      boxShadow: `inset 0 2px 4px rgba(0,0,0,0.4)`,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = AGENT_COLORS.goldMuted
                      e.target.style.boxShadow = `inset 0 2px 4px rgba(0,0,0,0.4), 0 0 20px ${AGENT_COLORS.goldGlow}`
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = AGENT_COLORS.goldSubtle
                      e.target.style.boxShadow = `inset 0 2px 4px rgba(0,0,0,0.4)`
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputValue.trim()}
                    className="absolute right-1.5 top-1.5 h-8 w-8 rounded-lg transition-all disabled:opacity-40"
                    style={{
                      background: inputValue.trim() ? AGENT_COLORS.gold : AGENT_COLORS.surface,
                      color: inputValue.trim() ? AGENT_COLORS.recessed : AGENT_COLORS.textMuted,
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// =============================================================================
// INBOX TAB - Proactive suggestions awaiting response
// =============================================================================

function InboxTab({
  suggestions,
  onAction,
  onEdit,
  quietHours,
}: {
  suggestions: Suggestion[]
  onAction: (id: string, action: "approve" | "dismiss") => void
  onEdit: (suggestion: Suggestion) => void
  quietHours: { start: string; end: string } | null
}) {
  const getIconForTrigger = (triggerType: string) => {
    switch (triggerType) {
      case "blocker_stale":
        return { icon: <AlertTriangle className="h-4 w-4" />, color: "#f59e0b" }
      case "sprint_complete":
        return { icon: <FileText className="h-4 w-4" />, color: "#3b82f6" }
      case "task_stuck":
        return { icon: <Clock className="h-4 w-4" />, color: "#ef4444" }
      default:
        return { icon: <Sparkles className="h-4 w-4" />, color: AGENT_COLORS.gold }
    }
  }

  const formatTimestamp = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="p-4 rounded-2xl mb-4"
          style={{
            background: AGENT_COLORS.surface,
            border: `1px solid ${AGENT_COLORS.edgeLight}`,
          }}
        >
          <Inbox className="h-8 w-8" style={{ color: AGENT_COLORS.textMuted }} />
        </div>
        <p className="font-medium mb-1" style={{ color: AGENT_COLORS.textPrimary }}>
          All clear
        </p>
        <Muted className="text-sm" style={{ color: AGENT_COLORS.textMuted }}>
          Nothing needs your attention right now.
        </Muted>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: AGENT_COLORS.textMuted }}
        >
          Needs your input
        </span>
        <Badge
          variant="outline"
          className="text-[10px] px-2"
          style={{
            borderColor: AGENT_COLORS.goldSubtle,
            color: AGENT_COLORS.gold,
            background: "transparent",
          }}
        >
          {suggestions.length} items
        </Badge>
      </div>

      {/* Suggestion cards */}
      {suggestions.map((suggestion, index) => {
        const { icon, color } = getIconForTrigger(suggestion.triggerType)
        const isUrgent = suggestion.urgency === "urgent"

        return (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, ease: OVERSHOOT_EASE }}
            className="p-4 rounded-xl space-y-3"
            style={{
              background: AGENT_COLORS.surface,
              border: `1px solid ${AGENT_COLORS.edgeLight}`,
              borderTop: `1px solid rgba(255,255,255,0.1)`,
              borderBottom: `1px solid rgba(0,0,0,0.3)`,
              boxShadow: isUrgent
                ? `0 0 16px ${AGENT_COLORS.goldGlow}, inset 0 1px 0 ${AGENT_COLORS.edgeLight}`
                : `0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 ${AGENT_COLORS.edgeLight}`,
            }}
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: `${color}15`,
                  color: color,
                }}
              >
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="font-medium text-sm"
                    style={{ color: AGENT_COLORS.textPrimary }}
                  >
                    {suggestion.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {suggestion.projectName && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                      style={{
                        borderColor: AGENT_COLORS.edgeLight,
                        color: AGENT_COLORS.textSecondary,
                        background: "transparent",
                      }}
                    >
                      {suggestion.projectName}
                    </Badge>
                  )}
                  <span
                    className="text-[10px]"
                    style={{ color: AGENT_COLORS.textMuted }}
                  >
                    {formatTimestamp(suggestion.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p
              className="text-sm"
              style={{ color: AGENT_COLORS.textSecondary }}
            >
              {suggestion.description}
            </p>

            {/* Agent suggestion */}
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-3.5 w-3.5" style={{ color: AGENT_COLORS.gold }} />
              <span style={{ color: AGENT_COLORS.textPrimary }}>{suggestion.proposedAction}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className="flex-1 h-8 text-xs font-semibold transition-all"
                style={{
                  background: AGENT_COLORS.gold,
                  color: AGENT_COLORS.recessed,
                }}
                onClick={() => onAction(suggestion.id, "approve")}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                style={{
                  background: "transparent",
                  border: `1px solid ${AGENT_COLORS.edgeLight}`,
                  color: AGENT_COLORS.textSecondary,
                }}
                onClick={() => onEdit(suggestion)}
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                style={{ color: AGENT_COLORS.textMuted }}
                onClick={() => onAction(suggestion.id, "dismiss")}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )
      })}

      {/* Quiet time notice */}
      {quietHours && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
          style={{
            background: AGENT_COLORS.recessed,
            color: AGENT_COLORS.textMuted,
          }}
        >
          <Moon className="h-3.5 w-3.5" style={{ color: AGENT_COLORS.gold }} />
          <span>Quiet hours: {quietHours.start} - {quietHours.end}. Only urgent items will notify.</span>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// CHAT TAB - Conversational interface
// =============================================================================

function ChatTab({
  messages,
  isSending,
}: {
  messages: ChatMessage[]
  isSending: boolean
}) {
  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="p-4 rounded-2xl mb-4"
            style={{
              background: `linear-gradient(145deg, ${AGENT_COLORS.surface} 0%, ${AGENT_COLORS.recessed} 100%)`,
              border: `1px solid ${AGENT_COLORS.goldSubtle}`,
              boxShadow: `0 0 20px ${AGENT_COLORS.goldGlow}`,
            }}
          >
            <MessageSquare className="h-8 w-8" style={{ color: AGENT_COLORS.gold }} />
          </div>
          <p className="font-medium mb-1" style={{ color: AGENT_COLORS.textPrimary }}>
            Start a conversation
          </p>
          <Muted
            className="text-sm max-w-[240px]"
            style={{ color: AGENT_COLORS.textMuted }}
          >
            Ask about your projects, blockers, or anything else.
          </Muted>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              {message.role === "agent" && (
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(145deg, ${AGENT_COLORS.surface} 0%, ${AGENT_COLORS.recessed} 100%)`,
                    border: `1px solid ${AGENT_COLORS.goldSubtle}`,
                  }}
                >
                  <Bot className="h-4 w-4" style={{ color: AGENT_COLORS.gold }} />
                </div>
              )}
              <div
                className={cn(
                  "flex-1 max-w-[85%] p-3 rounded-xl text-sm",
                  message.role === "agent" ? "" : "ml-auto"
                )}
                style={
                  message.role === "agent"
                    ? {
                        background: `rgba(255,255,255,0.03)`,
                        border: `1px solid ${AGENT_COLORS.edgeLight}`,
                        color: AGENT_COLORS.textPrimary,
                      }
                    : {
                        background: `${AGENT_COLORS.gold}20`,
                        border: `1px solid ${AGENT_COLORS.goldSubtle}`,
                        color: AGENT_COLORS.textPrimary,
                      }
                }
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span
                  className="text-[10px] mt-1 block"
                  style={{
                    color: message.role === "agent" ? AGENT_COLORS.textMuted : AGENT_COLORS.goldMuted,
                  }}
                >
                  {message.timestamp}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Thinking indicator */}
          {isSending && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(145deg, ${AGENT_COLORS.surface} 0%, ${AGENT_COLORS.recessed} 100%)`,
                  border: `1px solid ${AGENT_COLORS.goldSubtle}`,
                }}
              >
                <Bot className="h-4 w-4" style={{ color: AGENT_COLORS.gold }} />
              </div>
              <div
                className="flex-1 max-w-[85%] p-3 rounded-xl text-sm"
                style={{
                  background: `rgba(255,255,255,0.03)`,
                  border: `1px solid ${AGENT_COLORS.edgeLight}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ background: AGENT_COLORS.gold }}
                        animate={{
                          opacity: [0.3, 1, 0.3],
                          scale: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ color: AGENT_COLORS.textMuted }}>Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// ACTIONS TAB - Manual triggers for agent behaviors
// =============================================================================

function ActionsTab({
  onActionResult,
}: {
  onActionResult: (result: { type: string; content: unknown }) => void
}) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const executeAction = async (actionId: string) => {
    setLoadingAction(actionId)
    try {
      const res = await fetch("/api/agent/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId }),
      })

      if (res.ok) {
        const result = await res.json()
        onActionResult(result)
      }
    } catch (error) {
      console.error("Action failed:", error)
    } finally {
      setLoadingAction(null)
    }
  }

  const actionGroups = [
    {
      label: "GENERATE",
      actions: [
        {
          id: "client-update",
          label: "Client Update",
          description: "Summary of recent progress for stakeholders",
          icon: <Mail className="h-4 w-4" />,
        },
        {
          id: "weekly-summary",
          label: "Weekly Summary",
          description: "What got done this week across all projects",
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          id: "standup-notes",
          label: "Standup Notes",
          description: "Yesterday, today, blockers - ready to paste",
          icon: <Coffee className="h-4 w-4" />,
        },
      ],
    },
    {
      label: "ANALYZE",
      actions: [
        {
          id: "blocker-analysis",
          label: "Blocker Analysis",
          description: "Why is this taking so long? Root cause breakdown",
          icon: <AlertTriangle className="h-4 w-4" />,
        },
        {
          id: "scope-check",
          label: "Scope Check",
          description: "Are we building what we planned? Drift detection",
          icon: <Eye className="h-4 w-4" />,
        },
      ],
    },
    {
      label: "AUTOMATE",
      actions: [
        {
          id: "followup-drafts",
          label: "Draft Follow-ups",
          description: "Emails for all stale blockers and waiting items",
          icon: <Mail className="h-4 w-4" />,
        },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {actionGroups.map((group) => (
        <div key={group.label} className="space-y-2">
          <span
            className="text-[10px] uppercase tracking-widest font-semibold"
            style={{ color: AGENT_COLORS.goldMuted }}
          >
            {group.label}
          </span>
          <div className="space-y-2">
            {group.actions.map((action) => {
              const isLoading = loadingAction === action.id
              const isDisabled = isLoading || loadingAction !== null

              return (
                <button
                  key={action.id}
                  onClick={() => executeAction(action.id)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full p-3 rounded-xl text-left group transition-all",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  style={{
                    background: AGENT_COLORS.surface,
                    border: `1px solid ${AGENT_COLORS.edgeLight}`,
                    boxShadow: `inset 0 1px 0 ${AGENT_COLORS.edgeLight}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isDisabled) {
                      e.currentTarget.style.borderColor = AGENT_COLORS.goldSubtle
                      e.currentTarget.style.boxShadow = `inset 0 1px 0 ${AGENT_COLORS.edgeLight}, 0 0 12px ${AGENT_COLORS.goldGlow}`
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = AGENT_COLORS.edgeLight
                    e.currentTarget.style.boxShadow = `inset 0 1px 0 ${AGENT_COLORS.edgeLight}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        background: `${AGENT_COLORS.gold}15`,
                        color: AGENT_COLORS.gold,
                      }}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        action.icon
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium text-sm"
                        style={{ color: AGENT_COLORS.textPrimary }}
                      >
                        {action.label}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: AGENT_COLORS.textMuted }}
                      >
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 transition-colors"
                      style={{ color: AGENT_COLORS.textMuted }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// MEMORY TAB - What the agent knows about you
// =============================================================================

function MemoryTab({
  preferences,
  onToggle,
}: {
  preferences: AgentPreferences | null
  onToggle: (key: keyof AgentPreferences, value: boolean) => void
}) {
  const learnedPatterns = (preferences?.learnedPatterns || []) as string[]

  const agentSettings: {
    id: keyof AgentPreferences
    label: string
    description: string
  }[] = [
    { id: "proactiveEnabled", label: "Proactive suggestions", description: "Surface issues without being asked" },
    { id: "autoDraftFollowups", label: "Auto-draft follow-ups", description: "Prepare emails for stale blockers" },
    { id: "morningBriefEnabled", label: "Morning brief", description: "Daily summary at start of work" },
    { id: "quietHoursEnabled", label: "Respect quiet hours", description: `No notifications ${preferences?.quietHoursStart || "10pm"} - ${preferences?.quietHoursEnd || "8am"}` },
  ]

  if (!preferences) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: AGENT_COLORS.gold }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Profile */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] uppercase tracking-widest font-semibold"
            style={{ color: AGENT_COLORS.textMuted }}
          >
            About You
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            style={{ color: AGENT_COLORS.textMuted }}
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
        <div
          className="p-4 rounded-xl space-y-3"
          style={{
            background: AGENT_COLORS.surface,
            border: `1px solid ${AGENT_COLORS.edgeLight}`,
          }}
        >
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" style={{ color: AGENT_COLORS.textMuted }} />
              <span style={{ color: AGENT_COLORS.textSecondary }}>{preferences.timezone}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <MessageSquare className="h-3.5 w-3.5" style={{ color: AGENT_COLORS.textMuted }} />
              <span style={{ color: AGENT_COLORS.textSecondary }}>
                Prefers {preferences.preferredStyle} responses
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Learned Patterns */}
      <div className="space-y-3">
        <span
          className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: AGENT_COLORS.textMuted }}
        >
          What I&apos;ve Learned
        </span>
        {learnedPatterns.length > 0 ? (
          <div className="space-y-2">
            {learnedPatterns.map((pattern, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2.5 rounded-lg text-sm"
                style={{
                  background: AGENT_COLORS.recessed,
                  border: `1px solid ${AGENT_COLORS.edgeLight}`,
                }}
              >
                <Brain className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: AGENT_COLORS.gold }} />
                <span style={{ color: AGENT_COLORS.textSecondary }}>{pattern}</span>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="p-4 rounded-lg text-sm text-center"
            style={{
              background: AGENT_COLORS.recessed,
              color: AGENT_COLORS.textMuted,
              border: `1px solid ${AGENT_COLORS.edgeLight}`,
            }}
          >
            <Sparkles className="h-5 w-5 mx-auto mb-2" style={{ color: AGENT_COLORS.goldMuted }} />
            No patterns learned yet. Keep using the agent!
          </div>
        )}
        <p className="text-[11px] px-1" style={{ color: AGENT_COLORS.textMuted }}>
          Patterns are learned from your activity. Nothing is shared externally.
        </p>
      </div>

      {/* Agent Behavior Settings with custom toggle */}
      <div className="space-y-3">
        <span
          className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: AGENT_COLORS.textMuted }}
        >
          Agent Behavior
        </span>
        <div className="space-y-2">
          {agentSettings.map((setting) => {
            const isEnabled = preferences[setting.id] as boolean
            return (
              <button
                key={setting.id}
                onClick={() => onToggle(setting.id, !isEnabled)}
                className="w-full flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
                style={{
                  background: AGENT_COLORS.surface,
                  border: `1px solid ${AGENT_COLORS.edgeLight}`,
                }}
              >
                <div className="flex-1 min-w-0 pr-3 text-left">
                  <p className="text-sm font-medium" style={{ color: AGENT_COLORS.textPrimary }}>
                    {setting.label}
                  </p>
                  <p className="text-xs" style={{ color: AGENT_COLORS.textMuted }}>
                    {setting.description}
                  </p>
                </div>

                {/* Custom NerveSwitch - dark metal knob */}
                <div
                  className="relative w-11 h-6 rounded-full flex-shrink-0 transition-all"
                  style={{
                    background: isEnabled
                      ? `linear-gradient(145deg, ${AGENT_COLORS.gold}40 0%, ${AGENT_COLORS.gold}20 100%)`
                      : AGENT_COLORS.recessed,
                    boxShadow: isEnabled
                      ? `inset 0 1px 2px rgba(0,0,0,0.3), 0 0 8px ${AGENT_COLORS.goldGlow}`
                      : `inset 0 2px 4px rgba(0,0,0,0.5)`,
                    border: `1px solid ${isEnabled ? AGENT_COLORS.goldMuted : AGENT_COLORS.edgeLight}`,
                  }}
                >
                  <motion.div
                    className="absolute w-5 h-5 rounded-full"
                    style={{
                      top: "1px",
                      background: isEnabled
                        ? `linear-gradient(145deg, ${AGENT_COLORS.gold} 0%, #B8943C 100%)`
                        : `linear-gradient(145deg, ${AGENT_COLORS.elevated} 0%, ${AGENT_COLORS.surface} 100%)`,
                      boxShadow: isEnabled
                        ? `0 2px 4px rgba(0,0,0,0.3), 0 0 6px ${AGENT_COLORS.goldGlow}`
                        : `0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 ${AGENT_COLORS.edgeLight}`,
                    }}
                    animate={{
                      x: isEnabled ? 21 : 1,
                    }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Soul signature */}
      <div
        className="pt-4"
        style={{ borderTop: `1px solid ${AGENT_COLORS.edgeLight}` }}
      >
        <div className="flex items-center gap-2 text-xs" style={{ color: AGENT_COLORS.textMuted }}>
          <Sparkles className="h-3.5 w-3.5" style={{ color: AGENT_COLORS.gold }} />
          <span>Nerve Agent v0.2 · Direct. Opinionated. Useful.</span>
        </div>
      </div>
    </div>
  )
}
