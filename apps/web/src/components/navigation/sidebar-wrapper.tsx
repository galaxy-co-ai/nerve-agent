"use client"

import { useEffect, useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  // Clear any existing cookie preference on first load
  useEffect(() => {
    document.cookie = "sidebar_state=false; path=/; max-age=604800"
  }, [])

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      {children}
    </SidebarProvider>
  )
}
