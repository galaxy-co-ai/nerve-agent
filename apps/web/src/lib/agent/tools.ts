import Anthropic from "@anthropic-ai/sdk"

// =============================================================================
// Tool Definitions for Claude
// These define what the agent can do during conversations
// =============================================================================

export const AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_project_details",
    description:
      "Get detailed information about a specific project including sprints, tasks, and blockers",
    input_schema: {
      type: "object" as const,
      properties: {
        project_id: {
          type: "string",
          description: "The ID or slug of the project",
        },
      },
      required: ["project_id"],
    },
  },
  {
    name: "get_blocker_details",
    description:
      "Get detailed information about a specific blocker including history and context",
    input_schema: {
      type: "object" as const,
      properties: {
        blocker_id: {
          type: "string",
          description: "The ID of the blocker",
        },
      },
      required: ["blocker_id"],
    },
  },
  {
    name: "list_recent_activity",
    description:
      "Get recent activity across all projects (tasks completed, blockers resolved, etc.)",
    input_schema: {
      type: "object" as const,
      properties: {
        days: {
          type: "number",
          description: "Number of days to look back (default 7)",
        },
        project_id: {
          type: "string",
          description: "Optional: filter to a specific project",
        },
      },
      required: [],
    },
  },
  {
    name: "draft_email",
    description:
      "Draft an email for the user to review. Use this for follow-ups, client updates, etc.",
    input_schema: {
      type: "object" as const,
      properties: {
        subject: {
          type: "string",
          description: "Email subject line",
        },
        body: {
          type: "string",
          description: "Email body content",
        },
        context: {
          type: "string",
          description:
            "Why this email is being drafted (for user context, not included in email)",
        },
      },
      required: ["subject", "body"],
    },
  },
  {
    name: "create_note",
    description: "Create a note in the user's notes collection",
    input_schema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string",
          description: "Note title",
        },
        content: {
          type: "string",
          description: "Note content (supports markdown)",
        },
        project_id: {
          type: "string",
          description: "Optional: associate with a project",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional tags: idea, task, reference, insight, decision",
        },
      },
      required: ["title", "content"],
    },
  },
  {
    name: "create_suggestion",
    description:
      "Create a suggestion for the user's inbox. Use this when you notice something that needs attention but want user approval before acting.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string",
          description: "Short, direct title",
        },
        description: {
          type: "string",
          description: "What's happening and why it matters",
        },
        proposed_action: {
          type: "string",
          description: "What you're offering to do if approved",
        },
        urgency: {
          type: "string",
          enum: ["low", "normal", "urgent"],
          description: "How urgent is this",
        },
        trigger_type: {
          type: "string",
          description: "What triggered this suggestion",
        },
        project_id: {
          type: "string",
          description: "Optional: related project ID",
        },
      },
      required: ["title", "description", "proposed_action"],
    },
  },
  {
    name: "get_time_entries",
    description:
      "Get time tracking entries for analysis (hours worked, patterns, etc.)",
    input_schema: {
      type: "object" as const,
      properties: {
        days: {
          type: "number",
          description: "Number of days to look back",
        },
        project_id: {
          type: "string",
          description: "Optional: filter to a specific project",
        },
      },
      required: [],
    },
  },
]

// =============================================================================
// Tool Name Type
// =============================================================================

export type AgentToolName =
  | "get_project_details"
  | "get_blocker_details"
  | "list_recent_activity"
  | "draft_email"
  | "create_note"
  | "create_suggestion"
  | "get_time_entries"
