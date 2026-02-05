"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { getInboxFolderId } from "@/lib/seed-folders"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function createNote(formData: FormData) {
  const user = await requireUser()

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const projectId = formData.get("projectId") as string | null

  if (!title || !content) {
    throw new Error("Title and content are required")
  }

  // Get inbox folder (creates folders if needed)
  const inboxFolderId = await getInboxFolderId(user.id)

  // Generate unique slug
  const baseSlug = generateSlug(title)
  let slug = baseSlug
  let counter = 1

  while (await db.note.findFirst({ where: { userId: user.id, slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  const note = await db.note.create({
    data: {
      userId: user.id,
      title,
      slug,
      content,
      projectId: projectId || null,
      folderId: inboxFolderId, // New notes go to Inbox
    },
  })

  revalidatePath("/notes")
  if (projectId) {
    const project = await db.project.findUnique({ where: { id: projectId } })
    if (project) {
      revalidatePath(`/projects/${project.slug}`)
    }
  }
  redirect(`/notes/${note.slug}`)
}

export async function updateNote(slug: string, formData: FormData) {
  const user = await requireUser()

  const note = await db.note.findFirst({
    where: { slug, userId: user.id },
  })

  if (!note) {
    throw new Error("Note not found")
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const projectId = formData.get("projectId") as string | null
  const folderId = formData.get("folderId") as string | null
  const tagsJson = formData.get("tags") as string | null

  // Parse tags
  let tags: string[] = []
  if (tagsJson) {
    try {
      tags = JSON.parse(tagsJson)
    } catch {
      tags = []
    }
  }

  // Generate new slug if title changed
  let newSlug = note.slug
  if (title && title !== note.title) {
    const baseSlug = generateSlug(title)
    newSlug = baseSlug
    let counter = 1

    while (await db.note.findFirst({ where: { userId: user.id, slug: newSlug, id: { not: note.id } } })) {
      newSlug = `${baseSlug}-${counter}`
      counter++
    }
  }

  // Check if folder is being manually changed
  const folderChanged = folderId && folderId !== note.folderId

  await db.note.update({
    where: { id: note.id },
    data: {
      title: title || note.title,
      slug: newSlug,
      content: content || note.content,
      projectId: projectId || null,
      tags: tags,
      ...(folderId ? { folderId } : {}),
      ...(folderChanged ? { wasManuallyMoved: true } : {}),
    },
  })

  revalidatePath("/notes")
  revalidatePath(`/notes/${slug}`)
  if (newSlug !== slug) {
    redirect(`/notes/${newSlug}`)
  }
}

export async function deleteNote(slug: string) {
  const user = await requireUser()

  const note = await db.note.findFirst({
    where: { slug, userId: user.id },
  })

  if (!note) {
    throw new Error("Note not found")
  }

  await db.note.delete({
    where: { id: note.id },
  })

  revalidatePath("/notes")
  redirect("/notes")
}

export async function toggleNotePin(slug: string) {
  const user = await requireUser()

  const note = await db.note.findFirst({
    where: { slug, userId: user.id },
  })

  if (!note) {
    throw new Error("Note not found")
  }

  await db.note.update({
    where: { id: note.id },
    data: { isPinned: !note.isPinned },
  })

  revalidatePath("/notes")
  revalidatePath(`/notes/${slug}`)
}

// Quick create note from anywhere
export async function quickCreateNote(title: string, content: string, projectId?: string, tags?: string[]) {
  const user = await requireUser()

  // Get inbox folder (creates folders if needed)
  const inboxFolderId = await getInboxFolderId(user.id)

  const baseSlug = generateSlug(title)
  let slug = baseSlug
  let counter = 1

  while (await db.note.findFirst({ where: { userId: user.id, slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  const note = await db.note.create({
    data: {
      userId: user.id,
      title,
      slug,
      content,
      projectId: projectId || null,
      tags: tags || [],
      folderId: inboxFolderId, // New notes go to Inbox
    },
  })

  revalidatePath("/notes")
  return note
}

// Quick create idea - minimal input, auto-generated title, "idea" tag
export async function quickCreateIdea(content: string) {
  const user = await requireUser()

  // Get inbox folder (creates folders if needed)
  const inboxFolderId = await getInboxFolderId(user.id)

  // Generate title from first line or first ~50 chars
  const firstLine = content.split("\n")[0].trim()
  let title = firstLine.slice(0, 50)
  if (firstLine.length > 50) title += "..."
  if (!title) title = "Quick Idea"

  const baseSlug = generateSlug(title)
  let slug = baseSlug
  let counter = 1

  while (await db.note.findFirst({ where: { userId: user.id, slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  const note = await db.note.create({
    data: {
      userId: user.id,
      title,
      slug,
      content,
      tags: ["idea"],
      folderId: inboxFolderId,
    },
  })

  revalidatePath("/notes")
  return note
}

// Quick create URL reference - saves URL with optional notes
export async function quickCreateUrlReference(url: string, title: string, notes?: string) {
  const user = await requireUser()

  // Get inbox folder (creates folders if needed)
  const inboxFolderId = await getInboxFolderId(user.id)

  // Build content with URL and optional notes
  let content = `**URL:** ${url}\n\n`
  if (notes) {
    content += `**Notes:**\n${notes}`
  }

  const baseSlug = generateSlug(title)
  let slug = baseSlug
  let counter = 1

  while (await db.note.findFirst({ where: { userId: user.id, slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  const note = await db.note.create({
    data: {
      userId: user.id,
      title,
      slug,
      content,
      tags: ["reference"],
      folderId: inboxFolderId,
    },
  })

  revalidatePath("/notes")
  return note
}

// Get notes tagged with "meeting" or "call" for the Calls page
export async function getMeetingNotes() {
  const user = await requireUser()

  // Prisma JSON array contains query for PostgreSQL
  const notes = await db.note.findMany({
    where: {
      userId: user.id,
      OR: [
        { tags: { array_contains: ["meeting"] } },
        { tags: { array_contains: ["call"] } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      project: { select: { id: true, name: true, slug: true } },
    },
  })

  return notes
}

// Organize a note using AI
export async function organizeNote(noteId: string): Promise<{
  success: boolean
  folderId?: string
  folderName?: string
  confidence?: number
  reasoning?: string
  autoMoved?: boolean
  error?: string
}> {
  const user = await requireUser()

  // Verify note belongs to user
  const note = await db.note.findFirst({
    where: { id: noteId, userId: user.id },
  })

  if (!note) {
    return { success: false, error: "Note not found" }
  }

  try {
    // Call the organize API internally
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/notes/organize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error || "Failed to organize" }
    }

    const result = await response.json()
    revalidatePath("/notes")

    return {
      success: true,
      folderId: result.folderId,
      folderName: result.folderName,
      confidence: result.confidence,
      reasoning: result.reasoning,
      autoMoved: result.autoMoved,
    }
  } catch (error) {
    console.error("Failed to organize note:", error)
    return { success: false, error: "Failed to organize note" }
  }
}
