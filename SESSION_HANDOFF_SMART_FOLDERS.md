# Session Handoff: Smart Folders Sprint

**Date:** January 31, 2026
**Project:** nerve-agent (C:\Users\Owner\workspace\nerve-agent)
**Status:** Phase 1-3 COMPLETE, Phase 4-5 remaining

---

## What Was Built

### Smart Folders Feature
An AI-powered automatic note organization system for the Notes "second brain". Notes land in Inbox, AI analyzes content and moves them to the appropriate folder based on content type.

### Completed Phases

#### Phase 1: Foundation ✅
- Added `NoteFolder` model to Prisma schema
- Added `NoteFolderCorrection` model (tracks when users correct AI)
- Added folder fields to `Note` model: `folderId`, `aiConfidence`, `aiReasoning`, `wasManuallyMoved`
- Created 7 system folders that seed for every user:
  - Inbox (order: 0)
  - Ideas (order: 1)
  - Research (order: 2)
  - Decisions (order: 3)
  - Processes (order: 4)
  - Learnings (order: 5)
  - Archive (order: 99)

#### Phase 2: UI ✅
- Folder sidebar on `/notes` page (left side, 224px wide)
- Click folder to filter notes by that folder
- Note counts per folder
- "All Notes" option shows all notes regardless of folder

#### Phase 3: AI Organization ✅
- AI endpoint analyzes note content and suggests folder + confidence score
- Confidence >= 75%: Auto-moves note silently
- Confidence < 75%: Moves note but requires user confirmation
- Toast system created for showing confirmation prompts
- Note creation now defaults to Inbox folder

---

## What Remains (Phase 4-5)

### Phase 4: Toast & Confirmation Wiring
The toast system is built but NOT wired to the note save flow yet.

**TODO:**
1. **Wire toast to note composer** - After a note is saved, call the organize API and show the appropriate toast
2. **Folder selector in note edit** - Add a dropdown to manually select folder when editing a note
3. **"Edit" button behavior** - The toast has an "Edit" button that currently goes to `/notes?editFolder={noteId}` - this needs to open a folder selector modal or inline UI

**Key files to modify:**
- `src/components/features/note-composer.tsx` - Trigger organization after save
- `src/components/forms/edit-note-form.tsx` - Add folder selector dropdown
- `src/app/(dashboard)/notes/[slug]/page.tsx` - May need to handle `editFolder` param

### Phase 5: Polish
1. **Drag-and-drop** - Drag notes between folders in sidebar
2. **Custom folders** - "New Folder" button in sidebar (currently disabled)
3. **Folder reordering** - Drag to reorder folders
4. **Archive automation** - Auto-archive notes untouched for 90+ days

---

## File Locations

### Schema & Database
```
apps/web/prisma/schema.prisma     # NoteFolder, NoteFolderCorrection, Note updates
apps/web/src/lib/seed-folders.ts  # DEFAULT_NOTE_FOLDERS, seedNoteFoldersForUser()
apps/web/src/lib/db.ts            # Prisma client
```

### API Endpoints
```
apps/web/src/app/api/folders/route.ts           # GET (list), POST (create folder)
apps/web/src/app/api/notes/organize/route.ts    # POST - AI organization
apps/web/src/app/api/notes/[id]/folder/route.ts # PUT (move), POST (confirm)
apps/web/src/app/api/admin/backfill-folders/route.ts # One-time backfill
```

### UI Components
```
apps/web/src/app/(dashboard)/notes/page.tsx                    # Notes list with sidebar
apps/web/src/components/features/notes/folder-sidebar.tsx      # Folder sidebar component
apps/web/src/components/nerve/toaster.tsx                      # Toast renderer
apps/web/src/components/providers.tsx                          # ToastProvider wrapper
```

### Hooks
```
apps/web/src/hooks/use-toast.tsx              # Toast state management
apps/web/src/hooks/use-note-organization.ts   # organizeNote(), confirmOrganization(), moveToFolder()
```

### Server Actions
```
apps/web/src/lib/actions/notes.ts  # createNote, quickCreateNote, organizeNote (server action)
```

---

## How the AI Organization Works

### Flow
```
1. User saves note
2. Note goes to Inbox (folderId set to inbox folder)
3. Client calls POST /api/notes/organize with noteId
4. API:
   - Fetches note content
   - Calls Mistral (quick-generate task) with classification prompt
   - Parses JSON response: { folder, confidence, reasoning, tags }
   - If confidence >= 75: Updates note.folderId, returns autoMoved: true
   - If confidence < 75: Updates note.folderId, returns autoMoved: false
5. Client shows toast:
   - autoMoved=true: Success toast, auto-dismiss
   - autoMoved=false: Info toast with Confirm/Edit buttons, 8s duration
```

### AI Prompt (in /api/notes/organize/route.ts)
The system prompt tells Claude/Mistral to classify notes into folders based on content patterns:
- Ideas = speculative, brainstorms, "what if"
- Research = facts, references, documentation
- Decisions = trade-offs, "decided to", reasoning
- Processes = step-by-step, how-to, SOPs
- Learnings = reflections, lessons, retrospectives

### Confidence Threshold
- `>= 75`: High confidence, auto-move without interruption
- `< 75`: Low confidence, move but ask user to confirm

---

## Key Code Patterns

### Using the toast system
```tsx
"use client"
import { useToast } from "@/hooks/use-toast"

function MyComponent() {
  const { addToast } = useToast()

  const handleSomething = () => {
    addToast({
      variant: "success", // or "error", "warning", "info"
      title: "Note organized",
      description: "Moved to Ideas folder",
      duration: 3000, // ms, or 0 for persistent
      action: { label: "Undo", onClick: () => {} },
      secondaryAction: { label: "View", onClick: () => {} },
    })
  }
}
```

### Using the organization hook
```tsx
"use client"
import { useNoteOrganization } from "@/hooks/use-note-organization"

function NoteComposer() {
  const { organizeNote } = useNoteOrganization()

  const handleSave = async (noteId: string, title: string) => {
    // After saving note...
    await organizeNote(noteId, title)
    // Toast is shown automatically based on confidence
  }
}
```

### Folder API responses
```typescript
// GET /api/folders
[
  { id, name, slug, icon, color, isSystem, order, noteCount }
]

// POST /api/notes/organize
{
  folderId: string,
  folderName: string,
  folderSlug: string,
  confidence: number,      // 0-100
  reasoning: string,
  suggestedTags: string[],
  autoMoved: boolean,      // true if >= 75% confidence
  previousFolder: { id, name, slug } | null
}
```

---

## Commands

```bash
cd C:\Users\Owner\workspace\nerve-agent\apps\web

# Type check
npm run typecheck

# Dev server
npm run dev

# Full validation (typecheck + lint + build)
npm run validate

# Build only
npm run build
```

---

## Spec Document
Full feature spec is at: `specs/17-smart-folders.md`

---

## Gotchas / Notes

1. **Zod v4**: Uses `error.issues` not `error.errors`
2. **Server Actions can't use fetch to own API**: The `organizeNote` server action in notes.ts tries to call the API internally - this works in dev but may need adjustment for production
3. **Folder sidebar uses `useSearchParams`**: Wrapped in Suspense in the notes page
4. **Toast provider**: Added to root layout via `<Providers>` wrapper
5. **AI uses Mistral**: The "quick-generate" task routes to Mistral for speed/cost, not Claude

---

## Next Steps for New Session

1. **Find the note composer** - Search for where notes are created/saved
2. **Add organization trigger** - After save, call `organizeNote(noteId, title)`
3. **Add folder selector to edit form** - Dropdown with all folders
4. **Test the full flow** - Create note → AI organizes → Toast appears → Confirm/Edit works

The hardest part (AI classification, toast system, APIs) is done. What remains is wiring it together in the UI.
