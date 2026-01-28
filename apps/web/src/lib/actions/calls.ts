"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { CallSentiment } from "@prisma/client"

interface ProcessedCallData {
  summary: string
  actionItems: Array<{ text: string; assignedTo: string; dueDate?: string }>
  decisions: Array<{ text: string; decidedBy: string }>
  sentiment: CallSentiment
}

export async function createCall(
  formData: FormData,
  processedData?: ProcessedCallData
) {
  const user = await requireUser()

  const projectId = formData.get("projectId") as string
  const title = formData.get("title") as string
  const callDate = formData.get("callDate") as string
  const participants = formData.get("participants") as string | null
  const transcript = formData.get("transcript") as string

  if (!projectId || !title || !callDate || !transcript) {
    throw new Error("Project, title, date, and transcript are required")
  }

  // Verify project belongs to user
  const project = await db.project.findFirst({
    where: { id: projectId, userId: user.id },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  const call = await db.call.create({
    data: {
      userId: user.id,
      projectId,
      title,
      callDate: new Date(callDate),
      participants: participants || null,
      transcript,
      summary: processedData?.summary || null,
      actionItems: processedData?.actionItems || [],
      decisions: processedData?.decisions || [],
      sentiment: processedData?.sentiment || null,
    },
  })

  revalidatePath("/calls")
  revalidatePath(`/projects/${project.slug}`)
  redirect(`/calls/${call.id}`)
}

export async function updateCall(callId: string, formData: FormData) {
  const user = await requireUser()

  const call = await db.call.findUnique({
    where: { id: callId },
    include: { project: true },
  })

  if (!call || call.userId !== user.id) {
    throw new Error("Call not found")
  }

  const title = formData.get("title") as string
  const callDate = formData.get("callDate") as string
  const participants = formData.get("participants") as string | null

  await db.call.update({
    where: { id: callId },
    data: {
      title: title || call.title,
      callDate: callDate ? new Date(callDate) : call.callDate,
      participants: participants ?? call.participants,
    },
  })

  revalidatePath("/calls")
  revalidatePath(`/calls/${callId}`)
}

export async function updateCallProcessedData(
  callId: string,
  processedData: ProcessedCallData
) {
  const user = await requireUser()

  const call = await db.call.findUnique({
    where: { id: callId },
  })

  if (!call || call.userId !== user.id) {
    throw new Error("Call not found")
  }

  await db.call.update({
    where: { id: callId },
    data: {
      summary: processedData.summary,
      actionItems: processedData.actionItems,
      decisions: processedData.decisions,
      sentiment: processedData.sentiment,
    },
  })

  revalidatePath(`/calls/${callId}`)
}

export async function deleteCall(callId: string) {
  const user = await requireUser()

  const call = await db.call.findUnique({
    where: { id: callId },
    include: { project: true },
  })

  if (!call || call.userId !== user.id) {
    throw new Error("Call not found")
  }

  await db.call.delete({
    where: { id: callId },
  })

  revalidatePath("/calls")
  revalidatePath(`/projects/${call.project.slug}`)
  redirect("/calls")
}

export async function toggleBriefShared(callId: string) {
  const user = await requireUser()

  const call = await db.call.findUnique({
    where: { id: callId },
  })

  if (!call || call.userId !== user.id) {
    throw new Error("Call not found")
  }

  // Generate a brief token if sharing for the first time
  let briefToken = call.briefToken
  if (!call.briefShared && !briefToken) {
    briefToken = crypto.randomUUID()
  }

  await db.call.update({
    where: { id: callId },
    data: {
      briefShared: !call.briefShared,
      briefToken,
    },
  })

  revalidatePath(`/calls/${callId}`)

  return { briefShared: !call.briefShared, briefToken }
}

export async function getCallByBriefToken(token: string) {
  const call = await db.call.findUnique({
    where: { briefToken: token },
    include: {
      project: {
        select: { name: true, clientName: true },
      },
    },
  })

  if (!call || !call.briefShared) {
    return null
  }

  return call
}
