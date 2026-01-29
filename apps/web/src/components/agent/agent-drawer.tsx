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
import { Separator } from "@/components/ui/separator"

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
    { id: "inbox", label: "Inbox", icon: <Inbox className="h-4 w-4" />, badge: inboxCount },
    { id: "chat", label: "Chat", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "actions", label: "Actions", icon: <Zap className="h-4 w-4" /> },
    { id: "memory", label: "Memory", icon: <Brain className="h-4 w-4" /> },
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
      // Revert on error
      setPreferences(preferences)
    }
  }

  return (
    <>
      {/* Agent Tab - sticks out from right side */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed right-0 bottom-32 z-40",
          "flex items-center gap-2 px-3 py-3",
          "bg-gradient-to-r from-orange-600 to-orange-500",
          "rounded-l-xl border border-r-0 border-orange-400/30",
          "shadow-lg shadow-orange-500/20",
          "hover:shadow-orange-500/30 hover:from-orange-500 hover:to-orange-400",
          "transition-all duration-200",
          "group",
          isOpen && "opacity-0 pointer-events-none"
        )}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.98 }}
      >
        <Bot className="h-5 w-5 text-white" />
        <span className="text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
          Agent
        </span>
        {inboxCount > 0 && (
          <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-orange-600 shadow-sm">
            {inboxCount}
          </span>
        )}
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-0 bottom-0 z-50",
              "w-full max-w-md",
              "bg-background/95 backdrop-blur-xl",
              "border-l border-border/50",
              "shadow-2xl shadow-black/20",
              "flex flex-col"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  {/* Status indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <div>
                  <H4 className="text-base leading-none mb-0.5">Nerve Agent</H4>
                  <Muted className="text-xs">Watching 3 projects</Muted>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/50 px-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-2 py-3",
                    "text-xs font-medium transition-colors relative",
                    activeTab === tab.id
                      ? "text-orange-500"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                      {tab.badge}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-orange-500 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                    >
                      {activeTab === "inbox" && (
                        <InboxTab
                          suggestions={suggestions}
                          onAction={handleSuggestionAction}
                          quietHours={preferences?.quietHoursEnabled ? {
                            start: preferences.quietHoursStart,
                            end: preferences.quietHoursEnd,
                          } : null}
                        />
                      )}
                      {activeTab === "chat" && (
                        <ChatTab messages={messages} isSending={isSending} />
                      )}
                      {activeTab === "actions" && <ActionsTab />}
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

            {/* Persistent Input */}
            <div className="border-t border-border/50 p-4">
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask anything..."
                    className={cn(
                      "w-full px-4 py-3 pr-12 rounded-xl",
                      "bg-muted/50 border border-border/50",
                      "text-sm placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50",
                      "transition-all"
                    )}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputValue.trim()}
                    className={cn(
                      "absolute right-1.5 top-1.5 h-8 w-8 rounded-lg",
                      "bg-orange-500 hover:bg-orange-600 disabled:opacity-50",
                      "transition-all"
                    )}
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
  quietHours,
}: {
  suggestions: Suggestion[]
  onAction: (id: string, action: "approve" | "dismiss") => void
  quietHours: { start: string; end: string } | null
}) {
  const getIconForTrigger = (triggerType: string) => {
    switch (triggerType) {
      case "blocker_stale":
        return { icon: <AlertTriangle className="h-4 w-4" />, bg: "bg-yellow-500/10 text-yellow-500" }
      case "sprint_complete":
        return { icon: <FileText className="h-4 w-4" />, bg: "bg-blue-500/10 text-blue-500" }
      case "task_stuck":
        return { icon: <Clock className="h-4 w-4" />, bg: "bg-red-500/10 text-red-500" }
      default:
        return { icon: <Sparkles className="h-4 w-4" />, bg: "bg-orange-500/10 text-orange-500" }
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
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="font-medium mb-1">All clear</p>
        <Muted className="text-sm">Nothing needs your attention right now.</Muted>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <Muted className="text-xs uppercase tracking-wider font-medium">
          Needs your input
        </Muted>
        <Badge variant="outline" className="text-xs">
          {suggestions.length} items
        </Badge>
      </div>

      {/* Suggestion cards */}
      {suggestions.map((suggestion, index) => {
        const { icon, bg } = getIconForTrigger(suggestion.triggerType)
        return (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-xl border border-border/50 bg-card/30 space-y-3"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg", bg)}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-sm">{suggestion.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {suggestion.projectName && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {suggestion.projectName}
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {formatTimestamp(suggestion.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              {suggestion.description}
            </p>

            {/* Agent suggestion */}
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-foreground">{suggestion.proposedAction}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className="flex-1 h-8 text-xs bg-orange-500 hover:bg-orange-600"
                onClick={() => onAction(suggestion.id, "approve")}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Approve
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs">
                <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground"
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
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 text-xs text-muted-foreground">
          <Moon className="h-3.5 w-3.5" />
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
          <div className="p-4 rounded-full bg-gradient-to-br from-orange-500/10 to-orange-600/10 mb-4">
            <MessageSquare className="h-8 w-8 text-orange-500" />
          </div>
          <p className="font-medium mb-1">Start a conversation</p>
          <Muted className="text-sm max-w-[240px]">
            Ask about your projects, blockers, or anything else.
          </Muted>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              {message.role === "agent" && (
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "flex-1 max-w-[85%] p-3 rounded-xl text-sm",
                  message.role === "agent"
                    ? "bg-muted/50"
                    : "bg-orange-500 text-white ml-auto"
                )}
              >
                <p>{message.content}</p>
                <span
                  className={cn(
                    "text-[10px] mt-1 block",
                    message.role === "agent"
                      ? "text-muted-foreground"
                      : "text-orange-100"
                  )}
                >
                  {message.timestamp}
                </span>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 max-w-[85%] p-3 rounded-xl text-sm bg-muted/50">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// ACTIONS TAB - Manual triggers for agent behaviors
// =============================================================================

function ActionsTab() {
  const actionGroups = [
    {
      label: "Generate",
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
      label: "Analyze",
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
      label: "Automate",
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
          <Muted className="text-xs uppercase tracking-wider font-medium">
            {group.label}
          </Muted>
          <div className="space-y-2">
            {group.actions.map((action) => (
              <button
                key={action.id}
                className={cn(
                  "w-full p-3 rounded-xl",
                  "border border-border/50 bg-card/30",
                  "hover:bg-card/60 hover:border-border",
                  "transition-colors text-left group"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </button>
            ))}
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
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Profile */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Muted className="text-xs uppercase tracking-wider font-medium">
            About You
          </Muted>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
            <Edit3 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
        <div className="p-4 rounded-xl border border-border/50 bg-card/30 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{preferences.timezone}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Prefers {preferences.preferredStyle} responses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Learned Patterns */}
      <div className="space-y-3">
        <Muted className="text-xs uppercase tracking-wider font-medium">
          What I've Learned
        </Muted>
        {learnedPatterns.length > 0 ? (
          <div className="space-y-2">
            {learnedPatterns.map((pattern, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30 text-sm"
              >
                <Brain className="h-3.5 w-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{pattern}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-muted/30 text-sm text-muted-foreground text-center">
            No patterns learned yet. Keep using the agent!
          </div>
        )}
        <p className="text-[11px] text-muted-foreground px-1">
          Patterns are learned from your activity. Nothing is shared externally.
        </p>
      </div>

      {/* Agent Behavior Settings */}
      <div className="space-y-3">
        <Muted className="text-xs uppercase tracking-wider font-medium">
          Agent Behavior
        </Muted>
        <div className="space-y-2">
          {agentSettings.map((setting) => {
            const isEnabled = preferences[setting.id] as boolean
            return (
              <button
                key={setting.id}
                onClick={() => onToggle(setting.id, !isEnabled)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card/30 cursor-pointer hover:bg-card/50 transition-colors"
              >
                <div className="flex-1 min-w-0 pr-3 text-left">
                  <p className="text-sm font-medium">{setting.label}</p>
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                </div>
                <div
                  className={cn(
                    "relative w-9 h-5 rounded-full transition-colors flex-shrink-0",
                    isEnabled ? "bg-orange-500" : "bg-muted"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                      isEnabled ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Soul signature */}
      <div className="pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-orange-500" />
          <span>Nerve Agent v0.1 · Direct. Opinionated. Useful.</span>
        </div>
      </div>
    </div>
  )
}
