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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  Users,
  Clock,
  MessageSquare,
} from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { BlockerActions } from "@/components/blocker-actions"

function formatAge(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "1 day ago"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return "1 week ago"
  return `${Math.floor(diffDays / 7)} weeks ago`
}

export default async function BlockersPage() {
  const user = await requireUser()

  const blockers = await db.blocker.findMany({
    where: {
      status: "ACTIVE",
      project: { userId: user.id },
    },
    include: {
      project: {
        select: { name: true, slug: true },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  const clientBlockers = blockers.filter((b) => b.waitingOn === "client")
  const selfBlockers = blockers.filter((b) => b.waitingOn === "self")
  const thirdPartyBlockers = blockers.filter((b) => b.waitingOn === "third-party")

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Daily Driver</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Blockers</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Active Blockers</h1>
          <p className="text-muted-foreground">
            Everything that's blocking progress across your projects
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Blockers</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{blockers.length}</div>
              <p className="text-xs text-muted-foreground">
                {blockers.length === 0 ? "All clear!" : "Need attention"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waiting on Client</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientBlockers.length}</div>
              <p className="text-xs text-muted-foreground">
                {clientBlockers.length === 0 ? "None pending" : "Follow up needed"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Self-Blocked</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selfBlockers.length}</div>
              <p className="text-xs text-muted-foreground">
                {selfBlockers.length === 0 ? "None" : "Action required"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Third Party</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thirdPartyBlockers.length}</div>
              <p className="text-xs text-muted-foreground">
                {thirdPartyBlockers.length === 0 ? "None" : "External dependencies"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Blocker Lists */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Client Blockers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Waiting on Client
              </CardTitle>
              <CardDescription>Items requiring client input or approval</CardDescription>
            </CardHeader>
            <CardContent>
              {clientBlockers.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 p-8 text-center">
                  <p className="text-sm text-muted-foreground">No client blockers</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientBlockers.map((blocker) => (
                    <div key={blocker.id} className="flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{blocker.title}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Link href={`/projects/${blocker.project.slug}`} className="hover:underline">
                            {blocker.project.name}
                          </Link>
                          <span>·</span>
                          <span>{formatAge(blocker.createdAt)}</span>
                          {blocker.followUpCount > 0 && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {blocker.followUpCount} follow-ups
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-yellow-500/20 text-yellow-500">
                          {blocker.type.toLowerCase()}
                        </Badge>
                        <BlockerActions blockerId={blocker.id} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Self & Third Party */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Other Blockers
              </CardTitle>
              <CardDescription>Self-blocked and third-party dependencies</CardDescription>
            </CardHeader>
            <CardContent>
              {selfBlockers.length === 0 && thirdPartyBlockers.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 p-8 text-center">
                  <p className="text-sm text-muted-foreground">No other blockers</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...selfBlockers, ...thirdPartyBlockers].map((blocker) => (
                    <div key={blocker.id} className="flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{blocker.title}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Link href={`/projects/${blocker.project.slug}`} className="hover:underline">
                            {blocker.project.name}
                          </Link>
                          <span>·</span>
                          <span>{formatAge(blocker.createdAt)}</span>
                          {blocker.followUpCount > 0 && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {blocker.followUpCount} follow-ups
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-yellow-500/20 text-yellow-500">
                          {blocker.type.toLowerCase()}
                        </Badge>
                        <BlockerActions blockerId={blocker.id} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
