"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useNoteOrganization } from "@/hooks/use-note-organization"
import { Loader2 } from "lucide-react"

interface FolderPickerModalProps {
  folders: { id: string; name: string; slug: string }[]
}

export function FolderPickerModal({ folders }: FolderPickerModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { moveToFolder } = useNoteOrganization()

  const editFolderNoteId = searchParams.get("editFolder")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Open modal when editFolder param is present
  useEffect(() => {
    if (editFolderNoteId) {
      setIsOpen(true)
      setSelectedFolderId("")
    }
  }, [editFolderNoteId])

  const handleClose = () => {
    setIsOpen(false)
    // Remove the query param
    const params = new URLSearchParams(searchParams.toString())
    params.delete("editFolder")
    const newUrl = params.toString() ? `/notes?${params.toString()}` : "/notes"
    router.replace(newUrl)
  }

  const handleSubmit = async () => {
    if (!editFolderNoteId || !selectedFolderId) return

    setIsSubmitting(true)
    try {
      await moveToFolder(editFolderNoteId, selectedFolderId, true)
      handleClose()
    } catch (error) {
      console.error("Failed to move note:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!editFolderNoteId) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Folder</DialogTitle>
          <DialogDescription>
            Select a folder to move this note to. This helps the AI learn your preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a folder..." />
            </SelectTrigger>
            <SelectContent>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFolderId || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Moving...
              </>
            ) : (
              "Move Note"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
