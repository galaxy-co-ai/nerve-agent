export const dynamic = "force-dynamic"

import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Pin, FolderKanban, Search } from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { AddNoteDialog } from "@/components/dialogs/add-note-dialog"
import { Input } from "@/components/ui/input"
import { formatDistanceToNow } from "date-fns"

interface NotesPageProps {
  searchParams: Promise<{ project?: string; sort?: string; q?: string }>
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

  // Filter by search query on the server
  const filteredNotes = params.q
    ? notes.filter(
        (note) =>
          note.title.toLowerCase().includes(params.q!.toLowerCase()) ||
          note.content.toLowerCase().includes(params.q!.toLowerCase())
      )
    : notes

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
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Notes</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <AddNoteDialog projects={projects} />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
            <p className="text-muted-foreground">Capture project knowledge with wiki-style linking.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <form>
            <Input
              name="q"
              placeholder="Search notes..."
              defaultValue={params.q}
              className="pl-9"
            />
          </form>
        </div>

        {/* Project Filter Pills */}
        {projects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link href="/notes">
              <Badge
                variant={!params.project ? "default" : "outline"}
                className="cursor-pointer"
              >
                All
              </Badge>
            </Link>
            {projects.map((project) => (
              <Link key={project.id} href={`/notes?project=${project.id}`}>
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

        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">
                {params.q ? "No notes found" : "No notes yet"}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 text-center max-w-sm">
                {params.q
                  ? "Try a different search term or create a new note."
                  : "Create your first note to start capturing knowledge. Use [[wiki links]] to connect ideas."}
              </p>
              {!params.q && <AddNoteDialog projects={projects} />}
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
                  {pinnedNotes.map((note) => (
                    <Link key={note.id} href={`/notes/${note.slug}`}>
                      <Card className="h-full transition-colors hover:bg-muted/50">
                        <CardHeader className="pb-2">
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
                  ))}
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
                  {regularNotes.map((note) => (
                    <Link key={note.id} href={`/notes/${note.slug}`}>
                      <Card className="h-full transition-colors hover:bg-muted/50">
                        <CardHeader className="pb-2">
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
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
