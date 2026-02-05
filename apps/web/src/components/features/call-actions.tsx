"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MoreHorizontal,
  Share2,
  Copy,
  Trash2,
  ExternalLink,
  Check,
  Loader2,
} from "lucide-react"
import { toggleBriefShared, deleteCall } from "@/lib/actions/calls"

interface CallActionsProps {
  callId: string
  briefShared: boolean
  briefToken: string | null
}

export function CallActions({ callId, briefShared, briefToken }: CallActionsProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentBriefShared, setCurrentBriefShared] = useState(briefShared)
  const [currentBriefToken, setCurrentBriefToken] = useState(briefToken)

  const shareUrl = currentBriefToken
    ? `${window.location.origin}/portal/brief/${currentBriefToken}`
    : null

  async function handleToggleShare() {
    setIsToggling(true)
    try {
      const result = await toggleBriefShared(callId)
      setCurrentBriefShared(result.briefShared)
      if (result.briefToken) {
        setCurrentBriefToken(result.briefToken)
      }
    } finally {
      setIsToggling(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteCall(callId)
    } catch {
      setIsDeleting(false)
    }
  }

  async function handleCopyLink() {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setIsShareDialogOpen(true)}>
          <Share2 className="mr-2 h-4 w-4" />
          {currentBriefShared ? "Sharing" : "Share Brief"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Call
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Call Brief</DialogTitle>
            <DialogDescription>
              Share a clean, professional brief with your client
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  {currentBriefShared
                    ? "Brief is visible to anyone with the link"
                    : "Brief is private"}
                </p>
              </div>
              <Button
                variant={currentBriefShared ? "destructive" : "default"}
                onClick={handleToggleShare}
                disabled={isToggling}
              >
                {isToggling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : currentBriefShared ? (
                  "Stop Sharing"
                ) : (
                  "Enable Sharing"
                )}
              </Button>
            </div>

            {currentBriefShared && shareUrl && (
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={handleCopyLink}>
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(shareUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Call</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this call? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
