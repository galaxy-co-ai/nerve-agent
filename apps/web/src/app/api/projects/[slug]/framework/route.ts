import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { FrameworkDocType, FrameworkDocStatus } from "@prisma/client"

// Map doc numbers to types
const DOC_TYPE_MAP: Record<number, FrameworkDocType> = {
  1: "IDEA_AUDIT",
  2: "PROJECT_BRIEF",
  3: "PRD",
  4: "TAD",
  5: "AI_COLLAB_PROTOCOL",
  6: "MTS",
  7: "TEST_PLAN",
  8: "AUDIT_CHECKLIST",
  9: "DECISION_LOG",
  10: "PROJECT_PULSE",
  11: "SHIP_CHECKLIST",
  12: "RETROSPECTIVE",
}

type RouteContext = { params: Promise<{ slug: string }> }

// Get all framework docs for a project
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug } = await context.params

    const project = await db.project.findFirst({
      where: { slug, userId: user.id },
      include: {
        frameworkDocs: {
          orderBy: { docNumber: "asc" },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(project.frameworkDocs)
  } catch (error) {
    console.error("Get framework docs error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get framework docs" },
      { status: 500 }
    )
  }
}

// Create or update a framework doc
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug } = await context.params
    const { docNumber, content } = await request.json()

    if (!docNumber || docNumber < 1 || docNumber > 12) {
      return NextResponse.json({ error: "Invalid doc number (1-12)" }, { status: 400 })
    }

    const project = await db.project.findFirst({
      where: { slug, userId: user.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const docType = DOC_TYPE_MAP[docNumber]

    const doc = await db.projectFrameworkDoc.upsert({
      where: {
        projectId_docNumber: {
          projectId: project.id,
          docNumber,
        },
      },
      create: {
        projectId: project.id,
        docNumber,
        docType,
        content: content || "",
      },
      update: {
        content: content || "",
      },
    })

    return NextResponse.json(doc)
  } catch (error) {
    console.error("Create/update framework doc error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save framework doc" },
      { status: 500 }
    )
  }
}

// Lock a framework doc
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug } = await context.params
    const { docNumber, status } = await request.json()

    if (!docNumber || docNumber < 1 || docNumber > 12) {
      return NextResponse.json({ error: "Invalid doc number (1-12)" }, { status: 400 })
    }

    const project = await db.project.findFirst({
      where: { slug, userId: user.id },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const updateData: { status?: FrameworkDocStatus; lockedAt?: Date | null } = {}

    if (status === "LOCKED") {
      updateData.status = "LOCKED"
      updateData.lockedAt = new Date()
    } else if (status === "DRAFT") {
      updateData.status = "DRAFT"
      updateData.lockedAt = null
    }

    const doc = await db.projectFrameworkDoc.update({
      where: {
        projectId_docNumber: {
          projectId: project.id,
          docNumber,
        },
      },
      data: updateData,
    })

    return NextResponse.json(doc)
  } catch (error) {
    console.error("Update framework doc status error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update framework doc status" },
      { status: 500 }
    )
  }
}
