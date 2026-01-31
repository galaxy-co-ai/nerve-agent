// =============================================================================
// Desktop Device Management - Delete/Update Device
// =============================================================================

import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"

// DELETE - Remove a paired device
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params

    // Find the device and verify ownership
    const device = await db.desktopDevice.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!device) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      )
    }

    if (device.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Delete the device
    await db.desktopDevice.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete device error:", error)
    return NextResponse.json(
      { error: "Failed to delete device" },
      { status: 500 }
    )
  }
}

// PATCH - Update device name
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params
    const body = await request.json()
    const { name } = body as { name?: string }

    // Find the device and verify ownership
    const device = await db.desktopDevice.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!device) {
      return NextResponse.json(
        { error: "Device not found" },
        { status: 404 }
      )
    }

    if (device.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Update the device
    const updated = await db.desktopDevice.update({
      where: { id },
      data: { name: name || undefined },
      select: {
        id: true,
        name: true,
        platform: true,
        lastSeenAt: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update device error:", error)
    return NextResponse.json(
      { error: "Failed to update device" },
      { status: 500 }
    )
  }
}
