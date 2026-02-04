"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Rocket,
  TrendingUp,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { FadeInUp, StaggeredList, StaggeredItem } from "@/components/motion"

interface Project {
  id: string
  name: string
  slug: string
  status: string
  phase: string
  health: number
  targetEndDate: Date | null
  accessLevel: string
  contractStatus: string
  progress: number
  sprints: {
    current: number | null
    total: number
    completed: number
  }
  blockerCount: number
  recentActivity: {
    id: string
    type: string
    title: string
    occurredAt: Date
  }[]
}

interface ActivityItem {
  id: string
  type: string
  title: string
  occurredAt: Date
  projectName: string
  projectSlug: string
}

interface PortfolioOverviewProps {
  user: {
    name: string | null
    email: string
  }
  projects: Project[]
  stats: {
    activeProjects: number
    onTrack: number
    atRisk: number
    completed: number
  }
  recentActivity: ActivityItem[]
}

const activityIcons: Record<string, typeof Activity> = {
  TASK_COMPLETED: CheckCircle2,
  MILESTONE_REACHED: Rocket,
  BLOCKER_RESOLVED: AlertCircle,
  default: Activity,
}

const statusColors: Record<string, string> = {
  PLANNING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
  ON_HOLD: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
}

export function PortfolioOverview({
  user,
  projects,
  stats,
  recentActivity,
}: PortfolioOverviewProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#08080a]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-[#08080a]/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold text-white">
              Welcome back, {user.name?.split(" ")[0] || "Investor"}
            </h1>
            <p className="text-sm text-zinc-500">Your project portfolio at a glance</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Stats Row */}
        <StaggeredList className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StaggeredItem>
            <StatCard
              title="Active"
              value={stats.activeProjects}
              icon={Activity}
              trend={stats.activeProjects > 0 ? "+2 this month" : undefined}
            />
          </StaggeredItem>
          <StaggeredItem>
            <StatCard
              title="On Track"
              value={stats.onTrack}
              icon={TrendingUp}
              variant="success"
            />
          </StaggeredItem>
          <StaggeredItem>
            <StatCard
              title="At Risk"
              value={stats.atRisk}
              icon={AlertCircle}
              variant={stats.atRisk > 0 ? "danger" : "default"}
            />
          </StaggeredItem>
          <StaggeredItem>
            <StatCard
              title="Shipped"
              value={stats.completed}
              icon={Rocket}
              variant="gold"
            />
          </StaggeredItem>
        </StaggeredList>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Projects - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Active Projects</h2>
              <span className="text-sm text-zinc-500">{projects.length} total</span>
            </div>

            {projects.length === 0 ? (
              <FadeInUp delay={0.2}>
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-6 h-6 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500">No projects assigned yet</p>
                    <p className="text-sm text-zinc-600 mt-1">
                      Projects will appear here once you&apos;re invited
                    </p>
                  </CardContent>
                </Card>
              </FadeInUp>
            ) : (
              <StaggeredList className="grid md:grid-cols-2 gap-4" staggerDelay={0.1}>
                {projects.map((project) => (
                  <StaggeredItem key={project.id}>
                    <ProjectCard project={project} />
                  </StaggeredItem>
                ))}
              </StaggeredList>
            )}
          </div>

          {/* Recent Activity - Takes 1 column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              <Link
                href="/client/activity"
                className="text-sm text-[#C9A84C] hover:text-[#C9A84C]/80"
              >
                See all
              </Link>
            </div>

            <FadeInUp delay={0.3}>
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-0">
                  {recentActivity.length === 0 ? (
                    <div className="py-12 text-center">
                      <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                      <p className="text-sm text-zinc-500">No recent activity</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-800">
                      {recentActivity.map((item) => (
                        <ActivityRow key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInUp>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
}: {
  title: string
  value: number
  icon: typeof Activity
  trend?: string
  variant?: "default" | "success" | "danger" | "gold"
}) {
  const variants = {
    default: "bg-zinc-800/50 text-zinc-400",
    success: "bg-green-500/10 text-green-400",
    danger: "bg-red-500/10 text-red-400",
    gold: "bg-[#C9A84C]/10 text-[#C9A84C]",
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">{title}</p>
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", variants[variant])}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
        {trend && <p className="text-xs text-green-400 mt-1">{trend}</p>}
      </CardContent>
    </Card>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const healthColor =
    project.health >= 80
      ? "text-green-400"
      : project.health >= 50
      ? "text-yellow-400"
      : "text-red-400"

  return (
    <Link href={`/client/projects/${project.slug}`}>
      <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors group cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-medium text-white group-hover:text-[#C9A84C] transition-colors">
                {project.name}
              </CardTitle>
              <Badge
                variant="outline"
                className={cn("text-[10px]", statusColors[project.status])}
              >
                {project.status.toLowerCase()}
              </Badge>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#C9A84C] transition-colors" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Progress</span>
              <span className={healthColor}>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5 bg-zinc-800" />
          </div>

          {/* Sprint info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Sprint</span>
            <span className="text-zinc-300">
              {project.sprints.current
                ? `${project.sprints.current} of ${project.sprints.total}`
                : `${project.sprints.completed}/${project.sprints.total} complete`}
            </span>
          </div>

          {/* Blockers */}
          {project.blockerCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{project.blockerCount} blocker{project.blockerCount > 1 ? "s" : ""}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = activityIcons[item.type] || activityIcons.default

  return (
    <Link
      href={`/client/projects/${item.projectSlug}`}
      className="flex items-start gap-3 p-4 hover:bg-zinc-800/50 transition-colors"
    >
      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300 line-clamp-2">{item.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-zinc-500">{item.projectName}</span>
          <span className="text-xs text-zinc-600">•</span>
          <span className="text-xs text-zinc-500">
            {formatDistanceToNow(new Date(item.occurredAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  )
}
