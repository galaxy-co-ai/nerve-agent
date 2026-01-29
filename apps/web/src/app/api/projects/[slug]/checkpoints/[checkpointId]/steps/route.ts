import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { StepStatus } from "@prisma/client"

type RouteContext = { params: Promise<{ slug: string; checkpointId: string }> }

// Update a step's status
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug, checkpointId } = await context.params
    const { objectiveId, stepId, status } = await request.json()

    if (!objectiveId || !stepId || !status) {
      return NextResponse.json(
        { error: "objectiveId, stepId, and status are required" },
        { status: 400 }
      )
    }

    const project = await db.project.findFirst({
      where: { slug, userId: user.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const checkpoint = await db.projectCheckpoint.findUnique({
      where: {
        projectId_checkpointId: {
          projectId: project.id,
          checkpointId,
        },
      },
    })

    if (!checkpoint) {
      return NextResponse.json({ error: "Checkpoint not found" }, { status: 404 })
    }

    const objective = await db.projectObjective.findUnique({
      where: {
        checkpointId_objectiveId: {
          checkpointId: checkpoint.id,
          objectiveId,
        },
      },
    })

    if (!objective) {
      return NextResponse.json({ error: "Objective not found" }, { status: 404 })
    }

    const step = await db.projectStep.update({
      where: {
        objectiveId_stepId: {
          objectiveId: objective.id,
          stepId,
        },
      },
      data: {
        status: status as StepStatus,
        completedAt: status === "COMPLETE" ? new Date() : null,
      },
    })

    // Check if all steps in this objective are complete
    const allSteps = await db.projectStep.findMany({
      where: { objectiveId: objective.id },
    })

    const allStepsComplete = allSteps.every((s) => s.status === "COMPLETE")

    // If all steps complete, auto-complete the objective
    if (allStepsComplete && objective.status !== "COMPLETE") {
      await db.projectObjective.update({
        where: { id: objective.id },
        data: { status: "COMPLETE" },
      })

      // Check if all objectives in checkpoint are complete
      const allObjectives = await db.projectObjective.findMany({
        where: { checkpointId: checkpoint.id },
      })

      const allObjectivesComplete = allObjectives.every(
        (o) => o.id === objective.id || o.status === "COMPLETE"
      )

      if (allObjectivesComplete && checkpoint.status !== "COMPLETE") {
        // End any open session
        const openSession = await db.checkpointSession.findFirst({
          where: { checkpointId: checkpoint.id, endedAt: null },
        })

        if (openSession) {
          const durationMins = Math.round(
            (Date.now() - openSession.startedAt.getTime()) / 60000
          )
          await db.checkpointSession.update({
            where: { id: openSession.id },
            data: { endedAt: new Date(), durationMins },
          })
        }

        // Calculate total time
        const allSessions = await db.checkpointSession.findMany({
          where: { checkpointId: checkpoint.id },
        })
        const totalMins = allSessions.reduce((sum, s) => sum + (s.durationMins || 0), 0)

        await db.projectCheckpoint.update({
          where: { id: checkpoint.id },
          data: {
            status: "COMPLETE",
            completedAt: new Date(),
            actualMins: totalMins,
          },
        })
      }
    }

    return NextResponse.json(step)
  } catch (error) {
    console.error("Update step error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update step" },
      { status: 500 }
    )
  }
}
