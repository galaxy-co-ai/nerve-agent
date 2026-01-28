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
import { Blocks, Puzzle, Database, FolderKanban, Clock, Copy } from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { LibraryItemActions } from "@/components/library-item-actions"
import { CopyCodeButton } from "@/components/copy-code-button"
import { formatDistanceToNow } from "date-fns"

const typeIcons = {
  BLOCK: Blocks,
  PATTERN: Puzzle,
  QUERY: Database,
}

const typeLabels = {
  BLOCK: "Block",
  PATTERN: "Pattern",
  QUERY: "Query",
}

const typePaths = {
  BLOCK: "blocks",
  PATTERN: "patterns",
  QUERY: "queries",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LibraryItemPage({ params }: PageProps) {
  const { id } = await params
  const user = await requireUser()

  const item = await db.libraryItem.findFirst({
    where: { id, userId: user.id },
    include: {
      tags: true,
      project: { select: { id: true, name: true, slug: true } },
    },
  })

  if (!item) {
    notFound()
  }

  const Icon = typeIcons[item.type]

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
              <BreadcrumbLink href={`/library/${typePaths[item.type]}`}>
                {typeLabels[item.type]}s
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{item.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <LibraryItemActions item={item} />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{item.title}</h1>
                <p className="text-muted-foreground">{typeLabels[item.type]}</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="font-mono">
            {item.language}
          </Badge>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-muted-foreground">{item.description}</p>
        )}

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {item.project && (
            <Link
              href={`/projects/${item.project.slug}`}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <FolderKanban className="h-4 w-4" />
              {item.project.name}
            </Link>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Updated {formatDistanceToNow(item.updatedAt, { addSuffix: true })}
          </div>
          {item.usageCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Copy className="h-4 w-4" />
              Copied {item.usageCount} time{item.usageCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                style={{ borderColor: tag.color, color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Code Block */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Code</CardTitle>
            <CopyCodeButton code={item.code} itemId={item.id} />
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
              <code className="font-mono">{item.code}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
