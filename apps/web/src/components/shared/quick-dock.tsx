"use client"

import { useRouter } from "next/navigation"
import {
  Plus,
  FileText,
  Lightbulb,
  Link2,
  FolderKanban,
  Phone,
  Code2,
  FileUp,
  Search,
  Sparkles,
} from "lucide-react"
import { FloatingDock, type DockItemConfig } from "./floating-dock"

// ============================================
// CUSTOMIZE YOUR DOCK HERE
// ============================================
// Regular actions: { id, label, icon, onClick }
// Expandable menus: { id, label, icon, items: [...] }
// ============================================

export function QuickDock() {
  const router = useRouter()

  const actions: DockItemConfig[] = [
    // ============================================
    // "+" CREATE MENU - expands upward
    // ============================================
    {
      id: "create",
      label: "Create",
      icon: <Plus className="size-full" />,
      items: [
        {
          id: "new-note",
          label: "New Note",
          icon: <FileText className="h-4 w-4" />,
          onClick: () => {
            window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "n", shiftKey: true, metaKey: true })
            )
          },
        },
        {
          id: "quick-idea",
          label: "Quick Idea",
          icon: <Lightbulb className="h-4 w-4" />,
          onClick: () => {
            // TODO: Quick idea capture (no tags, minimal friction)
            window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "n", shiftKey: true, metaKey: true })
            )
          },
        },
        {
          id: "save-url",
          label: "Save URL",
          icon: <Link2 className="h-4 w-4" />,
          onClick: () => {
            // TODO: Quick URL/bookmark capture
            router.push("/library")
          },
        },
        {
          id: "new-project",
          label: "New Project",
          icon: <FolderKanban className="h-4 w-4" />,
          onClick: () => router.push("/projects/new"),
        },
        {
          id: "add-call",
          label: "Call Transcript",
          icon: <Phone className="h-4 w-4" />,
          onClick: () => router.push("/calls/new"),
        },
        {
          id: "library-snippet",
          label: "Code Snippet",
          icon: <Code2 className="h-4 w-4" />,
          onClick: () => router.push("/library"),
        },
        {
          id: "upload-file",
          label: "Upload File",
          icon: <FileUp className="h-4 w-4" />,
          onClick: () => {
            // TODO: File upload flow
            router.push("/notes")
          },
        },
      ],
    },

    // ============================================
    // QUICK ACTIONS
    // ============================================
    {
      id: "search",
      label: "Search",
      icon: <Search className="size-full" />,
      onClick: () => {
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true })
        )
      },
    },
    {
      id: "claude",
      label: "AI Chat",
      icon: <Sparkles className="size-full" />,
      onClick: () => {
        const claudeButton = document.querySelector(
          "[data-claude-toggle]"
        ) as HTMLButtonElement
        claudeButton?.click()
      },
    },
  ]

  return <FloatingDock actions={actions} />
}
