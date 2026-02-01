export const dynamic = "force-dynamic"

import Link from "next/link"
import { Suspense } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  NerveCard,
  NerveCardContent,
  NerveCardDescription,
  NerveCardHeader,
  NerveCardTitle,
} from "@/components/nerve/components/nerve-card"
import { NerveBadge } from "@/components/nerve/components/nerve-badge"
import { FileText, Pin, FolderKanban } from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { NotesToolbar } from "@/components/features/notes-toolbar"
import { FolderSidebar } from "@/components/features/notes/folder-sidebar"
import { FolderPickerModal } from "@/components/features/notes/folder-picker-modal"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { axEntityAttrs, computeStaleness } from "@/lib/ax"
import { seedNoteFoldersForUser } from "@/lib/seed-folders"

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
  searchParams: Promise<{ project?: string; sort?: string; q?: string; tag?: string; folder?: string }>
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const params = await searchParams
  const user = await requireUser()

  // Ensure user has folders (seeds if missing)
  let folders = await db.noteFolder.findMany({
    where: { userId: user.id },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { notes: true } },
    },
  })

  // Seed folders if user doesn't have any
  if (folders.length === 0) {
    await seedNoteFoldersForUser(user.id)
    folders = await db.noteFolder.findMany({
      where: { userId: user.id },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { notes: true } },
      },
    })
  }

  // Find folder ID if filtering by folder slug
  const selectedFolder = params.folder
    ? folders.find((f) => f.slug === params.folder)
    : null

  const [notes, projects] = await Promise.all([
    db.note.findMany({
      where: {
        userId: user.id,
        ...(params.project ? { projectId: params.project } : {}),
        ...(selectedFolder ? { folderId: selectedFolder.id } : {}),
      },
      orderBy: params.sort === "recent"
        ? { updatedAt: "desc" }
        : [{ isPinned: "desc" }, { updatedAt: "desc" }],
      include: {
        project: { select: { id: true, name: true, slug: true } },
        folder: { select: { id: true, name: true, slug: true } },
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

  // Total note count for "All Notes" in sidebar
  const totalNoteCount = await db.note.count({
    where: { userId: user.id },
  })

  // Format folders for sidebar
  const folderItems = folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    slug: folder.slug,
    icon: folder.icon,
    color: folder.color,
    isSystem: folder.isSystem,
    order: folder.order,
    noteCount: folder._count.notes,
  }))

  // Extract a preview from content
  function getPreview(content: string, maxLength: number = 150): string {
    // Remove wiki links
    const cleaned = content.replace(/\[\[([^\]]+)\]\]/g, "$1")
    if (cleaned.length <= maxLength) return cleaned
    return cleaned.slice(0, maxLength).trim() + "..."
  }

  // Build filter URL helper
  function buildFilterUrl(overrides: Record<string, string | undefined>) {
    const newParams = { ...params, ...overrides }
    const searchParts: string[] = []
    if (newParams.folder) searchParts.push(`folder=${newParams.folder}`)
    if (newParams.project) searchParts.push(`project=${newParams.project}`)
    if (newParams.tag) searchParts.push(`tag=${newParams.tag}`)
    return `/notes${searchParts.length > 0 ? `?${searchParts.join("&")}` : ""}`
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

      <div className="flex flex-1 min-h-0">
        {/* Folder Sidebar */}
        <Suspense fallback={<div className="w-56 shrink-0 border-r border-border/40" />}>
          <FolderSidebar folders={folderItems} totalNoteCount={totalNoteCount} />
        </Suspense>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 p-6 min-w-0 overflow-y-auto">
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
                <Link href={buildFilterUrl({ project: undefined })}>
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
                    href={buildFilterUrl({ project: project.id })}
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
              <Link href={buildFilterUrl({ tag: undefined })}>
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
                  href={buildFilterUrl({ tag: tag.id })}
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

          {/* Current Folder Header */}
          {selectedFolder && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>Viewing:</span>
              <NerveBadge variant="outline">{selectedFolder.name}</NerveBadge>
            </div>
          )}

          {filteredNotes.length === 0 ? (
            <NerveCard elevation={1}>
              <NerveCardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-zinc-800 p-4 mb-4">
                  <FileText className="h-8 w-8 text-zinc-500" />
                </div>
                <h3 className="font-semibold mb-2 text-zinc-100">
                  {params.q ? "No notes found" : selectedFolder ? `No notes in ${selectedFolder.name}` : "No notes yet"}
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
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {pinnedNotes.map((note) => {
                      const tags = note.tags as string[]
                      const primaryTag = tags?.[0]
                      const staleness = computeStaleness(note.updatedAt, {
                        hasUntaggedContent: !tags || tags.length === 0,
                      })
                      const relationships = note.project
                        ? [{ type: "belongs-to", entity: "project", id: note.project.id, name: note.project.name }]
                        : []
                      return (
                      <Link key={note.id} href={`/notes/${note.slug}`} data-ax-intent="navigate:note-detail" data-ax-context="list-item" {...axEntityAttrs("note", note.id, staleness, relationships)}>
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
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {regularNotes.map((note) => {
                      const tags = note.tags as string[]
                      const primaryTag = tags?.[0]
                      const staleness = computeStaleness(note.updatedAt, {
                        hasUntaggedContent: !tags || tags.length === 0,
                      })
                      const relationships = note.project
                        ? [{ type: "belongs-to", entity: "project", id: note.project.id, name: note.project.name }]
                        : []
                      return (
                      <Link key={note.id} href={`/notes/${note.slug}`} data-ax-intent="navigate:note-detail" data-ax-context="list-item" {...axEntityAttrs("note", note.id, staleness, relationships)}>
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
      </div>

      {/* Folder Picker Modal (for toast "Edit" button) */}
      <Suspense fallback={null}>
        <FolderPickerModal folders={folderItems} />
      </Suspense>
    </>
  )
}
