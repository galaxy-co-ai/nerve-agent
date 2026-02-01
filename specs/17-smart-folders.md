# 17. Smart Folders — Automatic Note Organization

## Overview

Transform Notes into a self-organizing second brain. Every note lands in an Inbox, gets analyzed by AI, and is automatically filed into the appropriate folder. When the AI's confidence is below 75%, it shows a toast asking the user to confirm or edit.

**Philosophy:**
- Brain dump without organizing — the AI handles structure
- Opinionated but not overconfident — asks when uncertain
- Inbox zero for notes — nothing lingers unprocessed
- Knowledge compounds — cross-links and folders grow over time

---

## Folder Structure

Every user gets these **system folders** on first login (cannot be deleted):

| Folder | Purpose | Auto-sorted when... |
|--------|---------|---------------------|
| Inbox | Landing zone for new notes | Never (entry point) |
| Ideas | Raw concepts, brainstorms, "what if..." | Contains speculative language, questions, possibilities |
| Research | Things learned, articles, references | Contains facts, citations, external knowledge |
| Decisions | Reasoning behind choices | Contains "decided", "chose", trade-off language |
| Processes | How-to guides, SOPs, workflows | Contains steps, numbered lists, instructions |
| Learnings | Lessons from experience, retrospectives | Contains reflection, "learned", "mistake", "next time" |
| Archive | Stale/processed notes | Manual only, or notes untouched for 90+ days |

Users can also create **custom folders** for personal organization.

---

## User Flow

### 1. Note Creation
```
User writes note in composer
         ↓
Note saves to Inbox immediately
         ↓
AI analysis runs (background, <2s)
         ↓
   ┌─────┴─────┐
   │           │
≥75%        <75%
   │           │
   ↓           ↓
Silent      Toast with
move        confirmation
```

### 2. High Confidence (≥75%)
- Note moves to target folder automatically
- Small success indicator (checkmark animation)
- No interruption to user flow

### 3. Low Confidence (<75%)
- Note moves to AI's best guess folder
- Toast notification appears:

```
┌─────────────────────────────────────────────────────────────┐
│  ✨ Organized → Learnings                                   │
│  "API rate limiting gotchas"                                │
│                                                             │
│  AI confidence: 68% — want to adjust?                       │
│                                                             │
│  [Confirm]  [Edit]                                          │
└─────────────────────────────────────────────────────────────┘
```

**[Confirm]** — Dismisses toast, keeps AI's choice, improves future confidence
**[Edit]** — Opens note with folder selector highlighted

### 4. Manual Override
- User can always drag notes between folders
- User can set folder manually when creating/editing
- Manual choices train the AI for better future predictions

---

## AI Analysis

### Input
- Note title
- Note content (first 2000 chars)
- Existing tags (if any)
- User's folder history (what they've confirmed/edited)

### Output
```typescript
interface FolderSuggestion {
  folderId: string
  folderName: string
  confidence: number // 0-100
  reasoning: string  // For debugging/transparency
  suggestedTags?: string[]
  suggestedLinks?: string[] // [[wiki link]] suggestions
}
```

### Prompt Strategy
```
You are organizing a note into a personal knowledge base.

Available folders:
- Ideas: Raw concepts, brainstorms, speculative thoughts
- Research: Facts, references, external knowledge
- Decisions: Choices made and their reasoning
- Processes: Step-by-step guides, workflows, SOPs
- Learnings: Lessons from experience, reflections

Note title: {title}
Note content: {content}

Respond with:
1. folder: The best matching folder name
2. confidence: 0-100 how certain you are
3. reasoning: One sentence explaining why
4. tags: 1-3 relevant tags from [idea, task, reference, insight, decision]
```

---

## Data Model

### Schema Changes

```prisma
// New model
model NoteFolder {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name      String
  slug      String
  icon      String?  // Lucide icon name or emoji
  color     String?  // Hex color for UI accent

  isSystem  Boolean  @default(false) // System folders can't be deleted
  order     Int      @default(0)     // Display order in sidebar

  notes     Note[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, slug])
  @@index([userId])
}

// Updated Note model
model Note {
  // ... existing fields ...

  // New folder relationship
  folderId          String?
  folder            NoteFolder? @relation(fields: [folderId], references: [id], onDelete: SetNull)

  // AI organization metadata
  aiConfidence      Int?        // 0-100, null if manually organized
  aiReasoning       String?     // Why AI chose this folder
  wasManuallyMoved  Boolean     @default(false)

  @@index([folderId])
}

// Track user corrections to improve AI
model NoteFolderCorrection {
  id              String   @id @default(cuid())
  userId          String
  noteId          String

  fromFolderId    String
  toFolderId      String
  aiConfidence    Int      // What the AI's confidence was

  createdAt       DateTime @default(now())

  @@index([userId])
}
```

### Default Folders (seeded on user creation)

```typescript
const DEFAULT_FOLDERS = [
  { name: "Inbox", slug: "inbox", icon: "inbox", order: 0, isSystem: true },
  { name: "Ideas", slug: "ideas", icon: "lightbulb", order: 1, isSystem: true },
  { name: "Research", slug: "research", icon: "book-open", order: 2, isSystem: true },
  { name: "Decisions", slug: "decisions", icon: "scale", order: 3, isSystem: true },
  { name: "Processes", slug: "processes", icon: "list-checks", order: 4, isSystem: true },
  { name: "Learnings", slug: "learnings", icon: "graduation-cap", order: 5, isSystem: true },
  { name: "Archive", slug: "archive", icon: "archive", order: 99, isSystem: true },
]
```

---

## UI Components

### 1. Folder Sidebar (Notes Page)

```
┌──────────────────┐
│ FOLDERS          │
├──────────────────┤
│ 📥 Inbox      3  │  ← Count badge
│ 💡 Ideas     12  │
│ 📚 Research  28  │
│ ⚖️ Decisions  5  │
│ 📋 Processes  8  │
│ 🎓 Learnings 15  │
│ ─────────────────│
│ 📦 Archive   42  │  ← Visually separated
├──────────────────┤
│ + New Folder     │
└──────────────────┘
```

### 2. Organization Toast

```tsx
<Toast variant="info" duration={8000}>
  <div className="flex items-center gap-3">
    <Sparkles className="h-5 w-5 text-amber-400" />
    <div className="flex-1">
      <p className="font-medium">Organized → {folderName}</p>
      <p className="text-sm text-zinc-400 truncate">{noteTitle}</p>
      <p className="text-xs text-zinc-500 mt-1">
        AI confidence: {confidence}% — want to adjust?
      </p>
    </div>
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" onClick={onConfirm}>
        Confirm
      </Button>
      <Button size="sm" variant="outline" onClick={onEdit}>
        Edit
      </Button>
    </div>
  </div>
</Toast>
```

### 3. Folder Selector (Edit Mode)

```
┌─────────────────────────────────────┐
│ Move to folder                      │
├─────────────────────────────────────┤
│ ○ Inbox                             │
│ ● Ideas           ← AI suggested    │
│ ○ Research                          │
│ ○ Decisions                         │
│ ○ Processes                         │
│ ○ Learnings                         │
│ ○ Archive                           │
└─────────────────────────────────────┘
```

---

## API Endpoints

### POST /api/notes/organize
Trigger AI organization for a note.

```typescript
// Request
{ noteId: string }

// Response
{
  folderId: string
  folderName: string
  confidence: number
  reasoning: string
  suggestedTags: string[]
  moved: boolean // true if auto-moved (≥75%)
}
```

### POST /api/notes/confirm-organization
User confirms AI's folder choice.

```typescript
// Request
{ noteId: string }

// Response
{ success: true }
```

### POST /api/notes/move
User manually moves note to different folder.

```typescript
// Request
{
  noteId: string
  folderId: string
  wasAiSuggestion: boolean // Track if correcting AI
}

// Response
{ success: true }
```

### GET /api/folders
List user's folders with note counts.

```typescript
// Response
{
  folders: [
    { id, name, slug, icon, isSystem, noteCount }
  ]
}
```

---

## Implementation Phases

### Phase 1: Foundation (Day 1-2)
- [ ] Add NoteFolder and NoteFolderCorrection models to schema
- [ ] Create migration
- [ ] Seed default folders on user creation
- [ ] Backfill: Create folders for existing users
- [ ] Add folderId to Note model

### Phase 2: UI — Folder Sidebar (Day 2-3)
- [ ] Create FolderSidebar component
- [ ] Update Notes page layout (sidebar + content)
- [ ] Filter notes by folder
- [ ] Show note counts per folder
- [ ] Add "New Folder" functionality

### Phase 3: AI Organization (Day 3-4)
- [ ] Create /api/notes/organize endpoint
- [ ] Build AI prompt for folder classification
- [ ] Integrate with note save flow
- [ ] Handle confidence threshold logic

### Phase 4: Toast & Confirmation (Day 4-5)
- [ ] Create OrganizationToast component
- [ ] Wire up Confirm/Edit actions
- [ ] Track corrections in NoteFolderCorrection
- [ ] Manual folder selector in note edit

### Phase 5: Polish (Day 5)
- [ ] Drag-and-drop between folders
- [ ] Folder reordering
- [ ] Custom folder colors/icons
- [ ] Archive automation (90-day stale notes)

---

## Success Metrics

- **Inbox zero rate**: % of notes that leave Inbox within 24h
- **AI accuracy**: % of notes not manually moved after AI placement
- **Confirmation rate**: How often users confirm vs edit low-confidence suggestions
- **Folder usage**: Distribution across folders (healthy = spread, not all in one)

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Note has no content yet | Stay in Inbox, organize on next save |
| AI returns invalid folder | Default to Inbox, log error |
| User deletes custom folder | Move notes to Inbox |
| Very short note (<50 chars) | Lower confidence threshold, likely Inbox |
| Note already organized | Re-analyze only if content changed significantly |

---

## Future Enhancements

- **Smart Archive**: Auto-archive notes untouched for 90 days
- **Folder rules**: "Notes with tag X always go to folder Y"
- **Sub-folders**: Nested organization (if users request)
- **Bulk organize**: "Organize all Inbox notes" button
- **Confidence training**: Use corrections to fine-tune prompts per user
