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
import { Button } from "@/components/ui/button"
import {
  Phone,
  Plus,
  FolderKanban,
  TrendingUp,
  TrendingDown,
  Minus,
  Share2,
} from "lucide-react"
import { CallSearch } from "@/components/features/call-search"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { formatDistanceToNow, format } from "date-fns"
import { CallSentiment } from "@prisma/client"

interface CallsPageProps {
  searchParams: Promise<{ project?: string; q?: string }>
}

function getSentimentIcon(sentiment: CallSentiment | null) {
  switch (sentiment) {
    case "POSITIVE":
      return <TrendingUp className="h-4 w-4 text-green-500" />
    case "CONCERNED":
      return <TrendingDown className="h-4 w-4 text-orange-500" />
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />
  }
}

function getSentimentLabel(sentiment: CallSentiment | null) {
  switch (sentiment) {
    case "POSITIVE":
      return "Positive"
    case "CONCERNED":
      return "Concerned"
    default:
      return "Neutral"
  }
}

export default async function CallsPage({ searchParams }: CallsPageProps) {
  const params = await searchParams
  const user = await requireUser()

  const [calls, projects] = await Promise.all([
    db.call.findMany({
      where: {
        userId: user.id,
        ...(params.project ? { projectId: params.project } : {}),
      },
      orderBy: { callDate: "desc" },
      include: {
        project: { select: { id: true, name: true, slug: true } },
      },
    }),
    db.project.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ])

  // Filter by search query
  const filteredCalls = params.q
    ? calls.filter(
        (call) =>
          call.title.toLowerCase().includes(params.q!.toLowerCase()) ||
          call.summary?.toLowerCase().includes(params.q!.toLowerCase()) ||
          call.project.name.toLowerCase().includes(params.q!.toLowerCase())
      )
    : calls

  // Stats
  const totalCalls = calls.length
  const sharedBriefs = calls.filter((c) => c.briefShared).length
  const positiveCalls = calls.filter((c) => c.sentiment === "POSITIVE").length

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Calls</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Link href="/calls/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Call
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <H2>Call Intelligence</H2>
            <Muted>Transform call transcripts into actionable briefs</Muted>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCalls}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shared Briefs</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sharedBriefs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalCalls > 0 ? Math.round((positiveCalls / totalCalls) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <CallSearch projectId={params.project} />

        {/* Project Filter */}
        {projects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link href="/calls">
              <Badge
                variant={!params.project ? "default" : "outline"}
                className="cursor-pointer"
              >
                All
              </Badge>
            </Link>
            {projects.map((project) => (
              <Link key={project.id} href={`/calls?project=${project.id}`}>
                <Badge
                  variant={params.project === project.id ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {project.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {filteredCalls.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Phone className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">
                {params.q ? "No calls found" : "No calls yet"}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 text-center max-w-sm">
                {params.q
                  ? "Try a different search term or add a new call."
                  : "Add your first call transcript to extract insights, action items, and generate shareable briefs."}
              </p>
              {!params.q && (
                <Link href="/calls/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Call
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCalls.map((call) => {
              const actionItems = call.actionItems as Array<{ text: string }>
              const decisions = call.decisions as Array<{ text: string }>

              return (
                <Link key={call.id} href={`/calls/${call.id}`}>
                  <Card className="h-full transition-colors hover:bg-muted/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-1">
                          {call.title}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          {call.briefShared && (
                            <Share2 className="h-4 w-4 text-muted-foreground" />
                          )}
                          {getSentimentIcon(call.sentiment)}
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <FolderKanban className="h-3 w-3" />
                        {call.project.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {call.summary ? (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {call.summary}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic mb-3">
                          Processing...
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <span>{actionItems.length} action items</span>
                        <span>{decisions.length} decisions</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{format(call.callDate, "MMM d, yyyy")}</span>
                        <span>
                          Added {formatDistanceToNow(call.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
