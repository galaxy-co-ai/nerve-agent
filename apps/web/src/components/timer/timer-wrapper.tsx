"use client"

import { TimerProvider } from "@/components/timer/timer-provider"
import { ActiveTimer } from "@/components/timer/active-timer"
import { StartTimerDialog } from "@/components/dialogs/start-timer-dialog"

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
