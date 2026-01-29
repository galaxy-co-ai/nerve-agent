import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { requireUser } from "@/lib/auth"

const anthropic = new Anthropic()

const SYSTEM_PROMPT = `You are a note organization assistant. Your job is to take a brain dump of unstructured text and split it into separate, organized notes.

Each note should have:
1. A clear, concise title (max 60 chars)
2. The relevant content from the brain dump
3. A tag from EXACTLY these 5 categories:
   - "idea" - product ideas, features, brainstorms, possibilities
   - "task" - action items, todos, next steps, things to do
   - "reference" - documentation, code snippets, how-tos, facts to remember
   - "insight" - learnings, patterns, observations, realizations
   - "decision" - choices made, rationale, trade-offs, conclusions

Rules:
- Split logically - each note should be about ONE topic
- Keep content focused and clean
- Don't lose any information from the original
- Use the most appropriate single tag for each note
- If content is ambiguous, prefer "insight" over "idea"
- TODOs and action items are always "task"
- Code snippets and docs are always "reference"

Respond with a JSON array of notes:
[
  { "title": "Note Title", "content": "Note content here...", "tag": "idea" },
  ...
]

Only respond with valid JSON. No markdown, no explanation.`

export async function POST(request: Request) {
  try {
    await requireUser()

    const { content } = await request.json()

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Parse this brain dump into organized notes:\n\n${content}`,
        },
      ],
      system: SYSTEM_PROMPT,
    })

    // Extract the text content
    const textContent = message.content.find((block) => block.type === "text")
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI")
    }

    // Parse the JSON response
    let notes
    try {
      notes = JSON.parse(textContent.text)
    } catch {
      // Try to extract JSON from the response if it has extra text
      const jsonMatch = textContent.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        notes = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Failed to parse AI response as JSON")
      }
    }

    // Validate the structure
    if (!Array.isArray(notes)) {
      throw new Error("Response is not an array")
    }

    const validTags = ["idea", "task", "reference", "insight", "decision"]
    const validatedNotes = notes.map((note: { title?: string; content?: string; tag?: string }) => ({
      title: String(note.title || "Untitled").slice(0, 60),
      content: String(note.content || ""),
      tag: validTags.includes(note.tag || "") ? note.tag : "insight",
    }))

    return NextResponse.json({ notes: validatedNotes })
  } catch (error) {
    console.error("Error parsing notes:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse notes" },
      { status: 500 }
    )
  }
}
