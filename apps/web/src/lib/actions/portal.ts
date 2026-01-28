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

// Submit feedback from the portal (no auth required - public action)
export async function submitPortalFeedback(formData: FormData) {
  const projectId = formData.get("projectId") as string
  const portalToken = formData.get("portalToken") as string
  const authorName = formData.get("authorName") as string
  const authorEmail = formData.get("authorEmail") as string | null
  const type = formData.get("type") as "BUG" | "SUGGESTION" | "QUESTION" | "APPROVAL"
  const content = formData.get("content") as string
  const pageUrl = formData.get("pageUrl") as string | null

  if (!projectId || !portalToken || !authorName || !content) {
    throw new Error("Missing required fields")
  }

  // Verify the portal token matches the project
  const project = await db.project.findFirst({
    where: {
      id: projectId,
      portalToken: portalToken,
      portalEnabled: true,
    },
  })

  if (!project) {
    throw new Error("Invalid portal access")
  }

  await db.portalFeedback.create({
    data: {
      projectId,
      authorName,
      authorEmail: authorEmail || null,
      type,
      content,
      pageUrl: pageUrl || null,
    },
  })

  revalidatePath(`/portal/${portalToken}`)
}

// Get feedback for a project (requires auth)
export async function getProjectFeedback(projectSlug: string) {
  const user = await requireUser()

  const project = await db.project.findFirst({
    where: { slug: projectSlug, userId: user.id },
    include: {
      portalFeedback: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  return project.portalFeedback
}

// Respond to feedback (requires auth)
export async function respondToFeedback(feedbackId: string, response: string, resolve: boolean) {
  const user = await requireUser()

  const feedback = await db.portalFeedback.findUnique({
    where: { id: feedbackId },
    include: { project: true },
  })

  if (!feedback || feedback.project.userId !== user.id) {
    throw new Error("Feedback not found")
  }

  await db.portalFeedback.update({
    where: { id: feedbackId },
    data: {
      response,
      respondedAt: new Date(),
      status: resolve ? "RESOLVED" : "ACKNOWLEDGED",
    },
  })

  revalidatePath(`/projects/${feedback.project.slug}`)
}
