import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

type RouteContext = { params: Promise<{ slug: string }> }

// Get all workspace notes for a project
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug } = await context.params
    const { searchParams } = new URL(request.url)
    const checkpointId = searchParams.get("checkpoint")

    const project = await db.project.findFirst({
      where: { slug, userId: user.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const notes = await db.projectWorkspaceNote.findMany({
      where: {
        projectId: project.id,
        ...(checkpointId ? { checkpointId } : {}),
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Get workspace notes error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get workspace notes" },
      { status: 500 }
    )
  }
}

// Create a workspace note
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug } = await context.params
    const { content, author, checkpointId } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    if (!author || !["user", "claude"].includes(author)) {
      return NextResponse.json(
        { error: "Author must be 'user' or 'claude'" },
        { status: 400 }
      )
    }

    const project = await db.project.findFirst({
      where: { slug, userId: user.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const note = await db.projectWorkspaceNote.create({
      data: {
        projectId: project.id,
        content: content.trim(),
        author,
        checkpointId: checkpointId || null,
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error("Create workspace note error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create workspace note" },
      { status: 500 }
    )
  }
}

// Delete a workspace note
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug } = await context.params
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get("id")

    if (!noteId) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 })
    }

    const project = await db.project.findFirst({
      where: { slug, userId: user.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Verify note belongs to this project
    const note = await db.projectWorkspaceNote.findFirst({
      where: { id: noteId, projectId: project.id },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    await db.projectWorkspaceNote.delete({
      where: { id: noteId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete workspace note error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete workspace note" },
      { status: 500 }
    )
  }
}
