"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"
import type { AXStateGraph, AXWorkspace, AXUser, AXCurrentView, AXStalenessOverview } from "./types"
import type { AXRelationshipMap } from "./relationships"
import { computeUserPatterns, type AXUserPatterns, getPatternSummary } from "./patterns"
import { startAXSession, endAXSession, trackNavigation } from "./tracking"
import {
  getAXScratchpad,
  getScratchpadSummary,
  processAgentScratchpadWrite,
  type AXScratchpadSummary,
} from "./scratchpad"
import {
  computeQuietSignals,
  getQuietSignalBodyAttrs,
  type AXQuietSignals,
} from "./quiet-signals"

// =============================================================================
// CONTEXT
// =============================================================================

interface AXStateContextType {
  stateGraph: AXStateGraph
  setActiveModal: (modal: string | null) => void
  setActiveDrawer: (drawer: AXCurrentView["activeDrawer"]) => void
  updateWorkspace: (partial: Partial<AXWorkspace>) => void
  refreshPatterns: () => void
  refreshScratchpad: () => void
  quietSignals: AXQuietSignals | null
}

const AXStateContext = createContext<AXStateContextType | null>(null)

export function useAXState() {
  const context = useContext(AXStateContext)
  if (!context) {
    throw new Error("useAXState must be used within an AXStateProvider")
  }
  return context
}

// Optional hook for components that may be outside provider
export function useAXStateOptional() {
  return useContext(AXStateContext)
}

// =============================================================================
// PROPS
// =============================================================================

interface AXStateProviderProps {
  children: ReactNode
  initialUser: AXUser
  initialWorkspace: AXWorkspace
  initialStaleness?: AXStalenessOverview
  initialRelationships?: AXRelationshipMap
}

// =============================================================================
// PROVIDER
// =============================================================================

export function AXStateProvider({
  children,
  initialUser,
  initialWorkspace,
  initialStaleness,
  initialRelationships,
}: AXStateProviderProps) {
  const pathname = usePathname()
  const prevPathnameRef = useRef(pathname)
  const [user] = useState<AXUser>(initialUser)
  const [workspace, setWorkspace] = useState<AXWorkspace>(initialWorkspace)
  const [staleness] = useState<AXStalenessOverview | undefined>(initialStaleness)
  const [relationships] = useState<AXRelationshipMap | undefined>(initialRelationships)
  const [userPatterns, setUserPatterns] = useState<AXUserPatterns | undefined>(undefined)
  const [scratchpadSummary, setScratchpadSummary] = useState<AXScratchpadSummary | undefined>(undefined)
  const [quietSignals, setQuietSignals] = useState<AXQuietSignals | null>(null)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [activeDrawer, setActiveDrawer] = useState<AXCurrentView["activeDrawer"]>(null)

  // Refs for intervals and timeouts
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const quietSignalsIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const scratchpadTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  const [stateGraph, setStateGraph] = useState<AXStateGraph>(() =>
    buildStateGraph(
      user,
      workspace,
      pathname,
      activeModal,
      activeDrawer,
      staleness,
      relationships,
      userPatterns,
      scratchpadSummary,
      quietSignals
    )
  )

  // Initialize session tracking, patterns, scratchpad, and quiet signals on mount
  useEffect(() => {
    startAXSession()
    setUserPatterns(computeUserPatterns())
    setScratchpadSummary(getScratchpadSummary())

    // Compute initial quiet signals
    const patterns = computeUserPatterns()
    setQuietSignals(
      computeQuietSignals(
        initialUser.quietHours,
        patterns?.activity.mostActiveHours
      )
    )

    // Update quiet signals every 10 seconds
    quietSignalsIntervalRef.current = setInterval(() => {
      const currentPatterns = computeUserPatterns()
      setQuietSignals(
        computeQuietSignals(
          initialUser.quietHours,
          currentPatterns?.activity.mostActiveHours
        )
      )
    }, 10000)

    // End session on unmount/tab close
    const handleUnload = () => endAXSession()
    window.addEventListener("beforeunload", handleUnload)

    return () => {
      window.removeEventListener("beforeunload", handleUnload)
      if (quietSignalsIntervalRef.current) {
        clearInterval(quietSignalsIntervalRef.current)
      }
      endAXSession()
    }
  }, [initialUser.quietHours])

  // Track navigation changes
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      trackNavigation(prevPathnameRef.current, pathname)
      prevPathnameRef.current = pathname
    }
  }, [pathname])

  // Update state graph when dependencies change (debounced)
  useEffect(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    updateTimeoutRef.current = setTimeout(() => {
      setStateGraph(
        buildStateGraph(
          user,
          workspace,
          pathname,
          activeModal,
          activeDrawer,
          staleness,
          relationships,
          userPatterns,
          scratchpadSummary,
          quietSignals
        )
      )
    }, 150) // 150ms debounce

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [user, workspace, pathname, activeModal, activeDrawer, staleness, relationships, userPatterns, scratchpadSummary, quietSignals])

  const updateWorkspace = useCallback((partial: Partial<AXWorkspace>) => {
    setWorkspace((prev) => ({ ...prev, ...partial }))
  }, [])

  const refreshPatterns = useCallback(() => {
    setUserPatterns(computeUserPatterns())
  }, [])

  const refreshScratchpad = useCallback(() => {
    setScratchpadSummary(getScratchpadSummary())
  }, [])

  // Handle scratchpad writes from agents
  const handleScratchpadWrite = useCallback((newValue: string) => {
    if (newValue.trim()) {
      const success = processAgentScratchpadWrite(newValue)
      if (success) {
        refreshScratchpad()
      }
    }
  }, [refreshScratchpad])

  // Set up MutationObserver for scratchpad textarea on mount
  useEffect(() => {
    const textarea = scratchpadTextareaRef.current
    if (!textarea) return

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData" || mutation.type === "childList") {
          handleScratchpadWrite(textarea.value)
        }
      }
    })

    observer.observe(textarea, {
      characterData: true,
      childList: true,
      subtree: true,
    })

    // Also listen for direct value changes
    const handleInput = () => handleScratchpadWrite(textarea.value)
    textarea.addEventListener("input", handleInput)

    return () => {
      observer.disconnect()
      textarea.removeEventListener("input", handleInput)
    }
  }, [handleScratchpadWrite])

  // Get pattern summary for body attributes
  const patternSummary = userPatterns ? getPatternSummary(userPatterns) : null

  // Get quiet signal body attributes
  const quietSignalAttrs = quietSignals ? getQuietSignalBodyAttrs(quietSignals) : {}

  // Get current scratchpad for DOM exposure
  const scratchpad = typeof window !== "undefined" ? getAXScratchpad() : null

  return (
    <AXStateContext.Provider
      value={{
        stateGraph,
        setActiveModal,
        setActiveDrawer,
        updateWorkspace,
        refreshPatterns,
        refreshScratchpad,
        quietSignals,
      }}
    >
      {children}
      {/* Hidden state graph div for AI agents */}
      <div
        id="ax-state-graph"
        data-ax-type="state-graph"
        aria-hidden="true"
        style={{ display: "none" }}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(stateGraph) }}
      />
      {/* Pattern attributes on a hidden element for quick agent access */}
      {patternSummary && (
        <div
          id="ax-user-patterns"
          data-ax-type="user-patterns"
          data-ax-user-style={patternSummary.style}
          data-ax-user-approval-rate={String(patternSummary.approvalRate)}
          data-ax-user-prefers-keyboard={String(patternSummary.prefersKeyboard)}
          data-ax-user-most-active={patternSummary.mostActiveHours}
          aria-hidden="true"
          style={{ display: "none" }}
        />
      )}
      {/* Agent scratchpad - read/write interface for persistent memory */}
      <div id="ax-scratchpad" data-ax-type="scratchpad" aria-hidden="true" style={{ display: "none" }}>
        <script
          type="application/json"
          id="ax-scratchpad-read"
          dangerouslySetInnerHTML={{ __html: scratchpad ? JSON.stringify(scratchpad) : "{}" }}
        />
        <textarea
          ref={scratchpadTextareaRef}
          id="ax-scratchpad-write"
          data-ax-writable="true"
          style={{ display: "none" }}
          defaultValue=""
        />
      </div>
      {/* Quiet signals on a hidden element for quick access */}
      {quietSignals && (
        <div
          id="ax-quiet-signals"
          data-ax-type="quiet-signals"
          {...quietSignalAttrs}
          aria-hidden="true"
          style={{ display: "none" }}
        />
      )}
    </AXStateContext.Provider>
  )
}

// =============================================================================
// HELPERS
// =============================================================================

function buildStateGraph(
  user: AXUser,
  workspace: AXWorkspace,
  pathname: string,
  activeModal: string | null,
  activeDrawer: AXCurrentView["activeDrawer"],
  staleness?: AXStalenessOverview,
  relationships?: AXRelationshipMap,
  userPatterns?: AXUserPatterns,
  scratchpad?: AXScratchpadSummary,
  quietSignals?: AXQuietSignals | null
): AXStateGraph {
  return {
    timestamp: new Date().toISOString(),
    user,
    workspace,
    currentView: {
      page: pathname,
      activeModal,
      activeDrawer,
    },
    staleness,
    relationships,
    userPatterns,
    scratchpad,
    quietSignals: quietSignals || undefined,
  }
}

