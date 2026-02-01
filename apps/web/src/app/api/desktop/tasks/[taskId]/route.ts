// =============================================================================
// Desktop API - Single Task
// =============================================================================
// PATCH individual task status/hours

import { NextRequest, NextResponse } from "next/server"
import { updateTaskForDesktop } from "@/lib/actions/desktop-sync"

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const authToken = getAuthToken(request)

    if (!authToken) {
      return NextResponse.json(
        { error: "Missing authorization" },
        { status: 401 }
      )
    }

    const { taskId } = await params

    const body = await request.json()
    const { status, actualHours } = body as {
      status?: "TODO" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED"
      actualHours?: number
    }

    if (!status && actualHours === undefined) {
      return NextResponse.json(
        { error: "No update fields provided" },
        { status: 400 }
      )
    }

    const task = await updateTaskForDesktop(authToken, taskId, { status, actualHours })

    return NextResponse.json({ task })
  } catch (error) {
    console.error("Task update error:", error)

    if (error instanceof Error && error.message === "Invalid auth token") {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Update failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
