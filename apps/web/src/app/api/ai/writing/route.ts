import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { requireUser } from "@/lib/auth"

const anthropic = new Anthropic()

type WritingAction = "continue" | "brainstorm" | "expand" | "summarize" | "rewrite" | "suggest-tags" | "generate-title"

interface WritingRequest {
  action: WritingAction
  content: string
  selection?: string
  context?: {
    title?: string
    projectName?: string
  }
}

const systemPrompts: Record<WritingAction, string> = {
  continue: `You are a writing assistant. Continue the user's text naturally, maintaining their voice and style.
Write 2-4 sentences that flow naturally from what they've written.
Do not add any preamble or explanation - just write the continuation.`,

  brainstorm: `You are a creative brainstorming assistant. Based on the given topic or text, generate ideas.
Format as a bulleted list with 5-8 concise, actionable ideas.
Be specific and practical. No preamble - just the list.`,

  expand: `You are a writing assistant. Take the selected text and expand it with more detail.
Add context, examples, or elaboration while maintaining the original meaning and tone.
Keep it concise - aim for 2-3x the original length. No preamble.`,

  summarize: `You are a writing assistant. Summarize the given text concisely.
Capture the key points in 1-3 sentences. No preamble - just the summary.`,

  rewrite: `You are a writing assistant. Rewrite the selected text to be clearer and more professional.
Improve clarity and flow while preserving the original meaning.
No preamble - just the rewritten text.`,

  "suggest-tags": `You are a note organization assistant. Based on the note content, suggest relevant tags.
Return a JSON array of 3-5 short, lowercase tag names (no # prefix).
Consider: topics, project names, content type (meeting, idea, research, todo).
Return ONLY the JSON array, no other text. Example: ["project-alpha", "meeting-notes", "api"]`,

  "generate-title": `You are a note organization assistant. Based on the note content, generate a concise title.
The title should be 2-4 words maximum, capturing the essence of the note.
Use title case. Be specific and descriptive.
Return ONLY the title, no quotes, no explanation. Examples: "API Auth Flow", "Meeting Notes", "Bug Fix Ideas"`,
}

export async function POST(request: NextRequest) {
  try {
    await requireUser()
    const body: WritingRequest = await request.json()
    const { action, content, selection, context } = body

    if (!action || !content) {
      return NextResponse.json(
        { error: "Action and content are required" },
        { status: 400 }
      )
    }

    let userMessage = ""
    const textToProcess = selection || content

    switch (action) {
      case "continue":
        userMessage = `Continue this text:\n\n${content}`
        break
      case "brainstorm":
        userMessage = `Brainstorm ideas based on:\n\n${textToProcess}`
        break
      case "expand":
        userMessage = `Expand this text:\n\n${textToProcess}`
        break
      case "summarize":
        userMessage = `Summarize this text:\n\n${textToProcess}`
        break
      case "rewrite":
        userMessage = `Rewrite this text:\n\n${textToProcess}`
        break
      case "suggest-tags":
        userMessage = `Note title: ${context?.title || "Untitled"}
${context?.projectName ? `Project: ${context.projectName}` : ""}

Note content:
${content}`
        break
      case "generate-title":
        userMessage = `Generate a 2-4 word title for this note:

${content}`
        break
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompts[action],
      messages: [{ role: "user", content: userMessage }],
    })

    const textContent = response.content.find((b) => b.type === "text")
    const result = textContent?.type === "text" ? textContent.text : ""

    // For suggest-tags, parse the JSON response
    if (action === "suggest-tags") {
      try {
        const tags = JSON.parse(result)
        return NextResponse.json({ result: tags })
      } catch {
        // If parsing fails, try to extract tags from text
        const tagMatch = result.match(/\[.*\]/)
        if (tagMatch) {
          const tags = JSON.parse(tagMatch[0])
          return NextResponse.json({ result: tags })
        }
        return NextResponse.json({ result: [] })
      }
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error("AI writing error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI writing failed" },
      { status: 500 }
    )
  }
}
