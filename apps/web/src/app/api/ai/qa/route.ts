import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

const anthropic = new Anthropic()

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const { question, context } = await request.json()

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    // Fetch user's current context for the AI
    const [projects, recentTasks, recentNotes, blockers] = await Promise.all([
      db.project.findMany({
        where: { userId: user.id },
        select: {
          name: true,
          slug: true,
          clientName: true,
          status: true,
          description: true,
          _count: {
            select: {
              sprints: true,
              blockers: { where: { status: "ACTIVE" } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      db.task.findMany({
        where: {
          sprint: { project: { userId: user.id } },
        },
        select: {
          title: true,
          status: true,
          estimatedHours: true,
          actualHours: true,
          sprint: {
            select: {
              name: true,
              number: true,
              project: { select: { name: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 20,
      }),
      db.note.findMany({
        where: { userId: user.id },
        select: {
          title: true,
          content: true,
          tags: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      db.blocker.findMany({
        where: {
          status: "ACTIVE",
          project: { userId: user.id },
        },
        select: {
          title: true,
          description: true,
          waitingOn: true,
          project: { select: { name: true } },
        },
        take: 10,
      }),
    ])

    const contextSummary = `
User's NERVE AGENT Data:

Projects (${projects.length}):
${projects.map(p => `- ${p.name} (${p.status}) - Client: ${p.clientName}
  ${p.description ? `Description: ${p.description}` : ""}
  Sprints: ${p._count.sprints}, Active Blockers: ${p._count.blockers}`).join("\n")}

Recent Tasks (${recentTasks.length}):
${recentTasks.map(t => `- [${t.status}] ${t.title} (${t.sprint.project.name} / Sprint ${t.sprint.number})
  Est: ${t.estimatedHours}h, Actual: ${t.actualHours}h`).join("\n")}

Active Blockers (${blockers.length}):
${blockers.map(b => `- ${b.title} (${b.project.name}) - Waiting on: ${b.waitingOn}
  ${b.description || ""}`).join("\n")}

Recent Notes (${recentNotes.length}):
${recentNotes.map(n => `- ${n.title}
  ${(n.content as string).substring(0, 200)}...`).join("\n")}
`

    const systemPrompt = `You are an AI assistant integrated into NERVE AGENT, a project management system for solo developers.

You have access to the user's project data, tasks, notes, and blockers. Answer their questions helpfully and specifically based on this context.

${contextSummary}

Guidelines:
- Be concise but thorough
- Reference specific projects, tasks, or data when relevant
- If you don't have enough information to answer, say so
- Offer actionable suggestions when appropriate
- Keep responses focused and practical`

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
      system: systemPrompt,
    })

    const textContent = response.content.find((b) => b.type === "text")
    const answer = textContent?.type === "text" ? textContent.text : "I couldn't generate a response."

    // Log to FAQ database
    const faq = await db.faq.create({
      data: {
        userId: user.id,
        question: question.trim(),
        answer,
        context: context || "dashboard",
      },
    })

    return NextResponse.json({
      id: faq.id,
      question: question.trim(),
      answer,
    })
  } catch (error) {
    console.error("Q&A error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to answer question" },
      { status: 500 }
    )
  }
}

// Update FAQ feedback
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser()
    const { id, isHelpful } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "FAQ ID is required" }, { status: 400 })
    }

    await db.faq.update({
      where: { id, userId: user.id },
      data: { isHelpful },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("FAQ feedback error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update feedback" },
      { status: 500 }
    )
  }
}
