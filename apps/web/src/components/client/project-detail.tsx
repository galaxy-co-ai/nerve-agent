"use client"

import Link from "next/link"
import { formatDistanceToNow, format } from "date-fns"
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Loader2,
  Play,
  Rocket,
  User,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { FadeInUp, StaggeredList, StaggeredItem } from "@/components/motion"
import { PresenceIndicator } from "@/components/client/presence-indicator"
import { CommentThread } from "@/components/client/comment-thread"
import { FeedbackButton } from "@/components/client/feedback-form"

interface ProjectDetailProps {
  currentUserId: string
  project: {
    id: string
    name: string
    slug: string
    description: string | null
    status: string
    phase: string
    health: number
    startDate: Date | null
    targetEndDate: Date | null
    developer: {
      id: string
      name: string | null
      avatarUrl: string | null
    }
    contractStatus: string
    accessLevel: string
    stats: {
      progress: number
      currentSprint: number | null
      totalSprints: number
      completedSprints: number
      blockerCount: number
    }
    sprints: {
      id: string
      number: number
      name: string
      status: string
      estimatedHours: number
      actualHours: number
      plannedStartDate: Date | null
      plannedEndDate: Date | null
    }[]
    milestones: {
      id: string
      title: string
      description: string | null
      status: string
      progressPercent: number
      demoUrl: string | null
      screenshots: string[]
      dueDate: Date | null
      completedAt: Date | null
    }[]
    blockers: {
      id: string
      title: string
      description: string | null
      waitingOn: string
      createdAt: Date
    }[]
    activity: {
      id: string
      type: string
      title: string
      occurredAt: Date
    }[]
  }
}

const statusColors: Record<string, string> = {
  PLANNED: "bg-zinc-500/20 text-zinc-400",
  IN_PROGRESS: "bg-blue-500/20 text-blue-400",
  REVIEW: "bg-purple-500/20 text-purple-400",
  COMPLETED: "bg-green-500/20 text-green-400",
}

const milestoneIcons: Record<string, typeof Circle> = {
  PLANNED: Circle,
  IN_PROGRESS: Loader2,
  REVIEW: Clock,
  COMPLETED: CheckCircle2,
}

export function ProjectDetail({ project, currentUserId }: ProjectDetailProps) {
  const healthColor =
    project.health >= 80
      ? "text-green-400"
      : project.health >= 50
      ? "text-yellow-400"
      : "text-red-400"

  return (
    <div className="flex flex-col min-h-screen bg-[#08080a]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-[#08080a]/80 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-4 px-6">
          <Link
            href="/client"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Portfolio</span>
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <FeedbackButton
              projectId={project.id}
              projectName={project.name}
            />
            <Badge variant="outline" className={statusColors[project.status]}>
              {project.status.toLowerCase().replace("_", " ")}
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Project Title & Developer */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            {project.description && (
              <p className="text-zinc-400 mt-1 max-w-2xl">{project.description}</p>
            )}
          </div>
          <PresenceIndicator
            userId={project.developer.id}
            size="md"
            showDetails={true}
          />
        </div>

        {/* Stats Overview */}
        <StaggeredList className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StaggeredItem>
            <StatCard title="Progress" value={`${project.stats.progress}%`} className={healthColor}>
              <Progress value={project.stats.progress} className="h-1.5 bg-zinc-800 mt-2" />
            </StatCard>
          </StaggeredItem>
          <StaggeredItem>
            <StatCard
              title="Sprint"
              value={
                project.stats.currentSprint
                  ? `${project.stats.currentSprint} of ${project.stats.totalSprints}`
                  : `${project.stats.completedSprints}/${project.stats.totalSprints}`
              }
            />
          </StaggeredItem>
          <StaggeredItem>
            <StatCard
              title="Timeline"
              value={project.health >= 80 ? "On Track" : project.health >= 50 ? "At Risk" : "Behind"}
              valueClass={healthColor}
            >
              {project.targetEndDate && (
                <p className="text-xs text-zinc-500 mt-1">
                  Due {format(new Date(project.targetEndDate), "MMM d")}
                </p>
              )}
            </StatCard>
          </StaggeredItem>
          <StaggeredItem>
            <StatCard
              title="Blockers"
              value={project.stats.blockerCount.toString()}
              valueClass={project.stats.blockerCount > 0 ? "text-yellow-400" : "text-zinc-400"}
            />
          </StaggeredItem>
        </StaggeredList>

        {/* Tabs Content */}
        <Tabs defaultValue="milestones" className="space-y-4">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            {project.stats.blockerCount > 0 && (
              <TabsTrigger value="blockers">
                Blockers
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-[10px]">
                  {project.stats.blockerCount}
                </Badge>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-4">
            {project.milestones.length === 0 ? (
              <FadeInUp>
                <EmptyState
                  icon={Rocket}
                  title="No milestones yet"
                  description="Milestones will appear here as they're defined"
                />
              </FadeInUp>
            ) : (
              <StaggeredList className="space-y-3" staggerDelay={0.08}>
                {project.milestones.map((milestone) => (
                  <StaggeredItem key={milestone.id}>
                    <MilestoneCard milestone={milestone} />
                  </StaggeredItem>
                ))}
              </StaggeredList>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            {project.activity.length === 0 ? (
              <FadeInUp>
                <EmptyState
                  icon={Activity}
                  title="No activity yet"
                  description="Recent updates will appear here"
                />
              </FadeInUp>
            ) : (
              <FadeInUp>
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-0 divide-y divide-zinc-800">
                    {project.activity.map((item) => (
                      <ActivityItem key={item.id} item={item} />
                    ))}
                  </CardContent>
                </Card>
              </FadeInUp>
            )}
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            <FadeInUp>
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-zinc-200">Project Discussion</CardTitle>
                  <p className="text-sm text-zinc-500">
                    Ask questions, provide feedback, or request changes
                  </p>
                </CardHeader>
                <CardContent>
                  <CommentThread
                    entityType="project"
                    entityId={project.id}
                    currentUserId={currentUserId}
                  />
                </CardContent>
              </Card>
            </FadeInUp>
          </TabsContent>

          {/* Blockers Tab */}
          <TabsContent value="blockers" className="space-y-4">
            <StaggeredList className="space-y-4" staggerDelay={0.1}>
              {project.blockers.map((blocker) => (
                <StaggeredItem key={blocker.id}>
                  <BlockerCard blocker={blocker} />
                </StaggeredItem>
              ))}
            </StaggeredList>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function StatCard({
  title,
  value,
  valueClass,
  className,
  children,
}: {
  title: string
  value: string
  valueClass?: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="pt-4">
        <p className="text-sm text-zinc-500">{title}</p>
        <p className={cn("text-2xl font-bold text-white mt-1", valueClass, className)}>{value}</p>
        {children}
      </CardContent>
    </Card>
  )
}

function MilestoneCard({ milestone }: { milestone: ProjectDetailProps["project"]["milestones"][0] }) {
  const Icon = milestoneIcons[milestone.status] || Circle
  const isCompleted = milestone.status === "COMPLETED"
  const isInProgress = milestone.status === "IN_PROGRESS"

  return (
    <Card className={cn("bg-zinc-900/50 border-zinc-800", isCompleted && "opacity-75")}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              isCompleted
                ? "bg-green-500/20 text-green-400"
                : isInProgress
                ? "bg-blue-500/20 text-blue-400"
                : "bg-zinc-800 text-zinc-400"
            )}
          >
            <Icon className={cn("w-4 h-4", isInProgress && "animate-spin")} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className={cn("text-base", isCompleted && "line-through text-zinc-500")}>
                {milestone.title}
              </CardTitle>
              <Badge variant="outline" className={statusColors[milestone.status]}>
                {milestone.status.toLowerCase().replace("_", " ")}
              </Badge>
            </div>
            {milestone.description && (
              <p className="text-sm text-zinc-500 mt-1">{milestone.description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pl-14">
        {/* Progress bar for in-progress milestones */}
        {isInProgress && (
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Progress</span>
              <span className="text-zinc-300">{milestone.progressPercent}%</span>
            </div>
            <Progress value={milestone.progressPercent} className="h-1.5 bg-zinc-800" />
          </div>
        )}

        <div className="flex items-center gap-4 text-xs">
          {milestone.dueDate && (
            <span className="flex items-center gap-1 text-zinc-500">
              <Calendar className="w-3 h-3" />
              {isCompleted
                ? `Completed ${format(new Date(milestone.completedAt!), "MMM d")}`
                : `Due ${format(new Date(milestone.dueDate), "MMM d")}`}
            </span>
          )}
          {milestone.demoUrl && (
            <a
              href={milestone.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#C9A84C] hover:text-[#C9A84C]/80"
            >
              <ExternalLink className="w-3 h-3" />
              View Demo
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ item }: { item: { id: string; type: string; title: string; occurredAt: Date } }) {
  const icons: Record<string, typeof Activity> = {
    TASK_COMPLETED: CheckCircle2,
    MILESTONE_REACHED: Rocket,
    BLOCKER_RESOLVED: AlertCircle,
    SPRINT_STARTED: Play,
  }
  const Icon = icons[item.type] || Activity

  return (
    <div className="flex items-start gap-3 p-4">
      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300">{item.title}</p>
        <p className="text-xs text-zinc-500 mt-1">
          {formatDistanceToNow(new Date(item.occurredAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  )
}

function BlockerCard({
  blocker,
}: {
  blocker: { id: string; title: string; description: string | null; waitingOn: string; createdAt: Date }
}) {
  return (
    <Card className="bg-yellow-500/5 border-yellow-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <CardTitle className="text-base text-yellow-200">{blocker.title}</CardTitle>
            {blocker.description && (
              <p className="text-sm text-yellow-200/70 mt-1">{blocker.description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pl-12">
        <div className="flex items-center gap-4 text-xs text-yellow-200/60">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            Waiting on: {blocker.waitingOn}
          </span>
          <span>•</span>
          <span>
            {formatDistanceToNow(new Date(blocker.createdAt), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Activity
  title: string
  description: string
}) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-6 h-6 text-zinc-600" />
        </div>
        <p className="text-zinc-400">{title}</p>
        <p className="text-sm text-zinc-600 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
