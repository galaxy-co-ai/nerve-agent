"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

export async function createSprint(projectSlug: string, formData: FormData) {
  const user = await requireUser()

  const name = formData.get("name") as string
  const description = formData.get("description") as string | null
  const estimatedHours = formData.get("estimatedHours") as string

  if (!name || !estimatedHours) {
    throw new Error("Name and estimated hours are required")
  }

  const project = await db.project.findFirst({
    where: { slug: projectSlug, userId: user.id },
    include: {
      sprints: {
        orderBy: { number: "desc" },
        take: 1,
      },
    },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  // Get next sprint number
  const nextNumber = project.sprints.length > 0 ? project.sprints[0].number + 1 : 1

  await db.sprint.create({
    data: {
      projectId: project.id,
      number: nextNumber,
      name,
      description: description || null,
      estimatedHours: parseFloat(estimatedHours),
    },
  })

  revalidatePath(`/projects/${projectSlug}`)
  revalidatePath("/sprints")
}

export async function updateSprint(
  projectSlug: string,
  sprintNumber: number,
  formData: FormData
) {
  const user = await requireUser()

  const name = formData.get("name") as string
  const description = formData.get("description") as string | null
  const estimatedHours = formData.get("estimatedHours") as string
  const status = formData.get("status") as string | null

  const project = await db.project.findFirst({
    where: { slug: projectSlug, userId: user.id },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  const sprint = await db.sprint.findUnique({
    where: {
      projectId_number: {
        projectId: project.id,
        number: sprintNumber,
      },
    },
  })

  if (!sprint) {
    throw new Error("Sprint not found")
  }

  await db.sprint.update({
    where: { id: sprint.id },
    data: {
      name: name || sprint.name,
      description: description ?? sprint.description,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : sprint.estimatedHours,
      status: (status as any) || sprint.status,
    },
  })

  revalidatePath(`/projects/${projectSlug}`)
  revalidatePath(`/projects/${projectSlug}/sprints/${sprintNumber}`)
  revalidatePath("/sprints")
}

export async function updateSprintStatus(
  projectSlug: string,
  sprintNumber: number,
  status: string
) {
  const user = await requireUser()

  const project = await db.project.findFirst({
    where: { slug: projectSlug, userId: user.id },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  const sprint = await db.sprint.findUnique({
    where: {
      projectId_number: {
        projectId: project.id,
        number: sprintNumber,
      },
    },
  })

  if (!sprint) {
    throw new Error("Sprint not found")
  }

  const updateData: Record<string, unknown> = {
    status: status as any,
  }

  // Set actual start date when starting
  if (status === "IN_PROGRESS" && !sprint.actualStartDate) {
    updateData.actualStartDate = new Date()
  }

  // Set actual end date when completing
  if (status === "COMPLETED" && !sprint.actualEndDate) {
    updateData.actualEndDate = new Date()
  }

  await db.sprint.update({
    where: { id: sprint.id },
    data: updateData,
  })

  revalidatePath(`/projects/${projectSlug}`)
  revalidatePath(`/projects/${projectSlug}/sprints/${sprintNumber}`)
  revalidatePath("/sprints")
}

export async function deleteSprint(projectSlug: string, sprintNumber: number) {
  const user = await requireUser()

  const project = await db.project.findFirst({
    where: { slug: projectSlug, userId: user.id },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  const sprint = await db.sprint.findUnique({
    where: {
      projectId_number: {
        projectId: project.id,
        number: sprintNumber,
      },
    },
  })

  if (!sprint) {
    throw new Error("Sprint not found")
  }

  await db.sprint.delete({
    where: { id: sprint.id },
  })

  revalidatePath(`/projects/${projectSlug}`)
  revalidatePath("/sprints")
  redirect(`/projects/${projectSlug}`)
}
