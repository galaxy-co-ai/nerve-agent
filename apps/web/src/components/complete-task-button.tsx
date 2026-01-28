"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { completeTask } from "@/lib/actions/tasks"

interface CompleteTaskButtonProps {
  taskId: string
  onComplete?: () => void
}

export function CompleteTaskButton({ taskId, onComplete }: CompleteTaskButtonProps) {
  const [pending, setPending] = useState(false)

  async function handleComplete() {
    setPending(true)
    try {
      await completeTask(taskId)
      onComplete?.()
    } catch (error) {
      console.error("Failed to complete task:", error)
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="default"
      onClick={handleComplete}
      disabled={pending}
      className="bg-green-600 hover:bg-green-700"
    >
      <Check className="mr-2 h-4 w-4" />
      {pending ? "Completing..." : "Mark Complete"}
    </Button>
  )
}
