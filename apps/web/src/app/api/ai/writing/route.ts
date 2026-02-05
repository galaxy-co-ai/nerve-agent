import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { requireUser } from "@/lib/auth"

const anthropic = new Anthropic()

type WritingAction = "continue" | "brainstorm" | "expand" | "summarize" | "rewrite" | "suggest-tags" | "generate-title" | "suggest-folder"

interface WritingRequest {
  action: WritingAction
  content: string
  selection?: string
  context?: {
    title?: string
    projectName?: string
    folders?: Array<{ id: string; name: string }>
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
Return a JSON array of 1-3 tags from this list: idea, task, reference, insight, decision, call, meeting.
- idea: brainstorms, speculative thoughts, possibilities
- task: actionable items, todos
- reference: facts, documentation, external knowledge
- insight: realizations, lessons learned
- decision: choices made with reasoning
- call: phone/video call notes or transcripts
- meeting: in-person or scheduled meeting notes
Return ONLY the JSON array, no other text. Example: ["meeting", "decision"]`,

  "generate-title": `You are a note organization assistant. Based on the note content, generate a concise title.
The title should be 2-4 words maximum, capturing the essence of the note.
Use title case. Be specific and descriptive.
Return ONLY the title, no quotes, no explanation. Examples: "API Auth Flow", "Meeting Notes", "Bug Fix Ideas"`,

  "suggest-folder": `You are a note organization assistant. Based on the note content and title, suggest the most appropriate folder.
The user has these folders available. You must return a JSON object with the folderId of the best match.
Consider the note's topic, purpose, and content type when making your selection.
Return ONLY valid JSON in this format: {"folderId": "<id>", "confidence": <0-1>, "reasoning": "<brief explanation>"}
If no folder is clearly appropriate, suggest "inbox" or the first folder as fallback.`,
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
      case "suggest-folder":
        const foldersInfo = context?.folders ? JSON.stringify(context.folders) : "[]"
        userMessage = `Note title: ${context?.title || "Untitled"}

Available folders (pick the best match):
${foldersInfo}

Note content:
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

    // For suggest-folder, parse the JSON response
    if (action === "suggest-folder") {
      try {
        const folderSuggestion = JSON.parse(result)
        return NextResponse.json({ result: folderSuggestion })
      } catch {
        // If parsing fails, try to extract JSON from text
        const jsonMatch = result.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const folderSuggestion = JSON.parse(jsonMatch[0])
          return NextResponse.json({ result: folderSuggestion })
        }
        return NextResponse.json({ result: null })
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
