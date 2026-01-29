import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

type RouteContext = { params: Promise<{ slug: string; checkpointId: string }> }

// Get all sessions for a checkpoint
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug, checkpointId } = await context.params

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

    const sessions = await db.checkpointSession.findMany({
      where: { checkpointId: checkpoint.id },
      orderBy: { startedAt: "desc" },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Get sessions error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get sessions" },
      { status: 500 }
    )
  }
}

// Start a new session (pause existing if any)
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug, checkpointId } = await context.params
    const body = await request.json().catch(() => ({}))

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

    // End any existing open session first
    const openSession = await db.checkpointSession.findFirst({
      where: {
        checkpointId: checkpoint.id,
        endedAt: null,
      },
    })

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

    // Create new session
    const session = await db.checkpointSession.create({
      data: {
        checkpointId: checkpoint.id,
        startedAt: new Date(),
        notes: body.notes || null,
      },
    })

    // Update checkpoint status to IN_PROGRESS if it was PENDING
    if (checkpoint.status === "PENDING") {
      await db.projectCheckpoint.update({
        where: { id: checkpoint.id },
        data: {
          status: "IN_PROGRESS",
          startedAt: checkpoint.startedAt || new Date(),
        },
      })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error("Start session error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start session" },
      { status: 500 }
    )
  }
}

// End the current session (pause timer)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug, checkpointId } = await context.params
    const body = await request.json().catch(() => ({}))

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

    // Find and end open session
    const openSession = await db.checkpointSession.findFirst({
      where: {
        checkpointId: checkpoint.id,
        endedAt: null,
      },
    })

    if (!openSession) {
      return NextResponse.json({ error: "No active session" }, { status: 400 })
    }

    const durationMins = Math.round(
      (Date.now() - openSession.startedAt.getTime()) / 60000
    )

    const session = await db.checkpointSession.update({
      where: { id: openSession.id },
      data: {
        endedAt: new Date(),
        durationMins,
        notes: body.notes !== undefined ? body.notes : openSession.notes,
      },
    })

    // Update checkpoint actual time
    const allSessions = await db.checkpointSession.findMany({
      where: { checkpointId: checkpoint.id },
    })

    const totalMins = allSessions.reduce((sum, s) => sum + (s.durationMins || 0), 0)

    await db.projectCheckpoint.update({
      where: { id: checkpoint.id },
      data: { actualMins: totalMins },
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error("End session error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to end session" },
      { status: 500 }
    )
  }
}
