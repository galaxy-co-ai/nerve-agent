export const dynamic = "force-dynamic"

import Link from "next/link"
import { Suspense } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NerveBadge } from "@/components/nerve/components/nerve-badge"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { NotesToolbar } from "@/components/features/notes-toolbar"
import { HorizontalFolderRow } from "@/components/features/notes/horizontal-folder-row"
import { FolderPickerModal } from "@/components/features/notes/folder-picker-modal"
import { NotesGridClient } from "@/components/features/notes/notes-grid-client"
import { cn } from "@/lib/utils"
import { seedNoteFoldersForUser } from "@/lib/seed-folders"

// AI tag categories with NerveBadge variant mapping
const TAG_VARIANTS: Record<string, "primary" | "info" | "success" | "warning" | "error" | "default"> = {
  idea: "primary",      // gold/purple-ish
  task: "warning",      // orange/yellow
  reference: "info",    // blue
  insight: "success",   // green
  decision: "warning",  // yellow
  meeting: "info",      // blue - for meeting intelligence
  call: "info",         // blue - for call intelligence
}

// Custom styles for tags that need specific colors beyond NerveBadge variants
const TAG_STYLES: Record<string, string> = {
  idea: "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.1)]",
  task: "bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_8px_rgba(249,115,22,0.1)]",
  reference: "", // uses NerveBadge info variant
  insight: "",   // uses NerveBadge success variant
  decision: "",  // uses NerveBadge warning variant
  meeting: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.1)]",
  call: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.1)]",
}

// Tag definitions for filter pills
const TAGS = [
  { id: "idea", label: "Idea" },
  { id: "task", label: "Task" },
  { id: "reference", label: "Reference" },
  { id: "insight", label: "Insight" },
  { id: "decision", label: "Decision" },
  { id: "meeting", label: "Meeting" },
  { id: "call", label: "Call" },
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

  // Total note count for "All Notes" in folder row
  const totalNoteCount = await db.note.count({
    where: { userId: user.id },
  })

  // Format folders for folder row
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

  // Build filter URL helper
  function buildFilterUrl(overrides: Record<string, string | undefined>) {
    const newParams = { ...params, ...overrides }
    const searchParts: string[] = []
    if (newParams.folder) searchParts.push(`folder=${newParams.folder}`)
    if (newParams.project) searchParts.push(`project=${newParams.project}`)
    if (newParams.tag) searchParts.push(`tag=${newParams.tag}`)
    return `/notes${searchParts.length > 0 ? `?${searchParts.join("&")}` : ""}`
  }

  // Format notes for client component
  const pinnedNotesForClient = pinnedNotes.map((note) => ({
    id: note.id,
    slug: note.slug,
    title: note.title,
    content: note.content,
    tags: note.tags as string[] | null,
    isPinned: note.isPinned,
    updatedAt: note.updatedAt,
    project: note.project,
  }))

  const regularNotesForClient = regularNotes.map((note) => ({
    id: note.id,
    slug: note.slug,
    title: note.title,
    content: note.content,
    tags: note.tags as string[] | null,
    isPinned: note.isPinned,
    updatedAt: note.updatedAt,
    project: note.project,
  }))

  return (
    <>
      <header className="flex h-16 shrink-0 items-center border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1 flex justify-center">
          <h1 className="text-lg font-bold tracking-tight">NERVE AGENT</h1>
        </div>
        <div className="text-sm text-muted-foreground">Notes</div>
      </header>

      <NotesGridClient
        pinnedNotes={pinnedNotesForClient}
        regularNotes={regularNotesForClient}
        folderRow={
          <Suspense fallback={<div className="h-12" />}>
            <HorizontalFolderRow folders={folderItems} totalNoteCount={totalNoteCount} />
          </Suspense>
        }
        toolbar={
          <NotesToolbar
            projects={projects}
            noteCount={filteredNotes.length}
            defaultQuery={params.q}
          />
        }
        filterPills={
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
        }
        folderPickerModal={
          <Suspense fallback={null}>
            <FolderPickerModal folders={folderItems} />
          </Suspense>
        }
      />
    </>
  )
}
