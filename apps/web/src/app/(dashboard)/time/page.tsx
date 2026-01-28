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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Clock,
  DollarSign,
  Calendar,
  MoreHorizontal,
  Trash2,
  TrendingUp,
} from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { AddTimeEntryDialog } from "@/components/add-time-entry-dialog"
import { deleteTimeEntry, toggleBillable } from "@/lib/actions/time"

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export default async function TimePage() {
  const user = await requireUser()

  // Get date ranges
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)

  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

  // Fetch data
  const projects = await db.project.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, slug: true },
    orderBy: { updatedAt: "desc" },
  })

  const todayEntries = await db.timeEntry.findMany({
    where: {
      userId: user.id,
      startTime: { gte: startOfToday, lt: endOfToday },
    },
    include: {
      project: {
        select: { name: true, slug: true, hourlyRate: true },
      },
      task: {
        select: { title: true },
      },
    },
    orderBy: { startTime: "desc" },
  })

  const weekEntries = await db.timeEntry.findMany({
    where: {
      userId: user.id,
      startTime: { gte: startOfWeek },
    },
    include: {
      project: {
        select: { name: true, slug: true, hourlyRate: true },
      },
    },
    orderBy: { startTime: "desc" },
  })

  // Calculate stats
  const todayMinutes = todayEntries.reduce((sum, e) => sum + e.durationMinutes, 0)
  const todayBillableMinutes = todayEntries
    .filter((e) => e.billable)
    .reduce((sum, e) => sum + e.durationMinutes, 0)

  const weekMinutes = weekEntries.reduce((sum, e) => sum + e.durationMinutes, 0)
  const weekBillableMinutes = weekEntries
    .filter((e) => e.billable)
    .reduce((sum, e) => sum + e.durationMinutes, 0)

  // Calculate revenue
  const todayRevenue = todayEntries
    .filter((e) => e.billable && e.project.hourlyRate)
    .reduce((sum, e) => sum + (e.durationMinutes / 60) * Number(e.project.hourlyRate), 0)

  const weekRevenue = weekEntries
    .filter((e) => e.billable && e.project.hourlyRate)
    .reduce((sum, e) => sum + (e.durationMinutes / 60) * Number(e.project.hourlyRate), 0)

  // Group week entries by project
  const projectTotals = weekEntries.reduce((acc, entry) => {
    const projectName = entry.project.name
    if (!acc[projectName]) {
      acc[projectName] = { minutes: 0, billable: 0, slug: entry.project.slug }
    }
    acc[projectName].minutes += entry.durationMinutes
    if (entry.billable) {
      acc[projectName].billable += entry.durationMinutes
    }
    return acc
  }, {} as Record<string, { minutes: number; billable: number; slug: string }>)

  const sortedProjects = Object.entries(projectTotals)
    .sort(([, a], [, b]) => b.minutes - a.minutes)

  const todayFormatted = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Time Tracking</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{todayFormatted}</span>
          <AddTimeEntryDialog projects={projects} />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time Tracking</h1>
          <p className="text-muted-foreground">
            Track and manage your time across projects
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(todayMinutes)}</div>
              <p className="text-xs text-muted-foreground">
                {formatDuration(todayBillableMinutes)} billable
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(weekMinutes)}</div>
              <p className="text-xs text-muted-foreground">
                {formatDuration(weekBillableMinutes)} billable
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${todayRevenue.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">
                from billable time
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Week Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${weekRevenue.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">
                from billable time
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Today's Entries */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Today's Time</CardTitle>
              <CardDescription>
                {todayEntries.length} entries · {formatDuration(todayMinutes)} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayEntries.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 p-8 text-center">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">No time logged today</p>
                    <p className="text-sm text-muted-foreground">
                      Click "Log Time" to add your first entry
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/projects/${entry.project.slug}`}
                            className="font-medium hover:underline truncate"
                          >
                            {entry.project.name}
                          </Link>
                          {entry.billable && (
                            <Badge variant="outline" className="text-xs">
                              billable
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {formatTime(entry.startTime)} – {entry.endTime ? formatTime(entry.endTime) : "now"}
                          </span>
                          {entry.task && (
                            <>
                              <span>·</span>
                              <span className="truncate">{entry.task.title}</span>
                            </>
                          )}
                        </div>
                        {entry.description && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {entry.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatDuration(entry.durationMinutes)}</div>
                        <div className="text-xs text-muted-foreground">
                          {entry.source.toLowerCase()}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <form action={toggleBillable.bind(null, entry.id)}>
                            <DropdownMenuItem asChild>
                              <button type="submit" className="w-full cursor-pointer">
                                {entry.billable ? "Mark Non-Billable" : "Mark Billable"}
                              </button>
                            </DropdownMenuItem>
                          </form>
                          <form action={deleteTimeEntry.bind(null, entry.id)}>
                            <DropdownMenuItem asChild>
                              <button type="submit" className="w-full cursor-pointer text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </button>
                            </DropdownMenuItem>
                          </form>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly By Project */}
          <Card>
            <CardHeader>
              <CardTitle>This Week by Project</CardTitle>
              <CardDescription>Time breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedProjects.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 p-8 text-center">
                  <p className="text-sm text-muted-foreground">No time this week</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedProjects.map(([projectName, data]) => {
                    const percent = Math.round((data.minutes / weekMinutes) * 100)
                    return (
                      <div key={projectName}>
                        <div className="flex items-center justify-between mb-1">
                          <Link
                            href={`/projects/${data.slug}`}
                            className="text-sm font-medium hover:underline truncate"
                          >
                            {projectName}
                          </Link>
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(data.minutes)}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
