"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  label?: string
  className?: string
  iconOnly?: boolean
}

export function CopyButton({ text, label, className, iconOnly }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (iconOnly) {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          "p-1 rounded bg-background/80 hover:bg-background transition-colors",
          className
        )}
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3 text-muted-foreground" />
        )}
      </button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={className}
    >
      {copied ? (
        <>
          <Check className="mr-2 h-3 w-3 text-green-500" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="mr-2 h-3 w-3" />
          {label || "Copy"}
        </>
      )}
    </Button>
  )
}
