import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { z } from "zod"

const reorderSchema = z.object({
  folderIds: z.array(z.string()).min(1),
})

/**
 * PATCH /api/folders/reorder
 * Reorder folders by providing an array of folder IDs in the desired order.
 * System folders (except archive) can be reordered. Archive stays at position 99.
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser()
    const body = await request.json()
    const data = reorderSchema.parse(body)

    // Verify all folders belong to the user
    const folders = await db.noteFolder.findMany({
      where: {
        userId: user.id,
        id: { in: data.folderIds },
      },
      select: { id: true, slug: true },
    })

    if (folders.length !== data.folderIds.length) {
      return NextResponse.json(
        { error: "Some folders not found" },
        { status: 400 }
      )
    }

    // Update order for each folder
    // Archive folder always stays at order 99
    const updates = data.folderIds.map((id, index) => {
      const folder = folders.find((f) => f.id === id)
      const order = folder?.slug === "archive" ? 99 : index

      return db.noteFolder.update({
        where: { id },
        data: { order },
      })
    })

    await db.$transaction(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Failed to reorder folders:", error)
    return NextResponse.json(
      { error: "Failed to reorder folders" },
      { status: 500 }
    )
  }
}
