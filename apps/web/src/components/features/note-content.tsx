"use client"

import { JSX } from "react"
import Link from "next/link"
import { FileText } from "lucide-react"

interface NoteContentProps {
  content: string
  notes: { id: string; title: string; slug: string }[]
}

export function NoteContent({ content, notes }: NoteContentProps) {
  // Parse wiki links [[Note Title]] and render them as clickable links
  const _renderContent = () => {
    // Split content by wiki links
    const wikiLinkPattern = /\[\[([^\]]+)\]\]/g
    const parts: (string | JSX.Element)[] = []
    let lastIndex = 0
    let match

    while ((match = wikiLinkPattern.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index))
      }

      // Find the linked note
      const linkTitle = match[1]
      const linkedNote = notes.find(
        (n) => n.title.toLowerCase() === linkTitle.toLowerCase()
      )

      if (linkedNote) {
        // Render as a link to existing note
        parts.push(
          <Link
            key={match.index}
            href={`/notes/${linkedNote.slug}`}
            className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
          >
            <FileText className="h-3.5 w-3.5" />
            {linkedNote.title}
          </Link>
        )
      } else {
        // Render as a "create new note" link (dashed underline to indicate non-existent)
        parts.push(
          <span
            key={match.index}
            className="inline-flex items-center gap-1 text-muted-foreground border-b border-dashed border-muted-foreground/50"
            title={`Note "${linkTitle}" not found`}
          >
            <FileText className="h-3.5 w-3.5" />
            {linkTitle}
          </span>
        )
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex))
    }

    return parts
  }

  // Split content into paragraphs and render
  const paragraphs = content.split("\n\n")

  return (
    <div className="prose prose-invert max-w-none">
      {paragraphs.map((paragraph, i) => {
        // Check for headers
        if (paragraph.startsWith("# ")) {
          return (
            <h1 key={i} className="text-2xl font-bold mt-6 mb-4">
              {paragraph.slice(2)}
            </h1>
          )
        }
        if (paragraph.startsWith("## ")) {
          return (
            <h2 key={i} className="text-xl font-semibold mt-5 mb-3">
              {paragraph.slice(3)}
            </h2>
          )
        }
        if (paragraph.startsWith("### ")) {
          return (
            <h3 key={i} className="text-lg font-semibold mt-4 mb-2">
              {paragraph.slice(4)}
            </h3>
          )
        }

        // Check for code blocks
        if (paragraph.startsWith("```")) {
          const lines = paragraph.split("\n")
          const _language = lines[0].slice(3)
          const code = lines.slice(1, -1).join("\n")
          return (
            <pre key={i} className="bg-muted rounded-lg p-4 overflow-x-auto my-4">
              <code className="text-sm font-mono">{code}</code>
            </pre>
          )
        }

        // Check for bullet lists
        if (paragraph.split("\n").every((line) => line.startsWith("- ") || line === "")) {
          const items = paragraph.split("\n").filter((line) => line.startsWith("- "))
          return (
            <ul key={i} className="list-disc list-inside my-4 space-y-1">
              {items.map((item, j) => (
                <li key={j} className="text-muted-foreground">
                  {renderWikiLinks(item.slice(2), notes)}
                </li>
              ))}
            </ul>
          )
        }

        // Regular paragraph
        const lines = paragraph.split("\n")
        return (
          <p key={i} className="text-muted-foreground leading-relaxed my-4">
            {lines.map((line, j) => (
              <span key={j}>
                {renderWikiLinks(line, notes)}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

// Helper function to render wiki links within a single line
function renderWikiLinks(text: string, notes: { id: string; title: string; slug: string }[]) {
  const wikiLinkPattern = /\[\[([^\]]+)\]\]/g
  const parts: (string | JSX.Element)[] = []
  let lastIndex = 0
  let match

  while ((match = wikiLinkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const linkTitle = match[1]
    const linkedNote = notes.find(
      (n) => n.title.toLowerCase() === linkTitle.toLowerCase()
    )

    if (linkedNote) {
      parts.push(
        <Link
          key={match.index}
          href={`/notes/${linkedNote.slug}`}
          className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
        >
          <FileText className="h-3.5 w-3.5" />
          {linkedNote.title}
        </Link>
      )
    } else {
      parts.push(
        <span
          key={match.index}
          className="inline-flex items-center gap-1 text-muted-foreground border-b border-dashed border-muted-foreground/50"
          title={`Note "${linkTitle}" not found`}
        >
          <FileText className="h-3.5 w-3.5" />
          {linkTitle}
        </span>
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}
