import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { chatWithAgent } from "@/lib/agent/core"

// POST: Send a message to the agent and get a response
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const { message, conversationId } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const response = await chatWithAgent(
      user.id,
      conversationId || null,
      message.trim()
    )

    return NextResponse.json(response)
  } catch (error) {
    console.error("Agent chat error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to chat with agent" },
      { status: 500 }
    )
  }
}
