import { db } from "@/lib/db"

// =============================================================================
// Action Registry
// Defines what the agent can do and permission levels
// =============================================================================

export interface ActionDefinition {
  id: string
  label: string
  description: string
  category: "generate" | "analyze" | "automate" | "internal"
  autoApprove: boolean // Can execute without user confirmation
  dangerous: boolean   // Requires extra caution
}

export const AGENT_ACTIONS: Record<string, ActionDefinition> = {
  // === Generate ===
  "draft-client-update": {
    id: "draft-client-update",
    label: "Draft Client Update",
    description: "Generate a summary of recent progress for stakeholders",
    category: "generate",
    autoApprove: false,
    dangerous: false,
  },
  "draft-followup-email": {
    id: "draft-followup-email",
    label: "Draft Follow-up Email",
    description: "Create a follow-up message for a stale blocker",
    category: "generate",
    autoApprove: false,
    dangerous: false,
  },
  "generate-weekly-summary": {
    id: "generate-weekly-summary",
    label: "Generate Weekly Summary",
    description: "Summarize accomplishments across all projects this week",
    category: "generate",
    autoApprove: false,
    dangerous: false,
  },
  "generate-standup-notes": {
    id: "generate-standup-notes",
    label: "Generate Standup Notes",
    description: "Create yesterday/today/blockers summary",
    category: "generate",
    autoApprove: false,
    dangerous: false,
  },

  // === Analyze ===
  "analyze-blocker": {
    id: "analyze-blocker",
    label: "Analyze Blocker",
    description: "Break down why something is taking longer than expected",
    category: "analyze",
    autoApprove: true, // Safe - just analysis
    dangerous: false,
  },
  "scope-check": {
    id: "scope-check",
    label: "Scope Check",
    description: "Compare current work to original plan, detect drift",
    category: "analyze",
    autoApprove: true,
    dangerous: false,
  },

  // === Automate ===
  "batch-draft-followups": {
    id: "batch-draft-followups",
    label: "Draft All Follow-ups",
    description: "Create follow-up drafts for all stale blockers",
    category: "automate",
    autoApprove: false,
    dangerous: false,
  },

  // === Internal (agent uses these, not user-triggered) ===
  "create-suggestion": {
    id: "create-suggestion",
    label: "Create Suggestion",
    description: "Add a suggestion to the user's inbox",
    category: "internal",
    autoApprove: true,
    dangerous: false,
  },
  "learn-pattern": {
    id: "learn-pattern",
    label: "Learn Pattern",
    description: "Record an observed pattern about the user",
    category: "internal",
    autoApprove: true,
    dangerous: false,
  },
}

// =============================================================================
// Action Executor
// =============================================================================

export type ActionResult = {
  success: boolean
  output?: string
  error?: string
}

export async function executeAction(
  actionId: string,
  userId: string,
  payload: Record<string, unknown>
): Promise<ActionResult> {
  const action = AGENT_ACTIONS[actionId]
  if (!action) {
    return { success: false, error: `Unknown action: ${actionId}` }
  }

  try {
    switch (actionId) {
      case "create-suggestion":
        return await createSuggestion(userId, payload)
      case "learn-pattern":
        return await learnPattern(userId, payload)
      default:
        // For actions that need AI generation, return a placeholder
        // The actual generation happens in the API route with Claude
        return { success: true, output: `Action ${actionId} queued for execution` }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// =============================================================================
// Internal Action Implementations
// =============================================================================

async function createSuggestion(
  userId: string,
  payload: Record<string, unknown>
): Promise<ActionResult> {
  const suggestion = await db.agentSuggestion.create({
    data: {
      userId,
      triggerType: (payload.triggerType as string) || "manual",
      triggerEntityId: payload.entityId as string | undefined,
      type: (payload.type as string) || "suggestion",
      title: payload.title as string,
      description: payload.description as string,
      projectId: payload.projectId as string | undefined,
      projectName: payload.projectName as string | undefined,
      proposedAction: payload.proposedAction as string,
      actionPayload: payload.actionPayload || {},
      urgency: (payload.urgency as string) || "normal",
    },
  })

  return { success: true, output: `Created suggestion: ${suggestion.id}` }
}

async function learnPattern(
  userId: string,
  payload: Record<string, unknown>
): Promise<ActionResult> {
  const prefs = await db.agentPreferences.findUnique({
    where: { userId },
  })

  if (!prefs) {
    // Create preferences if they don't exist
    await db.agentPreferences.create({
      data: {
        userId,
        learnedPatterns: [payload.pattern],
      },
    })
  } else {
    const patterns = prefs.learnedPatterns as string[]
    if (!patterns.includes(payload.pattern as string)) {
      await db.agentPreferences.update({
        where: { userId },
        data: {
          learnedPatterns: [...patterns, payload.pattern],
        },
      })
    }
  }

  return { success: true, output: `Learned pattern: ${payload.pattern}` }
}

// =============================================================================
// Check if action can auto-execute
// =============================================================================

export async function canAutoExecute(
  userId: string,
  actionId: string
): Promise<boolean> {
  const action = AGENT_ACTIONS[actionId]
  if (!action || action.dangerous) return false
  if (!action.autoApprove) return false

  // Check user preferences for additional auto-approve types
  const prefs = await db.agentPreferences.findUnique({
    where: { userId },
  })

  if (prefs) {
    const autoApproveTypes = prefs.autoApproveTypes as string[]
    if (autoApproveTypes.includes(actionId)) {
      return true
    }
  }

  return action.autoApprove
}
