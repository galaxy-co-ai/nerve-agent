export const dynamic = "force-dynamic"

import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { H3, Muted } from "@/components/ui/typography"
import { Badge } from "@/components/ui/badge"
import { FileText, Pin, FolderKanban } from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { NotesToolbar } from "@/components/features/notes-toolbar"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

// AI tag categories with colors (matches brain-dump-dialog)
const TAG_STYLES: Record<string, string> = {
  idea: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  task: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  reference: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  insight: "bg-green-500/20 text-green-400 border-green-500/30",
  decision: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
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

      <div className="flex flex-1 flex-col gap-6 p-6">
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
                <Badge
                  variant={!params.project ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  All
                </Badge>
              </Link>
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/notes?project=${project.id}${params.tag ? `&tag=${params.tag}` : ""}`}
                >
                  <Badge
                    variant={params.project === project.id ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    {project.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Tag Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Tag:</span>
            <Link href={`/notes${params.project ? `?project=${params.project}` : ""}`}>
              <Badge
                variant={!params.tag ? "default" : "outline"}
                className="cursor-pointer"
              >
                All
              </Badge>
            </Link>
            {TAGS.map((tag) => (
              <Link
                key={tag.id}
                href={`/notes?${params.project ? `project=${params.project}&` : ""}tag=${tag.id}`}
              >
                <Badge
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-opacity",
                    params.tag === tag.id
                      ? TAG_STYLES[tag.id]
                      : "opacity-60 hover:opacity-100"
                  )}
                >
                  {tag.label}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">
                {params.q ? "No notes found" : "No notes yet"}
              </h3>
              <p className="text-muted-foreground text-sm text-center max-w-sm">
                {params.q
                  ? "Try a different search term or start writing above."
                  : "Start writing in the composer above. Use [[wiki links]] to connect ideas."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Pin className="h-4 w-4" />
                  Pinned
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pinnedNotes.map((note) => {
                    const tags = note.tags as string[]
                    const primaryTag = tags?.[0]
                    return (
                    <Link key={note.id} href={`/notes/${note.slug}`}>
                      <Card className="h-full transition-colors hover:bg-muted/50 relative">
                        {primaryTag && TAG_STYLES[primaryTag] && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "absolute top-3 right-3 text-[10px] px-1.5 py-0 h-5 capitalize",
                              TAG_STYLES[primaryTag]
                            )}
                          >
                            {primaryTag}
                          </Badge>
                        )}
                        <CardHeader className="pb-2 pr-20">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base line-clamp-1">
                              {note.title}
                            </CardTitle>
                            <Pin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                          {note.project && (
                            <CardDescription className="flex items-center gap-1">
                              <FolderKanban className="h-3 w-3" />
                              {note.project.name}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {getPreview(note.content)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-3">
                            Updated {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  )})}
                </div>
              </div>
            )}

            {/* Regular Notes */}
            {regularNotes.length > 0 && (
              <div className="space-y-3">
                {pinnedNotes.length > 0 && (
                  <h2 className="text-sm font-medium text-muted-foreground">All Notes</h2>
                )}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {regularNotes.map((note) => {
                    const tags = note.tags as string[]
                    const primaryTag = tags?.[0]
                    return (
                    <Link key={note.id} href={`/notes/${note.slug}`}>
                      <Card className="h-full transition-colors hover:bg-muted/50 relative">
                        {primaryTag && TAG_STYLES[primaryTag] && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "absolute top-3 right-3 text-[10px] px-1.5 py-0 h-5 capitalize",
                              TAG_STYLES[primaryTag]
                            )}
                          >
                            {primaryTag}
                          </Badge>
                        )}
                        <CardHeader className="pb-2 pr-20">
                          <CardTitle className="text-base line-clamp-1">
                            {note.title}
                          </CardTitle>
                          {note.project && (
                            <CardDescription className="flex items-center gap-1">
                              <FolderKanban className="h-3 w-3" />
                              {note.project.name}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {getPreview(note.content)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-3">
                            Updated {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                          </p>
                        </CardContent>
                      </Card>
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
