import Anthropic from "@anthropic-ai/sdk"
import {
  FilteredCodebase,
  formatCodebaseForAI,
} from "@/lib/upload/file-filter"

const anthropic = new Anthropic()

export interface AnalyzedTask {
  title: string
  description: string
  category: string
  estimatedHours: number
}

export interface AnalyzedSprint {
  name: string
  description: string
  tasks: AnalyzedTask[]
}

export interface CodebaseAnalysis {
  projectName: string
  description: string
  sprints: AnalyzedSprint[]
}

const ANALYSIS_PROMPT = `You are a senior software architect analyzing a codebase to create a project plan.

Based on the codebase provided, generate a structured project plan in JSON format. Your analysis should:

1. **Extract project name** from package.json (name field) or infer from the codebase
2. **Extract description** from README.md or package.json description, or summarize based on the codebase
3. **Identify remaining work** and organize into sprints with tasks

For tasks, use these categories:
- setup: Environment, configuration, tooling
- feature: New functionality
- integration: Third-party services, APIs
- ui: User interface components
- api: Backend endpoints, server logic
- testing: Tests, QA
- documentation: Docs, comments, guides

Guidelines for sprint planning:
- Each sprint should be 1-2 weeks of work (10-80 hours total)
- Tasks should be 0.5-8 hours each
- Order sprints from foundation/setup to features to polish
- Consider dependencies between tasks
- Be realistic about effort estimates

IMPORTANT: Return ONLY valid JSON, no markdown code blocks or extra text.

Example output format:
{
  "projectName": "My App",
  "description": "A web application for managing tasks and projects",
  "sprints": [
    {
      "name": "Foundation",
      "description": "Set up core infrastructure and authentication",
      "tasks": [
        {
          "title": "Configure database schema",
          "description": "Set up Prisma schema with User, Project, and Task models",
          "category": "setup",
          "estimatedHours": 2
        }
      ]
    }
  ]
}
`

/**
 * Analyze a codebase and generate a project plan
 */
export async function analyzeCodebase(
  filtered: FilteredCodebase
): Promise<CodebaseAnalysis> {
  const codebaseContent = formatCodebaseForAI(filtered)

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: ANALYSIS_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analyze this codebase and generate a project plan:\n\n${codebaseContent}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== "text") {
    throw new Error("Unexpected response format from AI")
  }

  // Parse the JSON response
  const jsonText = content.text.trim()

  // Try to extract JSON if wrapped in code blocks
  const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
  const cleanJson = jsonMatch ? jsonMatch[1].trim() : jsonText

  try {
    const analysis = JSON.parse(cleanJson) as CodebaseAnalysis

    // Validate the response structure
    if (!analysis.projectName) {
      analysis.projectName = "Imported Project"
    }
    if (!analysis.description) {
      analysis.description = "Imported from codebase"
    }
    if (!Array.isArray(analysis.sprints)) {
      analysis.sprints = []
    }

    // Validate each sprint
    for (const sprint of analysis.sprints) {
      if (!sprint.name) {
        sprint.name = "Sprint"
      }
      if (!sprint.description) {
        sprint.description = ""
      }
      if (!Array.isArray(sprint.tasks)) {
        sprint.tasks = []
      }

      // Validate each task
      for (const task of sprint.tasks) {
        if (!task.title) {
          task.title = "Task"
        }
        if (!task.description) {
          task.description = ""
        }
        if (!task.category) {
          task.category = "feature"
        }
        if (typeof task.estimatedHours !== "number" || task.estimatedHours < 0) {
          task.estimatedHours = 1
        }
      }
    }

    return analysis
  } catch {
    console.error("Failed to parse AI response:", cleanJson)
    throw new Error("Failed to parse project analysis. Please try again.")
  }
}

/**
 * Extract project info from package.json and README
 */
export function extractProjectInfo(files: Map<string, string>): {
  name: string | null
  description: string | null
} {
  let name: string | null = null
  let description: string | null = null

  // Try package.json
  const packageJson = files.get("package.json")
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson)
      name = pkg.name || null
      description = pkg.description || null
    } catch {
      // Invalid JSON, skip
    }
  }

  // Try README for description if not found
  if (!description) {
    const readme = files.get("README.md") || files.get("readme.md") || files.get("README")
    if (readme) {
      // Extract first paragraph as description
      const lines = readme.split("\n")
      const paragraphs: string[] = []
      let currentParagraph: string[] = []

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed === "") {
          if (currentParagraph.length > 0) {
            paragraphs.push(currentParagraph.join(" "))
            currentParagraph = []
          }
        } else if (!trimmed.startsWith("#") && !trimmed.startsWith("!")) {
          currentParagraph.push(trimmed)
        }
      }

      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(" "))
      }

      // Use first non-empty paragraph
      for (const para of paragraphs) {
        if (para.length > 20) {
          description = para.slice(0, 500)
          break
        }
      }
    }
  }

  return { name, description }
}
