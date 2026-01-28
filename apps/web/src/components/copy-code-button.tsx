"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { recordLibraryItemUsage } from "@/lib/actions/library"

interface CopyCodeButtonProps {
  code: string
  itemId: string
  size?: "default" | "sm"
}

export function CopyCodeButton({ code, itemId, size = "default" }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)

      // Record usage
      await recordLibraryItemUsage(itemId)

      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Button
      variant="ghost"
      size={size === "sm" ? "icon" : "sm"}
      onClick={handleCopy}
      className={size === "sm" ? "h-7 w-7" : "h-8"}
    >
      {copied ? (
        <Check className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      ) : (
        <Copy className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      )}
      {size !== "sm" && <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>}
    </Button>
  )
}
