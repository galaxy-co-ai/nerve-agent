"use client"

import Link from "next/link"
import { AlertCircle, Clock, Target, TrendingUp, Bell, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Insight {
  type: "warning" | "info" | "success" | "action"
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

interface DashboardInsightsProps {
  inProgressTaskCount: number
  activeBlockers: number
  overdueBlockers: { id: string; description: string; projectName: string }[]
  totalMinutesToday: number
  dailyTarget?: number // in minutes, default 8 hours = 480
  completedToday: number
}

export function DashboardInsights({
  inProgressTaskCount,
  activeBlockers,
  overdueBlockers,
  totalMinutesToday,
  dailyTarget = 480,
  completedToday,
}: DashboardInsightsProps) {
  const insights: Insight[] = []

  // Warning: Multiple tasks in progress
  if (inProgressTaskCount > 1) {
    insights.push({
      type: "warning",
      icon: <Target className="h-4 w-4" />,
      title: "Multiple tasks in progress",
      description: `You have ${inProgressTaskCount} tasks marked as in-progress. Focus on one to make faster progress.`,
      action: {
        label: "View tasks",
        href: "/sprints?status=in-progress",
      },
    })
  }

  // Action: Old blockers that may need follow-up
  if (overdueBlockers.length > 0) {
    const first = overdueBlockers[0]
    const desc = first.description || first.projectName
    insights.push({
      type: "action",
      icon: <Bell className="h-4 w-4" />,
      title: "Old blocker needs attention",
      description: `"${desc.slice(0, 50)}${desc.length > 50 ? "..." : ""}" on ${first.projectName}`,
      action: {
        label: "View blockers",
        href: "/dashboard/blockers",
      },
    })
  }

  // Info: Time tracking status
  const percentOfTarget = Math.round((totalMinutesToday / dailyTarget) * 100)
  const hoursTracked = Math.floor(totalMinutesToday / 60)
  const minsTracked = totalMinutesToday % 60
  const targetHours = Math.floor(dailyTarget / 60)

  if (totalMinutesToday === 0) {
    insights.push({
      type: "info",
      icon: <Clock className="h-4 w-4" />,
      title: "No time tracked today",
      description: "Start a timer or log time to track your progress.",
      action: {
        label: "Log time",
        href: "/time",
      },
    })
  } else if (percentOfTarget < 50 && new Date().getHours() >= 14) {
    insights.push({
      type: "info",
      icon: <Clock className="h-4 w-4" />,
      title: `${hoursTracked}h ${minsTracked}m tracked`,
      description: `You're at ${percentOfTarget}% of your ${targetHours}h daily target.`,
    })
  } else if (percentOfTarget >= 100) {
    insights.push({
      type: "success",
      icon: <TrendingUp className="h-4 w-4" />,
      title: "Daily target reached!",
      description: `You've tracked ${hoursTracked}h ${minsTracked}m today. Great work!`,
    })
  }

  // Success: Productive day
  if (completedToday >= 3) {
    insights.push({
      type: "success",
      icon: <Zap className="h-4 w-4" />,
      title: "Productive day!",
      description: `You've completed ${completedToday} tasks today. Keep the momentum!`,
    })
  }

  // Don't show if no insights
  if (insights.length === 0) {
    return null
  }

  // Only show top 2 most important insights
  const topInsights = insights.slice(0, 2)

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {topInsights.map((insight, index) => (
        <div
          key={index}
          className={`flex items-start gap-3 rounded-lg border p-3 ${
            insight.type === "warning"
              ? "border-yellow-500/30 bg-yellow-500/5"
              : insight.type === "action"
              ? "border-orange-500/30 bg-orange-500/5"
              : insight.type === "success"
              ? "border-green-500/30 bg-green-500/5"
              : "border-blue-500/30 bg-blue-500/5"
          }`}
        >
          <div
            className={`mt-0.5 ${
              insight.type === "warning"
                ? "text-yellow-500"
                : insight.type === "action"
                ? "text-orange-500"
                : insight.type === "success"
                ? "text-green-500"
                : "text-blue-500"
            }`}
          >
            {insight.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{insight.title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{insight.description}</p>
          </div>
          {insight.action && (
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link href={insight.action.href}>{insight.action.label}</Link>
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
