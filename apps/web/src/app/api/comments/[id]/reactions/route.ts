// =============================================================================
// Comment Reactions API
// =============================================================================
//
// POST /api/comments/:id/reactions - Add a reaction
// DELETE /api/comments/:id/reactions - Remove a reaction
//
// =============================================================================

import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { addReaction, removeReaction } from "@/lib/comments"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params
    const body = await request.json()

    const { emoji } = body as { emoji: string }

    if (!emoji) {
      return NextResponse.json(
        { error: "Emoji is required" },
        { status: 400 }
      )
    }

    const comment = await addReaction(id, user.id, emoji)

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("[Reactions] POST error:", error)
    return NextResponse.json(
      { error: "Failed to add reaction" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params
    const { searchParams } = new URL(request.url)

    const emoji = searchParams.get("emoji")

    if (!emoji) {
      return NextResponse.json(
        { error: "Emoji query parameter is required" },
        { status: 400 }
      )
    }

    const comment = await removeReaction(id, user.id, emoji)

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("[Reactions] DELETE error:", error)
    return NextResponse.json(
      { error: "Failed to remove reaction" },
      { status: 500 }
    )
  }
}
