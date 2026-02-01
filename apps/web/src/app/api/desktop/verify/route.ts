// =============================================================================
// Desktop Pairing - Verify Code and Register Device
// =============================================================================
// Desktop app calls this with the 6-digit code to complete pairing

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, deviceId, platform, name } = body as {
      code: string
      deviceId: string
      platform: string
      name?: string
    }

    // Validate required fields
    if (!code || !deviceId || !platform) {
      return NextResponse.json(
        { error: "Missing required fields: code, deviceId, platform" },
        { status: 400 }
      )
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Invalid code format" },
        { status: 400 }
      )
    }

    // Find the pairing code
    const pairingCode = await db.desktopPairingCode.findUnique({
      where: { code },
      include: { user: true },
    })

    if (!pairingCode) {
      return NextResponse.json(
        { error: "Invalid pairing code" },
        { status: 400 }
      )
    }

    // Check if code is expired
    if (pairingCode.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Pairing code expired" },
        { status: 400 }
      )
    }

    // Check if code was already used
    if (pairingCode.usedAt) {
      return NextResponse.json(
        { error: "Pairing code already used" },
        { status: 400 }
      )
    }

    // Generate auth token for the device
    const authToken = randomUUID()

    // Check if device already exists (re-pairing)
    const existingDevice = await db.desktopDevice.findUnique({
      where: { deviceId },
    })

    if (existingDevice) {
      // Update existing device with new auth token
      await db.desktopDevice.update({
        where: { deviceId },
        data: {
          userId: pairingCode.userId,
          authToken,
          name: name || existingDevice.name,
          platform,
          lastSeenAt: new Date(),
        },
      })
    } else {
      // Create new device record
      await db.desktopDevice.create({
        data: {
          userId: pairingCode.userId,
          deviceId,
          authToken,
          name: name || `Desktop (${platform})`,
          platform,
        },
      })
    }

    // Mark the pairing code as used
    await db.desktopPairingCode.update({
      where: { id: pairingCode.id },
      data: { usedAt: new Date() },
    })

    // Return auth credentials
    return NextResponse.json({
      authToken,
      userId: pairingCode.userId,
      pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY || "f919f7a62de70f654108",
      pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
    })
  } catch (error) {
    console.error("Device verification error:", error)
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    )
  }
}
