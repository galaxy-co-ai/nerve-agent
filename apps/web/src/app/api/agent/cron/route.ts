import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { runHeartbeat } from "@/lib/agent/core"

// Vercel Cron configuration
// Add to vercel.json:
// {
//   "crons": [{
//     "path": "/api/agent/cron",
//     "schedule": "0 */4 * * *"
//   }]
// }

// GET: Run the agent heartbeat for all users with proactive mode enabled
export async function GET(request: Request) {
  try {
    // Verify cron secret (optional but recommended for production)
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all users with proactive mode enabled
    const usersWithAgent = await db.agentPreferences.findMany({
      where: {
        proactiveEnabled: true,
      },
      select: {
        userId: true,
      },
    })

    const results: {
      userId: string
      suggestions: number
      skipped: boolean
      reason?: string
      error?: string
    }[] = []

    // Run heartbeat for each user
    for (const { userId } of usersWithAgent) {
      try {
        const result = await runHeartbeat(userId)
        results.push({ userId, ...result })
      } catch (error) {
        results.push({
          userId,
          suggestions: 0,
          skipped: true,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    const totalSuggestions = results.reduce((sum, r) => sum + r.suggestions, 0)
    const usersProcessed = results.filter((r) => !r.skipped).length

    return NextResponse.json({
      success: true,
      usersProcessed,
      totalSuggestions,
      results,
    })
  } catch (error) {
    console.error("Agent cron error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to run cron" },
      { status: 500 }
    )
  }
}
