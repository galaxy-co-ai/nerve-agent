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
import { H2, Muted } from "@/components/ui/typography"
import { Badge } from "@/components/ui/badge"
import { Code2, Blocks, Puzzle, Database, Star, TrendingUp, Palette } from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { AddLibraryItemDialog } from "@/components/dialogs/add-library-item-dialog"
import { LibraryItemCard } from "@/components/features/library-item-card"

export default async function LibraryPage() {
  const user = await requireUser()

  const [items, tags, projects] = await Promise.all([
    db.libraryItem.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { tags: true, project: true },
      take: 10,
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

  const [blockCount, patternCount, queryCount, favoriteCount, designSystemCount] = await Promise.all([
    db.libraryItem.count({ where: { userId: user.id, type: "BLOCK" } }),
    db.libraryItem.count({ where: { userId: user.id, type: "PATTERN" } }),
    db.libraryItem.count({ where: { userId: user.id, type: "QUERY" } }),
    db.libraryItem.count({ where: { userId: user.id, isFavorite: true } }),
    db.designSystem.count({ where: { userId: user.id } }),
  ])

  const recentlyUsed = items
    .filter(item => item.lastUsedAt)
    .sort((a, b) => (b.lastUsedAt?.getTime() || 0) - (a.lastUsedAt?.getTime() || 0))
    .slice(0, 5)

  const favorites = items.filter(item => item.isFavorite).slice(0, 5)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Library</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <AddLibraryItemDialog tags={tags} projects={projects} />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <H2>Library</H2>
          <Muted>Your reusable code library. Ship faster with battle-tested patterns.</Muted>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-5">
          <Link href="/library/design-systems">
            <Card className="transition-colors hover:bg-muted/50 border-amber-500/20 hover:border-amber-500/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Design Systems</CardTitle>
                <Palette className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{designSystemCount}</div>
                <p className="text-xs text-muted-foreground">Visual languages</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/library/blocks">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Blocks</CardTitle>
                <Blocks className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{blockCount}</div>
                <p className="text-xs text-muted-foreground">Large implementations</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/library/patterns">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Patterns</CardTitle>
                <Puzzle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patternCount}</div>
                <p className="text-xs text-muted-foreground">Hooks, utilities, snippets</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/library/queries">
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Queries</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{queryCount}</div>
                <p className="text-xs text-muted-foreground">Database patterns</p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favoriteCount}</div>
              <p className="text-xs text-muted-foreground">Quick access items</p>
            </CardContent>
          </Card>
        </div>

        {/* Recently Used & Favorites */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recently Used */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Recently Used</CardTitle>
              </div>
              <CardDescription>Quick access to your most recent copies</CardDescription>
            </CardHeader>
            <CardContent>
              {recentlyUsed.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No items used yet. Copy some code to see it here.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentlyUsed.map((item) => (
                    <LibraryItemCard key={item.id} item={item} compact />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favorites */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Favorites</CardTitle>
              </div>
              <CardDescription>Your starred items for quick access</CardDescription>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No favorites yet. Star items to add them here.
                </p>
              ) : (
                <div className="space-y-2">
                  {favorites.map((item) => (
                    <LibraryItemCard key={item.id} item={item} compact />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Tags */}
        {tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
              <CardDescription>Browse by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link key={tag.id} href={`/library?tag=${tag.name}`}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Code2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Your library is empty</h3>
              <p className="text-muted-foreground text-sm mb-4 text-center max-w-sm">
                Start building your reusable code library. Add blocks, patterns, and queries to ship faster.
              </p>
              <AddLibraryItemDialog tags={tags} projects={projects} />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
