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
  NerveButton,
  NerveBadge,
  NerveSeparator,
} from "@/components/nerve"
import { H2 } from "@/components/ui/typography"
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
import { axEntityAttrs, computeStaleness } from "@/lib/ax"

interface CallsPageProps {
  searchParams: Promise<{ project?: string; q?: string }>
}

function getSentimentIcon(sentiment: CallSentiment | null) {
  switch (sentiment) {
    case "POSITIVE":
      return <TrendingUp className="h-4 w-4 text-[var(--nerve-success)]" />
    case "CONCERNED":
      return <TrendingDown className="h-4 w-4 text-[var(--nerve-warning)]" />
    default:
      return <Minus className="h-4 w-4 text-zinc-500" />
  }
}

function getSentimentVariant(sentiment: CallSentiment | null): "success" | "warning" | "default" {
  switch (sentiment) {
    case "POSITIVE":
      return "success"
    case "CONCERNED":
      return "warning"
    default:
      return "default"
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
        <NerveSeparator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Calls</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <NerveButton asChild>
            <Link href="/calls/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Call
            </Link>
          </NerveButton>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <H2>Call Intelligence</H2>
            <p className="text-zinc-400">Transform call transcripts into actionable briefs</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <NerveCard elevation={1}>
            <NerveCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <NerveCardTitle className="text-sm font-medium">Total Calls</NerveCardTitle>
              <Phone className="h-4 w-4 text-zinc-500" />
            </NerveCardHeader>
            <NerveCardContent>
              <div className="text-2xl font-bold text-zinc-100">{totalCalls}</div>
            </NerveCardContent>
          </NerveCard>
          <NerveCard elevation={1}>
            <NerveCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <NerveCardTitle className="text-sm font-medium">Shared Briefs</NerveCardTitle>
              <Share2 className="h-4 w-4 text-zinc-500" />
            </NerveCardHeader>
            <NerveCardContent>
              <div className="text-2xl font-bold text-zinc-100">{sharedBriefs}</div>
            </NerveCardContent>
          </NerveCard>
          <NerveCard elevation={1}>
            <NerveCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <NerveCardTitle className="text-sm font-medium">Positive Sentiment</NerveCardTitle>
              <TrendingUp className="h-4 w-4 text-zinc-500" />
            </NerveCardHeader>
            <NerveCardContent>
              <div className="text-2xl font-bold text-zinc-100">
                {totalCalls > 0 ? Math.round((positiveCalls / totalCalls) * 100) : 0}%
              </div>
            </NerveCardContent>
          </NerveCard>
        </div>

        {/* Search */}
        <CallSearch projectId={params.project} />

        {/* Project Filter */}
        {projects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link href="/calls">
              <NerveBadge
                variant={!params.project ? "primary" : "outline"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                All
              </NerveBadge>
            </Link>
            {projects.map((project) => (
              <Link key={project.id} href={`/calls?project=${project.id}`}>
                <NerveBadge
                  variant={params.project === project.id ? "primary" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {project.name}
                </NerveBadge>
              </Link>
            ))}
          </div>
        )}

        {filteredCalls.length === 0 ? (
          <NerveCard elevation={1}>
            <NerveCardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-zinc-800 p-4 mb-4">
                <Phone className="h-8 w-8 text-zinc-500" />
              </div>
              <h3 className="font-semibold mb-2 text-zinc-100">
                {params.q ? "No calls found" : "No calls yet"}
              </h3>
              <p className="text-zinc-400 text-sm mb-4 text-center max-w-sm">
                {params.q
                  ? "Try a different search term or add a new call."
                  : "Add your first call transcript to extract insights, action items, and generate shareable briefs."}
              </p>
              {!params.q && (
                <NerveButton asChild>
                  <Link href="/calls/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Call
                  </Link>
                </NerveButton>
              )}
            </NerveCardContent>
          </NerveCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCalls.map((call) => {
              const actionItems = call.actionItems as Array<{ text: string }>
              const decisions = call.decisions as Array<{ text: string }>
              const staleness = computeStaleness(call.createdAt, {
                hasPendingBrief: !call.summary,
              })
              const relationships = [
                { type: "belongs-to", entity: "project", id: call.project.id, name: call.project.name },
              ]

              return (
                <Link key={call.id} href={`/calls/${call.id}`} {...axEntityAttrs("call", call.id, staleness, relationships)}>
                  <NerveCard variant="interactive" elevation={1} className="h-full">
                    <NerveCardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <NerveCardTitle className="text-base line-clamp-1">
                          {call.title}
                        </NerveCardTitle>
                        <div className="flex items-center gap-2">
                          {call.briefShared && (
                            <Share2 className="h-4 w-4 text-zinc-500" />
                          )}
                          <NerveBadge variant={getSentimentVariant(call.sentiment)} size="sm" dot>
                            {call.sentiment?.toLowerCase() || "neutral"}
                          </NerveBadge>
                        </div>
                      </div>
                      <NerveCardDescription className="flex items-center gap-1">
                        <FolderKanban className="h-3 w-3" />
                        {call.project.name}
                      </NerveCardDescription>
                    </NerveCardHeader>
                    <NerveCardContent>
                      {call.summary ? (
                        <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
                          {call.summary}
                        </p>
                      ) : (
                        <p className="text-sm text-zinc-500 italic mb-3">
                          Processing...
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-zinc-500 mb-2">
                        <span>{actionItems.length} action items</span>
                        <span>{decisions.length} decisions</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>{format(call.callDate, "MMM d, yyyy")}</span>
                        <span>
                          Added {formatDistanceToNow(call.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                    </NerveCardContent>
                  </NerveCard>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
