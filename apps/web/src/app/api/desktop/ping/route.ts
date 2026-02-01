// =============================================================================
// Desktop API - Ping (Health Check)
// =============================================================================
// Simple health check endpoint for desktop app to verify connection

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// Helper to extract auth token from either header format
function getAuthToken(request: NextRequest): string | null {
  // Try X-Nerve-Token first (desktop client format)
  const nerveToken = request.headers.get("X-Nerve-Token")
  if (nerveToken) return nerveToken

  // Fall back to Authorization: Bearer format
  const authHeader = request.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "")
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const authToken = getAuthToken(request)

    if (!authToken) {
      return NextResponse.json(
        { error: "Missing authorization" },
        { status: 401 }
      )
    }

    // Verify the auth token is valid
    const device = await db.desktopDevice.findUnique({
      where: { authToken },
      select: {
        id: true,
        deviceId: true,
        name: true,
        lastSeenAt: true,
      },
    })

    if (!device) {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 }
      )
    }

    // Update last seen
    await db.desktopDevice.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date() },
    })

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      device: {
        id: device.deviceId,
        name: device.name,
      },
    })
  } catch (error) {
    console.error("Ping error:", error)

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
