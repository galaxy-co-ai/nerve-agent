export const dynamic = "force-dynamic"

import Link from "next/link"
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
import { Badge } from "@/components/ui/badge"
import {
  FolderKanban,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  ListTodo,
  FileText,
  Clock,
} from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { format } from "date-fns"
import { CallSentiment } from "@prisma/client"
import { CallActions } from "@/components/features/call-actions"

interface CallPageProps {
  params: Promise<{ id: string }>
}

function getSentimentDisplay(sentiment: CallSentiment | null) {
  switch (sentiment) {
    case "POSITIVE":
      return {
        icon: <TrendingUp className="h-4 w-4" />,
        label: "Positive",
        className: "bg-green-500/20 text-green-500",
      }
    case "CONCERNED":
      return {
        icon: <TrendingDown className="h-4 w-4" />,
        label: "Concerned",
        className: "bg-orange-500/20 text-orange-500",
      }
    default:
      return {
        icon: <Minus className="h-4 w-4" />,
        label: "Neutral",
        className: "bg-muted text-muted-foreground",
      }
  }
}

export default async function CallPage({ params }: CallPageProps) {
  const { id } = await params
  const user = await requireUser()

  const call = await db.call.findUnique({
    where: { id },
    include: {
      project: { select: { name: true, slug: true, clientName: true } },
      followUps: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!call || call.userId !== user.id) {
    notFound()
  }

  const suggestedFollowUps = call.followUps.filter((f) => f.status === "SUGGESTED")
  const activeFollowUps = call.followUps.filter((f) =>
    f.status === "SCHEDULED" || f.status === "PENDING"
  )

  const actionItems = call.actionItems as Array<{
    text: string
    assignedTo: string
    dueDate?: string
  }>
  const decisions = call.decisions as Array<{ text: string; decidedBy: string }>
  const sentiment = getSentimentDisplay(call.sentiment)

  const myActions = actionItems.filter((a) => a.assignedTo === "me")
  const clientActions = actionItems.filter((a) => a.assignedTo === "client")

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/calls">Calls</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] truncate">
                {call.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <CallActions
            callId={call.id}
            briefShared={call.briefShared}
            briefToken={call.briefToken}
          />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{call.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <Link
                href={`/projects/${call.project.slug}`}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <FolderKanban className="h-4 w-4" />
                {call.project.name}
              </Link>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(call.callDate, "MMMM d, yyyy")}
              </span>
              {call.participants && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {call.participants}
                </span>
              )}
            </div>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${sentiment.className}`}>
            {sentiment.icon}
            <span className="text-sm font-medium">{sentiment.label}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {call.summary ? (
                  <p className="text-muted-foreground leading-relaxed">{call.summary}</p>
                ) : (
                  <p className="text-muted-foreground italic">No summary available</p>
                )}
              </CardContent>
            </Card>

            {/* Decisions */}
            {decisions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Decisions
                  </CardTitle>
                  <CardDescription>
                    {decisions.length} decision{decisions.length !== 1 ? "s" : ""} made
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {decisions.map((decision, i) => (
                      <div key={i} className="rounded-lg border p-4">
                        <p className="font-medium">{decision.text}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Decided by: {decision.decidedBy}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transcript */}
            <Card>
              <CardHeader>
                <CardTitle>Transcript</CardTitle>
                <CardDescription>
                  {call.transcript.split(/\s+/).filter(Boolean).length} words
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted/50 p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {call.transcript}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5" />
                  Action Items
                </CardTitle>
                <CardDescription>
                  {actionItems.length} item{actionItems.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {actionItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No action items</p>
                ) : (
                  <div className="space-y-4">
                    {/* My Actions */}
                    {myActions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-0">
                            You
                          </Badge>
                          <span className="text-muted-foreground">({myActions.length})</span>
                        </h4>
                        <div className="space-y-2">
                          {myActions.map((item, i) => (
                            <div key={i} className="text-sm rounded border p-2">
                              <p>{item.text}</p>
                              {item.dueDate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Due: {item.dueDate}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Client Actions */}
                    {clientActions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-purple-500/20 text-purple-500 border-0"
                          >
                            {call.project.clientName}
                          </Badge>
                          <span className="text-muted-foreground">({clientActions.length})</span>
                        </h4>
                        <div className="space-y-2">
                          {clientActions.map((item, i) => (
                            <div key={i} className="text-sm rounded border p-2">
                              <p>{item.text}</p>
                              {item.dueDate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Due: {item.dueDate}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Follow-ups */}
            {(suggestedFollowUps.length > 0 || activeFollowUps.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Follow-ups
                  </CardTitle>
                  <CardDescription>
                    {call.followUps.length} follow-up{call.followUps.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Suggested Follow-ups */}
                  {suggestedFollowUps.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 border-0">
                          Suggested
                        </Badge>
                        <span className="text-muted-foreground">({suggestedFollowUps.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {suggestedFollowUps.map((followUp) => (
                          <div key={followUp.id} className="text-sm rounded border p-2">
                            <p className="font-medium">{followUp.title}</p>
                            {followUp.sourceQuote && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                &ldquo;{followUp.sourceQuote}&rdquo;
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      <Link
                        href="/dashboard/follow-ups"
                        className="text-xs text-primary hover:underline mt-2 inline-block"
                      >
                        Manage in Follow-ups
                      </Link>
                    </div>
                  )}

                  {/* Active Follow-ups */}
                  {activeFollowUps.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-0">
                          Active
                        </Badge>
                        <span className="text-muted-foreground">({activeFollowUps.length})</span>
                      </h4>
                      <div className="space-y-2">
                        {activeFollowUps.map((followUp) => (
                          <div key={followUp.id} className="text-sm rounded border p-2">
                            <p className="font-medium">{followUp.title}</p>
                            {followUp.dueDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Due: {format(followUp.dueDate, "MMM d, yyyy")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Decisions</span>
                    <span className="font-medium">{decisions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Actions</span>
                    <span className="font-medium">{myActions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client Actions</span>
                    <span className="font-medium">{clientActions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Follow-ups</span>
                    <span className="font-medium">{call.followUps.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brief Shared</span>
                    <span className="font-medium">
                      {call.briefShared ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
