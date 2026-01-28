import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { readdir, readFile, stat } from "fs/promises"
import { join, relative } from "path"
import { filterCodebaseFiles, formatCodebaseForAI } from "@/lib/upload/file-filter"

const anthropic = new Anthropic()

// Tool definitions for Claude
const tools: Anthropic.Tool[] = [
  {
    name: "list_projects",
    description: "List all projects for the current user",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_project",
    description: "Get details of a specific project including its sprints and tasks",
    input_schema: {
      type: "object" as const,
      properties: {
        slug: {
          type: "string",
          description: "The project slug",
        },
      },
      required: ["slug"],
    },
  },
  {
    name: "create_project",
    description: "Create a new project with optional sprints and tasks",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Project name" },
        clientName: { type: "string", description: "Client name" },
        description: { type: "string", description: "Project description" },
        sprints: {
          type: "array",
          description: "Optional array of sprints to create",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    estimatedHours: { type: "number" },
                    category: { type: "string" },
                  },
                  required: ["title", "estimatedHours"],
                },
              },
            },
            required: ["name"],
          },
        },
      },
      required: ["name", "clientName"],
    },
  },
  {
    name: "create_sprint",
    description: "Create a new sprint in a project",
    input_schema: {
      type: "object" as const,
      properties: {
        projectSlug: { type: "string", description: "The project slug" },
        name: { type: "string", description: "Sprint name" },
        description: { type: "string", description: "Sprint description" },
        estimatedHours: { type: "number", description: "Estimated hours" },
      },
      required: ["projectSlug", "name", "estimatedHours"],
    },
  },
  {
    name: "create_task",
    description: "Create a new task in a sprint",
    input_schema: {
      type: "object" as const,
      properties: {
        projectSlug: { type: "string", description: "The project slug" },
        sprintNumber: { type: "number", description: "The sprint number" },
        title: { type: "string", description: "Task title" },
        description: { type: "string", description: "Task description" },
        estimatedHours: { type: "number", description: "Estimated hours" },
        category: { type: "string", description: "Task category (setup, feature, integration, ui, api, testing, documentation)" },
      },
      required: ["projectSlug", "sprintNumber", "title", "estimatedHours"],
    },
  },
  {
    name: "read_local_directory",
    description: "Read and analyze files from a local directory path to understand a codebase",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "Full path to the directory" },
      },
      required: ["path"],
    },
  },
]

// Skip these directories when scanning
const SKIP_DIRS = new Set([
  "node_modules", ".git", ".next", "dist", "build", ".cache",
  "coverage", ".vscode", ".idea", "__pycache__", "venv", ".env",
])

async function scanDirectory(
  dirPath: string,
  basePath: string,
  files: Map<string, string>,
  maxFiles = 500
): Promise<void> {
  if (files.size >= maxFiles) return
  const entries = await readdir(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    if (files.size >= maxFiles) break
    const fullPath = join(dirPath, entry.name)
    const relativePath = relative(basePath, fullPath).replace(/\\/g, "/")
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name) && !entry.name.startsWith(".")) {
        await scanDirectory(fullPath, basePath, files, maxFiles)
      }
    } else if (entry.isFile()) {
      const stats = await stat(fullPath)
      if (stats.size > 1024 * 1024) continue
      try {
        const content = await readFile(fullPath, "utf-8")
        if (!content.includes("\0")) {
          files.set(relativePath, content)
        }
      } catch {
        // Skip unreadable files
      }
    }
  }
}

// Tool execution
async function executeTool(
  name: string,
  input: Record<string, unknown>,
  userId: string
): Promise<string> {
  switch (name) {
    case "list_projects": {
      const projects = await db.project.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
          name: true,
          slug: true,
          clientName: true,
          status: true,
          _count: { select: { sprints: true } },
        },
      })
      return JSON.stringify(projects, null, 2)
    }

    case "get_project": {
      const project = await db.project.findFirst({
        where: { slug: input.slug as string, userId },
        include: {
          sprints: {
            orderBy: { number: "asc" },
            include: {
              tasks: { orderBy: { order: "asc" } },
            },
          },
        },
      })
      if (!project) return "Project not found"
      return JSON.stringify(project, null, 2)
    }

    case "create_project": {
      const { name, clientName, description, sprints } = input as {
        name: string
        clientName: string
        description?: string
        sprints?: Array<{
          name: string
          description?: string
          tasks?: Array<{
            title: string
            description?: string
            estimatedHours: number
            category?: string
          }>
        }>
      }

      // Generate unique slug
      let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      let slug = baseSlug
      let counter = 1
      while (await db.project.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }

      const project = await db.$transaction(async (tx) => {
        const newProject = await tx.project.create({
          data: {
            userId,
            name,
            slug,
            clientName,
            description: description || null,
          },
        })

        if (sprints?.length) {
          for (let i = 0; i < sprints.length; i++) {
            const sprintData = sprints[i]
            const totalHours = sprintData.tasks?.reduce((sum, t) => sum + t.estimatedHours, 0) || 0

            const sprint = await tx.sprint.create({
              data: {
                projectId: newProject.id,
                number: i + 1,
                name: sprintData.name,
                description: sprintData.description || null,
                estimatedHours: totalHours,
              },
            })

            if (sprintData.tasks?.length) {
              for (let j = 0; j < sprintData.tasks.length; j++) {
                const task = sprintData.tasks[j]
                await tx.task.create({
                  data: {
                    sprintId: sprint.id,
                    title: task.title,
                    description: task.description || null,
                    order: j + 1,
                    estimatedHours: task.estimatedHours,
                    category: task.category || null,
                  },
                })
              }
            }
          }
        }

        return newProject
      })

      return `Project created successfully! Slug: ${project.slug}`
    }

    case "create_sprint": {
      const { projectSlug, name, description, estimatedHours } = input as {
        projectSlug: string
        name: string
        description?: string
        estimatedHours: number
      }

      const project = await db.project.findFirst({
        where: { slug: projectSlug, userId },
        include: { sprints: { orderBy: { number: "desc" }, take: 1 } },
      })

      if (!project) return "Project not found"

      const nextNumber = project.sprints.length > 0 ? project.sprints[0].number + 1 : 1

      await db.sprint.create({
        data: {
          projectId: project.id,
          number: nextNumber,
          name,
          description: description || null,
          estimatedHours,
        },
      })

      return `Sprint ${nextNumber} "${name}" created successfully`
    }

    case "create_task": {
      const { projectSlug, sprintNumber, title, description, estimatedHours, category } = input as {
        projectSlug: string
        sprintNumber: number
        title: string
        description?: string
        estimatedHours: number
        category?: string
      }

      const project = await db.project.findFirst({
        where: { slug: projectSlug, userId },
      })

      if (!project) return "Project not found"

      const sprint = await db.sprint.findUnique({
        where: { projectId_number: { projectId: project.id, number: sprintNumber } },
        include: { tasks: { orderBy: { order: "desc" }, take: 1 } },
      })

      if (!sprint) return "Sprint not found"

      const nextOrder = sprint.tasks.length > 0 ? sprint.tasks[0].order + 1 : 1

      await db.task.create({
        data: {
          sprintId: sprint.id,
          title,
          description: description || null,
          order: nextOrder,
          estimatedHours,
          category: category || null,
        },
      })

      return `Task "${title}" created successfully in Sprint ${sprintNumber}`
    }

    case "read_local_directory": {
      const dirPath = input.path as string

      try {
        const stats = await stat(dirPath)
        if (!stats.isDirectory()) {
          return "Error: Path is not a directory"
        }
      } catch {
        return "Error: Directory not found"
      }

      const files = new Map<string, string>()
      await scanDirectory(dirPath, dirPath, files)

      if (files.size === 0) {
        return "No readable files found in directory"
      }

      const filtered = filterCodebaseFiles(files)
      const formatted = formatCodebaseForAI(filtered)

      return formatted
    }

    default:
      return `Unknown tool: ${name}`
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const { messages, context } = await request.json()

    // Build system prompt with context
    let systemPrompt = `You are Claude, an AI assistant integrated into NERVE AGENT, a project management application for software developers.

You have access to tools that let you:
- List and view projects, sprints, and tasks
- Create new projects, sprints, and tasks
- Read local directories to analyze codebases

When the user asks you to import or analyze a codebase, use the read_local_directory tool first, then create a project with appropriate sprints and tasks based on what you find.

Be concise and helpful. When creating projects, organize work into logical sprints with realistic time estimates.`

    if (context?.currentProject) {
      systemPrompt += `\n\nThe user is currently viewing project: "${context.currentProject.name}" (slug: ${context.currentProject.slug})`
    }

    // Call Claude with tools
    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages,
    })

    // Handle tool use loop
    const allMessages = [...messages]
    while (response.stop_reason === "tool_use") {
      const assistantMessage = { role: "assistant" as const, content: response.content }
      allMessages.push(assistantMessage)

      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const block of response.content) {
        if (block.type === "tool_use") {
          const result = await executeTool(block.name, block.input as Record<string, unknown>, user.id)
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: result,
          })
        }
      }

      allMessages.push({ role: "user" as const, content: toolResults })

      response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        tools,
        messages: allMessages,
      })
    }

    // Extract text response
    const textContent = response.content.find((b) => b.type === "text")
    const text = textContent?.type === "text" ? textContent.text : ""

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 }
    )
  }
}
