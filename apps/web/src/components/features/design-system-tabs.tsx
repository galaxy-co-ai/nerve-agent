"use client"

import * as React from "react"
import { useRef, useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Palette, Type, Layers, Box, Sparkles, Settings2 } from "lucide-react"

export type TabId = "colors" | "typography" | "primitives" | "components" | "backgrounds" | "css"

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

const tabs: Tab[] = [
  { id: "colors", label: "Colors", icon: <Palette className="h-4 w-4" /> },
  { id: "typography", label: "Typography", icon: <Type className="h-4 w-4" /> },
  { id: "primitives", label: "Primitives", icon: <Layers className="h-4 w-4" /> },
  { id: "components", label: "Components", icon: <Box className="h-4 w-4" /> },
  { id: "backgrounds", label: "Backgrounds", icon: <Sparkles className="h-4 w-4" /> },
  { id: "css", label: "CSS Variables", icon: <Settings2 className="h-4 w-4" /> },
]

interface DesignSystemTabsProps {
  children: React.ReactNode
  availableTabs?: TabId[]
  defaultTab?: TabId
  className?: string
}

interface DesignSystemTabContentProps {
  tabId: TabId
  children: React.ReactNode
}

interface TabsContextValue {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("Tab components must be used within DesignSystemTabs")
  }
  return context
}

export function DesignSystemTabs({
  children,
  availableTabs,
  defaultTab,
  className,
}: DesignSystemTabsProps) {
  // Filter to only show tabs that have content
  const visibleTabs = availableTabs
    ? tabs.filter((tab) => availableTabs.includes(tab.id))
    : tabs

  const [activeTab, setActiveTab] = useState<TabId>(defaultTab || visibleTabs[0]?.id || "colors")

  // Refs for measuring tab positions
  const tabRefs = useRef<Map<TabId, HTMLButtonElement>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  // Underline position state
  const [underlineStyle, setUnderlineStyle] = useState({
    width: 0,
    left: 0,
    opacity: 0,
  })

  // Calculate underline position
  const updateUnderline = useCallback(() => {
    const activeTabElement = tabRefs.current.get(activeTab)
    const container = containerRef.current

    if (activeTabElement && container) {
      const containerRect = container.getBoundingClientRect()
      const tabRect = activeTabElement.getBoundingClientRect()

      setUnderlineStyle({
        width: tabRect.width,
        left: tabRect.left - containerRect.left,
        opacity: 1,
      })
    }
  }, [activeTab])

  // Update underline on mount and tab change
  useEffect(() => {
    updateUnderline()
  }, [updateUnderline])

  // Update on resize
  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(updateUnderline)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [updateUnderline])

  // Initial measurement after fonts load
  useEffect(() => {
    if (document.fonts?.ready) {
      document.fonts.ready.then(updateUnderline)
    }
  }, [updateUnderline])

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("flex flex-col", className)}>
        {/* Sticky Tab Bar */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div
            ref={containerRef}
            className="relative flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hide"
          >
            {/* Tab Buttons */}
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(tab.id, el)
                }}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md",
                  "transition-colors duration-200 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nerve-gold-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "whitespace-nowrap select-none",
                  activeTab === tab.id
                    ? "text-[var(--nerve-gold-400)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "transition-colors duration-200",
                    activeTab === tab.id
                      ? "text-[var(--nerve-gold-400)]"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            ))}

            {/* Animated Underline */}
            <div
              className="absolute bottom-0 h-[2px] transition-all duration-300 ease-out"
              style={{
                width: underlineStyle.width,
                left: underlineStyle.left,
                opacity: underlineStyle.opacity,
                background: "linear-gradient(90deg, var(--nerve-gold-400), var(--nerve-gold-500))",
                boxShadow: "0 0 12px var(--nerve-gold-glow-medium), 0 0 4px var(--nerve-gold-glow)",
                borderRadius: "2px 2px 0 0",
              }}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1">{children}</div>
      </div>
    </TabsContext.Provider>
  )
}

export function DesignSystemTabContent({ tabId, children }: DesignSystemTabContentProps) {
  const { activeTab } = useTabsContext()

  if (activeTab !== tabId) return null

  return (
    <div
      className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
      role="tabpanel"
      aria-labelledby={`tab-${tabId}`}
    >
      {children}
    </div>
  )
}

// Export tab IDs for type safety
export { tabs }
