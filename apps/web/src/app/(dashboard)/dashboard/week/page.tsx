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
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  CheckCircle2,
  Play,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" })
}

export default async function WeekPage() {
  const user = await requireUser()

  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  // Get all time entries for the week
  const timeEntries = await db.timeEntry.findMany({
    where: {
      userId: user.id,
      startTime: { gte: startOfWeek, lt: endOfWeek },
    },
    include: {
      project: { select: { name: true, slug: true } },
    },
    orderBy: { startTime: "asc" },
  })

  // Get completed tasks this week
  const completedTasks = await db.task.findMany({
    where: {
      completedAt: { gte: startOfWeek, lt: endOfWeek },
      sprint: { project: { userId: user.id } },
    },
    include: {
      sprint: {
        include: { project: { select: { name: true, slug: true } } },
      },
    },
    orderBy: { completedAt: "desc" },
  })

  // Get in-progress sprints
  const activeSprints = await db.sprint.findMany({
    where: {
      status: "IN_PROGRESS",
      project: { userId: user.id },
    },
    include: {
      project: { select: { name: true, slug: true } },
      tasks: { select: { status: true } },
    },
  })

  // Calculate daily totals
  const dailyTotals: { date: Date; minutes: number }[] = []
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(startOfWeek)
    dayStart.setDate(startOfWeek.getDate() + i)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayStart.getDate() + 1)

    const dayMinutes = timeEntries
      .filter((e) => e.startTime >= dayStart && e.startTime < dayEnd)
      .reduce((sum, e) => sum + e.durationMinutes, 0)

    dailyTotals.push({ date: dayStart, minutes: dayMinutes })
  }

  const weekTotal = timeEntries.reduce((sum, e) => sum + e.durationMinutes, 0)
  const billableMinutes = timeEntries.filter((e) => e.billable).reduce((sum, e) => sum + e.durationMinutes, 0)
  const maxDaily = Math.max(...dailyTotals.map((d) => d.minutes), 1)

  // Group time by project
  const projectTotals = timeEntries.reduce((acc, entry) => {
    const key = entry.project.slug
    if (!acc[key]) {
      acc[key] = { name: entry.project.name, slug: key, minutes: 0 }
    }
    acc[key].minutes += entry.durationMinutes
    return acc
  }, {} as Record<string, { name: string; slug: string; minutes: number }>)

  const sortedProjects = Object.values(projectTotals).sort((a, b) => b.minutes - a.minutes)

  const weekLabel = `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(endOfWeek.getTime() - 1).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`

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
              <BreadcrumbPage>Week View</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto text-sm text-muted-foreground">{weekLabel}</div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">This Week</h1>
          <p className="text-muted-foreground">
            Overview of your progress for the current week
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Tracked</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(weekTotal)}</div>
              <p className="text-xs text-muted-foreground">
                {formatDuration(billableMinutes)} billable
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                across all projects
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sprints</CardTitle>
              <Play className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSprints.length}</div>
              <p className="text-xs text-muted-foreground">
                in progress
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(Math.round(weekTotal / 7))}
              </div>
              <p className="text-xs text-muted-foreground">
                per day this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Breakdown
            </CardTitle>
            <CardDescription>Time tracked each day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40">
              {dailyTotals.map((day, i) => {
                const isToday = day.date.toDateString() === today.toDateString()
                const height = maxDaily > 0 ? (day.minutes / maxDaily) * 100 : 0
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <div className="relative w-full flex items-end justify-center h-32">
                      <div
                        className={`w-full max-w-12 rounded-t transition-all ${
                          isToday ? "bg-primary" : "bg-primary/60"
                        }`}
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <div className={`text-xs font-medium ${isToday ? "text-primary" : ""}`}>
                        {getDayName(day.date)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {day.minutes > 0 ? formatDuration(day.minutes) : "-"}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* By Project */}
          <Card>
            <CardHeader>
              <CardTitle>Time by Project</CardTitle>
              <CardDescription>Where your time went this week</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedProjects.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 p-8 text-center">
                  <p className="text-sm text-muted-foreground">No time tracked this week</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedProjects.map((project) => {
                    const percent = Math.round((project.minutes / weekTotal) * 100)
                    return (
                      <div key={project.slug}>
                        <div className="flex items-center justify-between mb-1">
                          <Link
                            href={`/projects/${project.slug}`}
                            className="text-sm font-medium hover:underline"
                          >
                            {project.name}
                          </Link>
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(project.minutes)} ({percent}%)
                          </span>
                        </div>
                        <Progress value={percent} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Sprints */}
          <Card>
            <CardHeader>
              <CardTitle>Active Sprints</CardTitle>
              <CardDescription>Current work in progress</CardDescription>
            </CardHeader>
            <CardContent>
              {activeSprints.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 p-8 text-center">
                  <p className="text-sm text-muted-foreground">No active sprints</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeSprints.map((sprint) => {
                    const completed = sprint.tasks.filter((t) => t.status === "COMPLETED").length
                    const total = sprint.tasks.length
                    const percent = total > 0 ? Math.round((completed / total) * 100) : 0

                    return (
                      <Link
                        key={sprint.id}
                        href={`/projects/${sprint.project.slug}/sprints/${sprint.number}`}
                        className="block rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium">
                              Sprint {sprint.number}: {sprint.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {sprint.project.name}
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                            {completed}/{total} tasks
                          </Badge>
                        </div>
                        <Progress value={percent} className="h-1.5" />
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Completed Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Completed This Week
            </CardTitle>
            <CardDescription>Tasks you've finished</CardDescription>
          </CardHeader>
          <CardContent>
            {completedTasks.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 p-8 text-center">
                <p className="text-sm text-muted-foreground">No tasks completed this week yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {completedTasks.slice(0, 10).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {task.sprint.project.name} · Sprint {task.sprint.number}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {task.completedAt?.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                  </div>
                ))}
                {completedTasks.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{completedTasks.length - 10} more tasks
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
