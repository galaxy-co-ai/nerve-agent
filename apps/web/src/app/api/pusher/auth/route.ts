// =============================================================================
// Pusher Channel Authorization
// =============================================================================
// Authenticates subscriptions to private channels for both:
// - Desktop app (via X-Nerve-Token header)
// - Web app (via session cookie)

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { authenticateChannel, getDesktopChannelName } from "@/lib/pusher"

export async function POST(request: NextRequest) {
  try {
    // Parse request body (form-urlencoded for Pusher client)
    const contentType = request.headers.get("content-type") || ""
    let socket_id: string
    let channel_name: string

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData()
      socket_id = formData.get("socket_id") as string
      channel_name = formData.get("channel_name") as string
    } else {
      const body = await request.json()
      socket_id = body.socket_id
      channel_name = body.channel_name
    }

    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: "Missing socket_id or channel_name" },
        { status: 400 }
      )
    }

    // Check for desktop app auth token first
    const authToken = request.headers.get("X-Nerve-Token")

    if (authToken) {
      // Desktop app authentication
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
    }

    // Web app authentication via session
    const user = await requireUser()

    // Verify the channel belongs to this user
    const expectedChannel = getDesktopChannelName(user.id)
    if (channel_name !== expectedChannel) {
      return NextResponse.json(
        { error: "Unauthorized channel" },
        { status: 403 }
      )
    }

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
