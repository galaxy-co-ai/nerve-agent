"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { FollowUpStatus } from "@prisma/client"

export async function acceptFollowUp(followUpId: string, dueDate?: Date) {
  const user = await requireUser()

  const followUp = await db.followUp.findUnique({
    where: { id: followUpId },
    include: { project: true },
  })

  if (!followUp || followUp.userId !== user.id) {
    throw new Error("Follow-up not found")
  }

  await db.followUp.update({
    where: { id: followUpId },
    data: {
      status: dueDate ? "SCHEDULED" : "PENDING",
      dueDate: dueDate || null,
    },
  })

  revalidatePath("/dashboard/follow-ups")
  revalidatePath("/dashboard")
  revalidatePath(`/calls/${followUp.callId}`)
}

export async function dismissFollowUp(followUpId: string) {
  const user = await requireUser()

  const followUp = await db.followUp.findUnique({
    where: { id: followUpId },
  })

  if (!followUp || followUp.userId !== user.id) {
    throw new Error("Follow-up not found")
  }

  await db.followUp.update({
    where: { id: followUpId },
    data: { status: "DISMISSED" },
  })

  revalidatePath("/dashboard/follow-ups")
  revalidatePath("/dashboard")
  revalidatePath(`/calls/${followUp.callId}`)
}

export async function completeFollowUp(followUpId: string) {
  const user = await requireUser()

  const followUp = await db.followUp.findUnique({
    where: { id: followUpId },
  })

  if (!followUp || followUp.userId !== user.id) {
    throw new Error("Follow-up not found")
  }

  await db.followUp.update({
    where: { id: followUpId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  })

  revalidatePath("/dashboard/follow-ups")
  revalidatePath("/dashboard")
  revalidatePath(`/calls/${followUp.callId}`)
}

export async function createManualFollowUp(data: {
  title: string
  description?: string
  projectId: string
  dueDate?: Date
  callId?: string
}) {
  const user = await requireUser()

  const { title, description, projectId, dueDate, callId } = data

  if (!title || !projectId) {
    throw new Error("Title and project are required")
  }

  // Verify project belongs to user
  const project = await db.project.findFirst({
    where: { id: projectId, userId: user.id },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  const followUp = await db.followUp.create({
    data: {
      userId: user.id,
      projectId,
      callId: callId || null,
      title,
      description: description || null,
      sourceType: "MANUAL",
      status: dueDate ? "SCHEDULED" : "PENDING",
      dueDate: dueDate || null,
    },
  })

  revalidatePath("/dashboard/follow-ups")
  revalidatePath("/dashboard")

  return followUp
}

export async function updateFollowUpDueDate(followUpId: string, dueDate: Date | null) {
  const user = await requireUser()

  const followUp = await db.followUp.findUnique({
    where: { id: followUpId },
  })

  if (!followUp || followUp.userId !== user.id) {
    throw new Error("Follow-up not found")
  }

  await db.followUp.update({
    where: { id: followUpId },
    data: {
      dueDate,
      status: dueDate ? "SCHEDULED" : "PENDING",
    },
  })

  revalidatePath("/dashboard/follow-ups")
  revalidatePath("/dashboard")
}

export async function deleteFollowUp(followUpId: string) {
  const user = await requireUser()

  const followUp = await db.followUp.findUnique({
    where: { id: followUpId },
  })

  if (!followUp || followUp.userId !== user.id) {
    throw new Error("Follow-up not found")
  }

  await db.followUp.delete({
    where: { id: followUpId },
  })

  revalidatePath("/dashboard/follow-ups")
  revalidatePath("/dashboard")
}

export async function getFollowUps(status?: FollowUpStatus | FollowUpStatus[]) {
  const user = await requireUser()

  const statusFilter = status
    ? Array.isArray(status)
      ? { in: status }
      : status
    : undefined

  const followUps = await db.followUp.findMany({
    where: {
      userId: user.id,
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    include: {
      project: { select: { id: true, name: true, slug: true } },
      call: { select: { id: true, title: true } },
    },
    orderBy: [
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  })

  return followUps
}

// Create follow-ups from AI-extracted items
export async function createFollowUpsFromCall(
  callId: string,
  projectId: string,
  followUps: Array<{
    title: string
    description?: string
    sourceQuote?: string
    dueDate?: string
  }>
) {
  const user = await requireUser()

  // Verify the call belongs to user
  const call = await db.call.findUnique({
    where: { id: callId },
  })

  if (!call || call.userId !== user.id) {
    throw new Error("Call not found")
  }

  // Create all follow-ups
  await db.followUp.createMany({
    data: followUps.map((f) => ({
      userId: user.id,
      callId,
      projectId,
      title: f.title,
      description: f.description || null,
      sourceType: "AI_SUGGESTED" as const,
      sourceQuote: f.sourceQuote || null,
      status: "SUGGESTED" as const,
      dueDate: f.dueDate ? new Date(f.dueDate) : null,
    })),
  })

  revalidatePath("/dashboard/follow-ups")
  revalidatePath("/dashboard")
  revalidatePath(`/calls/${callId}`)
}
