// =============================================================================
// Comment API - Individual Comment Operations
// =============================================================================
//
// GET /api/comments/:id - Get a single comment
// PATCH /api/comments/:id - Update a comment
// DELETE /api/comments/:id - Delete a comment
//
// =============================================================================

import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { getComment, updateComment, deleteComment } from "@/lib/comments"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser()
    const { id } = await params

    const comment = await getComment(id)

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("[Comments] GET error:", error)
    return NextResponse.json(
      { error: "Failed to get comment" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params
    const body = await request.json()

    const { content } = body as { content: string }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    const comment = await updateComment(id, user.id, content.trim())

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found or unauthorized" },
        { status: 404 }
      )
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("[Comments] PATCH error:", error)
    return NextResponse.json(
      { error: "Failed to update comment" },
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

    const deleted = await deleteComment(id, user.id)

    if (!deleted) {
      return NextResponse.json(
        { error: "Comment not found or unauthorized" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Comments] DELETE error:", error)
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    )
  }
}
