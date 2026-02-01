// =============================================================================
// Desktop API - Sync Status
// =============================================================================
// Get current sync status and counts for desktop app

import { NextRequest, NextResponse } from "next/server"
import { getSyncStatus } from "@/lib/actions/desktop-sync"
import { db } from "@/lib/db"

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

    // Get device to find user
    const device = await db.desktopDevice.findUnique({
      where: { authToken },
      select: { userId: true },
    })

    if (!device) {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      )
    }

    // Get counts for desktop sync status display
    const [projectCount, taskCount, noteCount] = await Promise.all([
      db.project.count({
        where: {
          userId: device.userId,
          status: { in: ["ACTIVE", "PLANNING"] },
        },
      }),
      db.task.count({
        where: {
          sprint: {
            project: { userId: device.userId },
            status: "IN_PROGRESS",
          },
          status: { in: ["TODO", "IN_PROGRESS"] },
        },
      }),
      db.note.count({
        where: { userId: device.userId },
      }),
    ])

    // Also get the detailed sync status
    const syncStatus = await getSyncStatus(authToken)

    return NextResponse.json({
      projects: projectCount,
      tasks: taskCount,
      notes: noteCount,
      ...syncStatus,
    })
  } catch (error) {
    console.error("Sync status error:", error)

    if (error instanceof Error && error.message === "Invalid auth token") {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to get sync status", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
