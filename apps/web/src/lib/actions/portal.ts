"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { randomBytes } from "crypto"

function generatePortalToken(): string {
  return randomBytes(16).toString("hex")
}

export async function enablePortal(projectSlug: string) {
  const user = await requireUser()

  const project = await db.project.findFirst({
    where: { slug: projectSlug, userId: user.id },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  // Generate a new token if one doesn't exist
  const token = project.portalToken || generatePortalToken()

  await db.project.update({
    where: { id: project.id },
    data: {
      portalEnabled: true,
      portalToken: token,
    },
  })

  revalidatePath(`/projects/${projectSlug}`)
  return token
}

export async function disablePortal(projectSlug: string) {
  const user = await requireUser()

  const project = await db.project.findFirst({
    where: { slug: projectSlug, userId: user.id },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  await db.project.update({
    where: { id: project.id },
    data: { portalEnabled: false },
  })

  revalidatePath(`/projects/${projectSlug}`)
}

export async function regeneratePortalToken(projectSlug: string) {
  const user = await requireUser()

  const project = await db.project.findFirst({
    where: { slug: projectSlug, userId: user.id },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  const newToken = generatePortalToken()

  await db.project.update({
    where: { id: project.id },
    data: { portalToken: newToken },
  })

  revalidatePath(`/projects/${projectSlug}`)
  return newToken
}

// Record portal access (called from the public portal page)
export async function recordPortalAccess(token: string) {
  await db.project.update({
    where: { portalToken: token },
    data: { portalLastAccess: new Date() },
  })
}
