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
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { EditNoteForm } from "@/components/forms/edit-note-form"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function EditNotePage({ params }: PageProps) {
  const { slug } = await params
  const user = await requireUser()

  const [note, projects, folders] = await Promise.all([
    db.note.findFirst({
      where: { slug, userId: user.id },
      include: {
        project: { select: { id: true, name: true } },
        folder: { select: { id: true, name: true, slug: true } },
      },
    }),
    db.project.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.noteFolder.findMany({
      where: { userId: user.id },
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ])

  if (!note) {
    notFound()
  }

  // Parse tags from JSON
  const noteTags = Array.isArray(note.tags) ? note.tags as string[] : []

  const noteForForm = {
    slug: note.slug,
    title: note.title,
    content: note.content,
    projectId: note.projectId,
    folderId: note.folderId,
    tags: noteTags,
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
              <BreadcrumbLink href={`/notes/${note.slug}`}>{note.title}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Note</h1>
          <p className="text-muted-foreground">Update your note content.</p>
        </div>

        <EditNoteForm note={noteForForm} projects={projects} folders={folders} />
      </div>
    </>
  )
}
