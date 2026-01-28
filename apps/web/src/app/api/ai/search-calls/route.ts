import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"

const anthropic = new Anthropic()

interface SearchRequest {
  query: string
  projectId?: string
}

interface CallSearchResult {
  callId: string
  title: string
  callDate: string
  projectName: string
  relevance: number
  context: string
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const body: SearchRequest = await request.json()
    const { query, projectId } = body

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      )
    }

    // Fetch recent calls for the user (limit to 50 for context size)
    const calls = await db.call.findMany({
      where: {
        userId: user.id,
        ...(projectId ? { projectId } : {}),
      },
      select: {
        id: true,
        title: true,
        callDate: true,
        transcript: true,
        summary: true,
        project: {
          select: { name: true },
        },
      },
      orderBy: { callDate: "desc" },
      take: 50,
    })

    if (calls.length === 0) {
      return NextResponse.json({ results: [] })
    }

    // Build call summaries for Claude
    const callSummaries = calls.map((call, index) => ({
      index,
      id: call.id,
      title: call.title,
      date: call.callDate.toISOString().split("T")[0],
      projectName: call.project.name,
      summary: call.summary || "",
      transcriptPreview: call.transcript.slice(0, 1000) + (call.transcript.length > 1000 ? "..." : ""),
    }))

    // Ask Claude to rank calls by relevance and extract context
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: `You are a call search assistant. Given a user's natural language query, analyze the provided call transcripts and summaries to find the most relevant calls.

For each relevant call, extract a brief context snippet (1-2 sentences) that shows why it's relevant to the query.

Return a JSON object with this exact format:
{
  "results": [
    {
      "index": <number>,
      "relevance": <1-10>,
      "context": "<brief snippet explaining relevance>"
    }
  ]
}

Guidelines:
- Only include calls that are actually relevant to the query
- Relevance score: 10 = perfect match, 1 = loosely related
- Context should be specific quotes or paraphrases from the call
- Return at most 10 results, ordered by relevance (highest first)
- Return ONLY the JSON object, no markdown formatting

Return {"results": []} if no calls match the query.`,
      messages: [
        {
          role: "user",
          content: `Query: "${query}"

Available calls:
${JSON.stringify(callSummaries, null, 2)}`,
        },
      ],
    })

    const textContent = response.content.find((b) => b.type === "text")
    const result = textContent?.type === "text" ? textContent.text : '{"results": []}'

    // Parse the response
    let searchResults: CallSearchResult[] = []
    try {
      // Clean up response in case of markdown
      const cleanJson = result
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()

      const parsed = JSON.parse(cleanJson)

      if (Array.isArray(parsed.results)) {
        searchResults = parsed.results
          .filter((r: { index: number }) => r.index >= 0 && r.index < calls.length)
          .map((r: { index: number; relevance: number; context: string }) => {
            const call = calls[r.index]
            return {
              callId: call.id,
              title: call.title,
              callDate: call.callDate.toISOString(),
              projectName: call.project.name,
              relevance: r.relevance,
              context: r.context,
            }
          })
      }
    } catch (parseError) {
      console.error("Failed to parse AI search results:", result)
    }

    return NextResponse.json({ results: searchResults })
  } catch (error) {
    console.error("Call search error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    )
  }
}
