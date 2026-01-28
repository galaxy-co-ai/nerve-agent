# The Vault

## Overview

The Vault is your personal knowledge base of reusable code. Every auth flow, payment integration, form pattern, and clever solution you've built—saved, organized, and ready to use again.

## Philosophy

- **Stop rewriting the same code** — You've built auth 20 times, save it once
- **Patterns over snippets** — Complete, working solutions, not fragments
- **Context matters** — Know when and why to use each block
- **Evolves with you** — Update blocks as you learn better approaches

---

## Vault Structure

### Categories

```
THE VAULT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BLOCKS                                                    47
Large, complete implementations
├── Authentication (8)
├── Payments (6)
├── File Upload (4)
├── Email (5)
├── API Patterns (12)
└── Database (12)

PATTERNS                                                  34
Smaller, reusable code patterns
├── Error Handling (6)
├── Loading States (4)
├── Optimistic UI (5)
├── Form Validation (8)
└── Data Fetching (11)

FEATURES                                                  12
Complete feature implementations
├── User Settings Page
├── Notification System
├── Search with Filters
└── ...

QUERIES                                                   28
Database queries and patterns
├── Pagination
├── Full-text Search
├── Aggregations
└── ...
```

---

## Blocks

### Block Structure

```typescript
interface VaultBlock {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  techStack: string[]          // ["Next.js", "Clerk", "Prisma"]
  files: VaultFile[]
  dependencies: string[]       // npm packages
  envVars: string[]           // Required env vars
  setupInstructions?: string
  usageNotes?: string
  relatedBlocks: VaultBlock[]
  timesUsed: number
  lastUsed?: Date
  createdAt: Date
  updatedAt: Date
}

interface VaultFile {
  path: string                 // "src/lib/auth.ts"
  content: string
  language: string
}
```

### Block Detail View

```
BLOCK: Clerk Authentication
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Complete Clerk auth setup with middleware, protected routes,
and user sync to database.

TECH STACK
Next.js 15 • Clerk • Prisma • TypeScript

FILES (4)
──────────────────────────────────────────────────────────────────
□ middleware.ts              Auth middleware configuration
□ src/lib/auth.ts            Auth utilities and helpers
□ src/app/api/webhooks/      Clerk webhook for user sync
  clerk/route.ts
□ prisma/schema.prisma       User model (partial)

DEPENDENCIES
@clerk/nextjs ^4.29.0

ENV VARS REQUIRED
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET

──────────────────────────────────────────────────────────────────
Used 8 times • Last used: Jan 15, 2026

[Copy to Project]  [View Files]  [Edit Block]
```

### Adding a Block

```
ADD TO VAULT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: [Stripe Checkout Flow                        ]

Description:
┌─────────────────────────────────────────────────────────────────┐
│ Complete Stripe checkout with success/cancel handling,          │
│ webhook for payment confirmation, and order creation.           │
└─────────────────────────────────────────────────────────────────┘

Category: [Payments ▾]

Tech Stack: (select all that apply)
☑️ Next.js    ☑️ TypeScript    ☐ React Query
☑️ Stripe     ☑️ Prisma        ☐ tRPC

FILES
──────────────────────────────────────────────────────────────────
+ src/app/api/checkout/route.ts
+ src/app/api/webhooks/stripe/route.ts
+ src/lib/stripe.ts
+ src/components/checkout-button.tsx
[+ Add File]

[Save to Vault]
```

---

## Patterns

### Pattern Structure

Patterns are smaller, more focused than blocks:

```typescript
interface VaultPattern {
  id: string
  name: string
  description: string
  category: string
  code: string
  language: string
  usageExample: string
  notes?: string
  timesUsed: number
}
```

### Pattern Examples

```
PATTERN: Optimistic Update with Rollback
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React Query mutation with optimistic update and automatic
rollback on error.

──────────────────────────────────────────────────────────────────
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] })
    const previous = queryClient.getQueryData(['todos'])
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo])
    return { previous }
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})
──────────────────────────────────────────────────────────────────

Used 12 times • Last used: Yesterday

[Copy]  [View Full Example]
```

---

## Features

### Feature Structure

Features are complete, multi-file implementations:

```typescript
interface VaultFeature {
  id: string
  name: string
  description: string
  screenshot?: string
  techStack: string[]
  files: VaultFile[]
  dependencies: string[]
  envVars: string[]
  databaseChanges?: string    // Prisma schema additions
  setupSteps: string[]
  timesUsed: number
}
```

### Feature Example

```
FEATURE: Notification System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Complete notification system with:
• In-app notifications with bell icon
• Real-time updates via Pusher
• Mark as read/unread
• Notification preferences
• Email digest (optional)

[Screenshot of notification dropdown]

FILES (8)
──────────────────────────────────────────────────────────────────
Components
□ notification-bell.tsx
□ notification-list.tsx
□ notification-item.tsx
□ notification-preferences.tsx

API
□ api/notifications/route.ts
□ api/notifications/[id]/route.ts

Lib
□ lib/notifications.ts
□ lib/pusher.ts

DATABASE CHANGES
──────────────────────────────────────────────────────────────────
model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  message   String
  read      Boolean  @default(false)
  link      String?
  createdAt DateTime @default(now())
}

SETUP STEPS
──────────────────────────────────────────────────────────────────
1. Add Pusher credentials to .env
2. Run database migration
3. Add NotificationBell to your header
4. Configure notification triggers

[Install Feature]  [View All Files]
```

---

## Queries

### Query Library

```
QUERY LIBRARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAGINATION
──────────────────────────────────────────────────────────────────
Cursor-based Pagination (Prisma)
Offset Pagination with Count
Infinite Scroll Query

SEARCH
──────────────────────────────────────────────────────────────────
Full-text Search (PostgreSQL)
Fuzzy Search with pg_trgm
Search with Filters

AGGREGATIONS
──────────────────────────────────────────────────────────────────
Group by with Count
Date Range Aggregation
Running Totals

RELATIONSHIPS
──────────────────────────────────────────────────────────────────
Nested Include with Limits
Polymorphic Relations
Self-referencing Trees
```

### Query Detail

```
QUERY: Cursor-based Pagination
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Efficient pagination for large datasets using cursor.

──────────────────────────────────────────────────────────────────
async function getPaginatedItems(cursor?: string, limit = 20) {
  const items = await prisma.item.findMany({
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  const hasMore = items.length > limit
  const data = hasMore ? items.slice(0, -1) : items
  const nextCursor = hasMore ? data[data.length - 1].id : null

  return { data, nextCursor, hasMore }
}
──────────────────────────────────────────────────────────────────

USAGE WITH REACT QUERY
──────────────────────────────────────────────────────────────────
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['items'],
  queryFn: ({ pageParam }) => getItems(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
──────────────────────────────────────────────────────────────────

[Copy Query]  [Copy with React Query]
```

---

## Search & Discovery

### Search Interface

```
VAULT SEARCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│ stripe webhook                                                   │
└─────────────────────────────────────────────────────────────────┘

FILTERS
Type: [All ▾]  Tech: [All ▾]  Category: [All ▾]

RESULTS (4)
──────────────────────────────────────────────────────────────────

BLOCK — Stripe Checkout Flow                           Payments
Complete checkout with webhook handling
Next.js • Stripe • Prisma
Used 6 times

BLOCK — Stripe Subscription                            Payments
Subscription management with webhooks
Next.js • Stripe • Prisma
Used 3 times

PATTERN — Webhook Signature Verification              API Patterns
Verify Stripe webhook signatures
TypeScript
Used 8 times

QUERY — Payment History with Status                    Queries
Query payments with Stripe sync status
Prisma
Used 4 times
```

### AI-Assisted Search

```
ASK THE VAULT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│ How do I handle failed payments with retry logic?                │
└─────────────────────────────────────────────────────────────────┘

ANSWER
──────────────────────────────────────────────────────────────────
Based on your Vault, here's the recommended approach:

1. Use the "Stripe Subscription" block which includes webhook
   handling for payment_intent.payment_failed events.

2. Combine with the "Retry with Exponential Backoff" pattern
   for the retry logic.

3. The "Payment Status Query" can help you track failed payments.

RELEVANT ITEMS
• Block: Stripe Subscription [View →]
• Pattern: Retry with Exponential Backoff [View →]
• Query: Payment Status Query [View →]
```

---

## Using Vault Items

### Copy to Project

```
COPY TO PROJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Block: Clerk Authentication

Target Project: [Results Roofing ▾]

FILES TO COPY
──────────────────────────────────────────────────────────────────
☑️ middleware.ts              → middleware.ts
☑️ src/lib/auth.ts            → src/lib/auth.ts
☑️ src/app/api/webhooks/      → src/app/api/webhooks/
   clerk/route.ts                clerk/route.ts
☐ prisma/schema.prisma        (merge manually)

DEPENDENCIES TO INSTALL
──────────────────────────────────────────────────────────────────
npm install @clerk/nextjs

ENV VARS TO ADD
──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

[Copy Files]  [Copy & Install Deps]
```

### Agent Integration

Agents can pull from the Vault automatically:

```
AGENT: Set up Authentication
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Using Vault block: Clerk Authentication

This agent will:
✓ Copy auth files from Vault
✓ Install @clerk/nextjs
✓ Add env vars to Vercel
✓ Update Prisma schema with User model
✓ Run database migration

[Run Agent]
```

---

## Maintenance

### Updating Blocks

```
UPDATE BLOCK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Block: Clerk Authentication

This block was last updated 3 months ago.
@clerk/nextjs has a new major version (v5.0.0)

OPTIONS
○ Update from current project (Results Roofing)
○ Update manually
○ Keep current version

CHANGES DETECTED
──────────────────────────────────────────────────────────────────
- middleware.ts: Updated for Clerk v5 API changes
+ src/lib/auth.ts: Added new helper functions
~ prisma/schema.prisma: No changes

[Preview Changes]  [Update Block]
```

### Usage Analytics

```
VAULT ANALYTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MOST USED (Last 90 days)
──────────────────────────────────────────────────────────────────
1. Clerk Authentication                              12 uses
2. Stripe Checkout Flow                               8 uses
3. Optimistic Update Pattern                          7 uses
4. Cursor Pagination                                  6 uses
5. Error Boundary Component                           5 uses

NEVER USED
──────────────────────────────────────────────────────────────────
• Firebase Auth Block (created 6 months ago)
• GraphQL Subscription Pattern (created 4 months ago)

Consider archiving unused items? [Archive →]

RECENTLY ADDED
──────────────────────────────────────────────────────────────────
• Uploadthing Integration (2 days ago)
• React Email Templates (1 week ago)
```

---

## Data Model

See `data-models.md` for complete schema. Key entities:
- `VaultItem` (unified model for blocks, patterns, features, queries)
- `VaultFile`
- `VaultUsage`

---

## Integrations

### Sprint Stack
- Agent tasks can pull from Vault
- "Set up auth" task auto-suggests Vault blocks

### Agent Actions
- Agents use Vault as source of truth
- Code generation references Vault patterns

### Intelligence Layer
- "How did I implement X?" queries Vault
- Suggest relevant blocks for new projects
