// =============================================================================
// Presence API - Real-time Status Updates
// =============================================================================
//
// POST /api/presence - Update presence (heartbeat)
// GET /api/presence - Get current user's presence
// GET /api/presence?userId=xxx - Get another user's presence (for clients)
//
// =============================================================================

import { NextResponse } from "next/server"
import { PresenceStatus } from "@prisma/client"
import { requireUser } from "@/lib/auth"
import {
  updatePresence,
  getPresence,
  formatPresenceMessage,
  getStatusDisplay,
} from "@/lib/presence"

export async function POST(request: Request) {
  try {
    const user = await requireUser()
    const body = await request.json()

    const {
      projectId,
      area,
      taskId,
      customStatus,
      manualStatus,
    } = body as {
      projectId?: string
      area?: string
      taskId?: string
      customStatus?: string
      manualStatus?: PresenceStatus
    }

    await updatePresence({
      userId: user.id,
      projectId,
      area,
      taskId,
      customStatus,
      manualStatus,
    })

    const presence = await getPresence(user.id)

    return NextResponse.json({
      success: true,
      presence: presence
        ? {
            ...presence,
            display: getStatusDisplay(presence.calculatedStatus),
            message: formatPresenceMessage({
              status: presence.calculatedStatus,
              customStatus: presence.customStatus,
              currentProjectId: presence.currentProjectId,
              currentArea: presence.currentArea,
            }),
          }
        : null,
    })
  } catch (error) {
    console.error("[Presence] Update error:", error)
    return NextResponse.json(
      { error: "Failed to update presence" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireUser()
    const { searchParams } = new URL(request.url)

    // Can query another user's presence (for client viewing dev status)
    const targetUserId = searchParams.get("userId") || user.id

    const presence = await getPresence(targetUserId)

    if (!presence) {
      return NextResponse.json({
        exists: false,
        userId: targetUserId,
      })
    }

    return NextResponse.json({
      exists: true,
      presence: {
        userId: presence.userId,
        status: presence.calculatedStatus,
        customStatus: presence.customStatus,
        currentProjectId: presence.currentProjectId,
        currentArea: presence.currentArea,
        lastActivityAt: presence.lastActivityAt,
        display: getStatusDisplay(presence.calculatedStatus),
        message: formatPresenceMessage({
          status: presence.calculatedStatus,
          customStatus: presence.customStatus,
          currentProjectId: presence.currentProjectId,
          currentArea: presence.currentArea,
        }),
        user: {
          name: presence.user.name,
          avatarUrl: presence.user.avatarUrl,
        },
      },
    })
  } catch (error) {
    console.error("[Presence] GET error:", error)
    return NextResponse.json(
      { error: "Failed to get presence" },
      { status: 500 }
    )
  }
}
