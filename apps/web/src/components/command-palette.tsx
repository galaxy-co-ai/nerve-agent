// =============================================================================
// Command Palette - Cmd+K Quick Actions
// =============================================================================

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Home,
  FolderKanban,
  Clock,
  FileText,
  Settings,
  Users,
  BarChart3,
  Calendar,
  Plus,
  Timer,
  CheckSquare,
  MessageSquare,
  Zap,
  ExternalLink,
} from "lucide-react"
import { modalBackdrop, modalContent } from "@/lib/animations"
import { cn } from "@/lib/utils"

// =============================================================================
// Types
// =============================================================================

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  shortcut?: string[]
  action: () => void
  keywords?: string[]
  group: string
}

// =============================================================================
// Command Palette Context
// =============================================================================

interface CommandPaletteContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const CommandPaletteContext = React.createContext<CommandPaletteContextValue | null>(null)

export function useCommandPalette() {
  const context = React.useContext(CommandPaletteContext)
  if (!context) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider")
  }
  return context
}

// =============================================================================
// Provider
// =============================================================================

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  const toggle = React.useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  // Global keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        toggle()
      }
      // Escape to close
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, toggle])

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen, toggle }}>
      {children}
      <CommandPalette />
    </CommandPaletteContext.Provider>
  )
}

// =============================================================================
// Command Palette Component
// =============================================================================

function CommandPalette() {
  const { open, setOpen } = useCommandPalette()
  const router = useRouter()
  const [search, setSearch] = React.useState("")

  // Reset search when closing
  React.useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  // Define commands
  const commands: CommandItem[] = React.useMemo(
    () => [
      // Navigation
      {
        id: "nav-dashboard",
        label: "Go to Dashboard",
        icon: <Home className="h-4 w-4" />,
        shortcut: ["G", "D"],
        action: () => router.push("/dashboard"),
        keywords: ["home", "main"],
        group: "Navigation",
      },
      {
        id: "nav-projects",
        label: "Go to Projects",
        icon: <FolderKanban className="h-4 w-4" />,
        shortcut: ["G", "P"],
        action: () => router.push("/projects"),
        keywords: ["work", "tasks"],
        group: "Navigation",
      },
      {
        id: "nav-time",
        label: "Go to Time Tracking",
        icon: <Clock className="h-4 w-4" />,
        shortcut: ["G", "T"],
        action: () => router.push("/time"),
        keywords: ["hours", "timer"],
        group: "Navigation",
      },
      {
        id: "nav-notes",
        label: "Go to Notes",
        icon: <FileText className="h-4 w-4" />,
        shortcut: ["G", "N"],
        action: () => router.push("/notes"),
        keywords: ["docs", "writing"],
        group: "Navigation",
      },
      {
        id: "nav-clients",
        label: "Go to Clients",
        icon: <Users className="h-4 w-4" />,
        action: () => router.push("/clients"),
        keywords: ["customers", "portal"],
        group: "Navigation",
      },
      {
        id: "nav-analytics",
        label: "Go to Analytics",
        icon: <BarChart3 className="h-4 w-4" />,
        action: () => router.push("/analytics"),
        keywords: ["stats", "reports"],
        group: "Navigation",
      },
      {
        id: "nav-settings",
        label: "Go to Settings",
        icon: <Settings className="h-4 w-4" />,
        shortcut: ["G", "S"],
        action: () => router.push("/settings"),
        keywords: ["preferences", "config"],
        group: "Navigation",
      },

      // Quick Actions
      {
        id: "action-new-project",
        label: "Create New Project",
        icon: <Plus className="h-4 w-4" />,
        shortcut: ["C", "P"],
        action: () => router.push("/projects/new"),
        keywords: ["add", "start"],
        group: "Quick Actions",
      },
      {
        id: "action-new-task",
        label: "Create New Task",
        icon: <CheckSquare className="h-4 w-4" />,
        shortcut: ["C", "T"],
        action: () => {
          // Could open a task creation modal
          router.push("/projects?action=new-task")
        },
        keywords: ["add", "todo"],
        group: "Quick Actions",
      },
      {
        id: "action-start-timer",
        label: "Start Time Timer",
        icon: <Timer className="h-4 w-4" />,
        shortcut: ["S", "T"],
        action: () => router.push("/time?action=start"),
        keywords: ["track", "clock"],
        group: "Quick Actions",
      },
      {
        id: "action-new-note",
        label: "Create New Note",
        icon: <FileText className="h-4 w-4" />,
        shortcut: ["C", "N"],
        action: () => router.push("/notes/new"),
        keywords: ["add", "write"],
        group: "Quick Actions",
      },
      {
        id: "action-quick-feedback",
        label: "Submit Feedback",
        icon: <MessageSquare className="h-4 w-4" />,
        action: () => {
          // Could open feedback modal
          router.push("/?feedback=true")
        },
        keywords: ["comment", "bug", "suggest"],
        group: "Quick Actions",
      },

      // Tools
      {
        id: "tool-daily-view",
        label: "Today's Focus",
        description: "See your tasks and schedule for today",
        icon: <Calendar className="h-4 w-4" />,
        action: () => router.push("/dashboard?view=today"),
        keywords: ["daily", "schedule"],
        group: "Tools",
      },
      {
        id: "tool-quick-log",
        label: "Quick Time Log",
        description: "Log time without leaving current page",
        icon: <Zap className="h-4 w-4" />,
        action: () => {
          // Could open quick log modal
          router.push("/time?quick=true")
        },
        keywords: ["fast", "entry"],
        group: "Tools",
      },
      {
        id: "tool-client-portal",
        label: "View as Client",
        description: "Preview the client portal experience",
        icon: <ExternalLink className="h-4 w-4" />,
        action: () => {
          window.open("/?role=client", "_blank")
        },
        keywords: ["preview", "demo"],
        group: "Tools",
      },
    ],
    [router]
  )

  // Group commands
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    for (const cmd of commands) {
      if (!groups[cmd.group]) groups[cmd.group] = []
      groups[cmd.group].push(cmd)
    }
    return groups
  }, [commands])

  const handleSelect = (command: CommandItem) => {
    setOpen(false)
    command.action()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setOpen(false)}
          />

          {/* Command Dialog */}
          <motion.div
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Command
              className="overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
              loop
            >
              {/* Search Input */}
              <div className="flex items-center border-b border-border px-3">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Type a command or search..."
                  className="flex h-12 w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                  ESC
                </kbd>
              </div>

              {/* Command List */}
              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </Command.Empty>

                {Object.entries(groupedCommands).map(([group, items]) => (
                  <Command.Group
                    key={group}
                    heading={group}
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
                  >
                    {items.map((command) => (
                      <Command.Item
                        key={command.id}
                        value={`${command.label} ${command.keywords?.join(" ") || ""}`}
                        onSelect={() => handleSelect(command)}
                        className={cn(
                          "relative flex cursor-pointer select-none items-center gap-3 rounded-md px-2 py-2 text-sm outline-none",
                          "aria-selected:bg-accent aria-selected:text-accent-foreground",
                          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        )}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                          {command.icon}
                        </span>
                        <div className="flex flex-col">
                          <span>{command.label}</span>
                          {command.description && (
                            <span className="text-xs text-muted-foreground">
                              {command.description}
                            </span>
                          )}
                        </div>
                        {command.shortcut && (
                          <div className="ml-auto flex gap-1">
                            {command.shortcut.map((key, i) => (
                              <kbd
                                key={i}
                                className="pointer-events-none flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-border bg-muted px-1">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-border bg-muted px-1">↵</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-border bg-muted px-1">⌘K</kbd>
                  <span>Toggle</span>
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// =============================================================================
// Trigger Button (optional, for non-keyboard users)
// =============================================================================

export function CommandPaletteTrigger({ className }: { className?: string }) {
  const { toggle } = useCommandPalette()

  return (
    <button
      onClick={toggle}
      className={cn(
        "flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Search...</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
        ⌘K
      </kbd>
    </button>
  )
}
