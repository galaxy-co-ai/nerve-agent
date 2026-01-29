import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { executeAction } from "@/lib/agent/actions"

// GET: List all pending suggestions for the user
export async function GET() {
  try {
    const user = await requireUser()

    const suggestions = await db.agentSuggestion.findMany({
      where: {
        userId: user.id,
        status: "PENDING",
      },
      orderBy: [
        { urgency: "desc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error("Get suggestions error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get suggestions" },
      { status: 500 }
    )
  }
}

// POST: Respond to a suggestion (approve, dismiss, edit)
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const { suggestionId, action, dismissReason } = await request.json()

    if (!suggestionId || !action) {
      return NextResponse.json(
        { error: "suggestionId and action are required" },
        { status: 400 }
      )
    }

    // Verify the suggestion belongs to this user
    const suggestion = await db.agentSuggestion.findFirst({
      where: {
        id: suggestionId,
        userId: user.id,
      },
    })

    if (!suggestion) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      )
    }

    let updatedSuggestion
    let actionResult = null

    switch (action) {
      case "approve":
        updatedSuggestion = await db.agentSuggestion.update({
          where: { id: suggestionId },
          data: {
            status: "APPROVED",
            respondedAt: new Date(),
          },
        })

        // Execute the proposed action if there's an action payload
        if (suggestion.actionPayload) {
          try {
            const payload = suggestion.actionPayload as { actionType?: string; params?: Record<string, unknown> }
            if (payload.actionType) {
              actionResult = await executeAction(
                user.id,
                payload.actionType,
                payload.params || {}
              )
            }
          } catch (execError) {
            console.error("Failed to execute action:", execError)
            // Don't fail the whole request, just log it
          }
        }
        break

      case "dismiss":
        updatedSuggestion = await db.agentSuggestion.update({
          where: { id: suggestionId },
          data: {
            status: "DISMISSED",
            respondedAt: new Date(),
            dismissReason: dismissReason || null,
          },
        })
        break

      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'approve' or 'dismiss'" },
          { status: 400 }
        )
    }

    return NextResponse.json({ suggestion: updatedSuggestion, actionResult })
  } catch (error) {
    console.error("Respond to suggestion error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to respond to suggestion" },
      { status: 500 }
    )
  }
}
