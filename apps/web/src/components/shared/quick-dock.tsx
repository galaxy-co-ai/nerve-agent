"use client"

import { useRouter } from "next/navigation"
import {
  FileText,
  Clock,
  CheckSquare,
  Phone,
  Code2,
  Sparkles,
} from "lucide-react"
import { FloatingDock, type DockAction } from "./floating-dock"

// ============================================
// CUSTOMIZE YOUR DOCK ACTIONS HERE
// ============================================
// Each action needs:
// - id: unique identifier
// - label: tooltip text shown on hover
// - icon: lucide icon or any React node
// - onClick: what happens when clicked
// ============================================

export function QuickDock() {
  const router = useRouter()

  // Define your dock actions here - easy to add/remove/reorder
  const actions: DockAction[] = [
    {
      id: "new-note",
      label: "New Note",
      icon: <FileText className="size-full" />,
      onClick: () => {
        // Trigger the quick note dialog via keyboard shortcut event
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "n", shiftKey: true, metaKey: true }))
      },
    },
    {
      id: "log-time",
      label: "Log Time",
      icon: <Clock className="size-full" />,
      onClick: () => {
        // Trigger the quick time dialog via keyboard shortcut event
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "t", shiftKey: true, metaKey: true }))
      },
    },
    {
      id: "add-task",
      label: "Add Task",
      icon: <CheckSquare className="size-full" />,
      onClick: () => router.push("/sprints"),
    },
    {
      id: "add-call",
      label: "Add Call",
      icon: <Phone className="size-full" />,
      onClick: () => router.push("/calls/new"),
    },
    {
      id: "library",
      label: "Library",
      icon: <Code2 className="size-full" />,
      onClick: () => router.push("/library"),
    },
    {
      id: "claude",
      label: "Ask Claude",
      icon: <Sparkles className="size-full" />,
      onClick: () => {
        // Toggle Claude chat - you can customize this
        const claudeButton = document.querySelector('[data-claude-toggle]') as HTMLButtonElement
        claudeButton?.click()
      },
    },
  ]

  return <FloatingDock actions={actions} />
}
