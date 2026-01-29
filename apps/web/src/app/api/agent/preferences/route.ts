import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

// GET: Get the user's agent preferences
export async function GET() {
  try {
    const user = await requireUser()

    let preferences = await db.agentPreferences.findUnique({
      where: { userId: user.id },
    })

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await db.agentPreferences.create({
        data: {
          userId: user.id,
        },
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error("Get agent preferences error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get preferences" },
      { status: 500 }
    )
  }
}

// PUT: Update the user's agent preferences
export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser()
    const updates = await request.json()

    // Allowed fields to update
    const allowedFields = [
      "proactiveEnabled",
      "autoDraftFollowups",
      "morningBriefEnabled",
      "morningBriefTime",
      "quietHoursEnabled",
      "quietHoursStart",
      "quietHoursEnd",
      "preferredStyle",
      "timezone",
      "autoApproveTypes",
    ]

    // Filter to only allowed fields
    const filteredUpdates: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in updates) {
        filteredUpdates[key] = updates[key]
      }
    }

    const preferences = await db.agentPreferences.upsert({
      where: { userId: user.id },
      update: filteredUpdates,
      create: {
        userId: user.id,
        ...filteredUpdates,
      },
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error("Update agent preferences error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update preferences" },
      { status: 500 }
    )
  }
}
