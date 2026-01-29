import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function POST(request: Request) {
  try {
    const user = await requireUser()

    const { notes } = await request.json()

    if (!Array.isArray(notes) || notes.length === 0) {
      return NextResponse.json(
        { error: "Notes array is required" },
        { status: 400 }
      )
    }

    // Get existing slugs to avoid conflicts
    const existingSlugs = await db.note.findMany({
      where: { userId: user.id },
      select: { slug: true },
    })
    const slugSet = new Set(existingSlugs.map((n) => n.slug))

    // Create all notes
    const createdNotes = []

    for (const note of notes) {
      const { title, content, tag } = note

      if (!title || !content) continue

      // Generate unique slug
      let baseSlug = generateSlug(title)
      let slug = baseSlug
      let counter = 1

      while (slugSet.has(slug)) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
      slugSet.add(slug)

      const created = await db.note.create({
        data: {
          userId: user.id,
          title: String(title).slice(0, 200),
          slug,
          content: String(content),
          tags: tag ? [tag] : [],
        },
      })

      createdNotes.push(created)
    }

    return NextResponse.json({
      created: createdNotes.length,
      notes: createdNotes,
    })
  } catch (error) {
    console.error("Error creating notes:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create notes" },
      { status: 500 }
    )
  }
}
