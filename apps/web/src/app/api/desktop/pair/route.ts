// =============================================================================
// Desktop Pairing - Generate Pairing Code
// =============================================================================
// Generates a 6-digit code for the user to enter in the desktop app

import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"

// Generate a random 6-digit code
function generatePairingCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST() {
  try {
    const user = await requireUser()

    // Delete any existing unused codes for this user
    await db.desktopPairingCode.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    })

    // Generate new code with 5-minute expiry
    const code = generatePairingCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    await db.desktopPairingCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    })

    return NextResponse.json({
      code,
      expiresAt: expiresAt.toISOString(),
      expiresIn: 300, // seconds
    })
  } catch (error) {
    console.error("Pairing code generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate pairing code" },
      { status: 500 }
    )
  }
}

// GET - Check if user has any paired devices
export async function GET() {
  try {
    const user = await requireUser()

    const devices = await db.desktopDevice.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        platform: true,
        lastSeenAt: true,
        createdAt: true,
      },
      orderBy: { lastSeenAt: "desc" },
    })

    return NextResponse.json({ devices })
  } catch (error) {
    console.error("Get devices error:", error)
    return NextResponse.json(
      { error: "Failed to get devices" },
      { status: 500 }
    )
  }
}
