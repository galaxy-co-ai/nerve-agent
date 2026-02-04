"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSidebar } from "@/components/ui/sidebar"

const NERVE = {
  housing: "#1c1c1f",
  surface: "#141416",
  edgeLight: "rgba(255,255,255,0.08)",
  gold: "#C9A84C",
  goldSubtle: "rgba(201,168,76,0.2)",
  textPrimary: "#F0F0F2",
  textSecondary: "#A0A0A8",
  textMuted: "#68687A",
  orange: "#f97316",
  orangeSubtle: "rgba(249,115,22,0.2)",
}

const VIEW_MODE_KEY = "nerve-view-mode"

export function ViewModeToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const [viewMode, setViewMode] = useState<"admin" | "member">("admin")

  // Load view mode from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY)
    if (saved === "member") {
      setViewMode("member")
    }
  }, [])

  const toggleViewMode = () => {
    const newMode = viewMode === "admin" ? "member" : "admin"
    setViewMode(newMode)
    localStorage.setItem(VIEW_MODE_KEY, newMode)

    // Navigate to appropriate portal
    if (newMode === "member") {
      router.push("/client")
    } else {
      // If currently on client portal, go back to dev dashboard
      if (pathname.startsWith("/client")) {
        router.push("/dev/dashboard")
      }
    }
  }

  const isMemberMode = viewMode === "member"

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleViewMode}
            className="h-8 w-8 mx-auto"
            style={{
              background: isMemberMode ? NERVE.orangeSubtle : NERVE.surface,
              border: `1px solid ${isMemberMode ? NERVE.orange : NERVE.edgeLight}`,
            }}
          >
            {isMemberMode ? (
              <Eye className="h-4 w-4" style={{ color: NERVE.orange }} />
            ) : (
              <EyeOff className="h-4 w-4" style={{ color: NERVE.textMuted }} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {isMemberMode ? "Exit Member View" : "View as Member"}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Button
      variant="ghost"
      onClick={toggleViewMode}
      className="w-full justify-start gap-2 h-9 px-3"
      style={{
        background: isMemberMode ? NERVE.orangeSubtle : NERVE.surface,
        border: `1px solid ${isMemberMode ? NERVE.orange : NERVE.edgeLight}`,
        color: isMemberMode ? NERVE.orange : NERVE.textSecondary,
      }}
    >
      {isMemberMode ? (
        <>
          <Eye className="h-4 w-4" />
          <span className="text-xs font-medium">Member View</span>
          <span
            className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: NERVE.orange,
              color: "#000",
              fontWeight: 600,
            }}
          >
            ON
          </span>
        </>
      ) : (
        <>
          <EyeOff className="h-4 w-4" />
          <span className="text-xs">View as Member</span>
        </>
      )}
    </Button>
  )
}
