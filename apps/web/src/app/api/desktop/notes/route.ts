// =============================================================================
// Desktop API - Notes
// =============================================================================
// GET notes list, POST create new note

import { NextRequest, NextResponse } from "next/server"
import { getNotesForDesktop, createNoteForDesktop } from "@/lib/actions/desktop-sync"

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

// GET - Fetch notes for desktop
export async function GET(request: NextRequest) {
  try {
    const authToken = getAuthToken(request)

    if (!authToken) {
      return NextResponse.json(
        { error: "Missing authorization" },
        { status: 401 }
      )
    }

    const notes = await getNotesForDesktop(authToken)

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Get notes error:", error)

    if (error instanceof Error && error.message === "Invalid auth token") {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to get notes", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// POST - Create new note from desktop
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
    const { title, content, projectId } = body as {
      title: string
      content: string
      projectId?: string
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    const note = await createNoteForDesktop(authToken, { title, content, projectId })

    return NextResponse.json({ note })
  } catch (error) {
    console.error("Create note error:", error)

    if (error instanceof Error && error.message === "Invalid auth token") {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create note", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
