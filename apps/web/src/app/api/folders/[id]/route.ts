import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * DELETE /api/folders/[id]
 * Delete a custom folder. System folders cannot be deleted.
 * Notes in the folder are moved to Inbox.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireUser()
    const { id: folderId } = await params

    // Get the folder
    const folder = await db.noteFolder.findFirst({
      where: { id: folderId, userId: user.id },
      include: {
        _count: { select: { notes: true } },
      },
    })

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    // System folders cannot be deleted
    if (folder.isSystem) {
      return NextResponse.json(
        { error: "System folders cannot be deleted" },
        { status: 400 }
      )
    }

    // Get user's inbox folder to move notes to
    const inboxFolder = await db.noteFolder.findFirst({
      where: { userId: user.id, slug: "inbox" },
      select: { id: true },
    })

    if (!inboxFolder) {
      return NextResponse.json(
        { error: "Inbox folder not found" },
        { status: 500 }
      )
    }

    // Move all notes to inbox, then delete the folder
    await db.$transaction([
      db.note.updateMany({
        where: { folderId: folderId },
        data: { folderId: inboxFolder.id },
      }),
      db.noteFolder.delete({
        where: { id: folderId },
      }),
    ])

    return NextResponse.json({
      success: true,
      movedNotes: folder._count.notes,
    })
  } catch (error) {
    console.error("Failed to delete folder:", error)
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    )
  }
}
