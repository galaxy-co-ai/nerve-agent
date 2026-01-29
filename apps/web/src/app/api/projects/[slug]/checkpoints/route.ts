import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { CheckpointStatus } from "@prisma/client"

type RouteContext = { params: Promise<{ slug: string }> }

// Get all checkpoints for a project (with nested objectives and steps)
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug } = await context.params

    const project = await db.project.findFirst({
      where: { slug, userId: user.id },
      include: {
        checkpoints: {
          orderBy: [{ phase: "asc" }, { checkpointId: "asc" }],
          include: {
            objectives: {
              orderBy: { objectiveId: "asc" },
              include: {
                steps: {
                  orderBy: { stepId: "asc" },
                },
              },
            },
            sessions: {
              orderBy: { startedAt: "desc" },
              take: 5,
            },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project.checkpoints)
  } catch (error) {
    console.error("Get checkpoints error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get checkpoints" },
      { status: 500 }
    )
  }
}

// Create a checkpoint (with optional objectives and steps)
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug } = await context.params
    const { checkpointId, name, phase, estimatedMins, objectives } = await request.json()

    if (!checkpointId || !name || !phase) {
      return NextResponse.json(
        { error: "checkpointId, name, and phase are required" },
        { status: 400 }
      )
    }

    const project = await db.project.findFirst({
      where: { slug, userId: user.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const checkpoint = await db.projectCheckpoint.create({
      data: {
        projectId: project.id,
        checkpointId,
        name,
        phase,
        estimatedMins: estimatedMins || null,
        objectives: objectives?.length
          ? {
              create: objectives.map(
                (obj: {
                  objectiveId: string
                  name: string
                  acceptance: string
                  steps?: { stepId: string; action: string; acceptance: string }[]
                }) => ({
                  objectiveId: obj.objectiveId,
                  name: obj.name,
                  acceptance: obj.acceptance,
                  steps: obj.steps?.length
                    ? {
                        create: obj.steps.map((step) => ({
                          stepId: step.stepId,
                          action: step.action,
                          acceptance: step.acceptance,
                        })),
                      }
                    : undefined,
                })
              ),
            }
          : undefined,
      },
      include: {
        objectives: {
          include: {
            steps: true,
          },
        },
      },
    })

    return NextResponse.json(checkpoint)
  } catch (error) {
    console.error("Create checkpoint error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkpoint" },
      { status: 500 }
    )
  }
}

// Update checkpoint status (handles time tracking auto-start/stop)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug } = await context.params
    const { checkpointId, status } = await request.json()

    if (!checkpointId || !status) {
      return NextResponse.json(
        { error: "checkpointId and status are required" },
        { status: 400 }
      )
    }

    const project = await db.project.findFirst({
      where: { slug, userId: user.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const existingCheckpoint = await db.projectCheckpoint.findUnique({
      where: {
        projectId_checkpointId: {
          projectId: project.id,
          checkpointId,
        },
      },
      include: {
        sessions: {
          where: { endedAt: null },
          orderBy: { startedAt: "desc" },
          take: 1,
        },
      },
    })

    if (!existingCheckpoint) {
      return NextResponse.json({ error: "Checkpoint not found" }, { status: 404 })
    }

    const updateData: {
      status: CheckpointStatus
      startedAt?: Date
      completedAt?: Date | null
    } = { status }

    // Handle status transitions and time tracking
    if (status === "IN_PROGRESS" && existingCheckpoint.status === "PENDING") {
      // Starting a checkpoint - set startedAt and create a session
      updateData.startedAt = new Date()

      await db.checkpointSession.create({
        data: {
          checkpointId: existingCheckpoint.id,
          startedAt: new Date(),
        },
      })
    } else if (status === "COMPLETE") {
      // Completing a checkpoint - end any open session and set completedAt
      updateData.completedAt = new Date()

      const openSession = existingCheckpoint.sessions[0]
      if (openSession) {
        const durationMins = Math.round(
          (Date.now() - openSession.startedAt.getTime()) / 60000
        )
        await db.checkpointSession.update({
          where: { id: openSession.id },
          data: {
            endedAt: new Date(),
            durationMins,
          },
        })
      }

      // Calculate total actual time from all sessions
      const allSessions = await db.checkpointSession.findMany({
        where: { checkpointId: existingCheckpoint.id },
      })

      const totalMins = allSessions.reduce((sum, s) => sum + (s.durationMins || 0), 0)

      await db.projectCheckpoint.update({
        where: { id: existingCheckpoint.id },
        data: { actualMins: totalMins },
      })
    }

    const checkpoint = await db.projectCheckpoint.update({
      where: { id: existingCheckpoint.id },
      data: updateData,
      include: {
        objectives: {
          include: { steps: true },
        },
        sessions: {
          orderBy: { startedAt: "desc" },
        },
      },
    })

    return NextResponse.json(checkpoint)
  } catch (error) {
    console.error("Update checkpoint error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update checkpoint" },
      { status: 500 }
    )
  }
}

// Bulk create checkpoints (for initializing from MTS)
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug } = await context.params
    const { checkpoints } = await request.json()

    if (!checkpoints || !Array.isArray(checkpoints)) {
      return NextResponse.json({ error: "checkpoints array is required" }, { status: 400 })
    }

    const project = await db.project.findFirst({
      where: { slug, userId: user.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Delete existing checkpoints and recreate
    await db.projectCheckpoint.deleteMany({
      where: { projectId: project.id },
    })

    // Create all checkpoints with nested objectives and steps
    for (const cp of checkpoints) {
      await db.projectCheckpoint.create({
        data: {
          projectId: project.id,
          checkpointId: cp.checkpointId,
          name: cp.name,
          phase: cp.phase,
          estimatedMins: cp.estimatedMins || null,
          objectives: cp.objectives?.length
            ? {
                create: cp.objectives.map(
                  (obj: {
                    objectiveId: string
                    name: string
                    acceptance: string
                    steps?: { stepId: string; action: string; acceptance: string }[]
                  }) => ({
                    objectiveId: obj.objectiveId,
                    name: obj.name,
                    acceptance: obj.acceptance,
                    steps: obj.steps?.length
                      ? {
                          create: obj.steps.map(
                            (step: { stepId: string; action: string; acceptance: string }) => ({
                              stepId: step.stepId,
                              action: step.action,
                              acceptance: step.acceptance,
                            })
                          ),
                        }
                      : undefined,
                  })
                ),
              }
            : undefined,
        },
      })
    }

    // Fetch and return all created checkpoints
    const createdCheckpoints = await db.projectCheckpoint.findMany({
      where: { projectId: project.id },
      orderBy: [{ phase: "asc" }, { checkpointId: "asc" }],
      include: {
        objectives: {
          include: { steps: true },
        },
      },
    })

    return NextResponse.json(createdCheckpoints)
  } catch (error) {
    console.error("Bulk create checkpoints error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkpoints" },
      { status: 500 }
    )
  }
}
