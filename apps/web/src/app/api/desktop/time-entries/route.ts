// =============================================================================
// Desktop API - Time Entries
// =============================================================================
// GET time entries, POST sync new entries

import { NextRequest, NextResponse } from "next/server"
import { getTimeEntriesForDesktop, syncTimeEntries } from "@/lib/actions/desktop-sync"

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

// GET - Fetch time entries for desktop
export async function GET(request: NextRequest) {
  try {
    const authToken = getAuthToken(request)

    if (!authToken) {
      return NextResponse.json(
        { error: "Missing authorization" },
        { status: 401 }
      )
    }

    // Parse optional query params
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId") || undefined
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = searchParams.get("limit")

    const entries = await getTimeEntriesForDesktop(authToken, {
      projectId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    })

    return NextResponse.json({ entries })
  } catch (error) {
    console.error("Get time entries error:", error)

    if (error instanceof Error && error.message === "Invalid auth token") {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to get time entries", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// POST - Sync time entries from desktop
export async function POST(request: NextRequest) {
  try {
    const authToken = getAuthToken(request)

    if (!authToken) {
      return NextResponse.json(
        { error: "Missing authorization" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { entries } = body as {
      entries: Array<{
        id?: string
        projectId: string
        taskId?: string
        startTime: string
        endTime?: string
        durationMinutes: number
        source: "AUTO" | "MANUAL" | "ADJUSTED"
        appName?: string
        windowTitle?: string
        description?: string
        billable?: boolean
      }>
    }

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: "Missing or invalid entries array" },
        { status: 400 }
      )
    }

    // Convert date strings to Date objects
    const processedEntries = entries.map((entry) => ({
      ...entry,
      startTime: new Date(entry.startTime),
      endTime: entry.endTime ? new Date(entry.endTime) : undefined,
    }))

    const result = await syncTimeEntries(authToken, processedEntries)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Time entries sync error:", error)

    if (error instanceof Error && error.message === "Invalid auth token") {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Sync failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
