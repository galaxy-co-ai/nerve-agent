"use client"

import { useState, useEffect } from "react"
import { Check, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TaskCompletionDialog } from "@/components/dialogs/task-completion-dialog"
import { getNextTaskInSprint } from "@/lib/actions/tasks"

interface Task {
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

interface CompleteTaskButtonProps {
  taskId: string
  task?: Task
  onComplete?: () => void
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export function CompleteTaskButton({
  taskId,
  task,
  onComplete,
  variant = "default",
  size = "sm",
}: CompleteTaskButtonProps) {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [nextTask, setNextTask] = useState<Task | null>(null)
  const [loadingNext, setLoadingNext] = useState(false)

  // Load next task when dialog opens
  useEffect(() => {
    if (showDialog && task) {
      setLoadingNext(true)
      getNextTaskInSprint(taskId)
        .then((next) => setNextTask(next))
        .finally(() => setLoadingNext(false))
    }
  }, [showDialog, taskId, task])

  // If we have full task info, use smart completion dialog
  if (task) {
    return (
      <>
        <Button
          size={size}
          variant={variant}
          onClick={() => setShowDialog(true)}
          className={variant === "default" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          <Check className="mr-2 h-4 w-4" />
          Mark Complete
        </Button>
        <TaskCompletionDialog
          task={task}
          open={showDialog}
          onOpenChange={(open) => {
            setShowDialog(open)
            if (!open) {
              onComplete?.()
            }
          }}
          nextTask={loadingNext ? null : nextTask}
        />
      </>
    )
  }

  // Fallback: simple completion (for backwards compatibility)
  const [pending, setPending] = useState(false)
  const { completeTask } = require("@/lib/actions/tasks")

  async function handleComplete() {
    setPending(true)
    try {
      await completeTask(taskId)
      onComplete?.()
      router.refresh()
    } catch (error) {
      console.error("Failed to complete task:", error)
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleComplete}
      disabled={pending}
      className={variant === "default" ? "bg-green-600 hover:bg-green-700" : ""}
    >
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Check className="mr-2 h-4 w-4" />
      )}
      {pending ? "Completing..." : "Mark Complete"}
    </Button>
  )
}
