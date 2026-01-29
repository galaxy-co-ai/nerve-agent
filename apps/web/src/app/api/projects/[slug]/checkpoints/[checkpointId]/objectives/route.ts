import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { ObjectiveStatus } from "@prisma/client"

type RouteContext = { params: Promise<{ slug: string; checkpointId: string }> }

// Update an objective's status
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug, checkpointId } = await context.params
    const { objectiveId, status } = await request.json()

    if (!objectiveId || !status) {
      return NextResponse.json(
        { error: "objectiveId and status are required" },
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

    const objective = await db.projectObjective.update({
      where: {
        checkpointId_objectiveId: {
          checkpointId: checkpoint.id,
          objectiveId,
        },
      },
      data: { status: status as ObjectiveStatus },
      include: { steps: true },
    })

    // If all objectives are complete, auto-complete the checkpoint
    const allObjectives = await db.projectObjective.findMany({
      where: { checkpointId: checkpoint.id },
    })

    const allComplete = allObjectives.every((o) => o.status === "COMPLETE")

    if (allComplete && checkpoint.status !== "COMPLETE") {
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

    return NextResponse.json(objective)
  } catch (error) {
    console.error("Update objective error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update objective" },
      { status: 500 }
    )
  }
}
