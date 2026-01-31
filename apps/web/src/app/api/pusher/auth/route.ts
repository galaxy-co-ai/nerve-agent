// =============================================================================
// Pusher Channel Authorization
// =============================================================================
// Authenticates desktop app subscriptions to private channels

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authenticateChannel, getDesktopChannelName } from "@/lib/pusher"

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header (desktop app sends this)
    const authToken = request.headers.get("X-Nerve-Token")

    if (!authToken) {
      return NextResponse.json(
        { error: "Missing auth token" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { socket_id, channel_name } = body as {
      socket_id: string
      channel_name: string
    }

    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: "Missing socket_id or channel_name" },
        { status: 400 }
      )
    }

    // Validate the auth token and get the device
    const device = await db.desktopDevice.findUnique({
      where: { authToken },
      select: { userId: true, deviceId: true },
    })

    if (!device) {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      )
    }

    // Verify the channel belongs to this user
    const expectedChannel = getDesktopChannelName(device.userId)
    if (channel_name !== expectedChannel) {
      return NextResponse.json(
        { error: "Unauthorized channel" },
        { status: 403 }
      )
    }

    // Update last seen timestamp
    await db.desktopDevice.update({
      where: { authToken },
      data: { lastSeenAt: new Date() },
    })

    // Generate auth response
    const authResponse = authenticateChannel(socket_id, channel_name)

    return NextResponse.json(authResponse)
  } catch (error) {
    console.error("Pusher auth error:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}
