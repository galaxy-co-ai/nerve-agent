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
import type { AXStateGraph, AXWorkspace, AXUser, AXCurrentView } from "./types"

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
}

// =============================================================================
// PROVIDER
// =============================================================================

export function AXStateProvider({
  children,
  initialUser,
  initialWorkspace,
}: AXStateProviderProps) {
  const pathname = usePathname()
  const [user] = useState<AXUser>(initialUser)
  const [workspace, setWorkspace] = useState<AXWorkspace>(initialWorkspace)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [activeDrawer, setActiveDrawer] = useState<AXCurrentView["activeDrawer"]>(null)

  // Debounce state graph updates
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [stateGraph, setStateGraph] = useState<AXStateGraph>(() =>
    buildStateGraph(user, workspace, pathname, activeModal, activeDrawer)
  )

  // Update state graph when dependencies change (debounced)
  useEffect(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    updateTimeoutRef.current = setTimeout(() => {
      setStateGraph(buildStateGraph(user, workspace, pathname, activeModal, activeDrawer))
    }, 150) // 150ms debounce

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [user, workspace, pathname, activeModal, activeDrawer])

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
  activeDrawer: AXCurrentView["activeDrawer"]
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
  }
}

// =============================================================================
// SERVER-SIDE HELPERS FOR FETCHING INITIAL DATA
// =============================================================================

import { db } from "@/lib/db"

export async function fetchAXWorkspaceData(userId: string): Promise<AXWorkspace> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Fetch all data in parallel
  const [
    projects,
    notes,
    notesByTag,
    untaggedNotes,
    calls,
    pendingBriefCalls,
    recentCalls,
    designSystems,
    blocks,
    patterns,
    queries,
  ] = await Promise.all([
    // Projects with blocker and task counts
    db.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { blockers: { where: { status: "ACTIVE" } } },
        },
        sprints: {
          include: {
            _count: {
              select: { tasks: true },
            },
            tasks: {
              select: { status: true },
            },
          },
        },
      },
    }),
    // Notes total
    db.note.count({ where: { userId } }),
    // Notes by tag (simplified - get all notes with tags that aren't empty)
    db.note.findMany({
      where: { userId, NOT: { tags: { equals: [] } } },
      select: { tags: true },
    }),
    // Untagged notes (tags = empty array)
    db.note.count({ where: { userId, tags: { equals: [] } } }),
    // Calls total
    db.call.count({ where: { userId } }),
    // Calls with summary not yet generated (no summary = pending brief)
    db.call.count({ where: { userId, summary: null } }),
    // Recent calls (last 7 days)
    db.call.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
    // Library counts
    db.designSystem.count({ where: { userId } }),
    db.libraryItem.count({ where: { userId, type: "BLOCK" } }),
    db.libraryItem.count({ where: { userId, type: "PATTERN" } }),
    db.libraryItem.count({ where: { userId, type: "QUERY" } }),
  ])

  // Process projects
  const mappedProjects = projects.map((p) => {
    const allTasks = p.sprints.flatMap((s) => s.tasks)
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter((t) => t.status === "COMPLETED").length
    const stuckTasks = allTasks.filter((t) => t.status === "BLOCKED").length

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      status: (p.status.toLowerCase() === "active"
        ? "active"
        : p.status.toLowerCase() === "paused"
          ? "paused"
          : "completed") as "active" | "paused" | "completed",
      lastActivity: p.updatedAt.toISOString(),
      hasBlockers: p._count.blockers > 0,
      blockerCount: p._count.blockers,
      taskCount: {
        total: totalTasks,
        completed: completedTasks,
        stuck: stuckTasks,
      },
    }
  })

  // Process tags - tags is Json type, cast to string[]
  const tagCounts: Record<string, number> = {}
  notesByTag.forEach((note) => {
    const tags = note.tags as string[] | null
    if (tags && Array.isArray(tags)) {
      tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    }
  })

  // Recent notes count
  const recentNotes = await db.note.count({
    where: { userId, updatedAt: { gte: sevenDaysAgo } },
  })

  return {
    projects: mappedProjects,
    inbox: {
      // We'll update this when we have actual inbox items
      pendingCount: 0,
      oldestItemAge: "0h",
      items: [],
    },
    notes: {
      total: notes,
      recentCount: recentNotes,
      untaggedCount: untaggedNotes,
      byTag: tagCounts,
    },
    calls: {
      total: calls,
      pendingBriefs: pendingBriefCalls,
      recentTranscripts: recentCalls,
    },
    library: {
      designSystems,
      blocks,
      patterns,
      queries,
    },
  }
}

export function buildAXUser(user: {
  id: string
  workingHoursStart: string | null
  workingHoursEnd: string | null
  theme?: string | null
  weekStartsOn?: number | null
}): AXUser {
  return {
    id: user.id,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    quietHours:
      user.workingHoursStart && user.workingHoursEnd
        ? null // Quiet hours are the inverse of working hours
        : null,
    preferences: {
      theme: user.theme || "dark",
      weekStartsOn: user.weekStartsOn || 1,
    },
  }
}
