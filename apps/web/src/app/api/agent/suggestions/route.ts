import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

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

    switch (action) {
      case "approve":
        updatedSuggestion = await db.agentSuggestion.update({
          where: { id: suggestionId },
          data: {
            status: "APPROVED",
            respondedAt: new Date(),
          },
        })
        // TODO: Execute the proposed action
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

    return NextResponse.json(updatedSuggestion)
  } catch (error) {
    console.error("Respond to suggestion error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to respond to suggestion" },
      { status: 500 }
    )
  }
}
