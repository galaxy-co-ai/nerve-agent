"use client"

import { useState, useEffect, useCallback } from "react"
import {
  NerveDialog,
  NerveDialogContent,
  NerveDialogHeader,
  NerveDialogTitle,
  NerveDialogDescription,
  NerveDialogFooter,
  NerveDialogTrigger,
  NerveButton,
  NerveBadge,
} from "@/components/nerve"
import { Monitor, RefreshCw, Download, CheckCircle2, XCircle } from "lucide-react"

// =============================================================================
// Types
// =============================================================================

interface PairingCode {
  code: string
  expiresAt: string
  expiresIn: number
}

type PairingStatus = "idle" | "loading" | "code" | "success" | "error"

// =============================================================================
// Component
// =============================================================================

interface DesktopPairingDialogProps {
  onPairingSuccess?: () => void
  children?: React.ReactNode
}

export function DesktopPairingDialog({
  onPairingSuccess,
  children,
}: DesktopPairingDialogProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<PairingStatus>("idle")
  const [pairingCode, setPairingCode] = useState<PairingCode | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Generate a new pairing code
  const generateCode = useCallback(async () => {
    setStatus("loading")
    setError(null)

    try {
      const response = await fetch("/api/desktop/pair", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to generate pairing code")
      }

      const data: PairingCode = await response.json()
      setPairingCode(data)
      setTimeRemaining(data.expiresIn)
      setStatus("code")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setStatus("error")
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (status !== "code" || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setStatus("idle")
          setPairingCode(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [status, timeRemaining])

  // Generate code when dialog opens
  useEffect(() => {
    if (open && status === "idle") {
      generateCode()
    }
  }, [open, status, generateCode])

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset after animation completes
      setTimeout(() => {
        setStatus("idle")
        setPairingCode(null)
        setError(null)
      }, 200)
    }
  }

  // Format time remaining as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Format code as XXX-XXX for readability
  const formatCode = (code: string): string => {
    return `${code.slice(0, 3)}-${code.slice(3)}`
  }

  return (
    <NerveDialog open={open} onOpenChange={handleOpenChange}>
      <NerveDialogTrigger asChild>
        {children ?? (
          <NerveButton variant="outline">
            <Monitor className="h-4 w-4 mr-2" />
            Connect Desktop App
          </NerveButton>
        )}
      </NerveDialogTrigger>

      <NerveDialogContent className="sm:max-w-md">
        <NerveDialogHeader>
          <NerveDialogTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Connect Desktop App
          </NerveDialogTitle>
          <NerveDialogDescription>
            Enter this code in your NERVE desktop app to pair it with your account.
          </NerveDialogDescription>
        </NerveDialogHeader>

        <div className="py-8">
          {/* Loading State */}
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-zinc-500" />
              </div>
              <p className="text-sm text-zinc-400">Generating pairing code...</p>
            </div>
          )}

          {/* Code Display State */}
          {status === "code" && pairingCode && (
            <div className="flex flex-col items-center gap-6">
              {/* Large 6-digit code */}
              <div className="relative">
                {/* Glow effect behind */}
                <div className="absolute inset-0 blur-xl bg-[var(--nerve-gold-400)]/20 rounded-2xl" />

                {/* Code display */}
                <div className="relative px-8 py-6 rounded-2xl bg-zinc-800/80 border border-[var(--nerve-gold-500)]/30 backdrop-blur-sm">
                  <div className="font-mono text-5xl font-bold tracking-[0.3em] text-[var(--nerve-gold-400)] select-all">
                    {formatCode(pairingCode.code)}
                  </div>
                </div>
              </div>

              {/* Countdown timer */}
              <div className="flex items-center gap-2">
                <NerveBadge
                  variant={timeRemaining <= 60 ? "warning" : "primary"}
                  dot
                >
                  Expires in {formatTime(timeRemaining)}
                </NerveBadge>
              </div>

              {/* Instructions */}
              <div className="text-center space-y-1">
                <p className="text-sm text-zinc-300">
                  Open the NERVE desktop app and enter this code
                </p>
                <p className="text-xs text-zinc-500">
                  The code will expire in 5 minutes
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-[var(--nerve-success)]/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-[var(--nerve-success)]" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-zinc-100">
                  Successfully Paired!
                </p>
                <p className="text-sm text-zinc-400 mt-1">
                  Your desktop app is now connected
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-[var(--nerve-error)]/10 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-[var(--nerve-error)]" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-zinc-100">
                  Something went wrong
                </p>
                <p className="text-sm text-zinc-400 mt-1">
                  {error || "Failed to generate pairing code"}
                </p>
              </div>
              <NerveButton variant="secondary" onClick={generateCode}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </NerveButton>
            </div>
          )}

          {/* Idle/Expired State */}
          {status === "idle" && !pairingCode && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-zinc-400">
                Code expired. Generate a new one to continue.
              </p>
              <NerveButton variant="secondary" onClick={generateCode}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New Code
              </NerveButton>
            </div>
          )}
        </div>

        <NerveDialogFooter className="flex-col sm:flex-col gap-3">
          {/* Download link */}
          <div className="w-full flex justify-center">
            <a
              href="https://github.com/galaxy-co-ai/nerve-agent-desktop/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-[var(--nerve-gold-400)] transition-colors"
            >
              <Download className="h-4 w-4" />
              Download desktop app
            </a>
          </div>
        </NerveDialogFooter>
      </NerveDialogContent>
    </NerveDialog>
  )
}
