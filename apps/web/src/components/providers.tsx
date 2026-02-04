"use client"

import * as React from "react"
import { ToastProvider } from "@/hooks/use-toast"
import { Toaster } from "@/components/nerve/toaster"
import { CommandPaletteProvider } from "@/components/command-palette"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CommandPaletteProvider>
        {children}
      </CommandPaletteProvider>
      <Toaster />
    </ToastProvider>
  )
}
