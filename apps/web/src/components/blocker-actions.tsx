"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  CheckCircle2,
  MessageSquare,
} from "lucide-react"
import { resolveBlocker, deleteBlocker, recordFollowUp } from "@/lib/actions/blockers"

interface BlockerActionsProps {
  blockerId: string
}

export function BlockerActions({ blockerId }: BlockerActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <form action={recordFollowUp.bind(null, blockerId)}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full cursor-pointer">
              <MessageSquare className="mr-2 h-4 w-4" />
              Record Follow-up
            </button>
          </DropdownMenuItem>
        </form>
        <form action={resolveBlocker.bind(null, blockerId)}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full cursor-pointer">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Resolved
            </button>
          </DropdownMenuItem>
        </form>
        <DropdownMenuSeparator />
        <form action={deleteBlocker.bind(null, blockerId)}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full cursor-pointer text-red-500">
              Delete
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
