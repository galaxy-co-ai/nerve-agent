import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { z } from "zod"

const createFolderSchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string().optional(),
  color: z.string().optional(),
})

/**
 * GET /api/folders
 * List all folders for the current user with note counts
 */
export async function GET() {
  try {
    const user = await requireUser()

    const folders = await db.noteFolder.findMany({
      where: { userId: user.id },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    })

    return NextResponse.json(
      folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        slug: folder.slug,
        icon: folder.icon,
        color: folder.color,
        isSystem: folder.isSystem,
        order: folder.order,
        noteCount: folder._count.notes,
      }))
    )
  } catch (error) {
    console.error("Failed to fetch folders:", error)
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/folders
 * Create a new custom folder
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const body = await request.json()
    const data = createFolderSchema.parse(body)

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    // Check for duplicate slug
    const existing = await db.noteFolder.findFirst({
      where: { userId: user.id, slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: "A folder with this name already exists" },
        { status: 400 }
      )
    }

    // Get the highest order number (excluding archive at 99)
    const highestOrder = await db.noteFolder.findFirst({
      where: { userId: user.id, order: { lt: 99 } },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = (highestOrder?.order ?? 5) + 1

    const folder = await db.noteFolder.create({
      data: {
        userId: user.id,
        name: data.name,
        slug,
        icon: data.icon || "folder",
        color: data.color,
        isSystem: false,
        order: newOrder,
      },
    })

    return NextResponse.json({
      id: folder.id,
      name: folder.name,
      slug: folder.slug,
      icon: folder.icon,
      color: folder.color,
      isSystem: folder.isSystem,
      order: folder.order,
      noteCount: 0,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid folder data", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Failed to create folder:", error)
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    )
  }
}
