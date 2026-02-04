// =============================================================================
// Daily Time Anchor API - Merkle Tree Generation + Blockchain Anchoring
// =============================================================================
//
// This endpoint should be called daily (via cron) to:
// 1. Collect all unanchored time entries for a given date
// 2. Build a Merkle tree from their verification hashes
// 3. Anchor the root to Polygon
// 4. Update entries with their merkle proofs
//
// POST /api/time/anchor
// Body: { date?: string } (defaults to yesterday if not provided)
//
// =============================================================================

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin, getCurrentUser } from "@/lib/auth"
import {
  buildMerkleTree,
  anchorToPolygon,
  getPolygonscanUrl,
} from "@/lib/time-verification"

export async function POST(request: Request) {
  try {
    // Only Admin users can trigger anchoring
    await requireAdmin()
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))

    // Default to yesterday (ensures all entries for the day are in)
    const targetDate = body.date
      ? new Date(body.date)
      : new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Set to start of day
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Check if already anchored for this date
    const existingAnchor = await db.timeAnchor.findUnique({
      where: { date: startOfDay },
    })

    if (existingAnchor?.txHash) {
      return NextResponse.json({
        success: true,
        alreadyAnchored: true,
        anchor: existingAnchor,
        polygonscanUrl: getPolygonscanUrl(existingAnchor.txHash),
      })
    }

    // Get all unanchored entries for this user on this date
    const entries = await db.timeEntry.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        verificationHash: { not: null },
        anchoredAt: null,
      },
      select: {
        id: true,
        verificationHash: true,
      },
      orderBy: { startTime: "asc" },
    })

    if (entries.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No unanchored entries for this date",
        entryCount: 0,
      })
    }

    // Extract hashes (filter out any nulls just in case)
    const hashes = entries
      .map((e) => e.verificationHash)
      .filter((h): h is string => h !== null)

    // Build Merkle tree
    const { root, proofs } = buildMerkleTree(hashes)

    // Create or update the anchor record
    const anchor = await db.timeAnchor.upsert({
      where: { date: startOfDay },
      create: {
        date: startOfDay,
        merkleRoot: root,
        entryCount: entries.length,
      },
      update: {
        merkleRoot: root,
        entryCount: entries.length,
      },
    })

    // Attempt Polygon anchoring
    const polygonResult = await anchorToPolygon(root, startOfDay, entries.length)

    if (polygonResult) {
      // Update anchor with tx hash
      await db.timeAnchor.update({
        where: { id: anchor.id },
        data: {
          txHash: polygonResult.txHash,
          chainId: polygonResult.chainId,
        },
      })

      // Update all entries with their proofs and anchor info
      const updatePromises = entries.map((entry) => {
        const proof = proofs.get(entry.verificationHash!)
        return db.timeEntry.update({
          where: { id: entry.id },
          data: {
            merkleProof: proof || [],
            anchoredAt: new Date(),
            anchorTxHash: polygonResult.txHash,
          },
        })
      })

      await Promise.all(updatePromises)

      return NextResponse.json({
        success: true,
        anchored: true,
        anchor: {
          ...anchor,
          txHash: polygonResult.txHash,
          chainId: polygonResult.chainId,
        },
        entryCount: entries.length,
        polygonscanUrl: getPolygonscanUrl(polygonResult.txHash),
      })
    }

    // Polygon not configured or failed - still return success with local anchor
    return NextResponse.json({
      success: true,
      anchored: false,
      anchor,
      entryCount: entries.length,
      message: "Merkle tree created but Polygon anchoring not configured",
    })
  } catch (error) {
    console.error("[TimeAnchor] Error:", error)
    return NextResponse.json(
      { error: "Failed to create time anchor" },
      { status: 500 }
    )
  }
}

// GET /api/time/anchor?date=YYYY-MM-DD
// Get anchor status for a date
export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")

    const targetDate = dateParam ? new Date(dateParam) : new Date()
    targetDate.setHours(0, 0, 0, 0)

    const anchor = await db.timeAnchor.findUnique({
      where: { date: targetDate },
    })

    if (!anchor) {
      return NextResponse.json({
        exists: false,
        date: targetDate.toISOString().split("T")[0],
      })
    }

    return NextResponse.json({
      exists: true,
      anchor,
      polygonscanUrl: anchor.txHash ? getPolygonscanUrl(anchor.txHash) : null,
    })
  } catch (error) {
    console.error("[TimeAnchor] GET Error:", error)
    return NextResponse.json(
      { error: "Failed to get anchor status" },
      { status: 500 }
    )
  }
}
