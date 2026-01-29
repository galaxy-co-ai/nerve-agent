"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, ChevronDown, Plus, X } from "lucide-react"
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

// Expandable menu that fans out upward from a dock item
function ExpandableMenu({
  menu,
  onClose,
}: {
  menu: DockMenuAction
  onClose: () => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 flex flex-col-reverse items-center gap-2"
    >
      {menu.items.map((item, index) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            delay: index * 0.03,
          }}
          onClick={() => {
            item.onClick()
            onClose()
          }}
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
  )
}

export function FloatingDock({ actions, className }: FloatingDockProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  return (
    <div className={cn("fixed bottom-0 left-1/2 -translate-x-1/2 z-50", className)}>
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="mb-4"
          >
            <div className="relative">
              <Dock
                className="border border-border/50 shadow-2xl shadow-black/20"
                magnification={60}
                distance={100}
                panelHeight={56}
              >
                {actions.map((action) => (
                  <DockItem key={action.id}>
                    <DockLabel>{action.label}</DockLabel>
                    <DockIcon>
                      {isMenuAction(action) ? (
                        <div className="relative size-full">
                          <button
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
                          <AnimatePresence>
                            {openMenuId === action.id && (
                              <ExpandableMenu
                                menu={action}
                                onClose={() => setOpenMenuId(null)}
                              />
                            )}
                          </AnimatePresence>
                        </div>
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
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 p-1 rounded-full bg-neutral-900 border border-border/50 hover:bg-neutral-800 transition-colors"
              >
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={() => setIsExpanded(true)}
            className="mb-4 px-6 py-2 rounded-full bg-neutral-900/90 backdrop-blur-sm border border-border/50 hover:bg-neutral-800/90 hover:border-border transition-all shadow-lg shadow-black/20 group"
          >
            <ChevronUp className="h-5 w-5 text-neutral-400 group-hover:text-white transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
