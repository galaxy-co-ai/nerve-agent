export const dynamic = "force-dynamic"

import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  NerveCard,
  NerveCardContent,
  NerveCardDescription,
  NerveCardHeader,
  NerveCardTitle,
} from "@/components/nerve/components/nerve-card"
import { NerveBadge } from "@/components/nerve/components/nerve-badge"
import { H3, Muted } from "@/components/ui/typography"
import { FileText, Pin, FolderKanban } from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { NotesToolbar } from "@/components/features/notes-toolbar"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

// AI tag categories with NerveBadge variant mapping
const TAG_VARIANTS: Record<string, "primary" | "info" | "success" | "warning" | "error" | "default"> = {
  idea: "primary",      // gold/purple-ish
  task: "warning",      // orange/yellow
  reference: "info",    // blue
  insight: "success",   // green
  decision: "warning",  // yellow
}

// Custom styles for tags that need specific colors beyond NerveBadge variants
const TAG_STYLES: Record<string, string> = {
  idea: "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.1)]",
  task: "bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_8px_rgba(249,115,22,0.1)]",
  reference: "", // uses NerveBadge info variant
  insight: "",   // uses NerveBadge success variant
  decision: "",  // uses NerveBadge warning variant
}

// Tag definitions for filter pills
const TAGS = [
  { id: "idea", label: "Idea" },
  { id: "task", label: "Task" },
  { id: "reference", label: "Reference" },
  { id: "insight", label: "Insight" },
  { id: "decision", label: "Decision" },
]

interface NotesPageProps {
  searchParams: Promise<{ project?: string; sort?: string; q?: string; tag?: string }>
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const params = await searchParams
  const user = await requireUser()

  const [notes, projects] = await Promise.all([
    db.note.findMany({
      where: {
        userId: user.id,
        ...(params.project ? { projectId: params.project } : {}),
      },
      orderBy: params.sort === "recent"
        ? { updatedAt: "desc" }
        : [{ isPinned: "desc" }, { updatedAt: "desc" }],
      include: {
        project: { select: { id: true, name: true, slug: true } },
      },
    }),
    db.project.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ])

  // Filter by search query and tag on the server
  let filteredNotes = notes

  // Filter by tag
  if (params.tag) {
    filteredNotes = filteredNotes.filter((note) => {
      const tags = note.tags as string[]
      return tags?.includes(params.tag!)
    })
  }

  // Filter by search query
  if (params.q) {
    filteredNotes = filteredNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(params.q!.toLowerCase()) ||
        note.content.toLowerCase().includes(params.q!.toLowerCase())
    )
  }

  const pinnedNotes = filteredNotes.filter((note) => note.isPinned)
  const regularNotes = filteredNotes.filter((note) => !note.isPinned)

  // Extract a preview from content
  function getPreview(content: string, maxLength: number = 150): string {
    // Remove wiki links
    const cleaned = content.replace(/\[\[([^\]]+)\]\]/g, "$1")
    if (cleaned.length <= maxLength) return cleaned
    return cleaned.slice(0, maxLength).trim() + "..."
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1 flex justify-center">
          <h1 className="text-lg font-bold tracking-tight">NERVE AGENT</h1>
        </div>
        <div className="text-sm text-muted-foreground">Notes</div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 min-w-0">
        {/* Toolbar with search and action buttons */}
        <NotesToolbar
          projects={projects}
          noteCount={filteredNotes.length}
          defaultQuery={params.q}
        />

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Project Filter */}
          {projects.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Project:</span>
              <Link href={`/notes${params.tag ? `?tag=${params.tag}` : ""}`}>
                <NerveBadge
                  variant={!params.project ? "primary" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  All
                </NerveBadge>
              </Link>
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/notes?project=${project.id}${params.tag ? `&tag=${params.tag}` : ""}`}
                >
                  <NerveBadge
                    variant={params.project === project.id ? "primary" : "outline"}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {project.name}
                  </NerveBadge>
                </Link>
              ))}
            </div>
          )}

          {/* Tag Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Tag:</span>
            <Link href={`/notes${params.project ? `?project=${params.project}` : ""}`}>
              <NerveBadge
                variant={!params.tag ? "primary" : "outline"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                All
              </NerveBadge>
            </Link>
            {TAGS.map((tag) => (
              <Link
                key={tag.id}
                href={`/notes?${params.project ? `project=${params.project}&` : ""}tag=${tag.id}`}
              >
                <NerveBadge
                  variant={params.tag === tag.id ? TAG_VARIANTS[tag.id] : "outline"}
                  className={cn(
                    "cursor-pointer transition-opacity",
                    params.tag === tag.id && TAG_STYLES[tag.id],
                    params.tag !== tag.id && "opacity-60 hover:opacity-100"
                  )}
                >
                  {tag.label}
                </NerveBadge>
              </Link>
            ))}
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <NerveCard elevation={1}>
            <NerveCardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-zinc-800 p-4 mb-4">
                <FileText className="h-8 w-8 text-zinc-500" />
              </div>
              <h3 className="font-semibold mb-2 text-zinc-100">
                {params.q ? "No notes found" : "No notes yet"}
              </h3>
              <p className="text-zinc-400 text-sm text-center max-w-sm">
                {params.q
                  ? "Try a different search term or start writing above."
                  : "Start writing in the composer above. Use [[wiki links]] to connect ideas."}
              </p>
            </NerveCardContent>
          </NerveCard>
        ) : (
          <div className="space-y-6">
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                  <Pin className="h-4 w-4" />
                  Pinned
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pinnedNotes.map((note) => {
                    const tags = note.tags as string[]
                    const primaryTag = tags?.[0]
                    return (
                    <Link key={note.id} href={`/notes/${note.slug}`} data-ax-intent="navigate:note-detail" data-ax-context="list-item">
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
                            <Pin className="h-4 w-4 text-zinc-500 flex-shrink-0" />
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
                  )})}
                </div>
              </div>
            )}

            {/* Regular Notes */}
            {regularNotes.length > 0 && (
              <div className="space-y-3">
                {pinnedNotes.length > 0 && (
                  <h2 className="text-sm font-medium text-zinc-500">All Notes</h2>
                )}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {regularNotes.map((note) => {
                    const tags = note.tags as string[]
                    const primaryTag = tags?.[0]
                    return (
                    <Link key={note.id} href={`/notes/${note.slug}`} data-ax-intent="navigate:note-detail" data-ax-context="list-item">
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
                          <NerveCardTitle className="text-base line-clamp-1">
                            {note.title}
                          </NerveCardTitle>
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
                  )})}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
