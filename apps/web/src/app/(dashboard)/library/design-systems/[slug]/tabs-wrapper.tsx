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

const allTabs: Tab[] = [
  { id: "colors", label: "Colors", icon: <Palette className="h-4 w-4" /> },
  { id: "typography", label: "Typography", icon: <Type className="h-4 w-4" /> },
  { id: "primitives", label: "Primitives", icon: <Layers className="h-4 w-4" /> },
  { id: "components", label: "Components", icon: <Box className="h-4 w-4" /> },
  { id: "backgrounds", label: "Backgrounds", icon: <Sparkles className="h-4 w-4" /> },
  { id: "css", label: "CSS Variables", icon: <Settings2 className="h-4 w-4" /> },
]

interface DesignSystemTabsWrapperProps {
  children: React.ReactNode
  availableTabs: TabId[]
  defaultTab?: TabId
}

export function DesignSystemTabsWrapper({
  children,
  availableTabs,
  defaultTab,
}: DesignSystemTabsWrapperProps) {
  // Filter to only show tabs that have content
  const visibleTabs = allTabs.filter((tab) => availableTabs.includes(tab.id))

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
    // Small delay to ensure DOM is ready
    const timeout = setTimeout(updateUnderline, 50)
    return () => clearTimeout(timeout)
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

  // Filter children to only show the active tab's content
  const childArray = React.Children.toArray(children)
  const activeContent = childArray.find((child) => {
    if (React.isValidElement(child)) {
      const dataTab = child.props?.["data-tab"]
      return dataTab === activeTab
    }
    return false
  })

  return (
    <div className="flex flex-col flex-1">
      {/* Sticky Tab Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div
          ref={containerRef}
          className="relative flex items-center gap-0.5 px-6 overflow-x-auto scrollbar-hide"
          role="tablist"
          aria-label="Design system sections"
        >
          {/* Tab Buttons */}
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el)
              }}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium",
                "transition-all duration-200 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nerve-gold-400)]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                "whitespace-nowrap select-none",
                "hover:bg-muted/30 rounded-t-md",
                activeTab === tab.id
                  ? "text-[var(--nerve-gold-400,#facc15)]"
                  : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              <span
                className={cn(
                  "transition-colors duration-200",
                  activeTab === tab.id
                    ? "text-[var(--nerve-gold-400,#facc15)]"
                    : "text-muted-foreground"
                )}
              >
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}

          {/* Animated Underline with Gold Glow */}
          <div
            className="absolute bottom-0 h-[2px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              width: underlineStyle.width,
              left: underlineStyle.left,
              opacity: underlineStyle.opacity,
              background: "linear-gradient(90deg, var(--nerve-gold-400, #facc15), var(--nerve-gold-500, #eab308))",
              boxShadow: `
                0 0 8px rgba(234, 179, 8, 0.4),
                0 0 16px rgba(234, 179, 8, 0.2),
                0 1px 2px rgba(234, 179, 8, 0.3)
              `,
              borderRadius: "2px 2px 0 0",
            }}
          />
        </div>
      </div>

      {/* Tab Content with Animation */}
      <div className="flex-1">
        {activeContent && (
          <div
            key={activeTab}
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            className="animate-in fade-in-0 duration-200"
          >
            {activeContent}
          </div>
        )}
      </div>
    </div>
  )
}
