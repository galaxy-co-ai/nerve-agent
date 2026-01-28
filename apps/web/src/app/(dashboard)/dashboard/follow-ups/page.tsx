export const dynamic = "force-dynamic"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, ListTodo } from "lucide-react"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { FollowUpQueue } from "@/components/features/follow-up-queue"
import Link from "next/link"

interface FollowUpsPageProps {
  searchParams: Promise<{ status?: string; showCompleted?: string }>
}

export default async function FollowUpsPage({ searchParams }: FollowUpsPageProps) {
  const params = await searchParams
  const user = await requireUser()

  const showCompleted = params.showCompleted === "true"

  // Get all follow-ups
  const followUps = await db.followUp.findMany({
    where: {
      userId: user.id,
      // Don't show dismissed unless specifically requested
      status: { not: "DISMISSED" },
    },
    include: {
      project: { select: { id: true, name: true, slug: true } },
      call: { select: { id: true, title: true } },
    },
    orderBy: [
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  })

  // Calculate stats
  const suggested = followUps.filter((f) => f.status === "SUGGESTED").length
  const active = followUps.filter((f) => f.status === "SCHEDULED" || f.status === "PENDING").length
  const overdue = followUps.filter(
    (f) =>
      f.dueDate &&
      f.dueDate < new Date() &&
      (f.status === "SCHEDULED" || f.status === "PENDING")
  ).length
  const completed = followUps.filter((f) => f.status === "COMPLETED").length

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Follow-ups</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Follow-up Queue</h1>
            <p className="text-muted-foreground">
              Action items extracted from calls and meetings
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suggested</CardTitle>
              <ListTodo className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suggested}</div>
              <p className="text-xs text-muted-foreground">
                Waiting for review
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{active}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled or pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdue}</div>
              <p className="text-xs text-muted-foreground">
                Past due date
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completed}</div>
              <p className="text-xs text-muted-foreground">
                Done this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Link href="/dashboard/follow-ups">
            <Badge
              variant={!showCompleted ? "default" : "outline"}
              className="cursor-pointer"
            >
              Active
            </Badge>
          </Link>
          <Link href="/dashboard/follow-ups?showCompleted=true">
            <Badge
              variant={showCompleted ? "default" : "outline"}
              className="cursor-pointer"
            >
              Show Completed
            </Badge>
          </Link>
        </div>

        {/* Follow-up Queue */}
        <FollowUpQueue
          followUps={followUps.filter((f) =>
            showCompleted ? true : f.status !== "COMPLETED"
          )}
          showCompleted={showCompleted}
        />
      </div>
    </>
  )
}
