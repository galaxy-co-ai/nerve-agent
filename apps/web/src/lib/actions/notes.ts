"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

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

  // Generate unique slug
  let baseSlug = generateSlug(title)
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
    let baseSlug = generateSlug(title)
    newSlug = baseSlug
    let counter = 1

    while (await db.note.findFirst({ where: { userId: user.id, slug: newSlug, id: { not: note.id } } })) {
      newSlug = `${baseSlug}-${counter}`
      counter++
    }
  }

  await db.note.update({
    where: { id: note.id },
    data: {
      title: title || note.title,
      slug: newSlug,
      content: content || note.content,
      projectId: projectId || null,
      tags: tags,
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

  let baseSlug = generateSlug(title)
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
    },
  })

  revalidatePath("/notes")
  return note
}
