"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Dock, DockItem, DockLabel, DockIcon } from "@/components/ui/dock"
import { cn } from "@/lib/utils"

export interface DockAction {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
  href?: string
}

interface FloatingDockProps {
  actions: DockAction[]
  className?: string
}

export function FloatingDock({ actions, className }: FloatingDockProps) {
  const [isExpanded, setIsExpanded] = useState(false)

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
                      <button
                        onClick={action.onClick}
                        className="size-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                      >
                        {action.icon}
                      </button>
                    </DockIcon>
                  </DockItem>
                ))}
              </Dock>

              {/* Collapse button */}
              <button
                onClick={() => setIsExpanded(false)}
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
