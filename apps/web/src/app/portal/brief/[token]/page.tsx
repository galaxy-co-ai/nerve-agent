export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  ListTodo,
} from "lucide-react"
import { db } from "@/lib/db"
import { format } from "date-fns"
import { CallSentiment } from "@prisma/client"

interface BriefPageProps {
  params: Promise<{ token: string }>
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
        label: "Needs Attention",
        className: "bg-orange-500/20 text-orange-500",
      }
    default:
      return {
        icon: <Minus className="h-4 w-4" />,
        label: "On Track",
        className: "bg-blue-500/20 text-blue-500",
      }
  }
}

export default async function PublicBriefPage({ params }: BriefPageProps) {
  const { token } = await params

  const call = await db.call.findUnique({
    where: { briefToken: token },
    include: {
      project: {
        select: { name: true, clientName: true },
      },
    },
  })

  if (!call || !call.briefShared) {
    notFound()
  }

  const actionItems = call.actionItems as Array<{
    text: string
    assignedTo: string
    dueDate?: string
  }>
  const decisions = call.decisions as Array<{ text: string; decidedBy: string }>
  const sentiment = getSentimentDisplay(call.sentiment)

  // For client view, show only their action items
  const clientActions = actionItems.filter((a) => a.assignedTo === "client")
  const devActions = actionItems.filter((a) => a.assignedTo === "me")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>{call.project.name}</span>
            <span>•</span>
            <span>Call Brief</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">{call.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(call.callDate, "MMMM d, yyyy")}
            </span>
            {call.participants && (
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {call.participants}
              </span>
            )}
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${sentiment.className}`}>
              {sentiment.icon}
              <span className="text-sm font-medium">{sentiment.label}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Summary */}
        {call.summary && (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{call.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Decisions */}
        {decisions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Decisions Made
              </CardTitle>
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

        {/* Action Items */}
        {actionItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                Action Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Client Actions */}
                {clientActions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Badge className="bg-purple-500/20 text-purple-500 border-0">
                        Your Items
                      </Badge>
                    </h4>
                    <div className="space-y-3">
                      {clientActions.map((item, i) => (
                        <div key={i} className="rounded-lg border p-3">
                          <p className="text-sm">{item.text}</p>
                          {item.dueDate && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Due: {item.dueDate}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Developer Actions */}
                {devActions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Badge className="bg-blue-500/20 text-blue-500 border-0">
                        Developer Items
                      </Badge>
                    </h4>
                    <div className="space-y-3">
                      {devActions.map((item, i) => (
                        <div key={i} className="rounded-lg border p-3">
                          <p className="text-sm">{item.text}</p>
                          {item.dueDate && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Due: {item.dueDate}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>
            This brief was generated by{" "}
            <span className="font-medium">NERVE AGENT</span>
          </p>
        </div>
      </main>
    </div>
  )
}
