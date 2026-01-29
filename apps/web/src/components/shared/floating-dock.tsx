"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X } from "lucide-react"
import { Dock, DockItem, DockLabel, DockIcon } from "@/components/ui/dock"
import { cn } from "@/lib/utils"

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

  // Get the menu action if one is open
  const openMenu = openMenuId
    ? (actions.find((a) => a.id === openMenuId) as DockMenuAction | undefined)
    : null

  // Close menu when clicking outside
  useEffect(() => {
    if (!openMenuId) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      // Don't close if clicking inside the menu
      if (menuRef.current?.contains(target)) return
      // Don't close if clicking the dock trigger button (it has its own toggle)
      const triggerButton = containerRef.current?.querySelector(
        `[data-menu-trigger="${openMenuId}"]`
      )
      if (triggerButton?.contains(target)) return

      setOpenMenuId(null)
    }

    // Small delay to avoid immediate close on the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 10)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openMenuId])

  const handleMenuItemClick = useCallback((item: DockMenuItem) => {
    item.onClick()
    setOpenMenuId(null)
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("fixed bottom-4 left-1/2 -translate-x-1/2 z-50", className)}
    >
      {/* Expandable menu - rendered outside dock to avoid overflow clipping */}
      <AnimatePresence>
        {openMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 flex flex-col-reverse items-center gap-2 z-[60]"
          >
            {openMenu.items.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 26,
                  delay: index * 0.025,
                }}
                onClick={() => handleMenuItemClick(item)}
                className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-neutral-900/95 backdrop-blur-sm border border-border/50 hover:bg-neutral-800 hover:border-border transition-all shadow-lg whitespace-nowrap"
              >
                <span className="text-neutral-400 group-hover:text-white transition-colors">
                  {item.icon}
                </span>
                <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className=""
          >
            <div className="relative">
              <Dock
                className="border border-border/50 shadow-2xl shadow-black/20 overflow-visible"
                magnification={60}
                distance={100}
                panelHeight={56}
              >
                {actions.map((action) => (
                  <DockItem key={action.id}>
                    <DockLabel>{action.label}</DockLabel>
                    <DockIcon>
                      {isMenuAction(action) ? (
                        <button
                          data-menu-trigger={action.id}
                          onClick={() =>
                            setOpenMenuId(openMenuId === action.id ? null : action.id)
                          }
                          className={cn(
                            "size-full flex items-center justify-center transition-colors",
                            openMenuId === action.id
                              ? "text-white"
                              : "text-neutral-400 hover:text-white"
                          )}
                        >
                          {openMenuId === action.id ? (
                            <X className="size-full" />
                          ) : (
                            action.icon
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={action.onClick}
                          className="size-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                        >
                          {action.icon}
                        </button>
                      )}
                    </DockIcon>
                  </DockItem>
                ))}
              </Dock>

              {/* Collapse button */}
              <button
                onClick={() => {
                  setIsExpanded(false)
                  setOpenMenuId(null)
                }}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-neutral-900 border border-border/50 hover:bg-neutral-800 transition-colors"
              >
                <X className="h-3 w-3 text-neutral-400" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={() => setIsExpanded(true)}
            className="p-3 rounded-full bg-neutral-900/90 backdrop-blur-sm border border-border/50 hover:bg-neutral-800/90 hover:border-border transition-all shadow-lg shadow-black/20 group"
          >
            <Plus className="h-5 w-5 text-neutral-400 group-hover:text-white transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
