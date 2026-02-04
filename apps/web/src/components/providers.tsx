"use client"

import * as React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { ToastProvider } from "@/hooks/use-toast"
import { Toaster } from "@/components/nerve/toaster"
import { CommandPaletteProvider } from "@/components/command-palette"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#f97316", // nerve orange
          colorBackground: "#0a0a0a",
          colorInputBackground: "#141414",
          colorInputText: "#fafafa",
        },
      }}
    >
      <ToastProvider>
        <CommandPaletteProvider>
          {children}
        </CommandPaletteProvider>
        <Toaster />
      </ToastProvider>
    </ClerkProvider>
  )
}
