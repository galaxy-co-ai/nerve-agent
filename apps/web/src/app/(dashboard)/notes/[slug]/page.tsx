export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderKanban, Clock, Link2, FileText } from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { NoteActions } from "@/components/note-actions"
import { NoteContent } from "@/components/note-content"
import { formatDistanceToNow } from "date-fns"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function NotePage({ params }: PageProps) {
  const { slug } = await params
  const user = await requireUser()

  const note = await db.note.findFirst({
    where: { slug, userId: user.id },
    include: {
      project: { select: { id: true, name: true, slug: true } },
    },
  })

  if (!note) {
    notFound()
  }

  // Get all notes for wiki link resolution and backlinks
  const allNotes = await db.note.findMany({
    where: { userId: user.id },
    select: { id: true, title: true, slug: true, content: true },
  })

  // Find backlinks - notes that link to this note using [[Note Title]]
  const backlinks = allNotes.filter((n) => {
    if (n.id === note.id) return false // Don't include self
    const wikiLinkPattern = /\[\[([^\]]+)\]\]/g
    let match
    while ((match = wikiLinkPattern.exec(n.content)) !== null) {
      if (match[1].toLowerCase() === note.title.toLowerCase()) {
        return true
      }
    }
    return false
  })

  // Get context around the backlink for preview
  function getBacklinkContext(content: string, title: string): string {
    const pattern = new RegExp(`(.{0,50})\\[\\[${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\](.{0,50})`, 'i')
    const match = content.match(pattern)
    if (match) {
      return `...${match[1]}[[${title}]]${match[2]}...`
    }
    return ""
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/notes">Notes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{note.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <NoteActions note={note} />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{note.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {note.project && (
              <Link
                href={`/projects/${note.project.slug}`}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <FolderKanban className="h-4 w-4" />
                {note.project.name}
              </Link>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Updated {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
            </div>
            {note.isPinned && (
              <Badge variant="secondary">Pinned</Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-6">
            <NoteContent content={note.content} notes={allNotes} />
          </CardContent>
        </Card>

        {/* Backlinks */}
        {backlinks.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Backlinks</CardTitle>
              </div>
              <CardDescription>
                {backlinks.length} note{backlinks.length !== 1 ? "s" : ""} link to this note
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {backlinks.map((backlink) => (
                <Link
                  key={backlink.id}
                  href={`/notes/${backlink.slug}`}
                  className="block p-3 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{backlink.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {getBacklinkContext(backlink.content, note.title)}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
