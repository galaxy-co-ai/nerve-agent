import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"
import { buildSuggestionPrompt } from "@/lib/agent/prompts"
import { buildAgentContext, formatContextForPrompt } from "@/lib/agent/context"

const anthropic = new Anthropic()

// POST: Trigger an event for the agent to analyze
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const { triggerType, entityId, entityData } = await request.json()

    if (!triggerType) {
      return NextResponse.json(
        { error: "triggerType is required" },
        { status: 400 }
      )
    }

    // Build context for the trigger
    const context = await buildAgentContext(user.id)
    const baseContext = formatContextForPrompt(context)

    // Add entity-specific context
    let entityContext = ""
    if (entityId && entityData) {
      entityContext = `\n\n## Trigger Entity\nID: ${entityId}\n${JSON.stringify(entityData, null, 2)}`
    }

    const fullContext = baseContext + entityContext
    const prompt = buildSuggestionPrompt(triggerType, fullContext)

    // Ask Claude if we should create a suggestion
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    })

    // Parse the response
    const textBlock = response.content.find((b) => b.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ created: false, reason: "No response from agent" })
    }

    try {
      const result = JSON.parse(textBlock.text)

      if (result.shouldSuggest && result.suggestion) {
        // Create the suggestion
        const suggestion = await db.agentSuggestion.create({
          data: {
            userId: user.id,
            triggerType,
            triggerEntityId: entityId,
            type: "suggestion",
            title: result.suggestion.title,
            description: result.suggestion.description,
            proposedAction: result.suggestion.proposedAction,
            urgency: result.suggestion.urgency || "normal",
          },
        })

        return NextResponse.json({ created: true, suggestion })
      }

      return NextResponse.json({ created: false, reason: "Agent decided not to suggest" })
    } catch {
      return NextResponse.json({ created: false, reason: "Failed to parse agent response" })
    }
  } catch (error) {
    console.error("Agent trigger error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process trigger" },
      { status: 500 }
    )
  }
}
