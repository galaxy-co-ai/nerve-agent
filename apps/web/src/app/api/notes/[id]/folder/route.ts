import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { z } from "zod"

const moveSchema = z.object({
  folderId: z.string(),
  wasAiSuggestion: z.boolean().optional(),
})

const confirmSchema = z.object({
  confirm: z.literal(true),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PUT /api/notes/[id]/folder
 *
 * Move a note to a different folder.
 * If wasAiSuggestion is true, we track this as a correction.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser()
    const { id: noteId } = await params
    const body = await request.json()
    const data = moveSchema.parse(body)

    // Get the note with current folder
    const note = await db.note.findFirst({
      where: { id: noteId, userId: user.id },
      select: {
        id: true,
        folderId: true,
        aiConfidence: true,
        folder: { select: { id: true, name: true } },
      },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // Verify target folder belongs to user
    const targetFolder = await db.noteFolder.findFirst({
      where: { id: data.folderId, userId: user.id },
      select: { id: true, name: true, slug: true },
    })

    if (!targetFolder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    // Track correction if this was an AI suggestion being overridden
    if (data.wasAiSuggestion && note.folderId && note.folderId !== data.folderId) {
      await db.noteFolderCorrection.create({
        data: {
          userId: user.id,
          noteId: note.id,
          fromFolderId: note.folderId,
          toFolderId: data.folderId,
          fromFolderName: note.folder?.name || "Unknown",
          toFolderName: targetFolder.name,
          aiConfidence: note.aiConfidence || 0,
        },
      })
    }

    // Move the note
    await db.note.update({
      where: { id: noteId },
      data: {
        folderId: data.folderId,
        wasManuallyMoved: true,
      },
    })

    return NextResponse.json({
      success: true,
      folder: targetFolder,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Failed to move note:", error)
    return NextResponse.json(
      { error: "Failed to move note" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notes/[id]/folder
 *
 * Confirm AI's folder suggestion without changing it.
 * Marks the note as no longer needing manual confirmation.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser()
    const { id: noteId } = await params
    const body = await request.json()
    confirmSchema.parse(body)

    // Get the note
    const note = await db.note.findFirst({
      where: { id: noteId, userId: user.id },
      select: { id: true, folderId: true },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // Just mark as manually confirmed (keeps AI's choice)
    await db.note.update({
      where: { id: noteId },
      data: {
        wasManuallyMoved: false, // AI was correct, not a manual override
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Failed to confirm organization:", error)
    return NextResponse.json(
      { error: "Failed to confirm organization" },
      { status: 500 }
    )
  }
}
