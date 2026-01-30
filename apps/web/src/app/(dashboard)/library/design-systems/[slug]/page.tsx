export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Palette, Type, Layers, Box, Sparkles, Settings2 } from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { CopyButton } from "@/components/features/copy-button"
import { DesignSystemActions } from "@/components/features/design-system-actions"
import { DesignSystemTabsWrapper } from "./tabs-wrapper"
import { CollapsibleHero } from "./collapsible-hero"
import { ColorShowcase } from "./color-showcase"

interface DesignSystemPageProps {
  params: Promise<{ slug: string }>
}

export default async function DesignSystemPage({ params }: DesignSystemPageProps) {
  const { slug } = await params
  const user = await requireUser()

  const system = await db.designSystem.findFirst({
    where: {
      slug,
      OR: [{ userId: user.id }, { isPublic: true }],
    },
  })

  if (!system) {
    notFound()
  }

  const isOwner = system.userId === user.id
  const palette = (system.palette as unknown as Record<string, PaletteCategory>) || {}
  const typography = (system.typography as unknown as TypographyConfig) || {}
  const components = (system.components as unknown as ComponentEntry[]) || []
  const primitives = (system.primitives as unknown as PrimitiveEntry[]) || []
  const backgrounds = (system.backgrounds as unknown as BackgroundEntry[]) || []

  // Determine which tabs have content
  const availableTabs: Array<"colors" | "typography" | "primitives" | "components" | "backgrounds" | "css"> = []
  if (Object.keys(palette).length > 0) availableTabs.push("colors")
  if (Object.keys(typography).length > 0) availableTabs.push("typography")
  if (primitives.length > 0) availableTabs.push("primitives")
  if (components.length > 0) availableTabs.push("components")
  if (backgrounds.length > 0) availableTabs.push("backgrounds")
  if (system.cssContent) availableTabs.push("css")

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
              <BreadcrumbLink href="/library/design-systems">Design Systems</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{system.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {isOwner && (
          <div className="ml-auto">
            <DesignSystemActions system={system} />
          </div>
        )}
      </header>

      <div className="flex flex-1 flex-col min-h-0 overflow-y-auto" data-scroll-container>
        {/* Collapsible Hero */}
        <CollapsibleHero
          name={system.name}
          version={system.version}
          philosophy={system.philosophy}
          description={system.description}
          coverColor={system.coverColor}
          coverImage={system.coverImage}
          stats={{
            components: components.length,
            primitives: primitives.length,
            backgrounds: backgrounds.length,
            usageCount: system.usageCount,
          }}
        />

        {/* Tabbed Content */}
        {availableTabs.length > 0 ? (
          <DesignSystemTabsWrapper availableTabs={availableTabs} defaultTab={availableTabs[0]}>
            {/* Colors Tab */}
            {Object.keys(palette).length > 0 && (
              <div data-tab="colors" className="p-6 pt-4">
                <ColorShowcase palette={palette} />
              </div>
            )}

            {/* Typography Tab */}
            {Object.keys(typography).length > 0 && (
              <div data-tab="typography" className="p-6 pt-4">
                <Card className="border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Type className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>Typography</CardTitle>
                    </div>
                    <CardDescription>Type scale and font settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {typography.scale &&
                        Object.entries(typography.scale).map(([name, config]) => (
                          <div
                            key={name}
                            className="flex items-center gap-4 py-4 border-b border-border/50 last:border-0"
                          >
                            <code className="text-xs bg-muted px-2.5 py-1 rounded font-mono w-24 text-center shrink-0">
                              {name}
                            </code>
                            <span
                              className="flex-1 truncate"
                              style={{ fontSize: config.size, fontWeight: config.weight || 400 }}
                            >
                              The quick brown fox jumps over the lazy dog
                            </span>
                            <span className="text-muted-foreground text-sm shrink-0 tabular-nums">{config.size}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Primitives Tab */}
            {primitives.length > 0 && (
              <div data-tab="primitives" className="p-6 pt-4">
                <Card className="border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>Primitives</CardTitle>
                    </div>
                    <CardDescription>Low-level building blocks: surfaces, glows, and wells</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {primitives.map((primitive, idx) => (
                        <div key={idx} className="border border-border/50 rounded-lg p-4 bg-card/50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{primitive.name}</h4>
                            <CopyButton text={primitive.code} />
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{primitive.description}</p>
                          <pre className="text-xs bg-muted/50 p-3 rounded-md overflow-x-auto border border-border/30">
                            <code className="text-muted-foreground">{primitive.code}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Components Tab */}
            {components.length > 0 && (
              <div data-tab="components" className="p-6 pt-4">
                <Card className="border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Box className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>Components</CardTitle>
                    </div>
                    <CardDescription>Ready-to-use UI components</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {groupByCategory(components).map(([category, items]) => (
                        <div key={category}>
                          <h4 className="font-medium mb-4 capitalize text-sm text-muted-foreground tracking-wide">
                            {category}
                          </h4>
                          <div className="grid gap-4 lg:grid-cols-2">
                            {items.map((component, idx) => (
                              <div key={idx} className="border border-border/50 rounded-lg p-4 bg-card/50">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium">{component.name}</h5>
                                  <CopyButton text={component.code} />
                                </div>
                                {component.props && (
                                  <p className="text-xs text-muted-foreground mb-2 font-mono">Props: {component.props}</p>
                                )}
                                {component.usage && (
                                  <p className="text-sm text-muted-foreground mb-3">{component.usage}</p>
                                )}
                                <pre className="text-xs bg-muted/50 p-3 rounded-md overflow-x-auto max-h-48 border border-border/30">
                                  <code className="text-muted-foreground">{truncateCode(component.code, 500)}</code>
                                </pre>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Backgrounds Tab */}
            {backgrounds.length > 0 && (
              <div data-tab="backgrounds" className="p-6 pt-4">
                <Card className="border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>Background Treatments</CardTitle>
                    </div>
                    <CardDescription>Visual textures and ambient effects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {backgrounds.map((bg, idx) => (
                        <div key={idx} className="border border-border/50 rounded-lg p-4 bg-card/50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{bg.name}</h4>
                            <CopyButton text={bg.code} />
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{bg.description}</p>
                          <pre className="text-xs bg-muted/50 p-3 rounded-md overflow-x-auto border border-border/30">
                            <code className="text-muted-foreground">{bg.code}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* CSS Variables Tab */}
            {system.cssContent && (
              <div data-tab="css" className="p-6 pt-4">
                <Card className="border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>CSS Variables & Utilities</CardTitle>
                      </div>
                      <CopyButton text={system.cssContent} label="Copy All CSS" />
                    </div>
                    <CardDescription>Full CSS content ready to paste into globals.css</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted/50 p-4 rounded-md overflow-x-auto max-h-[600px] border border-border/30">
                      <code className="text-muted-foreground">{system.cssContent}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}
          </DesignSystemTabsWrapper>
        ) : (
          /* Empty state for new systems */
          <div className="p-6">
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Palette className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Design system is empty</h3>
                <p className="text-muted-foreground text-sm mb-4 text-center max-w-sm">
                  Start adding colors, components, and utilities to build out your design system.
                </p>
                {isOwner && (
                  <Button variant="outline">
                    <Settings2 className="mr-2 h-4 w-4" />
                    Edit Design System
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}

// Types
interface PaletteCategory {
  [colorName: string]: string
}

interface TypographyConfig {
  scale?: Record<string, { size: string; weight?: number }>
}

interface ComponentEntry {
  id?: string
  name: string
  category: string
  code: string
  props?: string
  usage?: string
}

interface PrimitiveEntry {
  name: string
  description: string
  code: string
}

interface BackgroundEntry {
  name: string
  description: string
  code: string
}

// Color swatch component
function ColorSwatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="group relative">
      <div
        className="h-14 rounded-lg shadow-inner border border-border/50 transition-transform hover:scale-105"
        style={{ backgroundColor: value }}
      />
      <div className="mt-2">
        <p className="text-xs font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground font-mono">{value}</p>
      </div>
      <CopyButton
        text={value}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
        iconOnly
      />
    </div>
  )
}

// Helper functions
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}

function groupByCategory(components: ComponentEntry[]): [string, ComponentEntry[]][] {
  const grouped = components.reduce(
    (acc, component) => {
      const cat = component.category || "uncategorized"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(component)
      return acc
    },
    {} as Record<string, ComponentEntry[]>
  )
  return Object.entries(grouped)
}

function truncateCode(code: string, maxLength: number): string {
  if (code.length <= maxLength) return code
  return code.slice(0, maxLength) + "\n// ... (truncated)"
}
