import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { generate } from "@/lib/ai/providers"
import { z } from "zod"

const organizeSchema = z.object({
  noteId: z.string(),
})

interface FolderSuggestion {
  folderId: string
  folderName: string
  folderSlug: string
  confidence: number
  reasoning: string
  suggestedTags: string[]
}

const ORGANIZATION_SYSTEM_PROMPT = `You are a note organization assistant for a personal knowledge base. Your job is to classify notes into the appropriate folder based on their content.

Available folders:
- inbox: Landing zone, should only be used if content is truly ambiguous
- ideas: Raw concepts, brainstorms, speculative thoughts, "what if" scenarios, possibilities
- research: Facts, references, external knowledge, articles, documentation, things learned
- decisions: Choices made and their reasoning, trade-offs considered, "decided to", "chose"
- processes: Step-by-step guides, workflows, SOPs, how-to instructions, checklists
- learnings: Lessons from experience, reflections, retrospectives, "learned that", mistakes, insights
- archive: Only for explicitly outdated or completed content (rare)

Classification rules:
1. Match based on the PRIMARY purpose of the note
2. "Ideas" = speculative, creative, exploratory
3. "Research" = factual, informational, reference material
4. "Decisions" = contains reasoning for a choice made
5. "Processes" = instructional, procedural, step-by-step
6. "Learnings" = reflective, lessons, retrospective

For tags, choose 1-3 from: idea, task, reference, insight, decision

Respond ONLY with valid JSON in this exact format:
{
  "folder": "folder-slug",
  "confidence": 85,
  "reasoning": "One sentence explaining why",
  "tags": ["tag1", "tag2"]
}`

/**
 * POST /api/notes/organize
 *
 * Analyzes a note's content and suggests a folder + tags.
 * Returns confidence score (0-100).
 * If confidence >= 75, the note is auto-moved.
 * If confidence < 75, returns suggestion for user confirmation.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const body = await request.json()
    const { noteId } = organizeSchema.parse(body)

    // Get the note
    const note = await db.note.findFirst({
      where: { id: noteId, userId: user.id },
      include: {
        folder: { select: { id: true, name: true, slug: true } },
      },
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    // Get user's folders
    const folders = await db.noteFolder.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, slug: true },
    })

    const folderMap = new Map(folders.map((f) => [f.slug, f]))

    // Build the prompt
    const contentPreview = note.content.slice(0, 2000)
    const prompt = `Classify this note:

Title: ${note.title}

Content:
${contentPreview}

Respond with JSON only.`

    // Call AI for classification
    const result = await generate({
      task: "quick-generate",
      systemPrompt: ORGANIZATION_SYSTEM_PROMPT,
      prompt,
      maxTokens: 256,
      temperature: 0.3,
    })

    // Parse AI response
    let aiResponse: {
      folder: string
      confidence: number
      reasoning: string
      tags: string[]
    }

    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = result.content.trim()
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```$/g, "").trim()
      }
      aiResponse = JSON.parse(jsonStr)
    } catch {
      console.error("Failed to parse AI response:", result.content)
      // Default to inbox with low confidence
      aiResponse = {
        folder: "inbox",
        confidence: 30,
        reasoning: "Could not analyze content",
        tags: [],
      }
    }

    // Validate folder exists
    const targetFolder = folderMap.get(aiResponse.folder)
    if (!targetFolder) {
      // Default to inbox
      const inboxFolder = folderMap.get("inbox")
      if (!inboxFolder) {
        return NextResponse.json(
          { error: "No inbox folder found" },
          { status: 500 }
        )
      }
      aiResponse.folder = "inbox"
      aiResponse.confidence = Math.min(aiResponse.confidence, 50)
    }

    const finalFolder = folderMap.get(aiResponse.folder)!
    const confidence = Math.max(0, Math.min(100, aiResponse.confidence))
    const autoMove = confidence >= 75

    // If high confidence, auto-move the note
    if (autoMove) {
      await db.note.update({
        where: { id: noteId },
        data: {
          folderId: finalFolder.id,
          aiConfidence: confidence,
          aiReasoning: aiResponse.reasoning,
          tags: aiResponse.tags,
          wasManuallyMoved: false,
        },
      })
    }

    const suggestion: FolderSuggestion = {
      folderId: finalFolder.id,
      folderName: finalFolder.name,
      folderSlug: finalFolder.slug,
      confidence,
      reasoning: aiResponse.reasoning,
      suggestedTags: aiResponse.tags,
    }

    return NextResponse.json({
      ...suggestion,
      autoMoved: autoMove,
      previousFolder: note.folder
        ? { id: note.folder.id, name: note.folder.name, slug: note.folder.slug }
        : null,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Failed to organize note:", error)
    return NextResponse.json(
      { error: "Failed to organize note" },
      { status: 500 }
    )
  }
}
