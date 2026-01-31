"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"

// =============================================================================
// DESIGN TOKENS - Matches sidebar exactly
// =============================================================================
const NERVE = {
  housing: "#1c1c1f",
  surface: "#141416",
  recessed: "#08080a",
  elevated: "#242428",
  edgeLight: "rgba(255,255,255,0.08)",
  edgeDark: "rgba(0,0,0,0.4)",
  gold: "#C9A84C",
  goldSubtle: "rgba(201,168,76,0.2)",
  goldGlow: "rgba(201,168,76,0.25)",
  textPrimary: "#F0F0F2",
  textSecondary: "#A0A0A8",
  textMuted: "#68687A",
}

export interface DockAction {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
}

export interface DockMenuItem {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
}

export interface DockMenuAction {
  id: string
  label: string
  icon: React.ReactNode
  items: DockMenuItem[]
}

export type DockItemConfig = DockAction | DockMenuAction

function isMenuAction(item: DockItemConfig): item is DockMenuAction {
  return "items" in item
}

interface FloatingDockProps {
  actions: DockItemConfig[]
  className?: string
}

export function FloatingDock({ actions, className }: FloatingDockProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Get sidebar state for positioning
  const { state: sidebarState } = useSidebar()
  const isCollapsed = sidebarState === "collapsed"

  // Get the menu action if one is open
  const openMenu = openMenuId
    ? (actions.find((a) => a.id === openMenuId) as DockMenuAction | undefined)
    : null

  // Close menu when clicking outside
  useEffect(() => {
    if (!openMenuId) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (menuRef.current?.contains(target)) return
      const triggerButton = containerRef.current?.querySelector(
        `[data-menu-trigger="${openMenuId}"]`
      )
      if (triggerButton?.contains(target)) return
      setOpenMenuId(null)
    }

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 10)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openMenuId])

  // Close everything when clicking outside the expanded dock
  useEffect(() => {
    if (!isExpanded) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (containerRef.current?.contains(target)) return
      setIsExpanded(false)
      setOpenMenuId(null)
    }

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 10)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded])

  const handleMenuItemClick = useCallback((item: DockMenuItem) => {
    item.onClick()
    setOpenMenuId(null)
    setIsExpanded(false)
  }, [])

  const handleActionClick = useCallback((action: DockAction) => {
    action.onClick()
    setIsExpanded(false)
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed bottom-6 z-50 flex items-center transition-[left] duration-200 ease-linear",
        // Position flush with sidebar - responds to collapsed/expanded state
        isCollapsed ? "left-[3.5rem]" : "left-[13rem]",
        className
      )}
    >
      {/* Collapsed trigger - flush with sidebar */}
      <AnimatePresence mode="wait">
        {!isExpanded && (
          <motion.button
            key="trigger"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={() => setIsExpanded(true)}
            className="py-3 px-1.5 rounded-r-xl group transition-all"
            style={{
              background: NERVE.housing,
              borderTop: `1px solid ${NERVE.edgeLight}`,
              borderRight: `1px solid ${NERVE.edgeLight}`,
              borderBottom: `1px solid ${NERVE.edgeDark}`,
              boxShadow: `
                4px 0 12px rgba(0,0,0,0.3),
                inset 0 1px 0 ${NERVE.edgeLight}
              `,
            }}
          >
            <ChevronRight
              className="h-4 w-4 transition-colors"
              style={{ color: NERVE.textMuted }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded dock - horizontal layout */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="flex items-center gap-1 py-2 px-2 rounded-r-xl"
            style={{
              background: NERVE.housing,
              borderTop: `1px solid ${NERVE.edgeLight}`,
              borderRight: `1px solid ${NERVE.edgeLight}`,
              borderBottom: `1px solid ${NERVE.edgeDark}`,
              boxShadow: `
                4px 0 16px rgba(0,0,0,0.4),
                inset 0 1px 0 ${NERVE.edgeLight}
              `,
            }}
          >
            {/* Action buttons */}
            {actions.map((action) => (
              <div key={action.id} className="relative">
                {isMenuAction(action) ? (
                  <>
                    <button
                      data-menu-trigger={action.id}
                      onClick={() =>
                        setOpenMenuId(openMenuId === action.id ? null : action.id)
                      }
                      className="p-2.5 rounded-lg transition-all"
                      style={{
                        background: openMenuId === action.id ? NERVE.surface : "transparent",
                        border: openMenuId === action.id ? `1px solid ${NERVE.goldSubtle}` : "1px solid transparent",
                        boxShadow: openMenuId === action.id ? `0 0 12px ${NERVE.goldGlow}` : "none",
                        color: openMenuId === action.id ? NERVE.gold : NERVE.textMuted,
                      }}
                    >
                      <span className="block h-5 w-5">{action.icon}</span>
                    </button>

                    {/* Submenu popup - expands upward */}
                    <AnimatePresence>
                      {openMenuId === action.id && openMenu && (
                        <motion.div
                          ref={menuRef}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full left-0 mb-2 flex flex-col gap-1 min-w-[160px]"
                          style={{
                            background: NERVE.housing,
                            border: `1px solid ${NERVE.edgeLight}`,
                            borderRadius: "12px",
                            padding: "6px",
                            boxShadow: `0 -4px 20px rgba(0,0,0,0.4)`,
                          }}
                        >
                          {openMenu.items.map((item, index) => (
                            <motion.button
                              key={item.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              onClick={() => handleMenuItemClick(item)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left"
                              style={{
                                color: NERVE.textSecondary,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = NERVE.surface
                                e.currentTarget.style.color = NERVE.textPrimary
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent"
                                e.currentTarget.style.color = NERVE.textSecondary
                              }}
                            >
                              <span style={{ color: NERVE.textMuted }}>{item.icon}</span>
                              <span className="text-sm">{item.label}</span>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <button
                    onClick={() => handleActionClick(action)}
                    className="p-2.5 rounded-lg transition-all"
                    style={{
                      color: NERVE.textMuted,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = NERVE.surface
                      e.currentTarget.style.color = NERVE.textPrimary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent"
                      e.currentTarget.style.color = NERVE.textMuted
                    }}
                  >
                    <span className="block h-5 w-5">{action.icon}</span>
                  </button>
                )}
              </div>
            ))}

            {/* Close button */}
            <button
              onClick={() => {
                setIsExpanded(false)
                setOpenMenuId(null)
              }}
              className="p-2 rounded-lg ml-1 transition-all"
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
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
