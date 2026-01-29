"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Calendar, AlertTriangle, Users, Clock, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface SmartChip {
  id: string
  label: string
  icon: React.ReactNode
  prompt: string
}

const smartChips: SmartChip[] = [
  {
    id: "deadlines",
    label: "By deadlines",
    icon: <Calendar className="h-3.5 w-3.5" />,
    prompt: "Plan my focus based on upcoming deadlines and due dates",
  },
  {
    id: "blocked",
    label: "Unblock first",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    prompt: "Focus on resolving blockers and unblocking progress",
  },
  {
    id: "client",
    label: "Client priorities",
    icon: <Users className="h-3.5 w-3.5" />,
    prompt: "Prioritize tasks that clients are waiting on",
  },
  {
    id: "quick-wins",
    label: "Quick wins",
    icon: <Clock className="h-3.5 w-3.5" />,
    prompt: "Start with small tasks I can complete quickly for momentum",
  },
]

interface FocusPlan {
  summary: string
  tasks: Array<{
    title: string
    reason: string
    estimatedTime?: string
  }>
}

export function AiFocusWizard() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedChip, setSelectedChip] = useState<string | null>(null)
  const [focusPlan, setFocusPlan] = useState<FocusPlan | null>(null)

  const handleChipClick = async (chip: SmartChip) => {
    setSelectedChip(chip.id)
    setIsGenerating(true)
    setFocusPlan(null)

    try {
      const response = await fetch("/api/ai/focus-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: chip.prompt,
          chipId: chip.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate focus plan")
      }

      const data = await response.json()
      setFocusPlan(data)
    } catch (error) {
      console.error("Focus plan error:", error)
      setFocusPlan({
        summary: "Unable to generate a focus plan right now. Please try again.",
        tasks: [],
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setSelectedChip(null)
    setFocusPlan(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <CardTitle>Today's Focus</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!focusPlan ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Let AI help you plan your focus for today
            </p>
            <div className="flex flex-wrap gap-2">
              {smartChips.map((chip) => (
                <Button
                  key={chip.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleChipClick(chip)}
                  disabled={isGenerating}
                  className={cn(
                    "gap-1.5 transition-all",
                    selectedChip === chip.id && "border-primary bg-primary/10"
                  )}
                >
                  {isGenerating && selectedChip === chip.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    chip.icon
                  )}
                  {chip.label}
                </Button>
              ))}
            </div>
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 animate-pulse text-yellow-500" />
                <span>Analyzing your projects and tasks...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-muted-foreground">{focusPlan.summary}</p>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Reset
              </Button>
            </div>
            <div className="space-y-3">
              {focusPlan.tasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">{task.reason}</div>
                  </div>
                  {task.estimatedTime && (
                    <div className="text-xs text-muted-foreground shrink-0">
                      {task.estimatedTime}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
