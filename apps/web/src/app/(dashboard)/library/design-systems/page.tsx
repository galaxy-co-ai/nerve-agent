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
import { H2, Muted } from "@/components/ui/typography"
import { Palette, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { AddDesignSystemDialog } from "@/components/dialogs/add-design-system-dialog"

export default async function DesignSystemsPage() {
  const user = await requireUser()

  const designSystems = await db.designSystem.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  })

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
              <BreadcrumbPage>Design Systems</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <AddDesignSystemDialog />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <H2>Design Systems</H2>
          <Muted>Your curated collection of visual languages. Ship with consistent, beautiful UI.</Muted>
        </div>

        {designSystems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Palette className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No design systems yet</h3>
              <p className="text-muted-foreground text-sm mb-4 text-center max-w-sm">
                Create your first design system to store colors, typography, components, and utilities in one place.
              </p>
              <div className="flex gap-3">
                <Link href="/library/design-systems/seed-nerve">
                  <Button variant="default" size="sm">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start with NERVE
                  </Button>
                </Link>
                <AddDesignSystemDialog />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {designSystems.map((system) => (
              <Link
                key={system.id}
                href={`/library/design-systems/${system.slug}`}
                className="group"
              >
                <Card className="overflow-hidden transition-all hover:ring-2 hover:ring-primary/50 hover:-translate-y-1">
                  {/* Album Cover */}
                  <div
                    className="aspect-square relative"
                    style={{
                      backgroundColor: system.coverColor || "#eab308",
                      backgroundImage: system.coverImage
                        ? `url(${system.coverImage})`
                        : `linear-gradient(135deg, ${system.coverColor || "#eab308"} 0%, ${adjustColor(system.coverColor || "#eab308", -30)} 100%)`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 dark:bg-black/90 rounded-full p-3">
                          <Palette className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                    {/* Version badge */}
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                      v{system.version}
                    </div>
                  </div>

                  {/* Info */}
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{system.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {system.philosophy}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <span>{getComponentCount(system.components)} components</span>
                      {system.usageCount > 0 && (
                        <>
                          <span>•</span>
                          <span>Used {system.usageCount}x</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* Add New Card */}
            <AddDesignSystemDialog asCard />
          </div>
        )}
      </div>
    </>
  )
}

// Helper to darken/lighten a hex color
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}

// Get component count from JSON
function getComponentCount(components: unknown): number {
  if (Array.isArray(components)) {
    return components.length
  }
  return 0
}
