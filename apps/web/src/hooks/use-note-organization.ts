"use client"

import { useToast } from "./use-toast"
import { useRouter } from "next/navigation"

interface OrganizationResult {
  success: boolean
  folderId?: string
  folderName?: string
  folderSlug?: string
  confidence?: number
  reasoning?: string
  autoMoved?: boolean
  error?: string
}

export function useNoteOrganization() {
  const { addToast } = useToast()
  const router = useRouter()

  const organizeNote = async (noteId: string, noteTitle: string) => {
    try {
      const response = await fetch("/api/notes/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to organize")
      }

      const result: OrganizationResult = await response.json()

      if (!result.folderName) {
        throw new Error("No folder suggestion returned")
      }

      // Show appropriate toast based on confidence
      if (result.autoMoved) {
        // High confidence - auto-moved, just show success
        addToast({
          variant: "success",
          title: `Organized → ${result.folderName}`,
          description: `"${truncate(noteTitle, 40)}"`,
          duration: 3000,
        })
      } else {
        // Low confidence - show confirmation toast
        addToast({
          variant: "info",
          title: `Organized → ${result.folderName}`,
          description: `"${truncate(noteTitle, 40)}" — AI confidence: ${result.confidence}%`,
          duration: 8000,
          action: {
            label: "Confirm",
            onClick: () => confirmOrganization(noteId),
          },
          secondaryAction: {
            label: "Edit",
            onClick: () => router.push(`/notes?editFolder=${noteId}`),
          },
        })
      }

      router.refresh()
      return result
    } catch (error) {
      addToast({
        variant: "error",
        title: "Organization failed",
        description: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  const confirmOrganization = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      })

      if (!response.ok) {
        throw new Error("Failed to confirm")
      }

      addToast({
        variant: "success",
        title: "Organization confirmed",
        duration: 2000,
      })

      router.refresh()
    } catch (error) {
      addToast({
        variant: "error",
        title: "Failed to confirm",
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const moveToFolder = async (
    noteId: string,
    folderId: string,
    wasAiSuggestion = false
  ) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/folder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId, wasAiSuggestion }),
      })

      if (!response.ok) {
        throw new Error("Failed to move note")
      }

      const result = await response.json()

      addToast({
        variant: "success",
        title: `Moved to ${result.folder.name}`,
        duration: 2000,
      })

      router.refresh()
      return result
    } catch (error) {
      addToast({
        variant: "error",
        title: "Failed to move note",
        description: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  return {
    organizeNote,
    confirmOrganization,
    moveToFolder,
  }
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + "..."
}
