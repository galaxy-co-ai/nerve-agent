"use client"

import { TimerProvider } from "@/components/timer-provider"
import { ActiveTimer } from "@/components/active-timer"
import { StartTimerDialog } from "@/components/start-timer-dialog"

export function TimerWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TimerProvider>
      {children}
      <StartTimerDialog />
    </TimerProvider>
  )
}

export function TimerIndicator() {
  return <ActiveTimer />
}
