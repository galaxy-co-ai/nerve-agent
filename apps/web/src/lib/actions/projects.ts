"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function createProject(formData: FormData) {
  const user = await requireUser()

  const name = formData.get("name") as string
  const clientName = formData.get("clientName") as string
  const description = formData.get("description") as string | null
  const hourlyRate = formData.get("hourlyRate") as string | null
  const contractValue = formData.get("contractValue") as string | null

  if (!name || !clientName) {
    throw new Error("Name and client name are required")
  }

  // Generate unique slug
  let baseSlug = generateSlug(name)
  let slug = baseSlug
  let counter = 1

  while (await db.project.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  const project = await db.project.create({
    data: {
      userId: user.id,
      name,
      slug,
      clientName,
      description: description || null,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      contractValue: contractValue ? parseFloat(contractValue) : null,
    },
  })

  revalidatePath("/projects")
  redirect(`/projects/${project.slug}`)
}

export async function updateProject(slug: string, formData: FormData) {
  const user = await requireUser()

  const name = formData.get("name") as string
  const clientName = formData.get("clientName") as string
  const description = formData.get("description") as string | null
  const hourlyRate = formData.get("hourlyRate") as string | null
  const contractValue = formData.get("contractValue") as string | null
  const status = formData.get("status") as string | null

  const project = await db.project.findFirst({
    where: { slug, userId: user.id },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  await db.project.update({
    where: { id: project.id },
    data: {
      name: name || project.name,
      clientName: clientName || project.clientName,
      description: description ?? project.description,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : project.hourlyRate,
      contractValue: contractValue ? parseFloat(contractValue) : project.contractValue,
      status: status as any || project.status,
    },
  })

  revalidatePath("/projects")
  revalidatePath(`/projects/${slug}`)
  redirect(`/projects/${slug}`)
}

export async function deleteProject(slug: string) {
  const user = await requireUser()

  const project = await db.project.findFirst({
    where: { slug, userId: user.id },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  await db.project.delete({
    where: { id: project.id },
  })

  revalidatePath("/projects")
  redirect("/projects")
}

export async function updateProjectStatus(slug: string, status: string) {
  const user = await requireUser()

  const project = await db.project.findFirst({
    where: { slug, userId: user.id },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  await db.project.update({
    where: { id: project.id },
    data: { status: status as any },
  })

  revalidatePath("/projects")
  revalidatePath(`/projects/${slug}`)
}
