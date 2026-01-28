import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"

const anthropic = new Anthropic()

interface SearchRequest {
  query: string
  type?: "BLOCK" | "PATTERN" | "QUERY"
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const body: SearchRequest = await request.json()
    const { query, type } = body

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      )
    }

    // Fetch all library items for the user
    const items = await db.libraryItem.findMany({
      where: {
        userId: user.id,
        ...(type ? { type } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        code: true,
        language: true,
        type: true,
        usageCount: true,
      },
      orderBy: { usageCount: "desc" },
      take: 100, // Limit for context size
    })

    if (items.length === 0) {
      return NextResponse.json({ results: [] })
    }

    // Build item summaries for Claude
    const itemSummaries = items.map((item, index) => ({
      index,
      id: item.id,
      title: item.title,
      description: item.description || "",
      language: item.language,
      type: item.type,
      codePreview: item.code.slice(0, 500) + (item.code.length > 500 ? "..." : ""),
    }))

    // Ask Claude to rank items by relevance
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You are a code library search assistant. Given a user's natural language query, rank the provided code items by relevance.
Return a JSON array of the indices (from the provided list) of the most relevant items, ordered by relevance (most relevant first).
Only include items that are actually relevant to the query. Return at most 10 items.
Return ONLY the JSON array, no other text. Example: [2, 5, 0, 8]`,
      messages: [
        {
          role: "user",
          content: `Query: "${query}"

Available items:
${JSON.stringify(itemSummaries, null, 2)}

Return the indices of relevant items as a JSON array.`,
        },
      ],
    })

    const textContent = response.content.find((b) => b.type === "text")
    const result = textContent?.type === "text" ? textContent.text : "[]"

    // Parse the indices
    let indices: number[] = []
    try {
      // Try to extract JSON array from response
      const match = result.match(/\[[\d,\s]*\]/)
      if (match) {
        indices = JSON.parse(match[0])
      }
    } catch {
      console.error("Failed to parse AI search results")
    }

    // Map indices back to items
    const results = indices
      .filter((i) => i >= 0 && i < items.length)
      .map((i) => items[i])

    return NextResponse.json({ results })
  } catch (error) {
    console.error("AI search error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    )
  }
}
