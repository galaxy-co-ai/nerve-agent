"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Star, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toggleLibraryItemFavorite, deleteLibraryItem } from "@/lib/actions/library"
import { CopyCodeButton } from "@/components/copy-code-button"
import { LibraryItemType } from "@prisma/client"

interface LibraryItemActionsProps {
  item: {
    id: string
    title: string
    code: string
    type: LibraryItemType
    isFavorite: boolean
  }
}

export function LibraryItemActions({ item }: LibraryItemActionsProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleToggleFavorite() {
    await toggleLibraryItemFavorite(item.id)
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteLibraryItem(item.id)
      router.push(`/library/${item.type.toLowerCase()}s`)
    } catch (error) {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <CopyCodeButton code={item.code} itemId={item.id} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleToggleFavorite}>
              <Star className={`mr-2 h-4 w-4 ${item.isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
              {item.isFavorite ? "Remove from favorites" : "Add to favorites"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/library/${item.id}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{item.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this item from your library. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
