"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import type { Prisma } from "@prisma/client"

// Slugify utility
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function createDesignSystem(formData: FormData) {
  const user = await requireUser()

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const philosophy = formData.get("philosophy") as string
  const coverImage = formData.get("coverImage") as string | null
  const coverColor = formData.get("coverColor") as string | null

  if (!name || !description || !philosophy) {
    throw new Error("Name, description, and philosophy are required")
  }

  const baseSlug = slugify(name)
  let slug = baseSlug
  let counter = 1

  // Ensure unique slug
  while (await db.designSystem.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  await db.designSystem.create({
    data: {
      userId: user.id,
      name,
      slug,
      description,
      philosophy,
      coverImage: coverImage || null,
      coverColor: coverColor || "#eab308", // Default gold
      cssContent: "",
      components: [],
      palette: {},
      typography: {},
      utilities: {},
      primitives: [],
      backgrounds: [],
    },
  })

  revalidatePath("/library")
  revalidatePath("/library/design-systems")

  return { slug }
}

export async function updateDesignSystem(systemId: string, formData: FormData) {
  const user = await requireUser()

  const system = await db.designSystem.findFirst({
    where: { id: systemId, userId: user.id },
  })

  if (!system) {
    throw new Error("Design system not found")
  }

  const name = formData.get("name") as string | null
  const description = formData.get("description") as string | null
  const philosophy = formData.get("philosophy") as string | null
  const coverImage = formData.get("coverImage") as string | null
  const coverColor = formData.get("coverColor") as string | null
  const version = formData.get("version") as string | null

  await db.designSystem.update({
    where: { id: systemId },
    data: {
      name: name || system.name,
      description: description ?? system.description,
      philosophy: philosophy ?? system.philosophy,
      coverImage: coverImage ?? system.coverImage,
      coverColor: coverColor ?? system.coverColor,
      version: version || system.version,
    },
  })

  revalidatePath("/library")
  revalidatePath("/library/design-systems")
  revalidatePath(`/library/design-systems/${system.slug}`)
}

export async function updateDesignSystemContent(
  systemId: string,
  content: {
    cssContent?: string
    components?: unknown[]
    palette?: Record<string, unknown>
    typography?: Record<string, unknown>
    utilities?: Record<string, unknown>
    primitives?: unknown[]
    backgrounds?: unknown[]
  }
) {
  const user = await requireUser()

  const system = await db.designSystem.findFirst({
    where: { id: systemId, userId: user.id },
  })

  if (!system) {
    throw new Error("Design system not found")
  }

  await db.designSystem.update({
    where: { id: systemId },
    data: {
      cssContent: content.cssContent ?? system.cssContent ?? undefined,
      components: (content.components ?? system.components ?? undefined) as Prisma.InputJsonValue | undefined,
      palette: (content.palette ?? system.palette ?? undefined) as Prisma.InputJsonValue | undefined,
      typography: (content.typography ?? system.typography ?? undefined) as Prisma.InputJsonValue | undefined,
      utilities: (content.utilities ?? system.utilities ?? undefined) as Prisma.InputJsonValue | undefined,
      primitives: (content.primitives ?? system.primitives ?? undefined) as Prisma.InputJsonValue | undefined,
      backgrounds: (content.backgrounds ?? system.backgrounds ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  })

  revalidatePath(`/library/design-systems/${system.slug}`)
}

export async function deleteDesignSystem(systemId: string) {
  const user = await requireUser()

  const system = await db.designSystem.findFirst({
    where: { id: systemId, userId: user.id },
  })

  if (!system) {
    throw new Error("Design system not found")
  }

  await db.designSystem.delete({
    where: { id: systemId },
  })

  revalidatePath("/library")
  revalidatePath("/library/design-systems")
}

export async function recordDesignSystemUsage(systemId: string) {
  const user = await requireUser()

  const system = await db.designSystem.findFirst({
    where: { id: systemId, userId: user.id },
  })

  if (!system) {
    throw new Error("Design system not found")
  }

  await db.designSystem.update({
    where: { id: systemId },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  })
}

// Add a component to a design system
export async function addComponentToDesignSystem(
  systemId: string,
  component: {
    name: string
    category: string
    code: string
    props?: string
    usage?: string
  }
) {
  const user = await requireUser()

  const system = await db.designSystem.findFirst({
    where: { id: systemId, userId: user.id },
  })

  if (!system) {
    throw new Error("Design system not found")
  }

  const components = (system.components as unknown[]) || []
  components.push({
    id: crypto.randomUUID(),
    ...component,
    createdAt: new Date().toISOString(),
  })

  await db.designSystem.update({
    where: { id: systemId },
    data: { components: components as Prisma.InputJsonValue },
  })

  revalidatePath(`/library/design-systems/${system.slug}`)
}

// Remove a component from a design system
export async function removeComponentFromDesignSystem(
  systemId: string,
  componentId: string
) {
  const user = await requireUser()

  const system = await db.designSystem.findFirst({
    where: { id: systemId, userId: user.id },
  })

  if (!system) {
    throw new Error("Design system not found")
  }

  const components = ((system.components as unknown[]) || []).filter(
    (c: unknown) => (c as { id: string }).id !== componentId
  )

  await db.designSystem.update({
    where: { id: systemId },
    data: { components: components as Prisma.InputJsonValue },
  })

  revalidatePath(`/library/design-systems/${system.slug}`)
}
