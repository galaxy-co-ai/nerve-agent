"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Blocks, Puzzle, Database, Star, Copy, FolderKanban } from "lucide-react"
import { LibraryItemType } from "@prisma/client"
import { CopyCodeButton } from "@/components/shared/copy-code-button"
import { axEntityAttrs, type AXEntityType } from "@/lib/ax"

const typeIcons = {
  BLOCK: Blocks,
  PATTERN: Puzzle,
  QUERY: Database,
}

const typeColors = {
  BLOCK: "text-blue-500",
  PATTERN: "text-green-500",
  QUERY: "text-purple-500",
}

interface LibraryItem {
  id: string
  title: string
  description: string | null
  code: string
  language: string
  type: LibraryItemType
  isFavorite: boolean
  usageCount: number
  tags: { id: string; name: string; color: string }[]
  project: { id: string; name: string; slug: string } | null
  updatedAt?: Date
}

interface LibraryItemCardProps {
  item: LibraryItem
  compact?: boolean
}

export function LibraryItemCard({ item, compact = false }: LibraryItemCardProps) {
  const Icon = typeIcons[item.type]
  const relationships = item.project
    ? [{ type: "belongs-to", entity: "project", id: item.project.id, name: item.project.name }]
    : []

  if (compact) {
    return (
      <Link
        href={`/library/${item.id}`}
        className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
        {...axEntityAttrs("library-item" as AXEntityType, item.id, undefined, relationships)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={`h-4 w-4 flex-shrink-0 ${typeColors[item.type]}`} />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground font-mono">{item.language}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.isFavorite && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
          <CopyCodeButton code={item.code} itemId={item.id} size="sm" />
        </div>
      </Link>
    )
  }

  return (
    <Card className="group transition-colors hover:bg-muted/50" {...axEntityAttrs("library-item" as AXEntityType, item.id, undefined, relationships)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`rounded p-1.5 bg-muted`}>
              <Icon className={`h-4 w-4 ${typeColors[item.type]}`} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">
                <Link href={`/library/${item.id}`} className="hover:underline">
                  {item.title}
                </Link>
              </CardTitle>
              <CardDescription className="font-mono text-xs">{item.language}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {item.isFavorite && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
            <CopyCodeButton code={item.code} itemId={item.id} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        {/* Code Preview */}
        <pre className="text-xs text-muted-foreground bg-muted rounded p-2 overflow-hidden max-h-20 mb-3">
          <code className="font-mono">{item.code.slice(0, 150)}{item.code.length > 150 ? "..." : ""}</code>
        </pre>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs"
                style={{ borderColor: tag.color, color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {item.project && (
              <span className="flex items-center gap-1">
                <FolderKanban className="h-3 w-3" />
                {item.project.name}
              </span>
            )}
            {item.usageCount > 0 && (
              <span className="flex items-center gap-1">
                <Copy className="h-3 w-3" />
                {item.usageCount}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
