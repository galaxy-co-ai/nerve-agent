import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

// Create a new note
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const { title, content, projectId, tags } = await request.json()

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    // Generate slug from title
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Ensure unique slug for this user
    let slug = baseSlug
    let counter = 1
    while (
      await db.note.findUnique({
        where: { userId_slug: { userId: user.id, slug } },
      })
    ) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const note = await db.note.create({
      data: {
        userId: user.id,
        title: title.trim(),
        content: content.trim(),
        slug,
        projectId: projectId && projectId !== "none" ? projectId : null,
        tags: tags || [],
      },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error("Create note error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create note" },
      { status: 500 }
    )
  }
}

// Get all notes for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser()
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("project")
    const q = searchParams.get("q")

    const notes = await db.note.findMany({
      where: {
        userId: user.id,
        ...(projectId ? { projectId } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      include: {
        project: { select: { id: true, name: true, slug: true } },
      },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Get notes error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get notes" },
      { status: 500 }
    )
  }
}
