"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

export async function createBlocker(projectSlug: string, formData: FormData) {
  const user = await requireUser()

  const title = formData.get("title") as string
  const description = formData.get("description") as string | null
  const type = formData.get("type") as "HARD" | "SOFT"
  const waitingOn = formData.get("waitingOn") as string

  if (!title || !waitingOn) {
    throw new Error("Title and waiting on are required")
  }

  const project = await db.project.findFirst({
    where: { slug: projectSlug, userId: user.id },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  await db.blocker.create({
    data: {
      projectId: project.id,
      title,
      description: description || null,
      type: type || "HARD",
      waitingOn,
    },
  })

  revalidatePath(`/projects/${projectSlug}`)
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/blockers")
}

export async function resolveBlocker(blockerId: string) {
  const user = await requireUser()

  const blocker = await db.blocker.findFirst({
    where: {
      id: blockerId,
      project: { userId: user.id },
    },
    include: {
      project: { select: { slug: true } },
    },
  })

  if (!blocker) {
    throw new Error("Blocker not found")
  }

  await db.blocker.update({
    where: { id: blockerId },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
    },
  })

  revalidatePath(`/projects/${blocker.project.slug}`)
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/blockers")
}

export async function deleteBlocker(blockerId: string) {
  const user = await requireUser()

  const blocker = await db.blocker.findFirst({
    where: {
      id: blockerId,
      project: { userId: user.id },
    },
    include: {
      project: { select: { slug: true } },
    },
  })

  if (!blocker) {
    throw new Error("Blocker not found")
  }

  await db.blocker.delete({
    where: { id: blockerId },
  })

  revalidatePath(`/projects/${blocker.project.slug}`)
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/blockers")
}

export async function recordFollowUp(blockerId: string) {
  const user = await requireUser()

  const blocker = await db.blocker.findFirst({
    where: {
      id: blockerId,
      project: { userId: user.id },
    },
    include: {
      project: { select: { slug: true } },
    },
  })

  if (!blocker) {
    throw new Error("Blocker not found")
  }

  await db.blocker.update({
    where: { id: blockerId },
    data: {
      lastFollowUpAt: new Date(),
      followUpCount: { increment: 1 },
    },
  })

  revalidatePath(`/projects/${blocker.project.slug}`)
  revalidatePath("/dashboard/blockers")
}
