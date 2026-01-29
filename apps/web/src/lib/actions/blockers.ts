"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

// Helper to trigger the agent when relevant events occur
async function triggerAgent(
  triggerType: string,
  entityId: string,
  entityData: Record<string, unknown>
) {
  try {
    // Use internal API call for server action -> API route communication
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"

    await fetch(`${baseUrl}/api/agent/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ triggerType, entityId, entityData }),
    })
  } catch (error) {
    // Don't block the main action if agent trigger fails
    console.error("Agent trigger failed:", error)
  }
}

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

  const blocker = await db.blocker.create({
    data: {
      projectId: project.id,
      title,
      description: description || null,
      type: type || "HARD",
      waitingOn,
    },
  })

  // Trigger agent for new blocker (it can decide if it wants to suggest something)
  triggerAgent("blocker_created", blocker.id, {
    title,
    description,
    type: type || "HARD",
    waitingOn,
    projectName: project.name,
    projectSlug: project.slug,
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
      project: { select: { slug: true, name: true } },
    },
  })

  if (!blocker) {
    throw new Error("Blocker not found")
  }

  const daysToResolve = Math.floor(
    (Date.now() - blocker.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  await db.blocker.update({
    where: { id: blockerId },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
    },
  })

  // Trigger agent for resolved blocker (can learn patterns)
  triggerAgent("blocker_resolved", blockerId, {
    title: blocker.title,
    type: blocker.type,
    waitingOn: blocker.waitingOn,
    daysToResolve,
    followUpCount: blocker.followUpCount,
    projectName: blocker.project.name,
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
      project: { select: { slug: true, name: true } },
    },
  })

  if (!blocker) {
    throw new Error("Blocker not found")
  }

  const updatedBlocker = await db.blocker.update({
    where: { id: blockerId },
    data: {
      lastFollowUpAt: new Date(),
      followUpCount: { increment: 1 },
    },
  })

  // If this is the 3rd+ follow-up, agent might want to escalate or suggest
  if (updatedBlocker.followUpCount >= 3) {
    const blockerAge = Math.floor(
      (Date.now() - blocker.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    triggerAgent("blocker_stale", blockerId, {
      title: blocker.title,
      type: blocker.type,
      waitingOn: blocker.waitingOn,
      followUpCount: updatedBlocker.followUpCount,
      daysOld: blockerAge,
      projectName: blocker.project.name,
    })
  }

  revalidatePath(`/projects/${blocker.project.slug}`)
  revalidatePath("/dashboard/blockers")
}
