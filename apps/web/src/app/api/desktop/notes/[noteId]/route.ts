// =============================================================================
// Desktop API - Single Note
// =============================================================================
// PATCH update note content

import { NextRequest, NextResponse } from "next/server"
import { updateNoteForDesktop } from "@/lib/actions/desktop-sync"

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
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const authToken = getAuthToken(request)

    if (!authToken) {
      return NextResponse.json(
        { error: "Missing authorization" },
        { status: 401 }
      )
    }

    const { noteId } = await params

    const body = await request.json()
    const { title, content, projectId } = body as {
      title?: string
      content?: string
      projectId?: string | null
    }

    if (!title && content === undefined && projectId === undefined) {
      return NextResponse.json(
        { error: "No update fields provided" },
        { status: 400 }
      )
    }

    const note = await updateNoteForDesktop(authToken, noteId, { title, content, projectId })

    return NextResponse.json({ note })
  } catch (error) {
    console.error("Note update error:", error)

    if (error instanceof Error && error.message === "Invalid auth token") {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message === "Note not found") {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Update failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
