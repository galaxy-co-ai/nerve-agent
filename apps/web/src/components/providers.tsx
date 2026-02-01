"use client"

import * as React from "react"
import { ToastProvider } from "@/hooks/use-toast"
import { Toaster } from "@/components/nerve/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Toaster />
    </ToastProvider>
  )
}
