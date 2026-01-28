"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { quickCreateTimeEntry } from "@/lib/actions/time"

type TimerState = {
  isRunning: boolean
  startedAt: number | null
  projectId: string | null
  projectName: string | null
  taskId: string | null
  taskTitle: string | null
  description: string | null
}

type TimerContextType = {
  timerState: TimerState
  elapsedSeconds: number
  startTimer: (data: {
    projectId: string
    projectName: string
    taskId?: string | null
    taskTitle?: string | null
    description?: string | null
  }) => void
  stopTimer: () => Promise<void>
  discardTimer: () => void
  isPending: boolean
}

const defaultState: TimerState = {
  isRunning: false,
  startedAt: null,
  projectId: null,
  projectName: null,
  taskId: null,
  taskTitle: null,
  description: null,
}

const STORAGE_KEY = "nerve-agent-timer"

const TimerContext = createContext<TimerContextType | null>(null)

export function useTimer() {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}

export function TimerProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [timerState, setTimerState] = useState<TimerState>(defaultState)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isPending, setIsPending] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TimerState
        if (parsed.isRunning && parsed.startedAt) {
          setTimerState(parsed)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (timerState.isRunning) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timerState))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [timerState])

  // Update elapsed time every second
  useEffect(() => {
    if (!timerState.isRunning || !timerState.startedAt) {
      setElapsedSeconds(0)
      return
    }

    const updateElapsed = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - timerState.startedAt!) / 1000)
      setElapsedSeconds(elapsed)
    }

    // Update immediately
    updateElapsed()

    // Then update every second
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [timerState.isRunning, timerState.startedAt])

  const startTimer = useCallback((data: {
    projectId: string
    projectName: string
    taskId?: string | null
    taskTitle?: string | null
    description?: string | null
  }) => {
    setTimerState({
      isRunning: true,
      startedAt: Date.now(),
      projectId: data.projectId,
      projectName: data.projectName,
      taskId: data.taskId || null,
      taskTitle: data.taskTitle || null,
      description: data.description || null,
    })
  }, [])

  const stopTimer = useCallback(async () => {
    if (!timerState.isRunning || !timerState.startedAt || !timerState.projectId) {
      return
    }

    setIsPending(true)
    try {
      const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60))

      await quickCreateTimeEntry({
        projectId: timerState.projectId,
        taskId: timerState.taskId,
        durationMinutes,
        description: timerState.description,
      })

      setTimerState(defaultState)
      router.refresh()
    } catch (error) {
      console.error("Failed to save time entry:", error)
    } finally {
      setIsPending(false)
    }
  }, [timerState, elapsedSeconds, router])

  const discardTimer = useCallback(() => {
    setTimerState(defaultState)
  }, [])

  return (
    <TimerContext.Provider
      value={{
        timerState,
        elapsedSeconds,
        startTimer,
        stopTimer,
        discardTimer,
        isPending,
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}
