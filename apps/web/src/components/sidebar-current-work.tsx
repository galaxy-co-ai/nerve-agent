"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { CheckCircle2, MoreHorizontal, Clock, ExternalLink, Loader2 } from "lucide-react"
import { completeTask } from "@/lib/actions/tasks"
import { useTimer } from "@/components/timer-provider"

type Task = {
  id: string
  title: string
  sprint: {
    number: number
    project: {
      id: string
      name: string
      slug: string
    }
  }
}

interface SidebarCurrentWorkProps {
  tasks: Task[]
}

export function SidebarCurrentWork({ tasks }: SidebarCurrentWorkProps) {
  const router = useRouter()
  const { timerState, startTimer } = useTimer()
  const [isPending, startTransition] = useTransition()
  const [completingId, setCompletingId] = useState<string | null>(null)

  if (tasks.length === 0) {
    return null
  }

  const handleComplete = async (taskId: string) => {
    setCompletingId(taskId)
    startTransition(async () => {
      try {
        await completeTask(taskId)
        router.refresh()
      } catch (error) {
        console.error("Failed to complete task:", error)
      } finally {
        setCompletingId(null)
      }
    })
  }

  const handleStartTimer = (task: Task) => {
    startTimer({
      projectId: task.sprint.project.id,
      projectName: task.sprint.project.name,
      taskId: task.id,
      taskTitle: task.title,
    })
  }

  // Don't show if timer is already running (SidebarTimer handles that case)
  if (timerState.isRunning) {
    return null
  }

  return (
    <SidebarGroup className="py-0">
      <SidebarGroupLabel className="text-xs">Working On</SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="space-y-1 px-2">
          {tasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className="rounded-md border border-border/50 bg-muted/30 p-2 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate leading-tight">{task.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {task.sprint.project.name}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => handleComplete(task.id)}
                      disabled={isPending && completingId === task.id}
                    >
                      {isPending && completingId === task.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Mark Complete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStartTimer(task)}>
                      <Clock className="mr-2 h-4 w-4" />
                      Start Timer
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/projects/${task.sprint.project.slug}/sprints/${task.sprint.number}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Sprint
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {tasks.length > 3 && (
            <p className="text-xs text-muted-foreground text-center py-1">
              +{tasks.length - 3} more
            </p>
          )}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
