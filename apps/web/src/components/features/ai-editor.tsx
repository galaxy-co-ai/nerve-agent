"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sparkles,
  Wand2,
  ListTree,
  Expand,
  FileText,
  RefreshCw,
  Loader2,
  Check,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

type WritingAction = "continue" | "brainstorm" | "expand" | "summarize" | "rewrite"

interface AIEditorProps {
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  context?: {
    title?: string
    projectName?: string
  }
}

const aiActions: { action: WritingAction; label: string; description: string; icon: typeof Sparkles }[] = [
  { action: "continue", label: "Continue writing", description: "AI continues your text", icon: Wand2 },
  { action: "brainstorm", label: "Brainstorm ideas", description: "Generate related ideas", icon: ListTree },
  { action: "expand", label: "Expand selection", description: "Add more detail", icon: Expand },
  { action: "summarize", label: "Summarize", description: "Condense to key points", icon: FileText },
  { action: "rewrite", label: "Rewrite", description: "Improve clarity", icon: RefreshCw },
]

export function AIEditor({
  id,
  name,
  value,
  onChange,
  placeholder,
  className,
  context,
}: AIEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [commandOpen, setCommandOpen] = useState(false)
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)

  // Get current selection
  const getSelection = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return null

    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    if (start === end) return null
    return {
      text: value.slice(start, end),
      start,
      end,
    }
  }, [value])

  // Handle AI action
  const handleAIAction = useCallback(async (action: WritingAction) => {
    setCommandOpen(false)
    setIsLoading(true)

    const selection = getSelection()

    try {
      const response = await fetch("/api/ai/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          content: value,
          selection: selection?.text,
          context,
        }),
      })

      if (!response.ok) throw new Error("AI request failed")

      const data = await response.json()
      const result = data.result

      if (action === "continue") {
        // Append to end
        setAiSuggestion(result)
        setSelectionRange({ start: value.length, end: value.length })
      } else if (selection) {
        // Replace selection with AI result
        setAiSuggestion(result)
        setSelectionRange({ start: selection.start, end: selection.end })
      } else {
        // No selection - show as suggestion at cursor
        const cursorPos = textareaRef.current?.selectionStart || value.length
        setAiSuggestion(result)
        setSelectionRange({ start: cursorPos, end: cursorPos })
      }
    } catch (error) {
      console.error("AI action failed:", error)
    } finally {
      setIsLoading(false)
    }
  }, [value, context, getSelection])

  // Accept AI suggestion
  const acceptSuggestion = useCallback(() => {
    if (!aiSuggestion || !selectionRange) return

    const before = value.slice(0, selectionRange.start)
    const after = value.slice(selectionRange.end)

    // Add space if needed
    const needsSpace = before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n") && !aiSuggestion.startsWith(" ")
    const newValue = before + (needsSpace ? " " : "") + aiSuggestion + after

    onChange(newValue)
    setAiSuggestion(null)
    setSelectionRange(null)

    // Focus textarea
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }, [aiSuggestion, selectionRange, value, onChange])

  // Reject AI suggestion
  const rejectSuggestion = useCallback(() => {
    setAiSuggestion(null)
    setSelectionRange(null)
    textareaRef.current?.focus()
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle when textarea is focused or AI suggestion is showing
      if (document.activeElement !== textareaRef.current && !aiSuggestion) return

      // Tab to continue writing (when at end of content)
      if (e.key === "Tab" && !e.shiftKey && !aiSuggestion) {
        const textarea = textareaRef.current
        if (textarea && textarea.selectionStart === textarea.selectionEnd) {
          // Only trigger at end of line or content
          const cursorPos = textarea.selectionStart
          const isAtEnd = cursorPos === value.length
          const isAtLineEnd = value[cursorPos] === "\n" || cursorPos === value.length

          if (isAtEnd || isAtLineEnd) {
            e.preventDefault()
            handleAIAction("continue")
          }
        }
      }

      // Cmd/Ctrl + / to open AI command palette
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen(true)
      }

      // Enter to accept, Escape to reject
      if (aiSuggestion) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          acceptSuggestion()
        }
        if (e.key === "Escape") {
          e.preventDefault()
          rejectSuggestion()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [value, aiSuggestion, handleAIAction, acceptSuggestion, rejectSuggestion])

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("min-h-[400px] font-mono pr-12", className)}
      />

      {/* AI Trigger Button */}
      <Popover open={commandOpen} onOpenChange={setCommandOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="end">
          <Command>
            <CommandInput placeholder="AI assist..." />
            <CommandList>
              <CommandEmpty>No action found.</CommandEmpty>
              <CommandGroup heading="AI Actions">
                {aiActions.map((item) => (
                  <CommandItem
                    key={item.action}
                    value={item.action}
                    onSelect={() => handleAIAction(item.action)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{item.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* AI Suggestion Preview */}
      {aiSuggestion && (
        <div className="absolute inset-x-0 bottom-0 bg-background border-t border-border p-4 rounded-b-md">
          <div className="flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-2">AI Suggestion</p>
              <div className="text-sm bg-muted/50 p-3 rounded-md max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                {aiSuggestion}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Button
                  type="button"
                  size="sm"
                  onClick={acceptSuggestion}
                  className="gap-1"
                >
                  <Check className="h-3 w-3" />
                  Accept
                  <kbd className="ml-1 px-1 py-0.5 text-[10px] bg-primary-foreground/20 rounded">
                    Enter
                  </kbd>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={rejectSuggestion}
                  className="gap-1"
                >
                  <X className="h-3 w-3" />
                  Dismiss
                  <kbd className="ml-1 px-1 py-0.5 text-[10px] bg-muted rounded">
                    Esc
                  </kbd>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hints */}
      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
        <span>
          <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Tab</kbd> to continue
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Cmd+/</kbd> AI assist
        </span>
        <span>Use [[Note Title]] to link notes</span>
      </div>
    </div>
  )
}
