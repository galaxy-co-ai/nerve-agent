export const dynamic = "force-dynamic"

import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
  NerveCard,
  NerveCardContent,
  NerveCardDescription,
  NerveCardHeader,
  NerveCardTitle,
  NerveBadge,
  NerveSeparator,
} from "@/components/nerve"
import { H2 } from "@/components/ui/typography"
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
        <NerveSeparator orientation="vertical" className="mr-2 h-4" />
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
          <p className="text-zinc-400">Your reusable code library. Ship faster with battle-tested patterns.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-5">
          <Link href="/library/design-systems" data-ax-intent="navigate:library" data-ax-context="card-action">
            <NerveCard variant="interactive" elevation={1} className="border-[var(--nerve-gold-500)]/20 hover:border-[var(--nerve-gold-500)]/40">
              <NerveCardHeader className="flex flex-row items-center justify-between pb-2">
                <NerveCardTitle className="text-sm font-medium">Design Systems</NerveCardTitle>
                <Palette className="h-4 w-4 text-[var(--nerve-gold-400)]" />
              </NerveCardHeader>
              <NerveCardContent>
                <div className="text-2xl font-bold text-zinc-100">{designSystemCount}</div>
                <p className="text-xs text-zinc-500">Visual languages</p>
              </NerveCardContent>
            </NerveCard>
          </Link>

          <Link href="/library/blocks" data-ax-intent="navigate:library" data-ax-context="card-action">
            <NerveCard variant="interactive" elevation={1}>
              <NerveCardHeader className="flex flex-row items-center justify-between pb-2">
                <NerveCardTitle className="text-sm font-medium">Blocks</NerveCardTitle>
                <Blocks className="h-4 w-4 text-zinc-500" />
              </NerveCardHeader>
              <NerveCardContent>
                <div className="text-2xl font-bold text-zinc-100">{blockCount}</div>
                <p className="text-xs text-zinc-500">Large implementations</p>
              </NerveCardContent>
            </NerveCard>
          </Link>

          <Link href="/library/patterns" data-ax-intent="navigate:library" data-ax-context="card-action">
            <NerveCard variant="interactive" elevation={1}>
              <NerveCardHeader className="flex flex-row items-center justify-between pb-2">
                <NerveCardTitle className="text-sm font-medium">Patterns</NerveCardTitle>
                <Puzzle className="h-4 w-4 text-zinc-500" />
              </NerveCardHeader>
              <NerveCardContent>
                <div className="text-2xl font-bold text-zinc-100">{patternCount}</div>
                <p className="text-xs text-zinc-500">Hooks, utilities, snippets</p>
              </NerveCardContent>
            </NerveCard>
          </Link>

          <Link href="/library/queries" data-ax-intent="navigate:library" data-ax-context="card-action">
            <NerveCard variant="interactive" elevation={1}>
              <NerveCardHeader className="flex flex-row items-center justify-between pb-2">
                <NerveCardTitle className="text-sm font-medium">Queries</NerveCardTitle>
                <Database className="h-4 w-4 text-zinc-500" />
              </NerveCardHeader>
              <NerveCardContent>
                <div className="text-2xl font-bold text-zinc-100">{queryCount}</div>
                <p className="text-xs text-zinc-500">Database patterns</p>
              </NerveCardContent>
            </NerveCard>
          </Link>

          <NerveCard elevation={1}>
            <NerveCardHeader className="flex flex-row items-center justify-between pb-2">
              <NerveCardTitle className="text-sm font-medium">Favorites</NerveCardTitle>
              <Star className="h-4 w-4 text-zinc-500" />
            </NerveCardHeader>
            <NerveCardContent>
              <div className="text-2xl font-bold text-zinc-100">{favoriteCount}</div>
              <p className="text-xs text-zinc-500">Quick access items</p>
            </NerveCardContent>
          </NerveCard>
        </div>

        {/* Recently Used & Favorites */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recently Used */}
          <NerveCard elevation={1}>
            <NerveCardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-zinc-500" />
                <NerveCardTitle className="text-base">Recently Used</NerveCardTitle>
              </div>
              <NerveCardDescription>Quick access to your most recent copies</NerveCardDescription>
            </NerveCardHeader>
            <NerveCardContent>
              {recentlyUsed.length === 0 ? (
                <p className="text-sm text-zinc-500 py-4 text-center">
                  No items used yet. Copy some code to see it here.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentlyUsed.map((item) => (
                    <LibraryItemCard key={item.id} item={item} compact />
                  ))}
                </div>
              )}
            </NerveCardContent>
          </NerveCard>

          {/* Favorites */}
          <NerveCard elevation={1}>
            <NerveCardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-zinc-500" />
                <NerveCardTitle className="text-base">Favorites</NerveCardTitle>
              </div>
              <NerveCardDescription>Your starred items for quick access</NerveCardDescription>
            </NerveCardHeader>
            <NerveCardContent>
              {favorites.length === 0 ? (
                <p className="text-sm text-zinc-500 py-4 text-center">
                  No favorites yet. Star items to add them here.
                </p>
              ) : (
                <div className="space-y-2">
                  {favorites.map((item) => (
                    <LibraryItemCard key={item.id} item={item} compact />
                  ))}
                </div>
              )}
            </NerveCardContent>
          </NerveCard>
        </div>

        {/* All Tags */}
        {tags.length > 0 && (
          <NerveCard elevation={1}>
            <NerveCardHeader>
              <NerveCardTitle className="text-base">Tags</NerveCardTitle>
              <NerveCardDescription>Browse by category</NerveCardDescription>
            </NerveCardHeader>
            <NerveCardContent>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link key={tag.id} href={`/library?tag=${tag.name}`}>
                    <NerveBadge
                      variant="outline"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                    </NerveBadge>
                  </Link>
                ))}
              </div>
            </NerveCardContent>
          </NerveCard>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <NerveCard elevation={1}>
            <NerveCardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-zinc-800 p-4 mb-4">
                <Code2 className="h-8 w-8 text-zinc-500" />
              </div>
              <h3 className="font-semibold mb-2 text-zinc-100">Your library is empty</h3>
              <p className="text-zinc-400 text-sm mb-4 text-center max-w-sm">
                Start building your reusable code library. Add blocks, patterns, and queries to ship faster.
              </p>
              <AddLibraryItemDialog tags={tags} projects={projects} />
            </NerveCardContent>
          </NerveCard>
        )}
      </div>
    </>
  )
}
