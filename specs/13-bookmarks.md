# Bookmarks (Link Library)

## Overview

A LinkWarden-style bookmark manager built into Nerve Agent. Save any URL, ever. Auto-organized, instantly searchable, and always accessible—without cluttering your browser toolbar.

## Philosophy

- **Save everything** — If it's useful once, it might be useful again
- **Zero organization effort** — AI categorizes and tags automatically
- **Find instantly** — Semantic search, not just keyword matching
- **Project context** — Links associated with relevant projects

---

## Quick Save

### Browser Extension

```
NERVE AGENT — SAVE LINK                    [Browser Extension]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│ 🔗 Tailwind CSS Documentation - Installation                    │
│    https://tailwindcss.com/docs/installation                    │
└─────────────────────────────────────────────────────────────────┘

Auto-detected:
  Category:   Documentation
  Tags:       #tailwind #css #frontend
  Project:    (none detected)

Add to project: [None ▾]
Add note:       [                                              ]

[Save]  [Save & Close]

Keyboard: Cmd+Shift+S to save current page
```

### In-App Quick Add

```
Cmd+Shift+L — ADD BOOKMARK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│ https://                                                         │
└─────────────────────────────────────────────────────────────────┘

Paste URL and press Enter to save

Recent saves:
• Supabase Realtime Docs (2 hours ago)
• Stripe Webhook Best Practices (yesterday)
• shadcn/ui Dialog Component (2 days ago)
```

---

## Bookmark Library

### Main View

```
BOOKMARKS                                              847 saved
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─ COLLECTIONS ─────┐  ┌─ BOOKMARKS ───────────────────────────────┐
│                   │  │                                            │
│ 📁 All Links      │  │  Search: [                              ]  │
│                   │  │                                            │
│ 📁 By Category    │  │  RECENTLY SAVED                           │
│   └ Documentation │  │  ──────────────────────────────────────── │
│   └ Tools         │  │                                            │
│   └ Articles      │  │  🔗 Supabase Realtime Docs                 │
│   └ Inspiration   │  │     supabase.com • Documentation           │
│   └ Resources     │  │     #supabase #realtime #database          │
│   └ Reference     │  │     2 hours ago                            │
│                   │  │                                            │
│ 📁 By Project     │  │  🔗 Stripe Webhook Best Practices          │
│   └ Results       │  │     stripe.com • Documentation             │
│   └ Galaxy Co     │  │     #stripe #webhooks #payments            │
│   └ QuickClaims   │  │     Yesterday                              │
│                   │  │                                            │
│ 📁 By Tag         │  │  🔗 shadcn/ui Dialog Component             │
│   └ #react (124)  │  │     ui.shadcn.com • Documentation          │
│   └ #api (89)     │  │     #shadcn #react #components             │
│   └ #design (67)  │  │     2 days ago • @results-roofing          │
│                   │  │                                            │
│ 📁 Reading List   │  │  🔗 Building a Design System               │
│ 📁 Archive        │  │     smashingmagazine.com • Article         │
│                   │  │     #design-system #frontend               │
└───────────────────┘  │     3 days ago                             │
                       │                                            │
                       │  [Load More...]                            │
                       └────────────────────────────────────────────┘
```

### Bookmark Detail

```
BOOKMARK DETAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Supabase Realtime Documentation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

URL:      https://supabase.com/docs/guides/realtime
Domain:   supabase.com
Saved:    January 28, 2026 at 2:34 PM

PREVIEW
──────────────────────────────────────────────────────────────────
[Screenshot/preview of the page]

METADATA
──────────────────────────────────────────────────────────────────
Category:    Documentation
Tags:        #supabase #realtime #database #websockets
Project:     Results Roofing

NOTES
──────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────┐
│ Using this for the customer dashboard real-time updates.        │
│ Key section: "Listening to changes"                             │
└─────────────────────────────────────────────────────────────────┘

RELATED BOOKMARKS
──────────────────────────────────────────────────────────────────
• Supabase Row Level Security
• Supabase Auth Documentation
• PostgreSQL LISTEN/NOTIFY

[Open Link]  [Copy URL]  [Edit]  [Archive]
```

---

## Auto-Organization

### Category Detection

```typescript
interface BookmarkCategory {
  id: string
  name: string
  icon: string
  rules: CategoryRule[]
  bookmarkCount: number
}

// Auto-detection rules
const categories = [
  {
    name: "Documentation",
    rules: [
      { domain: "*.docs.*" },
      { domain: "docs.*" },
      { path: "/docs/*" },
      { path: "/documentation/*" },
      { title: /docs|documentation|guide|reference/i }
    ]
  },
  {
    name: "Tools",
    rules: [
      { domain: "github.com" },
      { domain: "npmjs.com" },
      { domain: "vercel.com" },
      { title: /tool|utility|generator/i }
    ]
  },
  {
    name: "Articles",
    rules: [
      { domain: "medium.com" },
      { domain: "dev.to" },
      { domain: "*.substack.com" },
      { path: "/blog/*" },
      { path: "/article/*" }
    ]
  },
  {
    name: "Inspiration",
    rules: [
      { domain: "dribbble.com" },
      { domain: "behance.net" },
      { domain: "awwwards.com" },
      { domain: "pinterest.com" }
    ]
  }
]
```

### Auto-Tagging

```
AUTO-TAG ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

URL: https://supabase.com/docs/guides/realtime

Page Content Analysis:
──────────────────────────────────────────────────────────────────
Title:       "Realtime | Supabase Docs"
Description: "Send and receive messages with Supabase Realtime"
Keywords:    websockets, postgres, changes, broadcast

Suggested Tags:
──────────────────────────────────────────────────────────────────
☑️ #supabase       (domain detected)
☑️ #realtime       (title keyword)
☑️ #database       (content analysis)
☑️ #websockets     (content analysis)
☐ #postgres        (mentioned in content)

Project Association:
──────────────────────────────────────────────────────────────────
Detected: You're working on Results Roofing
This link mentions "realtime" which matches Sprint 2 tasks

Associate with Results Roofing? [Yes]  [No]
```

### Smart Collections

```
SMART COLLECTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Auto-generated collections based on your usage:

📁 Currently Relevant                               23 links
   Links related to active projects and sprints

📁 Frequently Accessed                              15 links
   Your most-visited saved links

📁 Recently Added                                   47 links
   Last 30 days

📁 Unread Articles                                  12 links
   Articles you saved but haven't opened

📁 Possibly Outdated                                 8 links
   Links that may have changed or broken
   [Check Links]
```

---

## Search

### Semantic Search

```
SEARCH BOOKMARKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│ how to handle real-time updates in react                        │
└─────────────────────────────────────────────────────────────────┘

RESULTS (semantic matching)
──────────────────────────────────────────────────────────────────

🔗 Supabase Realtime Docs                           95% match
   Real-time database subscriptions
   supabase.com • #supabase #realtime

🔗 React Query Real-Time Data                       89% match
   Keeping UI in sync with server
   tanstack.com • #react #react-query

🔗 Pusher Channels Tutorial                         82% match
   WebSocket connections for React apps
   pusher.com • #websockets #react

🔗 SWR - React Hooks for Data Fetching              75% match
   Revalidation and real-time updates
   swr.vercel.app • #react #data-fetching
```

### Filter Options

```
SEARCH FILTERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Category:   [All ▾]  [Documentation]  [Articles]  [Tools]
Project:    [All ▾]  [Results Roofing]  [Galaxy Co]
Tags:       [+ Add tag filter]
Date:       [Any time ▾]  [Last week]  [Last month]  [Last year]
Domain:     [                    ]
```

---

## Reading List

### Save for Later

```
READING LIST                                          12 unread
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UNREAD
──────────────────────────────────────────────────────────────────
○ Building a Design System from Scratch
  smashingmagazine.com • ~15 min read
  Saved 3 days ago

○ The Complete Guide to React Server Components
  vercel.com • ~25 min read
  Saved 1 week ago

○ Database Indexing Strategies
  planetscale.com • ~10 min read
  Saved 2 weeks ago

RECENTLY READ
──────────────────────────────────────────────────────────────────
✓ Understanding TypeScript Generics
  Read yesterday • Archived

✓ CSS Container Queries
  Read 3 days ago
```

### Reading Progress

```
ARTICLE: Building a Design System from Scratch
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[████████████░░░░░░░░░░░░░░░░░░░░]  35% read

Last position saved • Continue reading?

[Open Article]  [Mark as Read]  [Remove from List]
```

---

## Link Health

### Broken Link Detection

```
LINK HEALTH CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Last checked: Today at 6:00 AM

HEALTHY                                              842 links
REDIRECTED                                             3 links
BROKEN                                                 2 links

BROKEN LINKS
──────────────────────────────────────────────────────────────────
❌ Old React Hooks Tutorial
   reactjs.org/docs/hooks-intro (404 Not Found)
   Saved: 8 months ago
   [Find Alternative]  [Archive]  [Delete]

❌ Tailwind Plugin Documentation
   tailwindcss.com/plugins/forms (301 → 404)
   Saved: 6 months ago
   Suggested: tailwindcss.com/docs/plugins
   [Update URL]  [Archive]  [Delete]

REDIRECTED
──────────────────────────────────────────────────────────────────
↪️ Next.js Documentation
   Old: nextjs.org/docs → New: nextjs.org/docs/app
   [Update URL]  [Keep Both]
```

---

## Import/Export

### Import from Browser

```
IMPORT BOOKMARKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Import from:
○ Chrome bookmarks
○ Firefox bookmarks
○ Safari bookmarks
○ Bookmark HTML file
● Raindrop.io export
○ Pocket export
○ LinkWarden export

[Choose File]

IMPORT PREVIEW
──────────────────────────────────────────────────────────────────
Found 234 bookmarks

☑️ Import all
☐ Skip duplicates (23 found)
☑️ Auto-categorize on import
☑️ Auto-tag on import

[Import 234 Bookmarks]
```

### Export

```
EXPORT BOOKMARKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Export format:
● HTML (browser compatible)
○ JSON (full metadata)
○ CSV (spreadsheet)
○ Markdown (with notes)

Include:
☑️ All bookmarks (847)
☐ Specific collection: [Select...]
☐ Specific project: [Select...]
☐ Date range: [Select...]

[Export]
```

---

## Data Model

```typescript
interface Bookmark {
  id: string
  url: string
  title: string
  description?: string
  domain: string
  favicon?: string
  screenshot?: string
  category: BookmarkCategory
  tags: BookmarkTag[]
  project?: Project
  collection?: BookmarkCollection
  notes?: string
  isRead: boolean
  readProgress?: number
  lastAccessed?: Date
  lastHealthCheck: Date
  healthStatus: "HEALTHY" | "REDIRECTED" | "BROKEN"
  createdAt: Date
  archivedAt?: Date
}

interface BookmarkCollection {
  id: string
  name: string
  description?: string
  isSmartCollection: boolean
  smartRules?: CollectionRule[]
  bookmarkCount: number
}

interface BookmarkTag {
  id: string
  name: string
  isAutoGenerated: boolean
  bookmarkCount: number
}
```

---

## Integrations

### Notes
- Bookmarks can be linked in notes: `[[bookmark:supabase-realtime]]`
- Notes can reference bookmarks for research

### Vault
- Documentation links attached to code blocks
- Reference links for patterns

### Projects
- Project-specific bookmark collections
- Context-relevant links surfaced

### Browser Extension
- One-click save from any page
- Keyboard shortcut: Cmd+Shift+S
- Auto-detect current project context
