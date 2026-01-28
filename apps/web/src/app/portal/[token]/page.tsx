export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { recordPortalAccess } from "@/lib/actions/portal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Calendar,
  Layers,
  Target,
} from "lucide-react"
import { PortalFeedbackForm } from "@/components/forms/portal-feedback-form"
import { formatDistanceToNow, format } from "date-fns"

const statusColors: Record<string, string> = {
  PLANNING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ACTIVE: "bg-green-500/10 text-green-500 border-green-500/20",
  ON_HOLD: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
}

const phaseLabels: Record<string, string> = {
  PLAN: "Planning",
  SPRINT: "In Development",
  SHIP: "Shipping",
  SUPPORT: "Support",
}

const sprintStatusColors: Record<string, string> = {
  NOT_STARTED: "text-muted-foreground",
  IN_PROGRESS: "text-blue-500",
  BLOCKED: "text-yellow-500",
  COMPLETED: "text-green-500",
}

const taskStatusIcons: Record<string, typeof Circle> = {
  TODO: Circle,
  IN_PROGRESS: Clock,
  BLOCKED: AlertTriangle,
  COMPLETED: CheckCircle2,
}

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function ClientPortalPage({ params }: PageProps) {
  const { token } = await params

  // Find the project by portal token
  const project = await db.project.findFirst({
    where: {
      portalToken: token,
      portalEnabled: true,
    },
    include: {
      sprints: {
        orderBy: { number: "asc" },
        include: {
          tasks: {
            orderBy: { order: "asc" },
          },
        },
      },
      blockers: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!project) {
    notFound()
  }

  // Record access (fire and forget)
  recordPortalAccess(token)

  // Calculate stats
  const totalTasks = project.sprints.reduce((sum, s) => sum + s.tasks.length, 0)
  const completedTasks = project.sprints.reduce(
    (sum, s) => sum + s.tasks.filter((t) => t.status === "COMPLETED").length,
    0
  )
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const activeSprint = project.sprints.find((s) => s.status === "IN_PROGRESS")
  const completedSprints = project.sprints.filter((s) => s.status === "COMPLETED").length

  const clientBlockers = project.blockers.filter((b) => b.waitingOn === "client")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Project Status</p>
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <p className="text-muted-foreground mt-1">{project.clientName}</p>
            </div>
            <Badge variant="outline" className={statusColors[project.status]}>
              {phaseLabels[project.phase]}
            </Badge>
          </div>

          {project.description && (
            <p className="text-muted-foreground mt-4 max-w-2xl">{project.description}</p>
          )}
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {completedTasks} of {totalTasks} tasks completed
                </span>
                <span className="font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{project.sprints.length}</div>
                  <div className="text-sm text-muted-foreground">Total Sprints</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{completedSprints}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {activeSprint ? `Sprint ${activeSprint.number}` : "-"}
                  </div>
                  <div className="text-sm text-muted-foreground">Current</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Waiting on Client */}
        {clientBlockers.length > 0 && (
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-500">
                <AlertTriangle className="h-5 w-5" />
                Waiting on You
              </CardTitle>
              <CardDescription>
                These items need your input to move forward
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clientBlockers.map((blocker) => (
                  <div
                    key={blocker.id}
                    className="p-3 rounded-lg border border-yellow-500/20 bg-background"
                  >
                    <p className="font-medium">{blocker.title}</p>
                    {blocker.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {blocker.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Waiting since {formatDistanceToNow(blocker.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline/Key Dates */}
        {(project.startDate || project.targetEndDate) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8">
                {project.startDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Started</p>
                    <p className="font-medium">{format(project.startDate, "MMM d, yyyy")}</p>
                  </div>
                )}
                {project.targetEndDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Target Completion</p>
                    <p className="font-medium">{format(project.targetEndDate, "MMM d, yyyy")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sprints */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Sprint Progress
          </h2>

          {project.sprints.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No sprints scheduled yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {project.sprints.map((sprint) => {
                const sprintTasks = sprint.tasks.length
                const sprintCompleted = sprint.tasks.filter(
                  (t) => t.status === "COMPLETED"
                ).length
                const sprintProgress =
                  sprintTasks > 0 ? Math.round((sprintCompleted / sprintTasks) * 100) : 0

                return (
                  <Card key={sprint.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            Sprint {sprint.number}: {sprint.name}
                          </CardTitle>
                          {sprint.description && (
                            <CardDescription className="mt-1">
                              {sprint.description}
                            </CardDescription>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={sprintStatusColors[sprint.status]}
                        >
                          {sprint.status === "NOT_STARTED"
                            ? "Not Started"
                            : sprint.status === "IN_PROGRESS"
                            ? "In Progress"
                            : sprint.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Sprint Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {sprintCompleted}/{sprintTasks} tasks
                            </span>
                            <span>{sprintProgress}%</span>
                          </div>
                          <Progress value={sprintProgress} className="h-2" />
                        </div>

                        {/* Task List */}
                        {sprint.tasks.length > 0 && (
                          <div className="space-y-2 pt-2">
                            {sprint.tasks.map((task) => {
                              const Icon = taskStatusIcons[task.status]
                              const isCompleted = task.status === "COMPLETED"
                              const isBlocked = task.status === "BLOCKED"

                              return (
                                <div
                                  key={task.id}
                                  className={`flex items-center gap-3 p-2 rounded-lg ${
                                    isCompleted
                                      ? "bg-green-500/5"
                                      : isBlocked
                                      ? "bg-yellow-500/5"
                                      : "bg-muted/30"
                                  }`}
                                >
                                  <Icon
                                    className={`h-4 w-4 flex-shrink-0 ${
                                      isCompleted
                                        ? "text-green-500"
                                        : isBlocked
                                        ? "text-yellow-500"
                                        : task.status === "IN_PROGRESS"
                                        ? "text-blue-500"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                  <span
                                    className={`text-sm ${
                                      isCompleted
                                        ? "text-muted-foreground line-through"
                                        : ""
                                    }`}
                                  >
                                    {task.title}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <Separator />
        <footer className="text-center text-sm text-muted-foreground py-4">
          <p>Last updated {formatDistanceToNow(project.updatedAt, { addSuffix: true })}</p>
          <p className="mt-1">Powered by NERVE AGENT</p>
        </footer>
      </main>

      {/* Feedback Widget */}
      <PortalFeedbackForm projectId={project.id} portalToken={token} />
    </div>
  )
}
