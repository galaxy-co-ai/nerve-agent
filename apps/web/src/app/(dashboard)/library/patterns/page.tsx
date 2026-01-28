export const dynamic = "force-dynamic"

import { Suspense } from "react"
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
import { Puzzle } from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { AddLibraryItemDialog } from "@/components/dialogs/add-library-item-dialog"
import { LibrarySearchSection } from "@/components/features/library-search-section"

interface PatternsPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function PatternsPage({ searchParams }: PatternsPageProps) {
  const params = await searchParams
  const user = await requireUser()

  const [items, tags, projects] = await Promise.all([
    db.libraryItem.findMany({
      where: {
        userId: user.id,
        type: "PATTERN",
        ...(params.q ? {
          OR: [
            { title: { contains: params.q, mode: "insensitive" } },
            { description: { contains: params.q, mode: "insensitive" } },
            { code: { contains: params.q, mode: "insensitive" } },
          ],
        } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: { tags: true, project: true },
    }),
    db.libraryTag.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
    db.project.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ])

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/library">Library</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Patterns</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <AddLibraryItemDialog tags={tags} projects={projects} defaultType="PATTERN" />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Patterns</h1>
            <p className="text-muted-foreground">Hooks, utilities, and code snippets you use across projects.</p>
          </div>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <LibrarySearchSection
            type="PATTERN"
            items={items}
            emptyIcon={Puzzle}
            emptyTitle="No patterns yet"
            emptyDescription="Add your first pattern - a custom hook, a utility function, or any reusable snippet."
            searchPlaceholder="Search patterns..."
          >
            <AddLibraryItemDialog tags={tags} projects={projects} defaultType="PATTERN" />
          </LibrarySearchSection>
        </Suspense>
      </div>
    </>
  )
}
