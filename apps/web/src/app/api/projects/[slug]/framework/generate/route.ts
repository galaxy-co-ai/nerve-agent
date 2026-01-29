import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { DOCUMENT_TEMPLATES } from "@/lib/framework-templates"

const anthropic = new Anthropic()

type RouteContext = { params: Promise<{ slug: string }> }

// Generate a section of a framework document
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug } = await context.params
    const { docNumber, sectionIndex, userContext, previousSections } = await request.json()

    if (!docNumber || sectionIndex === undefined) {
      return NextResponse.json(
        { error: "docNumber and sectionIndex are required" },
        { status: 400 }
      )
    }

    const project = await db.project.findFirst({
      where: { slug, userId: user.id },
      include: {
        frameworkDocs: {
          orderBy: { docNumber: "asc" },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Get the template for this document
    const template = DOCUMENT_TEMPLATES[docNumber]
    if (!template) {
      return NextResponse.json({ error: "Invalid document number" }, { status: 400 })
    }

    const section = template.sections[sectionIndex]
    if (!section) {
      return NextResponse.json({ error: "Invalid section index" }, { status: 400 })
    }

    // Build context from previous documents
    const previousDocs = project.frameworkDocs
      .filter((d) => d.docNumber < docNumber && d.status === "LOCKED")
      .map((d) => `## Document ${d.docNumber}\n${d.content}`)
      .join("\n\n")

    // Build system prompt
    const systemPrompt = `You are Claude, an expert product strategist and technical architect helping a solo developer complete their project framework documents.

You are filling out section "${section.title}" of the "${template.name}" document.

IMPORTANT RULES:
1. Fill out ONLY this section - do not include other sections
2. Replace all placeholder text [like this] with real content
3. Be specific and actionable - no vague statements
4. Keep tables properly formatted in markdown
5. Be concise but thorough
6. Base your responses on the user's context and any previous documents

The section template is:
---
${section.template}
---

${previousDocs ? `Previous completed documents for context:\n${previousDocs}` : ""}

${previousSections ? `Previously completed sections of this document:\n${previousSections}` : ""}`

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userContext || `Please fill out this section for the project "${project.name}" for client "${project.clientName}".${project.description ? ` Project description: ${project.description}` : ""}`,
        },
      ],
    })

    const textContent = response.content.find((b) => b.type === "text")
    const generatedContent = textContent?.type === "text" ? textContent.text : ""

    return NextResponse.json({
      section: section.title,
      content: generatedContent,
      sectionIndex,
      totalSections: template.sections.length,
      isLastSection: sectionIndex === template.sections.length - 1,
    })
  } catch (error) {
    console.error("Generate section error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate section" },
      { status: 500 }
    )
  }
}

// Regenerate a section with feedback
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireUser()
    const { slug } = await context.params
    const { docNumber, sectionIndex, currentContent, feedback, userContext, previousSections } =
      await request.json()

    if (!docNumber || sectionIndex === undefined || !currentContent || !feedback) {
      return NextResponse.json(
        { error: "docNumber, sectionIndex, currentContent, and feedback are required" },
        { status: 400 }
      )
    }

    const project = await db.project.findFirst({
      where: { slug, userId: user.id },
      include: {
        frameworkDocs: {
          orderBy: { docNumber: "asc" },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const template = DOCUMENT_TEMPLATES[docNumber]
    if (!template) {
      return NextResponse.json({ error: "Invalid document number" }, { status: 400 })
    }

    const section = template.sections[sectionIndex]
    if (!section) {
      return NextResponse.json({ error: "Invalid section index" }, { status: 400 })
    }

    const previousDocs = project.frameworkDocs
      .filter((d) => d.docNumber < docNumber && d.status === "LOCKED")
      .map((d) => `## Document ${d.docNumber}\n${d.content}`)
      .join("\n\n")

    const systemPrompt = `You are Claude, an expert product strategist and technical architect helping a solo developer complete their project framework documents.

You previously generated content for section "${section.title}" of the "${template.name}" document, but the user has requested changes.

IMPORTANT RULES:
1. Revise ONLY this section based on the feedback
2. Keep the same structure but improve the content
3. Be specific and actionable
4. Keep tables properly formatted in markdown

The section template is:
---
${section.template}
---

${previousDocs ? `Previous completed documents for context:\n${previousDocs}` : ""}

${previousSections ? `Previously completed sections of this document:\n${previousSections}` : ""}`

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userContext || `Project: "${project.name}" for client "${project.clientName}".`,
        },
        {
          role: "assistant",
          content: currentContent,
        },
        {
          role: "user",
          content: `Please revise this section based on the following feedback:\n\n${feedback}`,
        },
      ],
    })

    const textContent = response.content.find((b) => b.type === "text")
    const generatedContent = textContent?.type === "text" ? textContent.text : ""

    return NextResponse.json({
      section: section.title,
      content: generatedContent,
      sectionIndex,
      totalSections: template.sections.length,
      isLastSection: sectionIndex === template.sections.length - 1,
    })
  } catch (error) {
    console.error("Regenerate section error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to regenerate section" },
      { status: 500 }
    )
  }
}
