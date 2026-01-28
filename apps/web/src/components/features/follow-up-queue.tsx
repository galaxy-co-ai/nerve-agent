"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Check, X, Clock, Phone, FolderKanban, MessageSquare } from "lucide-react"
import { format, isPast, isToday, isTomorrow } from "date-fns"
import { acceptFollowUp, dismissFollowUp, completeFollowUp, updateFollowUpDueDate } from "@/lib/actions/follow-ups"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface FollowUp {
  id: string
  title: string
  description: string | null
  sourceType: "CALL" | "MANUAL" | "AI_SUGGESTED"
  sourceQuote: string | null
  dueDate: Date | null
  status: "SUGGESTED" | "SCHEDULED" | "PENDING" | "COMPLETED" | "DISMISSED"
  createdAt: Date
  project: { id: string; name: string; slug: string }
  call: { id: string; title: string } | null
}

interface FollowUpQueueProps {
  followUps: FollowUp[]
  showCompleted?: boolean
}

function getDueDateBadge(dueDate: Date | null) {
  if (!dueDate) return null

  if (isPast(dueDate) && !isToday(dueDate)) {
    return <Badge variant="destructive">Overdue</Badge>
  }
  if (isToday(dueDate)) {
    return <Badge variant="default">Today</Badge>
  }
  if (isTomorrow(dueDate)) {
    return <Badge variant="secondary">Tomorrow</Badge>
  }
  return null
}

function getStatusColor(status: FollowUp["status"]) {
  switch (status) {
    case "SUGGESTED":
      return "bg-yellow-500/10 text-yellow-500"
    case "SCHEDULED":
      return "bg-blue-500/10 text-blue-500"
    case "PENDING":
      return "bg-orange-500/10 text-orange-500"
    case "COMPLETED":
      return "bg-green-500/10 text-green-500"
    case "DISMISSED":
      return "bg-muted text-muted-foreground"
  }
}

function FollowUpItem({ followUp, onAction }: { followUp: FollowUp; onAction: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleAccept = async (date?: Date) => {
    setIsLoading(true)
    try {
      await acceptFollowUp(followUp.id, date)
      setShowDatePicker(false)
      onAction()
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = async () => {
    setIsLoading(true)
    try {
      await dismissFollowUp(followUp.id)
      onAction()
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      await completeFollowUp(followUp.id)
      onAction()
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = async (date: Date | undefined) => {
    if (!date) return
    setIsLoading(true)
    try {
      await updateFollowUpDueDate(followUp.id, date)
      setShowDatePicker(false)
      onAction()
    } finally {
      setIsLoading(false)
    }
  }

  const isSuggested = followUp.status === "SUGGESTED"
  const isActive = followUp.status === "SCHEDULED" || followUp.status === "PENDING"

  return (
    <Card className={cn(
      "transition-colors",
      followUp.status === "DISMISSED" && "opacity-50"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1">{followUp.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <FolderKanban className="h-3 w-3" />
                {followUp.project.name}
              </span>
              {followUp.call && (
                <Link href={`/calls/${followUp.call.id}`} className="flex items-center gap-1 hover:underline">
                  <Phone className="h-3 w-3" />
                  {followUp.call.title}
                </Link>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getDueDateBadge(followUp.dueDate)}
            <Badge variant="outline" className={getStatusColor(followUp.status)}>
              {followUp.status.toLowerCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {followUp.description && (
          <p className="text-sm text-muted-foreground mb-3">{followUp.description}</p>
        )}

        {followUp.sourceQuote && (
          <div className="flex items-start gap-2 mb-3 text-sm italic text-muted-foreground bg-muted/50 p-2 rounded">
            <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="line-clamp-2">"{followUp.sourceQuote}"</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {followUp.dueDate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(followUp.dueDate, "MMM d, yyyy")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSuggested && (
              <>
                <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isLoading}>
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={followUp.dueDate || undefined}
                      onSelect={(date) => handleAccept(date)}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleAccept()}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}

            {isActive && (
              <>
                <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isLoading}>
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={followUp.dueDate || undefined}
                      onSelect={handleDateChange}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleComplete}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FollowUpQueue({ followUps, showCompleted = false }: FollowUpQueueProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAction = () => {
    setRefreshKey((k) => k + 1)
  }

  // Group follow-ups by status
  const suggested = followUps.filter((f) => f.status === "SUGGESTED")
  const active = followUps.filter((f) => f.status === "SCHEDULED" || f.status === "PENDING")
  const completed = followUps.filter((f) => f.status === "COMPLETED")
  const dismissed = followUps.filter((f) => f.status === "DISMISSED")

  if (followUps.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Check className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">All caught up!</h3>
          <p className="text-muted-foreground text-sm text-center max-w-sm">
            No follow-ups pending. Process more calls to extract action items.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Suggested */}
      {suggested.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            Suggested ({suggested.length})
          </h3>
          <div className="grid gap-3">
            {suggested.map((followUp) => (
              <FollowUpItem key={followUp.id} followUp={followUp} onAction={handleAction} />
            ))}
          </div>
        </div>
      )}

      {/* Active */}
      {active.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Active ({active.length})
          </h3>
          <div className="grid gap-3">
            {active.map((followUp) => (
              <FollowUpItem key={followUp.id} followUp={followUp} onAction={handleAction} />
            ))}
          </div>
        </div>
      )}

      {/* Completed (if showing) */}
      {showCompleted && completed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Completed ({completed.length})
          </h3>
          <div className="grid gap-3 opacity-75">
            {completed.map((followUp) => (
              <FollowUpItem key={followUp.id} followUp={followUp} onAction={handleAction} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
