import { NextResponse } from "next/server"
import { backfillNoteFoldersForAllUsers } from "@/lib/seed-folders"

/**
 * POST /api/admin/backfill-folders
 *
 * Backfills default note folders for all existing users who don't have them.
 * Should be run once after deploying the Smart Folders feature.
 */
export async function POST() {
  try {
    const backfilledCount = await backfillNoteFoldersForAllUsers()

    return NextResponse.json({
      success: true,
      message: `Backfilled folders for ${backfilledCount} user(s)`,
      backfilledCount,
    })
  } catch (error) {
    console.error("Failed to backfill folders:", error)
    return NextResponse.json(
      { success: false, error: "Failed to backfill folders" },
      { status: 500 }
    )
  }
}
