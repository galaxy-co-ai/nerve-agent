// =============================================================================
// Comments API - CRUD Operations
// =============================================================================
//
// POST /api/comments - Create a new comment
// GET /api/comments?entityType=&entityId= - List comments for an entity
//
// =============================================================================

import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import {
  createComment,
  getComments,
  CommentEntityType,
} from "@/lib/comments"

export async function POST(request: Request) {
  try {
    const user = await requireUser()
    const body = await request.json()

    const { entityType, entityId, content, parentId } = body as {
      entityType: CommentEntityType
      entityId: string
      content: string
      parentId?: string | null
    }

    // Validation
    if (!entityType || !entityId || !content?.trim()) {
      return NextResponse.json(
        { error: "entityType, entityId, and content are required" },
        { status: 400 }
      )
    }

    // Validate entityType
    const validTypes: CommentEntityType[] = [
      "project",
      "deliverable",
      "feedback",
      "activity",
      "blocker",
    ]
    if (!validTypes.includes(entityType)) {
      return NextResponse.json(
        { error: `Invalid entityType. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      )
    }

    const comment = await createComment({
      userId: user.id,
      entityType,
      entityId,
      content: content.trim(),
      parentId,
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("[Comments] Create error:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    await requireUser()
    const { searchParams } = new URL(request.url)

    const entityType = searchParams.get("entityType") as CommentEntityType | null
    const entityId = searchParams.get("entityId")
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const cursor = searchParams.get("cursor") || undefined
    const includeReplies = searchParams.get("includeReplies") !== "false"

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "entityType and entityId are required" },
        { status: 400 }
      )
    }

    const comments = await getComments(entityType, entityId, {
      limit,
      cursor,
      includeReplies,
    })

    return NextResponse.json({
      comments,
      count: comments.length,
      hasMore: comments.length === limit,
    })
  } catch (error) {
    console.error("[Comments] GET error:", error)
    return NextResponse.json(
      { error: "Failed to get comments" },
      { status: 500 }
    )
  }
}
