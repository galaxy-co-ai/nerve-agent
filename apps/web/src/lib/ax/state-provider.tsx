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

// =============================================================================
// CONTEXT
// =============================================================================

interface AXStateContextType {
  stateGraph: AXStateGraph
  setActiveModal: (modal: string | null) => void
  setActiveDrawer: (drawer: AXCurrentView["activeDrawer"]) => void
  updateWorkspace: (partial: Partial<AXWorkspace>) => void
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
  const [user] = useState<AXUser>(initialUser)
  const [workspace, setWorkspace] = useState<AXWorkspace>(initialWorkspace)
  const [staleness] = useState<AXStalenessOverview | undefined>(initialStaleness)
  const [relationships] = useState<AXRelationshipMap | undefined>(initialRelationships)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [activeDrawer, setActiveDrawer] = useState<AXCurrentView["activeDrawer"]>(null)

  // Debounce state graph updates
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [stateGraph, setStateGraph] = useState<AXStateGraph>(() =>
    buildStateGraph(user, workspace, pathname, activeModal, activeDrawer, staleness, relationships)
  )

  // Update state graph when dependencies change (debounced)
  useEffect(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    updateTimeoutRef.current = setTimeout(() => {
      setStateGraph(buildStateGraph(user, workspace, pathname, activeModal, activeDrawer, staleness, relationships))
    }, 150) // 150ms debounce

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [user, workspace, pathname, activeModal, activeDrawer, staleness, relationships])

  const updateWorkspace = useCallback((partial: Partial<AXWorkspace>) => {
    setWorkspace((prev) => ({ ...prev, ...partial }))
  }, [])

  return (
    <AXStateContext.Provider
      value={{
        stateGraph,
        setActiveModal,
        setActiveDrawer,
        updateWorkspace,
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
  relationships?: AXRelationshipMap
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
  }
}

