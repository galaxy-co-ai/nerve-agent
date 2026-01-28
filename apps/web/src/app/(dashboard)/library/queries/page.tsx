export const dynamic = "force-dynamic"

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
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Database, Search } from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { AddLibraryItemDialog } from "@/components/add-library-item-dialog"
import { LibraryItemCard } from "@/components/library-item-card"

interface QueriesPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function QueriesPage({ searchParams }: QueriesPageProps) {
  const params = await searchParams
  const user = await requireUser()

  const [items, tags, projects] = await Promise.all([
    db.libraryItem.findMany({
      where: {
        userId: user.id,
        type: "QUERY",
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
              <BreadcrumbPage>Queries</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <AddLibraryItemDialog tags={tags} projects={projects} defaultType="QUERY" />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Queries</h1>
            <p className="text-muted-foreground">Database patterns, SQL queries, and data access code.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <form>
            <Input
              name="q"
              placeholder="Search queries..."
              defaultValue={params.q}
              className="pl-9"
            />
          </form>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Database className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">
                {params.q ? "No queries found" : "No queries yet"}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 text-center max-w-sm">
                {params.q
                  ? "Try a different search term or create a new query."
                  : "Add your first query - a complex SQL pattern, a Prisma query, or any database code you reuse."}
              </p>
              {!params.q && <AddLibraryItemDialog tags={tags} projects={projects} defaultType="QUERY" />}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <LibraryItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
