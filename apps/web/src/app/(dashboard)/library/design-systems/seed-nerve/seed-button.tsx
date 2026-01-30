"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface SeedNerveButtonProps {
  action: () => Promise<void>
}

export function SeedNerveButton({ action }: SeedNerveButtonProps) {
  const [pending, setPending] = useState(false)

  async function handleClick() {
    setPending(true)
    try {
      await action()
    } catch (error) {
      console.error("Failed to seed NERVE:", error)
      setPending(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={pending} className="w-full">
      <Sparkles className="mr-2 h-4 w-4" />
      {pending ? "Creating NERVE..." : "Create NERVE Design System"}
    </Button>
  )
}
