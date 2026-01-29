import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

const anthropic = new Anthropic()

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const { prompt, chipId } = await request.json()

    // Fetch user's current context
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const [projects, inProgressTasks, blockers, upcomingDeadlines] = await Promise.all([
      // Active projects
      db.project.findMany({
        where: { userId: user.id, status: "ACTIVE" },
        select: {
          name: true,
          clientName: true,
          targetEndDate: true,
          _count: { select: { blockers: { where: { status: "ACTIVE" } } } },
        },
        take: 10,
      }),
      // In-progress tasks
      db.task.findMany({
        where: {
          status: "IN_PROGRESS",
          sprint: { project: { userId: user.id } },
        },
        select: {
          title: true,
          estimatedHours: true,
          sprint: {
            select: {
              name: true,
              project: { select: { name: true, clientName: true } },
            },
          },
        },
        take: 10,
      }),
      // Active blockers
      db.blocker.findMany({
        where: {
          status: "ACTIVE",
          project: { userId: user.id },
        },
        select: {
          title: true,
          description: true,
          waitingOn: true,
          createdAt: true,
          project: { select: { name: true } },
        },
        take: 10,
      }),
      // Tasks with upcoming sprint deadlines
      db.task.findMany({
        where: {
          status: { in: ["TODO", "IN_PROGRESS"] },
          sprint: {
            project: { userId: user.id },
            plannedEndDate: { gte: startOfDay },
          },
        },
        select: {
          title: true,
          estimatedHours: true,
          sprint: {
            select: {
              name: true,
              plannedEndDate: true,
              project: { select: { name: true } },
            },
          },
        },
        orderBy: { sprint: { plannedEndDate: "asc" } },
        take: 10,
      }),
    ])

    const contextSummary = `
Current Context:
- Active Projects: ${projects.length}
${projects.map(p => `  - ${p.name} (Client: ${p.clientName})${p._count.blockers > 0 ? ` - ${p._count.blockers} blockers` : ""}`).join("\n")}

- In-Progress Tasks: ${inProgressTasks.length}
${inProgressTasks.map(t => `  - ${t.title} (${t.sprint.project.name}, ${t.estimatedHours}h est.)`).join("\n")}

- Active Blockers: ${blockers.length}
${blockers.map(b => `  - ${b.title} - waiting on ${b.waitingOn} (${b.project.name})`).join("\n")}

- Upcoming Deadlines:
${upcomingDeadlines.map(t => `  - ${t.title} - ${t.sprint.project.name} (Sprint ends: ${t.sprint.plannedEndDate?.toLocaleDateString() || "No date"})`).join("\n")}
`

    const systemPrompt = `You are an AI assistant helping a solo developer plan their day. Based on their current projects, tasks, and blockers, create a focused work plan.

${contextSummary}

The user wants to plan their focus using this strategy: "${prompt}"

Respond with a JSON object in this exact format:
{
  "summary": "Brief explanation of your recommended focus strategy",
  "tasks": [
    {
      "title": "Task or action to focus on",
      "reason": "Why this should be prioritized",
      "estimatedTime": "Time estimate like '30 min' or '2 hours'"
    }
  ]
}

Provide 3-5 actionable tasks. Be specific and practical. If there are no relevant tasks for the strategy, suggest what the user should do instead.`

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Create my focus plan for today using the "${chipId}" strategy.`,
        },
      ],
      system: systemPrompt,
    })

    const textContent = response.content.find((b) => b.type === "text")
    const text = textContent?.type === "text" ? textContent.text : ""

    // Parse the JSON response
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const focusPlan = JSON.parse(jsonMatch[0])
        return NextResponse.json(focusPlan)
      }
    } catch {
      // If JSON parsing fails, return a structured error response
    }

    return NextResponse.json({
      summary: "I analyzed your current workload.",
      tasks: [
        {
          title: "Review your in-progress tasks",
          reason: "Start by reviewing what's already started",
          estimatedTime: "15 min",
        },
      ],
    })
  } catch (error) {
    console.error("Focus plan error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate focus plan" },
      { status: 500 }
    )
  }
}
