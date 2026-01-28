import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { requireUser } from "@/lib/auth"

const anthropic = new Anthropic()

interface ProcessCallRequest {
  transcript: string
  projectName?: string
  clientName?: string
}

interface ProcessedCall {
  summary: string
  actionItems: Array<{
    text: string
    assignedTo: string
    dueDate?: string
  }>
  decisions: Array<{
    text: string
    decidedBy: string
  }>
  sentiment: "POSITIVE" | "NEUTRAL" | "CONCERNED"
}

const systemPrompt = `You are an AI assistant that analyzes call transcripts for a software development consultancy. Your job is to extract key information and structure it for easy reference.

Analyze the transcript and extract:
1. A concise summary (2-4 sentences capturing the main topics and outcomes)
2. Action items (tasks that need to be done, with who should do them)
3. Decisions made during the call (what was decided and by whom)
4. Overall client sentiment (POSITIVE, NEUTRAL, or CONCERNED)

Guidelines:
- For action items, assign to either "me" (the developer/consultant) or "client"
- Include due dates only if explicitly mentioned in the transcript
- For decisions, note who made or agreed to the decision
- Sentiment should reflect the client's overall tone and satisfaction level
- Be concise but capture all important details

Respond with a JSON object in this exact format:
{
  "summary": "string",
  "actionItems": [{"text": "string", "assignedTo": "me|client", "dueDate": "optional string"}],
  "decisions": [{"text": "string", "decidedBy": "string"}],
  "sentiment": "POSITIVE|NEUTRAL|CONCERNED"
}

Return ONLY the JSON object, no markdown formatting or additional text.`

export async function POST(request: NextRequest) {
  try {
    await requireUser()
    const body: ProcessCallRequest = await request.json()
    const { transcript, projectName, clientName } = body

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      )
    }

    const contextInfo = [
      projectName && `Project: ${projectName}`,
      clientName && `Client: ${clientName}`,
    ]
      .filter(Boolean)
      .join("\n")

    const userMessage = `${contextInfo ? contextInfo + "\n\n" : ""}Transcript:\n${transcript}`

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    })

    const textContent = response.content.find((b) => b.type === "text")
    const result = textContent?.type === "text" ? textContent.text : ""

    // Parse the JSON response
    try {
      // Clean up the response in case it has markdown formatting
      const cleanJson = result
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()

      const parsed: ProcessedCall = JSON.parse(cleanJson)

      // Validate the structure
      if (
        typeof parsed.summary !== "string" ||
        !Array.isArray(parsed.actionItems) ||
        !Array.isArray(parsed.decisions) ||
        !["POSITIVE", "NEUTRAL", "CONCERNED"].includes(parsed.sentiment)
      ) {
        throw new Error("Invalid response structure")
      }

      return NextResponse.json(parsed)
    } catch (parseError) {
      console.error("Failed to parse AI response:", result)
      // Return a default structure if parsing fails
      return NextResponse.json({
        summary: "Failed to generate summary. Please review the transcript manually.",
        actionItems: [],
        decisions: [],
        sentiment: "NEUTRAL",
      })
    }
  } catch (error) {
    console.error("Call processing error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Call processing failed" },
      { status: 500 }
    )
  }
}
