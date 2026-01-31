// =============================================================================
// Desktop Status - Check if Desktop App is Connected
// =============================================================================

import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"

// Consider a device "online" if seen in the last 2 minutes
const ONLINE_THRESHOLD_MS = 2 * 60 * 1000

export async function GET() {
  try {
    const user = await requireUser()

    // Get all devices for this user
    const devices = await db.desktopDevice.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        deviceId: true,
        name: true,
        platform: true,
        lastSeenAt: true,
        createdAt: true,
      },
      orderBy: { lastSeenAt: "desc" },
    })

    const now = Date.now()
    const devicesWithStatus = devices.map((device) => ({
      ...device,
      isOnline: now - device.lastSeenAt.getTime() < ONLINE_THRESHOLD_MS,
    }))

    const hasOnlineDevice = devicesWithStatus.some((d) => d.isOnline)

    return NextResponse.json({
      connected: hasOnlineDevice,
      devices: devicesWithStatus,
    })
  } catch (error) {
    console.error("Desktop status error:", error)
    return NextResponse.json(
      { error: "Failed to get desktop status" },
      { status: 500 }
    )
  }
}
