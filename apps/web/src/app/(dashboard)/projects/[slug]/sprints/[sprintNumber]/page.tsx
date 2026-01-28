import { notFound } from "next/navigation"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Clock,
  MoreHorizontal,
  Play,
  Pause,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Trash2,
} from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { updateSprintStatus, deleteSprint } from "@/lib/actions/sprints"
import { updateTaskStatus, deleteTask } from "@/lib/actions/tasks"
import { AddTaskDialog } from "@/components/add-task-dialog"

const statusColors: Record<string, string> = {
  NOT_STARTED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  BLOCKED: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  COMPLETED: "bg-green-500/10 text-green-500 border-green-500/20",
}

const taskStatusIcons: Record<string, React.ReactNode> = {
  TODO: <Circle className="h-4 w-4 text-muted-foreground" />,
  IN_PROGRESS: <Play className="h-4 w-4 text-blue-500" />,
  BLOCKED: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  COMPLETED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
}

interface PageProps {
  params: Promise<{ slug: string; sprintNumber: string }>
}

export default async function SprintPage({ params }: PageProps) {
  const { slug, sprintNumber: sprintNumberStr } = await params
  const sprintNumber = parseInt(sprintNumberStr, 10)
  const user = await requireUser()

  const project = await db.project.findFirst({
    where: { slug, userId: user.id },
  })

  if (!project) {
    notFound()
  }

  const sprint = await db.sprint.findUnique({
    where: {
      projectId_number: {
        projectId: project.id,
        number: sprintNumber,
      },
    },
    include: {
      tasks: {
        orderBy: [
          { status: "asc" },
          { order: "asc" },
        ],
        include: {
          timeEntries: true,
        },
      },
    },
  })

  if (!sprint) {
    notFound()
  }

  // Calculate stats
  const completedTasks = sprint.tasks.filter((t) => t.status === "COMPLETED").length
  const totalTasks = sprint.tasks.length
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const totalEstimated = sprint.tasks.reduce((sum, t) => sum + Number(t.estimatedHours), 0)
  const totalActual = sprint.tasks.reduce((sum, t) => {
    const taskMinutes = t.timeEntries.reduce((m, e) => m + e.durationMinutes, 0)
    return sum + taskMinutes / 60
  }, 0)

  const deleteSprintBound = deleteSprint.bind(null, slug, sprintNumber)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/projects/${slug}`}>{project.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Sprint {sprintNumber}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <form action={updateSprintStatus.bind(null, slug, sprintNumber, "IN_PROGRESS")}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full cursor-pointer">
                    <Play className="mr-2 h-4 w-4" />
                    Start Sprint
                  </button>
                </DropdownMenuItem>
              </form>
              <form action={updateSprintStatus.bind(null, slug, sprintNumber, "BLOCKED")}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full cursor-pointer">
                    <Pause className="mr-2 h-4 w-4" />
                    Mark Blocked
                  </button>
                </DropdownMenuItem>
              </form>
              <form action={updateSprintStatus.bind(null, slug, sprintNumber, "COMPLETED")}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full cursor-pointer">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete Sprint
                  </button>
                </DropdownMenuItem>
              </form>
              <DropdownMenuSeparator />
              <form action={deleteSprintBound}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full cursor-pointer text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Sprint
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Sprint Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Sprint {sprint.number}: {sprint.name}
              </h1>
              <Badge variant="outline" className={statusColors[sprint.status]}>
                {sprint.status.toLowerCase().replace("_", " ")}
              </Badge>
            </div>
            {sprint.description && (
              <p className="text-muted-foreground max-w-2xl">{sprint.description}</p>
            )}
          </div>
        </div>

        {/* Progress Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Progress</div>
                <div className="text-2xl font-bold">{progressPercent}%</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Tasks</div>
                <div className="text-2xl font-bold">
                  {completedTasks}/{totalTasks}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Hours</div>
                <div className="text-2xl font-bold">
                  {totalActual.toFixed(1)}/{totalEstimated}h
                </div>
              </div>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                {sprint.tasks.length} tasks · {totalEstimated}h estimated
              </CardDescription>
            </div>
            <AddTaskDialog projectSlug={slug} sprintNumber={sprintNumber} />
          </CardHeader>
          <CardContent>
            {sprint.tasks.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 p-8 text-center">
                <div className="space-y-2">
                  <p className="text-muted-foreground">No tasks yet</p>
                  <p className="text-sm text-muted-foreground">
                    Add tasks to start tracking work
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {sprint.tasks.map((task) => {
                  const taskMinutes = task.timeEntries.reduce((m, e) => m + e.durationMinutes, 0)
                  const taskHours = taskMinutes / 60

                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {taskStatusIcons[task.status]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{task.title}</div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {taskHours.toFixed(1)}/{Number(task.estimatedHours)}h
                          </span>
                          {task.category && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-accent">
                              {task.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {task.status !== "IN_PROGRESS" && (
                              <form action={updateTaskStatus.bind(null, task.id, "IN_PROGRESS")}>
                                <DropdownMenuItem asChild>
                                  <button type="submit" className="w-full cursor-pointer">
                                    <Play className="mr-2 h-4 w-4" />
                                    Start Task
                                  </button>
                                </DropdownMenuItem>
                              </form>
                            )}
                            {task.status !== "COMPLETED" && (
                              <form action={updateTaskStatus.bind(null, task.id, "COMPLETED")}>
                                <DropdownMenuItem asChild>
                                  <button type="submit" className="w-full cursor-pointer">
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Complete
                                  </button>
                                </DropdownMenuItem>
                              </form>
                            )}
                            {task.status !== "BLOCKED" && (
                              <form action={updateTaskStatus.bind(null, task.id, "BLOCKED")}>
                                <DropdownMenuItem asChild>
                                  <button type="submit" className="w-full cursor-pointer">
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Mark Blocked
                                  </button>
                                </DropdownMenuItem>
                              </form>
                            )}
                            {task.status !== "TODO" && (
                              <form action={updateTaskStatus.bind(null, task.id, "TODO")}>
                                <DropdownMenuItem asChild>
                                  <button type="submit" className="w-full cursor-pointer">
                                    <Circle className="mr-2 h-4 w-4" />
                                    Reset to Todo
                                  </button>
                                </DropdownMenuItem>
                              </form>
                            )}
                            <DropdownMenuSeparator />
                            <form action={deleteTask.bind(null, task.id)}>
                              <DropdownMenuItem asChild>
                                <button type="submit" className="w-full cursor-pointer text-red-500">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Task
                                </button>
                              </DropdownMenuItem>
                            </form>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
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
