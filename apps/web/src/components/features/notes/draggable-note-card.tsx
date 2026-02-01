"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import Link from "next/link"
import {
  NerveCard,
  NerveCardContent,
  NerveCardDescription,
  NerveCardHeader,
  NerveCardTitle,
} from "@/components/nerve/components/nerve-card"
import { NerveBadge } from "@/components/nerve/components/nerve-badge"
import { FolderKanban, Pin, GripVertical } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { axEntityAttrs, computeStaleness } from "@/lib/ax"
import { useNotesDnd } from "./dnd-context"

// Tag variant mapping
const TAG_VARIANTS: Record<string, "primary" | "info" | "success" | "warning" | "error" | "default"> = {
  idea: "primary",
  task: "warning",
  reference: "info",
  insight: "success",
  decision: "warning",
}

const TAG_STYLES: Record<string, string> = {
  idea: "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.1)]",
  task: "bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_8px_rgba(249,115,22,0.1)]",
  reference: "",
  insight: "",
  decision: "",
}

export interface NoteForCard {
  id: string
  slug: string
  title: string
  content: string
  tags: string[] | null
  isPinned: boolean
  updatedAt: Date
  project: { id: string; name: string; slug: string } | null
}

interface DraggableNoteCardProps {
  note: NoteForCard
}

function getPreview(content: string, maxLength: number = 150): string {
  const cleaned = content.replace(/\[\[([^\]]+)\]\]/g, "$1")
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.slice(0, maxLength).trim() + "..."
}

export function DraggableNoteCard({ note }: DraggableNoteCardProps) {
  const { isDragging } = useNotesDnd()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isThisNoteDragging,
  } = useDraggable({
    id: note.id,
    data: {
      type: "note",
      title: note.title,
    },
  })

  const tags = note.tags as string[] | null
  const primaryTag = tags?.[0]
  const staleness = computeStaleness(note.updatedAt, {
    hasUntaggedContent: !tags || tags.length === 0,
  })
  const relationships = note.project
    ? [{ type: "belongs-to", entity: "project", id: note.project.id, name: note.project.name }]
    : []

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        opacity: isThisNoteDragging ? 0.5 : 1,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isThisNoteDragging && "z-50"
      )}
    >
      {/* Drag handle - shows on hover */}
      <button
        {...listeners}
        {...attributes}
        className={cn(
          "absolute -left-2 top-1/2 -translate-y-1/2 z-10",
          "p-1 rounded bg-zinc-800 border border-zinc-700",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "cursor-grab active:cursor-grabbing",
          isDragging && "opacity-100"
        )}
        aria-label="Drag to move note"
      >
        <GripVertical className="h-4 w-4 text-zinc-500" />
      </button>

      <Link
        href={`/notes/${note.slug}`}
        data-ax-intent="navigate:note-detail"
        data-ax-context="list-item"
        {...axEntityAttrs("note", note.id, staleness, relationships)}
        onClick={(e) => {
          // Prevent navigation when dragging
          if (isDragging) {
            e.preventDefault()
          }
        }}
      >
        <NerveCard variant="interactive" elevation={2} className="h-full relative">
          {primaryTag && (
            <NerveBadge
              variant={TAG_VARIANTS[primaryTag] || "default"}
              size="sm"
              className={cn(
                "absolute top-3 right-3 capitalize",
                TAG_STYLES[primaryTag]
              )}
            >
              {primaryTag}
            </NerveBadge>
          )}
          <NerveCardHeader className="pb-2 pr-20">
            <div className="flex items-start justify-between gap-2">
              <NerveCardTitle className="text-base line-clamp-1">
                {note.title}
              </NerveCardTitle>
              {note.isPinned && (
                <Pin className="h-4 w-4 text-zinc-500 flex-shrink-0" />
              )}
            </div>
            {note.project && (
              <NerveCardDescription className="flex items-center gap-1">
                <FolderKanban className="h-3 w-3" />
                {note.project.name}
              </NerveCardDescription>
            )}
          </NerveCardHeader>
          <NerveCardContent>
            <p className="text-sm text-zinc-400 line-clamp-3">
              {getPreview(note.content)}
            </p>
            <p className="text-xs text-zinc-500 mt-3">
              Updated {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
            </p>
          </NerveCardContent>
        </NerveCard>
      </Link>
    </div>
  )
}
