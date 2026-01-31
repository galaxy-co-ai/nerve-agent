"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  FileText,
  Lightbulb,
  Link2,
  Search,
} from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"

// =============================================================================
// DESIGN TOKENS - Matches agent-drawer.tsx exactly
// =============================================================================
const NERVE = {
  housing: "#1c1c1f",
  surface: "#141416",
  recessed: "#08080a",
  elevated: "#242428",
  edgeLight: "rgba(255,255,255,0.08)",
  edgeDark: "rgba(0,0,0,0.4)",
  gold: "#C9A84C",
  goldMuted: "rgba(201,168,76,0.6)",
  goldSubtle: "rgba(201,168,76,0.2)",
  goldGlow: "rgba(201,168,76,0.25)",
  textPrimary: "#F0F0F2",
  textSecondary: "#A0A0A8",
  textMuted: "#68687A",
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
  onClick: () => void
}

export function NavQuickActions() {
  const router = useRouter()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLLIElement>(null)

  const actions: QuickAction[] = [
    {
      id: "new-note",
      label: "New Note",
      icon: <FileText className="h-4 w-4" />,
      shortcut: "N",
      onClick: () => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "n", shiftKey: true, metaKey: true })
        )
      },
    },
    {
      id: "quick-idea",
      label: "Quick Idea",
      icon: <Lightbulb className="h-4 w-4" />,
      onClick: () => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "n", shiftKey: true, metaKey: true })
        )
      },
    },
    {
      id: "save-url",
      label: "Save URL",
      icon: <Link2 className="h-4 w-4" />,
      onClick: () => {
        router.push("/library")
      },
    },
    {
      id: "search",
      label: "Search",
      icon: <Search className="h-4 w-4" />,
      shortcut: "K",
      onClick: () => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true })
        )
      },
    },
  ]

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const handleActionClick = (action: QuickAction) => {
    action.onClick()
    setIsOpen(false)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem className="relative" ref={menuRef}>
        <SidebarMenuButton
          onClick={() => setIsOpen(!isOpen)}
          tooltip={isOpen ? undefined : "Quick Actions"}
          className="h-9"
          style={isOpen ? {
            background: `linear-gradient(180deg, ${NERVE.surface} 0%, ${NERVE.recessed} 100%)`,
            border: `1px solid ${NERVE.goldSubtle}`,
            boxShadow: `inset 0 2px 4px rgba(0,0,0,0.4), 0 0 12px ${NERVE.goldGlow}`,
          } : {}}
        >
          <Plus
            className="size-4"
            style={{ color: isOpen ? NERVE.gold : NERVE.textMuted }}
          />
          <span style={{ color: isOpen ? NERVE.textPrimary : NERVE.textSecondary }}>
            Quick Actions
          </span>
        </SidebarMenuButton>

        {/* Horizontal menu - expands to the right */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="fixed z-50 flex items-center gap-1"
              style={{
                left: isCollapsed ? "calc(3.5rem + 20px)" : "calc(13rem + 20px)",
                bottom: "18px",
              }}
            >
              <div
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl"
                style={{
                  background: NERVE.housing,
                  border: `1px solid ${NERVE.edgeLight}`,
                  boxShadow: `
                    4px 0 20px rgba(0,0,0,0.4),
                    inset 0 1px 0 ${NERVE.edgeLight}
                  `,
                }}
              >
                {actions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleActionClick(action)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all group"
                    title={action.label}
                    style={{ color: NERVE.textMuted }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = NERVE.surface
                      e.currentTarget.style.color = NERVE.textPrimary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent"
                      e.currentTarget.style.color = NERVE.textMuted
                    }}
                  >
                    <span className="group-hover:text-[#C9A84C] transition-colors">
                      {action.icon}
                    </span>
                    <span className="text-sm hidden sm:inline" style={{ color: NERVE.textSecondary }}>
                      {action.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
