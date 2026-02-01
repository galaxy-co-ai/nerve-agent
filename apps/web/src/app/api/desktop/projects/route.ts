// =============================================================================
// Desktop API - Projects
// =============================================================================
// GET user's projects for desktop app

import { NextRequest, NextResponse } from "next/server"
import { getProjectsForDesktop } from "@/lib/actions/desktop-sync"

// Helper to extract auth token from either header format
function getAuthToken(request: NextRequest): string | null {
  // Try X-Nerve-Token first (desktop client format)
  const nerveToken = request.headers.get("X-Nerve-Token")
  if (nerveToken) return nerveToken

  // Fall back to Authorization: Bearer format
  const authHeader = request.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "")
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const authToken = getAuthToken(request)

    if (!authToken) {
      return NextResponse.json(
        { error: "Missing authorization" },
        { status: 401 }
      )
    }

    const projects = await getProjectsForDesktop(authToken)

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Get projects error:", error)

    if (error instanceof Error && error.message === "Invalid auth token") {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to get projects", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
