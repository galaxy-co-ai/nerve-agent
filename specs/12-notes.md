# Notes & Writing Studio

## Overview

An always-accessible text editor with built-in AI writing assistant. Brainstorm ideas, draft documents, and build a linked knowledge library that auto-organizes and maintains context across everything you write.

## Philosophy

- **Always one shortcut away** — Cmd+Shift+N from anywhere
- **AI-native writing** — Not bolted on, built in
- **Auto-organization** — Tags and links generated, not manual
- **Connected knowledge** — Everything links to everything relevant

---

## Core Features

### Quick Access

```
Cmd+Shift+N — NEW NOTE (from anywhere in app)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│ ▌                                                               │
│                                                                  │
│                                                                  │
│                                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Start typing or press Tab for AI assist...

Recent: Project ideas • Meeting notes • Quick thoughts
```

### Editor Interface

```
NOTES                                              Untitled Note
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─ LIBRARY ─────────┐  ┌─ EDITOR ─────────────────────────────────┐
│                   │  │                                          │
│ 📁 Projects       │  │  # Results Roofing Ideas                 │
│   └ Results ideas │  │                                          │
│   └ Galaxy notes  │  │  ## Dashboard Features                   │
│                   │  │                                          │
│ 📁 Meetings       │  │  - Real-time project status              │
│   └ Jan 27 call   │  │  - Customer notification system          │
│   └ Jan 20 review │  │  - Payment milestone tracking            │
│                   │  │                                          │
│ 📁 Brainstorms    │  │  ## Questions for Tareq                  │
│   └ Feature ideas │  │                                          │
│   └ Tech research │  │  - Preferred notification frequency?     │
│                   │  │  - Integration with existing CRM?        │
│ 📁 Quick Notes    │  │                                          │
│   └ Today         │  │  ---                                     │
│   └ Yesterday     │  │                                          │
│                   │  │  [[Call Brief - Jan 27]] mentioned       │
│ ─────────────────│  │  wanting "instant visibility"            │
│ 🏷️ Tags          │  │                                          │
│   #results (5)    │  │                                          │
│   #ideas (12)     │  │                                          │
│   #meeting (8)    │  │                                          │
│                   │  ├──────────────────────────────────────────┤
└───────────────────┘  │ AI: Tab to brainstorm • Cmd+/ for assist │
                       └──────────────────────────────────────────┘
```

---

## AI Writing Assistant

### Inline AI Commands

```
AI ASSIST — Available Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tab                 Continue writing / complete thought
Cmd+/              Open AI command palette
Cmd+Shift+B        Brainstorm from selection
Cmd+Shift+E        Expand selection into more detail
Cmd+Shift+S        Summarize selection
Cmd+Shift+R        Rewrite / improve selection
Cmd+Shift+T        Auto-generate tags for note
```

### Brainstorm Mode

```
BRAINSTORM MODE                                    Results Roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Starting point:
┌─────────────────────────────────────────────────────────────────┐
│ Customer dashboard for roofing company                          │
└─────────────────────────────────────────────────────────────────┘

AI SUGGESTIONS
──────────────────────────────────────────────────────────────────

Feature Ideas:
• Real-time project timeline with photo updates
• Weather delay notifications and rescheduling
• Material delivery tracking
• Crew assignment visibility
• Payment milestone progress bar
• Document storage (permits, warranties)
• Review/testimonial request after completion

Technical Considerations:
• Mobile-first for field crews
• Offline support for job sites
• Push notifications for status changes
• Integration with weather APIs

Questions to Explore:
• How do customers currently check project status?
• What's the most common support call about?
• Do they want customer-to-crew messaging?

[Insert All]  [Pick Items]  [Refine Direction]
```

### Continue Writing

```
You're typing:
──────────────────────────────────────────────────────────────────
The dashboard should show customers their project status in
real-time. Key features include|

[Tab to continue]

AI continues:
──────────────────────────────────────────────────────────────────
The dashboard should show customers their project status in
real-time. Key features include:

1. **Project Timeline** — Visual progress through each phase
   (inspection, materials, installation, cleanup, final walkthrough)

2. **Photo Updates** — Crew uploads daily progress photos that
   customers can view without calling

3. **Weather Alerts** — Automatic notifications when weather
   may impact the schedule

4. **Payment Tracker** — Clear view of deposit paid, amount due,
   and payment schedule

[Accept]  [Regenerate]  [Undo]
```

### Rewrite/Improve

```
IMPROVE SELECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Original:
"we need to make sure customers can see their stuff without
calling us all the time"

Style: [Professional ▾]

Improved:
"Customers should have self-service visibility into their project
status, reducing support calls while improving satisfaction."

[Accept]  [Try Different Style]  [Keep Original]
```

---

## Auto-Tagging

### Automatic Tag Generation

```
AUTO-TAG ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Note: "Results Roofing Ideas"

Suggested Tags:
☑️ #results-roofing     (project detected)
☑️ #ideas               (content type)
☑️ #dashboard           (topic detected)
☑️ #features            (content type)
☐ #customer-portal      (related topic)

Auto-apply tags? [Yes, always]  [Yes, this time]  [Review each]
```

### Tag Intelligence

```typescript
interface NoteTag {
  id: string
  name: string
  color: string
  autoApplyRules: TagRule[]
  noteCount: number
}

interface TagRule {
  type: "PROJECT" | "KEYWORD" | "CONTENT_TYPE" | "CUSTOM"
  pattern: string           // regex or keyword
  confidence: number        // 0-1, threshold for auto-apply
}
```

### Tag Browser

```
TAG BROWSER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECTS
──────────────────────────────────────────────────────────────────
#results-roofing     ████████████████████    12 notes
#galaxy-co           ████████████            8 notes
#quickclaims         ████                    3 notes

CONTENT TYPES
──────────────────────────────────────────────────────────────────
#ideas               ████████████████████████  18 notes
#meeting-notes       ██████████████████        14 notes
#research            ████████████              9 notes
#draft               ██████                    5 notes

TOPICS
──────────────────────────────────────────────────────────────────
#dashboard           ████████████              8 notes
#integrations        ██████████                7 notes
#pricing             ██████                    5 notes
#ux                  ████                      3 notes

Click tag to filter • Cmd+click to multi-select
```

---

## Linking & Context

### Wiki-Style Links

```
LINKING SYNTAX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[[Note Title]]           Link to another note
[[Note Title|Display]]   Link with custom display text
[[#tag]]                 Link to tag
@project                 Link to project
@sprint                  Link to sprint

Examples:
──────────────────────────────────────────────────────────────────
As discussed in [[Call Brief - Jan 27]], the customer wants
instant visibility. See [[Dashboard Features]] for the full spec.

Related to @results-roofing Sprint 2 work.
```

### Auto-Suggested Links

```
SUGGESTED LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on this note's content, you might want to link:

RELATED NOTES
──────────────────────────────────────────────────────────────────
📄 Call Brief - Jan 27
   Mentions: "customer dashboard", "real-time status"
   [Insert Link]

📄 Technical Discovery - Results Roofing
   Mentions: "Supabase", "real-time updates"
   [Insert Link]

RELATED PROJECT ITEMS
──────────────────────────────────────────────────────────────────
📋 Sprint 2: Dashboard components
   [Insert Reference]

💬 Decision: Real-time updates via Supabase
   [Insert Reference]
```

### Backlinks View

```
BACKLINKS — Dashboard Features
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5 notes link to this note:

📄 Results Roofing Ideas
   "...see [[Dashboard Features]] for the full spec..."

📄 Call Brief - Jan 27
   "...dashboard requirements detailed in [[Dashboard Features]]..."

📄 Sprint 2 Planning
   "...implementing items from [[Dashboard Features]]..."

📄 Technical Research
   "...compare to [[Dashboard Features]] requirements..."

📄 Client Questions
   "...clarify items in [[Dashboard Features]]..."
```

### Context Graph

```
CONTEXT GRAPH — Results Roofing Ideas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    ┌─────────────────┐
                    │ Call Brief      │
                    │ Jan 27          │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Results Ideas   │ │ Dashboard       │ │ Tech Discovery  │
│ (this note)     │◄│ Features        │►│                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Sprint 2        │
                    │ Planning        │
                    └─────────────────┘

[Open Graph View]
```

---

## Library Organization

### Auto-Organization

```
LIBRARY ORGANIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Organization Mode:
● Smart (AI-organized based on content)
○ Manual (you organize everything)
○ Hybrid (AI suggests, you approve)

AUTO-ORGANIZATION RULES
──────────────────────────────────────────────────────────────────
☑️ Group by project when project tag detected
☑️ Create "Meetings" folder for notes with #meeting tag
☑️ Create "Quick Notes" for short notes (<100 words)
☑️ Archive notes not accessed in 90 days
☑️ Suggest merging similar notes

FOLDER STRUCTURE
──────────────────────────────────────────────────────────────────
📁 Projects/
   └─ {auto-created per project}
📁 Meetings/
   └─ {auto-sorted by date}
📁 Brainstorms/
   └─ {auto-sorted by topic}
📁 Quick Notes/
   └─ {recent at top}
📁 Archive/
   └─ {old notes, searchable}
```

### Smart Search

```
SEARCH NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│ customer dashboard features                                      │
└─────────────────────────────────────────────────────────────────┘

RESULTS (semantic + keyword)
──────────────────────────────────────────────────────────────────

📄 Dashboard Features                              98% match
   "Customer-facing dashboard with real-time status..."
   #results-roofing #features

📄 Results Roofing Ideas                           92% match
   "Dashboard should show customers their project..."
   #results-roofing #ideas

📄 Call Brief - Jan 27                             85% match
   "...wants instant visibility into project status..."
   #results-roofing #meeting

📄 Galaxy Co Portal Notes                          67% match
   "Similar dashboard requirements for client portal..."
   #galaxy-co #features
```

---

## Note Types

### Quick Note

```
QUICK NOTE                                         Cmd+Shift+N
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│ Remember to ask Tareq about the CRM API rate limits             │
└─────────────────────────────────────────────────────────────────┘

Auto-tagged: #results-roofing #question #api
Auto-filed: Quick Notes / Today

[Save]  [Expand to Full Note]  [Convert to Task]
```

### Meeting Note

```
NEW MEETING NOTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Meeting: [Sprint 2 Review                         ]
Date:    [January 28, 2026    ]
Project: [Results Roofing ▾   ]

TEMPLATE
──────────────────────────────────────────────────────────────────
## Attendees
-

## Agenda
-

## Discussion
-

## Decisions
-

## Action Items
- [ ]

## Next Steps
-

[Create Note]
```

### Linked to Project Items

```
CREATE NOTE FROM...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

○ Blank note
○ Quick note
● From project item...

SELECT PROJECT ITEM
──────────────────────────────────────────────────────────────────
📋 Task: Scope tracker view
💬 Decision: Real-time updates via Supabase
📞 Call Brief: Jan 27, 2026
📄 Planning Doc: Technical Discovery

Selected: Task - Scope tracker view

Note will be auto-linked and tagged with:
• @results-roofing
• #sprint-2
• [[Scope tracker view]]
```

---

## Data Model

```typescript
interface Note {
  id: string
  title: string
  content: string              // Markdown
  contentPlain: string         // For search
  folder: NoteFolder
  tags: NoteTag[]
  links: NoteLink[]            // Outgoing links
  backlinks: NoteLink[]        // Incoming links
  project?: Project
  linkedItems: LinkedItem[]    // Tasks, decisions, etc.
  createdAt: Date
  updatedAt: Date
  accessedAt: Date
  wordCount: number
  isArchived: boolean
}

interface NoteLink {
  fromNote: Note
  toNote: Note
  context: string              // Surrounding text
}

interface NoteFolder {
  id: string
  name: string
  parent?: NoteFolder
  isAutoGenerated: boolean
  sortOrder: number
}
```

---

## Integrations

### Call Intelligence
- Call briefs become linked notes
- Decisions and action items linkable

### Sprint Stack
- Notes can link to tasks
- Task notes visible in sprint view

### Daily Driver
- Quick note from anywhere
- Recent notes accessible

### Vault
- Code notes can link to Vault blocks
- Research notes inform Vault patterns
