"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { LibraryItemType } from "@prisma/client"
import { formatLibraryItemName } from "@/lib/ai/format-library-name"

export async function createLibraryItem(formData: FormData) {
  const user = await requireUser()

  const rawTitle = formData.get("title") as string
  const description = formData.get("description") as string | null
  const code = formData.get("code") as string
  const language = formData.get("language") as string
  const type = formData.get("type") as LibraryItemType
  const projectId = formData.get("projectId") as string | null
  const tagIds = formData.getAll("tagIds") as string[]

  if (!rawTitle || !code || !language || !type) {
    throw new Error("Title, code, language, and type are required")
  }

  // AI formats the title to match naming conventions
  const title = await formatLibraryItemName(rawTitle, type)

  await db.libraryItem.create({
    data: {
      userId: user.id,
      title,
      description: description || null,
      code,
      language,
      type,
      projectId: projectId || null,
      tags: tagIds.length > 0 ? { connect: tagIds.map(id => ({ id })) } : undefined,
    },
  })

  revalidatePath("/library")
  revalidatePath(`/library/${type.toLowerCase()}s`)
}

export async function updateLibraryItem(itemId: string, formData: FormData) {
  const user = await requireUser()

  const item = await db.libraryItem.findFirst({
    where: { id: itemId, userId: user.id },
    include: { tags: true },
  })

  if (!item) {
    throw new Error("Library item not found")
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string | null
  const code = formData.get("code") as string
  const language = formData.get("language") as string
  const projectId = formData.get("projectId") as string | null
  const tagIds = formData.getAll("tagIds") as string[]

  await db.libraryItem.update({
    where: { id: itemId },
    data: {
      title: title || item.title,
      description: description ?? item.description,
      code: code || item.code,
      language: language || item.language,
      projectId: projectId || null,
      tags: {
        set: tagIds.map(id => ({ id })),
      },
    },
  })

  revalidatePath("/library")
  revalidatePath(`/library/${item.type.toLowerCase()}s`)
}

export async function deleteLibraryItem(itemId: string) {
  const user = await requireUser()

  const item = await db.libraryItem.findFirst({
    where: { id: itemId, userId: user.id },
  })

  if (!item) {
    throw new Error("Library item not found")
  }

  await db.libraryItem.delete({
    where: { id: itemId },
  })

  revalidatePath("/library")
  revalidatePath(`/library/${item.type.toLowerCase()}s`)
}

export async function toggleLibraryItemFavorite(itemId: string) {
  const user = await requireUser()

  const item = await db.libraryItem.findFirst({
    where: { id: itemId, userId: user.id },
  })

  if (!item) {
    throw new Error("Library item not found")
  }

  await db.libraryItem.update({
    where: { id: itemId },
    data: { isFavorite: !item.isFavorite },
  })

  revalidatePath("/library")
  revalidatePath(`/library/${item.type.toLowerCase()}s`)
}

export async function recordLibraryItemUsage(itemId: string) {
  const user = await requireUser()

  const item = await db.libraryItem.findFirst({
    where: { id: itemId, userId: user.id },
  })

  if (!item) {
    throw new Error("Library item not found")
  }

  await db.libraryItem.update({
    where: { id: itemId },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  })
}

// Tag management
export async function createLibraryTag(formData: FormData) {
  const user = await requireUser()

  const name = formData.get("name") as string
  const color = formData.get("color") as string | null

  if (!name) {
    throw new Error("Tag name is required")
  }

  // Check for existing tag
  const existing = await db.libraryTag.findFirst({
    where: { userId: user.id, name },
  })

  if (existing) {
    throw new Error("Tag already exists")
  }

  await db.libraryTag.create({
    data: {
      userId: user.id,
      name,
      color: color || "#6366f1",
    },
  })

  revalidatePath("/library")
}

export async function deleteLibraryTag(tagId: string) {
  const user = await requireUser()

  const tag = await db.libraryTag.findFirst({
    where: { id: tagId, userId: user.id },
  })

  if (!tag) {
    throw new Error("Tag not found")
  }

  await db.libraryTag.delete({
    where: { id: tagId },
  })

  revalidatePath("/library")
}
