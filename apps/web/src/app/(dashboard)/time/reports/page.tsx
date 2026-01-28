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
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  BarChart3,
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

export default async function TimeReportsPage() {
  const user = await requireUser()

  const today = new Date()

  // This month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

  // Last month
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  // This week
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  // Fetch all data in parallel
  const [thisMonthEntries, lastMonthEntries, projects] = await Promise.all([
    db.timeEntry.findMany({
      where: {
        userId: user.id,
        startTime: { gte: startOfMonth, lt: endOfMonth },
      },
      include: {
        project: { select: { name: true, slug: true, hourlyRate: true } },
      },
    }),
    db.timeEntry.findMany({
      where: {
        userId: user.id,
        startTime: { gte: startOfLastMonth, lt: endOfLastMonth },
      },
      include: {
        project: { select: { hourlyRate: true } },
      },
    }),
    db.project.findMany({
      where: { userId: user.id },
      include: {
        timeEntries: {
          where: { startTime: { gte: startOfMonth } },
        },
      },
    }),
  ])

  // Calculate stats
  const thisMonthMinutes = thisMonthEntries.reduce((sum, e) => sum + e.durationMinutes, 0)
  const thisMonthBillable = thisMonthEntries.filter((e) => e.billable).reduce((sum, e) => sum + e.durationMinutes, 0)
  const thisMonthRevenue = thisMonthEntries
    .filter((e) => e.billable && e.project.hourlyRate)
    .reduce((sum, e) => sum + (e.durationMinutes / 60) * Number(e.project.hourlyRate), 0)

  const lastMonthMinutes = lastMonthEntries.reduce((sum, e) => sum + e.durationMinutes, 0)
  const lastMonthRevenue = lastMonthEntries
    .filter((e) => e.billable && e.project.hourlyRate)
    .reduce((sum, e) => sum + (e.durationMinutes / 60) * Number(e.project.hourlyRate), 0)

  // Week breakdown for this month
  const weeklyData: { week: number; minutes: number; revenue: number }[] = []
  const weeksInMonth = Math.ceil((endOfMonth.getTime() - startOfMonth.getTime()) / (7 * 24 * 60 * 60 * 1000))
  for (let i = 0; i < weeksInMonth; i++) {
    const weekStart = new Date(startOfMonth.getTime() + i * 7 * 24 * 60 * 60 * 1000)
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    const weekEntries = thisMonthEntries.filter(
      (e) => e.startTime >= weekStart && e.startTime < weekEnd
    )
    const weekMinutes = weekEntries.reduce((sum, e) => sum + e.durationMinutes, 0)
    const weekRevenue = weekEntries
      .filter((e) => e.billable && e.project.hourlyRate)
      .reduce((sum, e) => sum + (e.durationMinutes / 60) * Number(e.project.hourlyRate), 0)
    weeklyData.push({ week: i + 1, minutes: weekMinutes, revenue: weekRevenue })
  }

  // Project totals for this month
  const projectTotals = thisMonthEntries.reduce((acc, entry) => {
    const key = entry.project.slug
    if (!acc[key]) {
      acc[key] = {
        name: entry.project.name,
        slug: key,
        minutes: 0,
        billable: 0,
        revenue: 0,
        hourlyRate: entry.project.hourlyRate ? Number(entry.project.hourlyRate) : null,
      }
    }
    acc[key].minutes += entry.durationMinutes
    if (entry.billable) {
      acc[key].billable += entry.durationMinutes
      if (entry.project.hourlyRate) {
        acc[key].revenue += (entry.durationMinutes / 60) * Number(entry.project.hourlyRate)
      }
    }
    return acc
  }, {} as Record<string, { name: string; slug: string; minutes: number; billable: number; revenue: number; hourlyRate: number | null }>)

  const sortedProjects = Object.values(projectTotals).sort((a, b) => b.minutes - a.minutes)
  const maxProjectMinutes = Math.max(...sortedProjects.map((p) => p.minutes), 1)

  const monthName = today.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const lastMonthName = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    .toLocaleDateString("en-US", { month: "long" })

  // Calculate trends
  const minutesTrend = lastMonthMinutes > 0
    ? Math.round(((thisMonthMinutes - lastMonthMinutes) / lastMonthMinutes) * 100)
    : 0
  const revenueTrend = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/time">Time Tracking</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Reports</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time Reports</h1>
          <p className="text-muted-foreground">
            Monthly overview and trends for {monthName}
          </p>
        </div>

        {/* Month Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(thisMonthMinutes)}</div>
              <p className="text-xs text-muted-foreground">
                {minutesTrend >= 0 ? "+" : ""}{minutesTrend}% vs {lastMonthName}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(thisMonthBillable)}</div>
              <p className="text-xs text-muted-foreground">
                {thisMonthMinutes > 0 ? Math.round((thisMonthBillable / thisMonthMinutes) * 100) : 0}% utilization
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${thisMonthRevenue.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">
                {revenueTrend >= 0 ? "+" : ""}{revenueTrend}% vs {lastMonthName}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Hourly</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${thisMonthBillable > 0 ? ((thisMonthRevenue / thisMonthBillable) * 60).toFixed(0) : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                effective rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Breakdown
            </CardTitle>
            <CardDescription>Hours by week this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((week) => {
                const maxMinutes = Math.max(...weeklyData.map((w) => w.minutes), 1)
                const percent = (week.minutes / maxMinutes) * 100
                return (
                  <div key={week.week}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Week {week.week}</span>
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(week.minutes)}
                        {week.revenue > 0 && (
                          <span className="ml-2 text-green-500">${week.revenue.toFixed(0)}</span>
                        )}
                      </div>
                    </div>
                    <Progress value={percent} className="h-3" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Project Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>By Project</CardTitle>
            <CardDescription>Time and revenue breakdown by project</CardDescription>
          </CardHeader>
          <CardContent>
            {sortedProjects.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 p-8 text-center">
                <p className="text-sm text-muted-foreground">No time tracked this month</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedProjects.map((project) => {
                  const percent = (project.minutes / maxProjectMinutes) * 100
                  return (
                    <div key={project.slug}>
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          href={`/projects/${project.slug}`}
                          className="font-medium hover:underline"
                        >
                          {project.name}
                        </Link>
                        <div className="text-right">
                          <div className="font-medium">{formatDuration(project.minutes)}</div>
                          {project.revenue > 0 && (
                            <div className="text-sm text-green-500">${project.revenue.toFixed(0)}</div>
                          )}
                        </div>
                      </div>
                      <Progress value={percent} className="h-2 mb-1" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatDuration(project.billable)} billable</span>
                        {project.hourlyRate && (
                          <span>${project.hourlyRate}/hr</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>vs Last Month</CardTitle>
              <CardDescription>Comparison with {lastMonthName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Hours</span>
                    <span className={`text-sm ${minutesTrend >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {minutesTrend >= 0 ? "+" : ""}{minutesTrend}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">{lastMonthName}</div>
                      <Progress value={lastMonthMinutes > 0 ? 100 : 0} className="h-2" />
                      <div className="text-xs mt-1">{formatDuration(lastMonthMinutes)}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">{monthName.split(" ")[0]}</div>
                      <Progress
                        value={lastMonthMinutes > 0 ? Math.min((thisMonthMinutes / lastMonthMinutes) * 100, 100) : (thisMonthMinutes > 0 ? 100 : 0)}
                        className="h-2"
                      />
                      <div className="text-xs mt-1">{formatDuration(thisMonthMinutes)}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Revenue</span>
                    <span className={`text-sm ${revenueTrend >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {revenueTrend >= 0 ? "+" : ""}{revenueTrend}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">{lastMonthName}</div>
                      <Progress value={lastMonthRevenue > 0 ? 100 : 0} className="h-2" />
                      <div className="text-xs mt-1">${lastMonthRevenue.toFixed(0)}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">{monthName.split(" ")[0]}</div>
                      <Progress
                        value={lastMonthRevenue > 0 ? Math.min((thisMonthRevenue / lastMonthRevenue) * 100, 100) : (thisMonthRevenue > 0 ? 100 : 0)}
                        className="h-2"
                      />
                      <div className="text-xs mt-1">${thisMonthRevenue.toFixed(0)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Key metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Total hours</span>
                  <span className="font-medium">{formatDuration(thisMonthMinutes)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Billable hours</span>
                  <span className="font-medium">{formatDuration(thisMonthBillable)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Utilization rate</span>
                  <span className="font-medium">
                    {thisMonthMinutes > 0 ? Math.round((thisMonthBillable / thisMonthMinutes) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Total revenue</span>
                  <span className="font-medium text-green-500">${thisMonthRevenue.toFixed(0)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Active projects</span>
                  <span className="font-medium">{sortedProjects.length}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Avg daily hours</span>
                  <span className="font-medium">
                    {formatDuration(Math.round(thisMonthMinutes / today.getDate()))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
