import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

const STALE_DAYS = 90

/**
 * POST /api/notes/auto-archive
 * Automatically archive notes that haven't been updated in 90+ days.
 * Notes already in Archive folder are skipped.
 */
export async function POST() {
  try {
    const user = await requireUser()

    // Get user's archive folder
    const archiveFolder = await db.noteFolder.findFirst({
      where: { userId: user.id, slug: "archive" },
      select: { id: true },
    })

    if (!archiveFolder) {
      return NextResponse.json(
        { error: "Archive folder not found" },
        { status: 500 }
      )
    }

    // Calculate the cutoff date (90 days ago)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - STALE_DAYS)

    // Find stale notes not already in archive
    const staleNotes = await db.note.findMany({
      where: {
        userId: user.id,
        updatedAt: { lt: cutoffDate },
        folderId: { not: archiveFolder.id },
      },
      select: { id: true, title: true },
    })

    if (staleNotes.length === 0) {
      return NextResponse.json({
        success: true,
        archivedCount: 0,
        message: "No stale notes to archive",
      })
    }

    // Move stale notes to archive
    await db.note.updateMany({
      where: {
        id: { in: staleNotes.map((n) => n.id) },
      },
      data: {
        folderId: archiveFolder.id,
      },
    })

    return NextResponse.json({
      success: true,
      archivedCount: staleNotes.length,
      archivedNotes: staleNotes.map((n) => ({ id: n.id, title: n.title })),
    })
  } catch (error) {
    console.error("Failed to auto-archive notes:", error)
    return NextResponse.json(
      { error: "Failed to auto-archive notes" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/notes/auto-archive
 * Preview which notes would be archived (dry run).
 */
export async function GET() {
  try {
    const user = await requireUser()

    // Get user's archive folder
    const archiveFolder = await db.noteFolder.findFirst({
      where: { userId: user.id, slug: "archive" },
      select: { id: true },
    })

    if (!archiveFolder) {
      return NextResponse.json(
        { error: "Archive folder not found" },
        { status: 500 }
      )
    }

    // Calculate the cutoff date (90 days ago)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - STALE_DAYS)

    // Find stale notes not already in archive
    const staleNotes = await db.note.findMany({
      where: {
        userId: user.id,
        updatedAt: { lt: cutoffDate },
        folderId: { not: archiveFolder.id },
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        folder: { select: { name: true } },
      },
      orderBy: { updatedAt: "asc" },
    })

    return NextResponse.json({
      staleDays: STALE_DAYS,
      cutoffDate: cutoffDate.toISOString(),
      count: staleNotes.length,
      notes: staleNotes.map((n) => ({
        id: n.id,
        title: n.title,
        lastUpdated: n.updatedAt.toISOString(),
        currentFolder: n.folder?.name || "Inbox",
      })),
    })
  } catch (error) {
    console.error("Failed to preview stale notes:", error)
    return NextResponse.json(
      { error: "Failed to preview stale notes" },
      { status: 500 }
    )
  }
}
