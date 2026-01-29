"use client"

import { Code2, Package } from "lucide-react"

interface TechStackTabProps {
  techStack: string | null
}

export function TechStackTab({ techStack }: TechStackTabProps) {
  if (!techStack) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Package className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No tech stack defined</p>
        <p className="text-xs text-muted-foreground mt-1">
          Complete the TAD document to define your tech stack
        </p>
      </div>
    )
  }

  // Parse tech stack from markdown-style content
  // Expected format is markdown with headers and lists
  const lines = techStack.split("\n")

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Code2 className="h-3.5 w-3.5" />
        <span>Extracted from TAD</span>
      </div>

      <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
        <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">
          {techStack}
        </pre>
      </div>
    </div>
  )
}
