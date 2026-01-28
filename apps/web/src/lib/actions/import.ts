"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import type { CodebaseAnalysis } from "@/lib/ai/analyze-codebase"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

/**
 * Create a project from an analyzed codebase
 * Creates the project, sprints, and tasks in a single atomic transaction
 */
export async function createProjectFromImport(
  analysis: CodebaseAnalysis,
  clientName: string
): Promise<string> {
  const user = await requireUser()

  // Validate input
  if (!analysis.projectName) {
    throw new Error("Project name is required")
  }

  if (!clientName) {
    throw new Error("Client name is required")
  }

  // Generate unique slug
  let baseSlug = generateSlug(analysis.projectName)
  let slug = baseSlug
  let counter = 1

  while (await db.project.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  // Create everything in a transaction
  const project = await db.$transaction(async (tx) => {
    // Create the project
    const newProject = await tx.project.create({
      data: {
        userId: user.id,
        name: analysis.projectName,
        slug,
        clientName,
        description: analysis.description || null,
        status: "PLANNING",
        phase: "PLAN",
      },
    })

    // Create sprints with tasks
    for (let sprintIndex = 0; sprintIndex < analysis.sprints.length; sprintIndex++) {
      const sprintData = analysis.sprints[sprintIndex]

      // Calculate total estimated hours for the sprint
      const totalEstimatedHours = sprintData.tasks.reduce(
        (sum, task) => sum + (task.estimatedHours || 0),
        0
      )

      const sprint = await tx.sprint.create({
        data: {
          projectId: newProject.id,
          number: sprintIndex + 1,
          name: sprintData.name,
          description: sprintData.description || null,
          estimatedHours: totalEstimatedHours,
          status: "NOT_STARTED",
        },
      })

      // Create tasks for this sprint
      for (let taskIndex = 0; taskIndex < sprintData.tasks.length; taskIndex++) {
        const taskData = sprintData.tasks[taskIndex]

        await tx.task.create({
          data: {
            sprintId: sprint.id,
            title: taskData.title,
            description: taskData.description || null,
            order: taskIndex + 1,
            estimatedHours: taskData.estimatedHours || 1,
            category: taskData.category || null,
            status: "TODO",
          },
        })
      }
    }

    return newProject
  })

  revalidatePath("/projects")
  redirect(`/projects/${project.slug}`)
}

/**
 * Import form action that handles the analysis data and creates the project
 */
export async function importProject(formData: FormData) {
  const analysisJson = formData.get("analysis") as string
  const clientName = formData.get("clientName") as string

  if (!analysisJson) {
    throw new Error("Analysis data is required")
  }

  if (!clientName) {
    throw new Error("Client name is required")
  }

  let analysis: CodebaseAnalysis
  try {
    analysis = JSON.parse(analysisJson)
  } catch {
    throw new Error("Invalid analysis data")
  }

  // This will redirect on success
  await createProjectFromImport(analysis, clientName)
}
