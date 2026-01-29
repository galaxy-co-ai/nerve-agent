import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

const anthropic = new Anthropic()

// Tool to create the project
const tools: Anthropic.Tool[] = [
  {
    name: "create_project",
    description:
      "Create a new project when you have gathered enough information. Call this when the user has answered your questions and you're ready to set up their project.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "The project name (short, memorable)",
        },
        clientName: {
          type: "string",
          description:
            "The client/company name. For personal projects, use the user's name or 'Personal Project'",
        },
        description: {
          type: "string",
          description:
            "A 1-2 sentence description of the project capturing its essence",
        },
      },
      required: ["name", "clientName", "description"],
    },
  },
]

// Execute tool
async function executeTool(
  name: string,
  input: Record<string, unknown>,
  userId: string
): Promise<{ result: string; projectSlug?: string }> {
  if (name === "create_project") {
    const { name: projectName, clientName, description } = input as {
      name: string
      clientName: string
      description: string
    }

    // Generate unique slug
    let baseSlug = projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    let slug = baseSlug
    let counter = 1
    while (await db.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Generate portal token
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    const portalToken = Array.from(array, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("")

    const project = await db.project.create({
      data: {
        userId,
        name: projectName,
        slug,
        clientName,
        description,
        portalToken,
      },
    })

    return {
      result: `Project "${projectName}" created successfully!`,
      projectSlug: project.slug,
    }
  }

  return { result: `Unknown tool: ${name}` }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const { messages, selectedIdea, isSampleProject } = await request.json()

    // Build system prompt - co-founder personality
    const systemPrompt = `You are the AI co-founder in NERVE AGENT, a project management system for solo developers. You use "we" language because you're partners building this together.

Your personality:
- Direct and opinionated, but supportive
- Enthusiastic about good ideas
- You ask smart clarifying questions
- You help shape vague ideas into concrete projects
- Not corporate or sterile—you're a co-founder, not a chatbot

${
  isSampleProject
    ? `The user selected the sample project "MyStride.ai" - an AI training intelligence app for distance runners. When they're ready, create this project immediately. They want to experience the workflow.`
    : `The user is starting a new project based on: "${selectedIdea}"`
}

Your job:
1. Ask 2-3 quick clarifying questions to understand the project (who it's for, what problem it solves, what makes it unique)
2. Once you have enough info, use the create_project tool to set it up
3. After creating, give an encouraging message about next steps

Keep responses concise. This is a quick onboarding flow, not a long strategy session.

IMPORTANT: When using create_project, use a short memorable name (not a tagline), use "Personal Project" as clientName for solo projects, and write a crisp description.`

    // Call Claude with tools
    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    })

    // Handle tool use loop
    const allMessages = [...messages]
    let projectSlug: string | undefined

    while (response.stop_reason === "tool_use") {
      const assistantMessage = {
        role: "assistant" as const,
        content: response.content,
      }
      allMessages.push(assistantMessage)

      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const block of response.content) {
        if (block.type === "tool_use") {
          const { result, projectSlug: slug } = await executeTool(
            block.name,
            block.input as Record<string, unknown>,
            user.id
          )
          if (slug) {
            projectSlug = slug
          }
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
        max_tokens: 1024,
        system: systemPrompt,
        tools,
        messages: allMessages,
      })
    }

    // Extract text response
    const textContent = response.content.find((b) => b.type === "text")
    const text = textContent?.type === "text" ? textContent.text : ""

    return NextResponse.json({
      response: text,
      projectSlug,
    })
  } catch (error) {
    console.error("Onboarding chat error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 }
    )
  }
}
