import Anthropic from "@anthropic-ai/sdk"
import { db } from "@/lib/db"
import { buildAgentContext, formatContextForPrompt, isInQuietHours } from "./context"
import { buildChatSystemPrompt, buildHeartbeatPrompt } from "./prompts"
import { AGENT_TOOLS, AgentToolName } from "./tools"
import { executeAction } from "./actions"

// =============================================================================
// Core Agent Module
// =============================================================================

const anthropic = new Anthropic()

// =============================================================================
// Chat with Agent
// =============================================================================

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface ChatResponse {
  message: string
  toolResults?: {
    name: string
    result: unknown
  }[]
}

export async function chatWithAgent(
  userId: string,
  conversationId: string | null,
  userMessage: string
): Promise<ChatResponse> {
  // Build context
  const context = await buildAgentContext(userId)
  const systemPrompt = buildChatSystemPrompt({
    name: context.user.name,
    timezone: context.user.timezone,
    preferredStyle: context.user.preferredStyle,
    projectCount: context.stats.totalProjects,
    activeBlockers: context.stats.activeBlockers,
  })

  // Get or create conversation
  let conversation
  if (conversationId) {
    conversation = await db.agentConversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
    })
  }

  if (!conversation) {
    conversation = await db.agentConversation.create({
      data: { userId },
      include: { messages: true },
    })
  }

  // Build message history
  const messages: Anthropic.MessageParam[] = conversation.messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }))

  // Add context as a system-level user message if this is a fresh conversation
  if (messages.length === 0) {
    messages.push({
      role: "user",
      content: `[Context for this conversation]\n${formatContextForPrompt(context)}\n\n---\n\n${userMessage}`,
    })
  } else {
    messages.push({ role: "user", content: userMessage })
  }

  // Save user message
  await db.agentMessage.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: userMessage,
    },
  })

  // Call Claude
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    tools: AGENT_TOOLS,
    messages,
  })

  // Process response
  let assistantMessage = ""
  const toolResults: { name: string; result: unknown }[] = []

  for (const block of response.content) {
    if (block.type === "text") {
      assistantMessage += block.text
    } else if (block.type === "tool_use") {
      const result = await executeToolCall(
        userId,
        block.name as AgentToolName,
        block.input as Record<string, unknown>
      )
      toolResults.push({ name: block.name, result })
    }
  }

  // If there were tool calls, we need to continue the conversation
  if (response.stop_reason === "tool_use") {
    // Add the assistant's partial response
    messages.push({ role: "assistant", content: response.content })

    // Add tool results
    messages.push({
      role: "user",
      content: toolResults.map((tr) => ({
        type: "tool_result" as const,
        tool_use_id: response.content.find(
          (b) => b.type === "tool_use" && b.name === tr.name
        )?.id || "",
        content: JSON.stringify(tr.result),
      })),
    })

    // Continue the conversation
    const continuedResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    for (const block of continuedResponse.content) {
      if (block.type === "text") {
        assistantMessage += block.text
      }
    }
  }

  // Save assistant message
  await db.agentMessage.create({
    data: {
      conversationId: conversation.id,
      role: "agent",
      content: assistantMessage,
      toolCalls: toolResults.length > 0 ? toolResults : undefined,
    },
  })

  // Update conversation metadata
  await db.agentConversation.update({
    where: { id: conversation.id },
    data: {
      messageCount: { increment: 2 },
      lastMessageAt: new Date(),
    },
  })

  return { message: assistantMessage, toolResults }
}

// =============================================================================
// Tool Call Executor
// =============================================================================

async function executeToolCall(
  userId: string,
  toolName: AgentToolName,
  input: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "get_project_details":
      return await getProjectDetails(userId, input.project_id as string)

    case "get_blocker_details":
      return await getBlockerDetails(userId, input.blocker_id as string)

    case "list_recent_activity":
      return await listRecentActivity(
        userId,
        (input.days as number) || 7,
        input.project_id as string | undefined
      )

    case "draft_email":
      return {
        drafted: true,
        subject: input.subject,
        body: input.body,
        context: input.context,
      }

    case "create_note":
      return await createNote(userId, input)

    case "create_suggestion":
      return await executeAction(userId, "create-suggestion", {
        title: input.title,
        description: input.description,
        proposedAction: input.proposed_action,
        urgency: input.urgency || "normal",
        triggerType: input.trigger_type || "chat",
        projectId: input.project_id,
      })

    case "get_time_entries":
      return await getTimeEntries(
        userId,
        (input.days as number) || 7,
        input.project_id as string | undefined
      )

    default:
      return { error: `Unknown tool: ${toolName}` }
  }
}

// =============================================================================
// Tool Implementations
// =============================================================================

async function getProjectDetails(userId: string, projectIdOrSlug: string) {
  const project = await db.project.findFirst({
    where: {
      userId,
      OR: [{ id: projectIdOrSlug }, { slug: projectIdOrSlug }],
    },
    include: {
      sprints: {
        orderBy: { number: "desc" },
        take: 3,
        include: {
          _count: { select: { tasks: true } },
        },
      },
      blockers: {
        where: { status: "ACTIVE" },
        take: 5,
      },
      _count: {
        select: { timeEntries: true, notes: true },
      },
    },
  })

  if (!project) return { error: "Project not found" }
  return project
}

async function getBlockerDetails(userId: string, blockerId: string) {
  const blocker = await db.blocker.findFirst({
    where: {
      id: blockerId,
      project: { userId },
    },
    include: {
      project: { select: { name: true, slug: true } },
    },
  })

  if (!blocker) return { error: "Blocker not found" }
  return blocker
}

async function listRecentActivity(
  userId: string,
  days: number,
  projectId?: string
) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [completedTasks, resolvedBlockers, timeEntries] = await Promise.all([
    db.task.findMany({
      where: {
        completedAt: { gte: since },
        sprint: {
          project: {
            userId,
            ...(projectId ? { id: projectId } : {}),
          },
        },
      },
      include: {
        sprint: { include: { project: { select: { name: true } } } },
      },
      orderBy: { completedAt: "desc" },
      take: 10,
    }),
    db.blocker.findMany({
      where: {
        status: "RESOLVED",
        updatedAt: { gte: since },
        project: {
          userId,
          ...(projectId ? { id: projectId } : {}),
        },
      },
      include: { project: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.timeEntry.aggregate({
      where: {
        userId,
        startTime: { gte: since },
        ...(projectId ? { projectId } : {}),
      },
      _sum: { durationMinutes: true },
    }),
  ])

  return {
    completedTasks: completedTasks.length,
    resolvedBlockers: resolvedBlockers.length,
    totalMinutesTracked: timeEntries._sum.durationMinutes || 0,
    recentCompletions: completedTasks.slice(0, 5).map((t) => ({
      title: t.title,
      project: t.sprint.project.name,
      completedAt: t.completedAt,
    })),
  }
}

async function createNote(userId: string, input: Record<string, unknown>) {
  const slug = (input.title as string)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  const note = await db.note.create({
    data: {
      userId,
      title: input.title as string,
      content: input.content as string,
      slug: `${slug}-${Date.now()}`,
      projectId: input.project_id as string | undefined,
      tags: (input.tags as string[]) || [],
    },
  })

  return { created: true, noteId: note.id, slug: note.slug }
}

async function getTimeEntries(userId: string, days: number, projectId?: string) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const entries = await db.timeEntry.findMany({
    where: {
      userId,
      startTime: { gte: since },
      ...(projectId ? { projectId } : {}),
    },
    include: { project: { select: { name: true } } },
    orderBy: { startTime: "desc" },
  })

  const totalMinutes = entries.reduce((sum, e) => sum + e.durationMinutes, 0)
  const byProject: Record<string, number> = {}

  for (const entry of entries) {
    const name = entry.project?.name || "Unassigned"
    byProject[name] = (byProject[name] || 0) + entry.durationMinutes
  }

  return {
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    byProject,
    entryCount: entries.length,
  }
}

// =============================================================================
// Heartbeat - Proactive Check
// =============================================================================

export async function runHeartbeat(userId: string): Promise<{
  suggestions: number
  skipped: boolean
  reason?: string
}> {
  // Get preferences
  const prefs = await db.agentPreferences.findUnique({
    where: { userId },
  })

  // Check if proactive mode is disabled
  if (prefs && !prefs.proactiveEnabled) {
    return { suggestions: 0, skipped: true, reason: "Proactive mode disabled" }
  }

  // Check quiet hours
  if (prefs?.quietHoursEnabled) {
    const inQuiet = isInQuietHours(
      prefs.timezone,
      prefs.quietHoursStart,
      prefs.quietHoursEnd
    )
    if (inQuiet) {
      return { suggestions: 0, skipped: true, reason: "Quiet hours" }
    }
  }

  // Build context
  const context = await buildAgentContext(userId)
  const prompt = buildHeartbeatPrompt(formatContextForPrompt(context))

  // Call Claude
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  // Parse suggestions
  let suggestions: Array<{
    triggerType: string
    title: string
    description: string
    proposedAction: string
    urgency: string
    entityId?: string
  }> = []

  const textBlock = response.content.find((b) => b.type === "text")
  if (textBlock && textBlock.type === "text") {
    try {
      // Extract JSON from response
      const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0])
      }
    } catch {
      // Failed to parse, no suggestions
    }
  }

  // Create suggestions in database
  for (const s of suggestions) {
    await db.agentSuggestion.create({
      data: {
        userId,
        triggerType: s.triggerType,
        triggerEntityId: s.entityId,
        type: "suggestion",
        title: s.title,
        description: s.description,
        proposedAction: s.proposedAction,
        urgency: s.urgency,
      },
    })
  }

  return { suggestions: suggestions.length, skipped: false }
}
