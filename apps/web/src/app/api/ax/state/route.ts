import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { fetchAXExtendedData, buildAXUser } from "@/lib/ax"
import type { AXStateGraph } from "@/lib/ax"

export const dynamic = "force-dynamic"

/**
 * GET /api/ax/state
 *
 * Returns the complete AX state graph for the current user.
 * This endpoint is designed for AI agents that prefer fetching over DOM parsing.
 */
export async function GET() {
  try {
    const user = await requireUser()

    // Fetch extended workspace data (workspace + staleness + relationships)
    const { workspace, staleness, relationships } = await fetchAXExtendedData(user.id)

    // Build user data
    const axUser = buildAXUser(user)

    // Build state graph
    const stateGraph: AXStateGraph = {
      timestamp: new Date().toISOString(),
      user: axUser,
      workspace,
      currentView: {
        // API calls don't have view context - agents should use DOM for this
        page: "/unknown",
        activeModal: null,
        activeDrawer: null,
      },
      staleness,
      relationships,
    }

    return NextResponse.json(stateGraph, {
      headers: {
        // Short cache for fresh data, but allow conditional requests
        "Cache-Control": "private, max-age=5, stale-while-revalidate=30",
      },
    })
  } catch (error) {
    console.error("[AX State API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch AX state" },
      { status: 500 }
    )
  }
}
