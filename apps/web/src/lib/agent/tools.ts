import Anthropic from "@anthropic-ai/sdk"

// =============================================================================
// Tool Definitions for Claude
// These define what the agent can do during conversations
// Enhanced with analysis and learning capabilities
// =============================================================================

export const AGENT_TOOLS: Anthropic.Tool[] = [
  // ---------------------------------------------------------------------------
  // DATA RETRIEVAL TOOLS
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // ACTION TOOLS
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // ANALYSIS TOOLS (NEW)
  // ---------------------------------------------------------------------------
  {
    name: "analyze_estimate_accuracy",
    description:
      "Analyze historical estimate accuracy to calibrate future estimates. Compare actual vs estimated time for completed tasks.",
    input_schema: {
      type: "object" as const,
      properties: {
        project_id: {
          type: "string",
          description: "Optional: filter to a specific project",
        },
        task_type: {
          type: "string",
          description: "Optional: filter by task type/category",
        },
        days: {
          type: "number",
          description: "Number of days to look back (default 30)",
        },
      },
      required: [],
    },
  },
  {
    name: "detect_scope_drift",
    description:
      "Compare the current sprint/project state against the original plan to detect scope creep. Returns additions, removals, and complexity changes.",
    input_schema: {
      type: "object" as const,
      properties: {
        sprint_id: {
          type: "string",
          description: "The sprint ID to analyze",
        },
        project_id: {
          type: "string",
          description: "Or the project ID for overall scope check",
        },
      },
      required: [],
    },
  },
  {
    name: "suggest_similar_tasks",
    description:
      "Find similar tasks from history to inform estimates and identify patterns. Uses task title and description to find matches.",
    input_schema: {
      type: "object" as const,
      properties: {
        task_title: {
          type: "string",
          description: "Title of the task to find similar matches for",
        },
        task_description: {
          type: "string",
          description: "Optional: description for better matching",
        },
        limit: {
          type: "number",
          description: "Maximum number of similar tasks to return (default 5)",
        },
      },
      required: ["task_title"],
    },
  },
  {
    name: "track_pattern",
    description:
      "Record an observed pattern for learning. Use this when you notice recurring behaviors, estimate patterns, or workflow habits.",
    input_schema: {
      type: "object" as const,
      properties: {
        pattern_type: {
          type: "string",
          enum: ["estimate", "blocker", "communication", "workflow", "productivity"],
          description: "Category of the pattern",
        },
        pattern_description: {
          type: "string",
          description: "Clear description of what you observed",
        },
        confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "How confident are you in this pattern",
        },
        evidence: {
          type: "string",
          description: "What data supports this pattern",
        },
        actionable_insight: {
          type: "string",
          description: "How will this pattern inform future suggestions",
        },
      },
      required: ["pattern_type", "pattern_description", "confidence"],
    },
  },
  {
    name: "prepare_client_update",
    description:
      "Prepare a ready-to-send client update email based on recent project activity. Includes progress, blockers, and next steps.",
    input_schema: {
      type: "object" as const,
      properties: {
        project_id: {
          type: "string",
          description: "The project to generate update for",
        },
        days: {
          type: "number",
          description: "Days of activity to include (default 7)",
        },
        tone: {
          type: "string",
          enum: ["confident", "cautious", "urgent"],
          description: "Desired tone of the update",
        },
        include_blockers: {
          type: "boolean",
          description: "Whether to include blocker details (default true)",
        },
      },
      required: ["project_id"],
    },
  },

  // ---------------------------------------------------------------------------
  // INTELLIGENCE TOOLS (NEW)
  // ---------------------------------------------------------------------------
  {
    name: "get_velocity_trend",
    description:
      "Get velocity trend data comparing recent weeks. Useful for detecting slowdowns and understanding capacity.",
    input_schema: {
      type: "object" as const,
      properties: {
        weeks: {
          type: "number",
          description: "Number of weeks to analyze (default 4)",
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
    name: "get_communication_health",
    description:
      "Check communication health across projects. Days since last client update, pending follow-ups, etc.",
    input_schema: {
      type: "object" as const,
      properties: {
        project_id: {
          type: "string",
          description: "Optional: filter to a specific project",
        },
      },
      required: [],
    },
  },
  {
    name: "get_learned_patterns",
    description:
      "Retrieve learned patterns for context. Use this to inform suggestions based on past observations.",
    input_schema: {
      type: "object" as const,
      properties: {
        pattern_type: {
          type: "string",
          enum: ["estimate", "blocker", "communication", "workflow", "productivity", "all"],
          description: "Type of patterns to retrieve (default 'all')",
        },
        min_confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Minimum confidence level (default 'low')",
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
  // Data retrieval
  | "get_project_details"
  | "get_blocker_details"
  | "list_recent_activity"
  | "get_time_entries"
  // Actions
  | "draft_email"
  | "create_note"
  | "create_suggestion"
  // Analysis (new)
  | "analyze_estimate_accuracy"
  | "detect_scope_drift"
  | "suggest_similar_tasks"
  | "track_pattern"
  | "prepare_client_update"
  // Intelligence (new)
  | "get_velocity_trend"
  | "get_communication_health"
  | "get_learned_patterns"
