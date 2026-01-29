// =============================================================================
// Quick Generators - Fast LLM tasks using Mistral
// =============================================================================

import { generate } from "@/lib/ai/providers"
import { AGENT_SOUL } from "./prompts"

// =============================================================================
// Standup Notes
// =============================================================================

export async function generateStandupNotes(context: {
  completedYesterday: string[]
  inProgressToday: string[]
  blockers: string[]
}): Promise<string> {
  const prompt = `Generate standup notes based on this data:

**Yesterday:**
${context.completedYesterday.length > 0 ? context.completedYesterday.map((t) => `- ${t}`).join("\n") : "- No completed tasks"}

**Today:**
${context.inProgressToday.length > 0 ? context.inProgressToday.map((t) => `- ${t}`).join("\n") : "- No tasks planned"}

**Blockers:**
${context.blockers.length > 0 ? context.blockers.map((b) => `- ${b}`).join("\n") : "- None"}

Format as clean, copy-pasteable standup notes. Be concise.`

  const result = await generate({
    task: "quick-generate",
    prompt,
    systemPrompt: "You write concise standup notes. No fluff, just facts.",
    maxTokens: 300,
  })

  return result.content
}

// =============================================================================
// Weekly Summary
// =============================================================================

export async function generateWeeklySummary(context: {
  projectName: string
  tasksCompleted: number
  hoursLogged: number
  blockersResolved: number
  highlights: string[]
}): Promise<string> {
  const prompt = `Generate a weekly summary for project "${context.projectName}":

- Tasks completed: ${context.tasksCompleted}
- Hours logged: ${context.hoursLogged}
- Blockers resolved: ${context.blockersResolved}
- Key highlights: ${context.highlights.join(", ") || "None"}

Write a brief, professional summary suitable for a client or stakeholder. 2-3 sentences.`

  const result = await generate({
    task: "quick-generate",
    prompt,
    systemPrompt: "You write professional project summaries. Concise and factual.",
    maxTokens: 200,
  })

  return result.content
}

// =============================================================================
// Client Update Email
// =============================================================================

export async function generateClientUpdate(context: {
  clientName: string
  projectName: string
  recentProgress: string[]
  upcomingWork: string[]
  blockers?: string[]
}): Promise<{ subject: string; body: string }> {
  const prompt = `Draft a client update email:

**Client:** ${context.clientName}
**Project:** ${context.projectName}

**Recent Progress:**
${context.recentProgress.map((p) => `- ${p}`).join("\n")}

**Upcoming:**
${context.upcomingWork.map((w) => `- ${w}`).join("\n")}

${context.blockers && context.blockers.length > 0 ? `**Needs Input:**\n${context.blockers.map((b) => `- ${b}`).join("\n")}` : ""}

Return JSON: {"subject": "...", "body": "..."}`

  const result = await generate({
    task: "quick-generate",
    prompt,
    systemPrompt: `${AGENT_SOUL}\n\nYou draft professional but warm client emails. Return valid JSON only.`,
    maxTokens: 500,
  })

  try {
    return JSON.parse(result.content)
  } catch {
    return {
      subject: `${context.projectName} - Progress Update`,
      body: result.content,
    }
  }
}

// =============================================================================
// Follow-up Email for Stale Blocker
// =============================================================================

export async function generateFollowUpEmail(context: {
  blockerTitle: string
  blockerDescription: string
  daysSinceCreated: number
  waitingOn: string
  previousFollowUps: number
}): Promise<{ subject: string; body: string }> {
  const urgency = context.daysSinceCreated > 7 ? "more direct" : "polite"
  const followUpNote = context.previousFollowUps > 0
    ? `This is follow-up #${context.previousFollowUps + 1}.`
    : "This is the first follow-up."

  const prompt = `Draft a ${urgency} follow-up email:

**Blocker:** ${context.blockerTitle}
**Details:** ${context.blockerDescription}
**Waiting on:** ${context.waitingOn}
**Days waiting:** ${context.daysSinceCreated}
**${followUpNote}**

Return JSON: {"subject": "...", "body": "..."}`

  const result = await generate({
    task: "quick-generate",
    prompt,
    systemPrompt: `${AGENT_SOUL}\n\nYou draft follow-up emails that are professional but get results. Return valid JSON only.`,
    maxTokens: 400,
  })

  try {
    return JSON.parse(result.content)
  } catch {
    return {
      subject: `Following up: ${context.blockerTitle}`,
      body: result.content,
    }
  }
}

// =============================================================================
// Blocker Analysis
// =============================================================================

export async function analyzeBlocker(context: {
  title: string
  description: string
  daysSinceCreated: number
  waitingOn: string
  projectContext?: string
}): Promise<string> {
  const prompt = `Analyze this blocker:

**Title:** ${context.title}
**Description:** ${context.description}
**Waiting on:** ${context.waitingOn}
**Age:** ${context.daysSinceCreated} days
${context.projectContext ? `**Project context:** ${context.projectContext}` : ""}

Provide:
1. Root cause analysis
2. Why it might be taking so long
3. Suggested next steps
4. Escalation recommendations if needed

Be direct and actionable.`

  const result = await generate({
    task: "quick-generate",
    prompt,
    systemPrompt: AGENT_SOUL,
    maxTokens: 400,
  })

  return result.content
}
