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
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  Layers,
  CheckCircle2,
  Play,
  AlertTriangle,
  Circle,
} from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

const statusColors: Record<string, string> = {
  NOT_STARTED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  BLOCKED: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  COMPLETED: "bg-green-500/10 text-green-500 border-green-500/20",
}

const statusIcons: Record<string, React.ReactNode> = {
  NOT_STARTED: <Circle className="h-4 w-4 text-muted-foreground" />,
  IN_PROGRESS: <Play className="h-4 w-4 text-blue-500" />,
  BLOCKED: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  COMPLETED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
}

export default async function SprintsPage() {
  const user = await requireUser()

  const sprints = await db.sprint.findMany({
    where: {
      project: {
        userId: user.id,
      },
    },
    include: {
      project: {
        select: {
          name: true,
          slug: true,
        },
      },
      tasks: {
        select: {
          id: true,
          status: true,
          estimatedHours: true,
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { updatedAt: "desc" },
    ],
  })

  // Stats
  const inProgressCount = sprints.filter((s) => s.status === "IN_PROGRESS").length
  const completedCount = sprints.filter((s) => s.status === "COMPLETED").length
  const totalTasksInProgress = sprints
    .filter((s) => s.status === "IN_PROGRESS")
    .reduce((sum, s) => sum + s.tasks.filter((t) => t.status !== "COMPLETED").length, 0)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Sprint Stack</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sprint Stack</h1>
          <p className="text-muted-foreground">
            All sprints across your projects
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sprints</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sprints.length}</div>
              <p className="text-xs text-muted-foreground">
                across all projects
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Play className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressCount}</div>
              <p className="text-xs text-muted-foreground">
                active sprints
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Remaining</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasksInProgress}</div>
              <p className="text-xs text-muted-foreground">
                in active sprints
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
              <p className="text-xs text-muted-foreground">
                sprints shipped
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sprint List */}
        <Card>
          <CardHeader>
            <CardTitle>All Sprints</CardTitle>
            <CardDescription>
              Click a sprint to view tasks and manage progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sprints.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 p-8 text-center">
                <div className="space-y-2">
                  <p className="text-muted-foreground">No sprints yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create sprints from your project pages
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {sprints.map((sprint) => {
                  const completedTasks = sprint.tasks.filter((t) => t.status === "COMPLETED").length
                  const totalTasks = sprint.tasks.length
                  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
                  const totalEstimated = sprint.tasks.reduce((sum, t) => sum + Number(t.estimatedHours), 0)

                  return (
                    <Link
                      key={sprint.id}
                      href={`/projects/${sprint.project.slug}/sprints/${sprint.number}`}
                      className="block rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {statusIcons[sprint.status]}
                          <div>
                            <div className="font-medium">
                              Sprint {sprint.number}: {sprint.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {sprint.project.name}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className={statusColors[sprint.status]}>
                          {sprint.status.toLowerCase().replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex-1">
                          <Progress value={progressPercent} className="h-1.5" />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{completedTasks}/{totalTasks} tasks</span>
                          <span>{totalEstimated}h</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
