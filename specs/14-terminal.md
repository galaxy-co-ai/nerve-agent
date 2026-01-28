# Integrated Terminal (Code Studio)

## Overview

A Claude Code-powered terminal integrated directly into Nerve Agent. Build projects, access local files, run commands, and ship to Git and Vercel—all from your browser without switching to a separate terminal.

## Philosophy

- **One place to build** — Don't context-switch between browser and terminal
- **AI-assisted development** — Claude Code intelligence built in
- **Project-aware** — Knows your current project context
- **Ship from here** — Git and Vercel integration, not just commands

---

## Terminal Interface

### Main View

```
CODE STUDIO — Results Roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─ FILES ───────────┐  ┌─ TERMINAL ────────────────────────────────┐
│                   │  │                                            │
│ 📁 results-roofing│  │  ~/projects/results-roofing               │
│ ├─ 📁 src         │  │  $ npm run dev                            │
│ │  ├─ 📁 app      │  │                                            │
│ │  ├─ 📁 components│  │  > results-roofing@0.1.0 dev             │
│ │  └─ 📁 lib      │  │  > next dev                               │
│ ├─ 📁 prisma      │  │                                            │
│ ├─ 📄 package.json│  │  ▲ Next.js 15.0.0                         │
│ ├─ 📄 .env.local  │  │  - Local: http://localhost:3000           │
│ └─ 📄 README.md   │  │  - Network: http://192.168.1.10:3000      │
│                   │  │                                            │
│ ─────────────────│  │  ✓ Ready in 2.3s                          │
│                   │  │                                            │
│ QUICK ACTIONS     │  │  $ ▌                                       │
│ ─────────────────│  │                                            │
│ ▶ npm run dev     │  ├────────────────────────────────────────────┤
│ ▶ npm run build   │  │ AI: Type naturally or use commands         │
│ ▶ git status      │  │ "create a new component for user profile"  │
│ ▶ Deploy staging  │  └────────────────────────────────────────────┘
│                   │
└───────────────────┘

[New Terminal +]  [Split]  [Clear]
```

### Multi-Terminal Support

```
TERMINALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────┬─────────────┬─────────────┐
│ Terminal 1  │ Terminal 2  │ Terminal 3  │
│ dev server  │ prisma      │ general     │
└─────────────┴─────────────┴─────────────┘

┌─ Terminal 1: Dev Server ─────────────────────────────────────────┐
│ $ npm run dev                                                    │
│ ▲ Next.js 15.0.0 ready                                          │
│ ✓ Compiled in 234ms                                             │
└──────────────────────────────────────────────────────────────────┘

┌─ Terminal 2: Prisma ─────────────────────────────────────────────┐
│ $ npx prisma studio                                              │
│ Prisma Studio is up on http://localhost:5555                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Claude Code Integration

### Natural Language Commands

```
CLAUDE CODE ASSIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│ create a new api route for handling stripe webhooks              │
└─────────────────────────────────────────────────────────────────┘

CLAUDE IS WORKING...
──────────────────────────────────────────────────────────────────

I'll create a Stripe webhook handler for you.

Creating file: src/app/api/webhooks/stripe/route.ts

```typescript
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful checkout
      break
    case 'payment_intent.payment_failed':
      // Handle failed payment
      break
  }

  return NextResponse.json({ received: true })
}
```

[Apply Changes]  [Edit First]  [Reject]
```

### Context-Aware Assistance

```
CLAUDE CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Claude has access to:

PROJECT CONTEXT
──────────────────────────────────────────────────────────────────
☑️ Current project files
☑️ Package.json dependencies
☑️ Environment variables (names only)
☑️ Prisma schema
☑️ Project planning documents

NERVE AGENT CONTEXT
──────────────────────────────────────────────────────────────────
☑️ Current sprint tasks
☑️ Related Vault blocks
☑️ Technical decisions from calls
☑️ Integration mapping document

This allows Claude to:
• Suggest code matching your stack
• Reference your data models
• Follow your established patterns
• Know what you're building
```

### AI Commands

```
CLAUDE CODE COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/explain [file]        Explain what a file does
/refactor [file]       Suggest refactoring improvements
/test [file]           Generate tests for a file
/fix [error]           Fix an error message
/implement [task]      Implement a sprint task
/review                Review recent changes
/commit                Generate commit message

Examples:
──────────────────────────────────────────────────────────────────
> /explain src/lib/auth.ts
> /fix "Cannot read property 'id' of undefined"
> /implement "Add pagination to projects list"
> /test src/components/project-card.tsx
```

---

## File Browser

### File Tree

```
FILE BROWSER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 results-roofing/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 (auth)/
│   │   ├── 📁 (dashboard)/
│   │   ├── 📁 api/
│   │   │   ├── 📁 webhooks/
│   │   │   │   └── 📁 stripe/
│   │   │   │       └── 📄 route.ts ← NEW
│   │   │   └── ...
│   │   ├── 📄 layout.tsx
│   │   └── 📄 page.tsx
│   ├── 📁 components/
│   │   ├── 📁 ui/
│   │   └── 📁 features/
│   └── 📁 lib/
├── 📁 prisma/
│   └── 📄 schema.prisma
├── 📄 package.json
├── 📄 .env.local
├── 📄 .gitignore
└── 📄 README.md

Right-click for: New File, New Folder, Rename, Delete
```

### Quick File Preview

```
FILE PREVIEW — src/app/api/webhooks/stripe/route.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 1 │ import { headers } from 'next/headers'
 2 │ import { NextResponse } from 'next/server'
 3 │ import Stripe from 'stripe'
 4 │
 5 │ const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
 6 │
 7 │ export async function POST(req: Request) {
 8 │   const body = await req.text()
 9 │   const signature = headers().get('stripe-signature')!
10 │   ...

[Open in Editor]  [Copy Path]  [View Full]
```

---

## Git Integration

### Git Status Panel

```
GIT — results-roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Branch: feature/stripe-webhooks
Behind: origin/main by 2 commits

CHANGES (3 files)
──────────────────────────────────────────────────────────────────
Staged:
  ✓ src/app/api/webhooks/stripe/route.ts (new)

Unstaged:
  M src/lib/stripe.ts
  M prisma/schema.prisma

COMMIT
──────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────┐
│ Add Stripe webhook handler for payment events                    │
│                                                                  │
│ - Handle checkout.session.completed                             │
│ - Handle payment_intent.payment_failed                          │
│ - Verify webhook signatures                                     │
└─────────────────────────────────────────────────────────────────┘

[Generate Message]  [Stage All]  [Commit]  [Commit & Push]
```

### AI Commit Messages

```
GENERATE COMMIT MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analyzing staged changes...

SUGGESTED MESSAGE
──────────────────────────────────────────────────────────────────
feat(payments): add Stripe webhook handler

- Add POST handler for Stripe webhook events
- Implement signature verification
- Handle checkout.session.completed event
- Handle payment_intent.payment_failed event
- Add error logging for failed verifications

Closes #23
──────────────────────────────────────────────────────────────────

[Use This]  [Regenerate]  [Edit]
```

### Branch Management

```
BRANCHES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CURRENT
● feature/stripe-webhooks

LOCAL
○ main
○ feature/dashboard-components
○ feature/auth-flow

REMOTE
○ origin/main (2 ahead)
○ origin/feature/stripe-webhooks (synced)

[New Branch]  [Merge]  [Pull]  [Push]
```

---

## Vercel Deployment

### Deploy Panel

```
DEPLOY TO VERCEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: results-roofing
Connected: vercel.com/yourteam/results-roofing

ENVIRONMENTS
──────────────────────────────────────────────────────────────────
Production    results-roofing.vercel.app        ✓ Live
Preview       results-roofing-git-*.vercel.app  ✓ Auto-deploy on PR
Development   localhost:3000                     Running

RECENT DEPLOYMENTS
──────────────────────────────────────────────────────────────────
✓ Production  main        2 hours ago    [View →]
✓ Preview     feature/... 30 min ago     [View →]
✓ Preview     feature/... 1 hour ago     [View →]

DEPLOY
──────────────────────────────────────────────────────────────────
Deploy current branch to:
○ Preview (creates new preview URL)
● Staging (updates staging.resultsroofing.vercel.app)
○ Production (requires main branch)

[Deploy Now]
```

### Deployment Progress

```
DEPLOYING TO STAGING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[████████████████████░░░░░░░░░░░░]  Building...

✓ Cloning repository
✓ Installing dependencies (47 packages)
● Building application...
○ Running checks
○ Deploying

Build Output:
──────────────────────────────────────────────────────────────────
Route (app)                    Size     First Load JS
┌ ○ /                          5.2 kB   89.2 kB
├ ○ /dashboard                 12.1 kB  96.1 kB
├ ○ /projects                  8.4 kB   92.4 kB
└ ○ /api/webhooks/stripe       0 B      0 B

[View Build Logs]  [Cancel]
```

### Post-Deploy Actions

```
DEPLOYMENT COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Deployed to staging

URL: staging.resultsroofing.vercel.app
Branch: feature/stripe-webhooks
Commit: a1b2c3d "Add Stripe webhook handler"

POST-DEPLOY ACTIONS
──────────────────────────────────────────────────────────────────
☑️ Update client portal with new preview
☑️ Run smoke tests
☐ Notify client (email)
☐ Generate changelog

[Open Preview]  [View in Vercel]  [Notify Client]
```

---

## Project Switching

### Project Selector

```
SELECT PROJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTIVE PROJECTS
──────────────────────────────────────────────────────────────────
● Results Roofing    ~/projects/results-roofing
  Last opened: 2 hours ago

○ Galaxy Co          ~/projects/galaxy-co
  Last opened: Yesterday

○ QuickClaims        ~/projects/quickclaims
  Last opened: 3 days ago

RECENT
──────────────────────────────────────────────────────────────────
○ Personal Site      ~/projects/personal
○ nerve-agent        ~/workspace/nerve-agent

[Clone New Project]  [Open Folder]
```

### Clone from Git

```
CLONE REPOSITORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Repository URL:
┌─────────────────────────────────────────────────────────────────┐
│ git@github.com:yourusername/new-project.git                     │
└─────────────────────────────────────────────────────────────────┘

Clone to:
┌─────────────────────────────────────────────────────────────────┐
│ ~/projects/new-project                                          │
└─────────────────────────────────────────────────────────────────┘

☑️ Link to Nerve Agent project: [Select or Create ▾]

[Clone]
```

---

## Local File Access

### Desktop Agent Connection

```
LOCAL FILE ACCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Connection: ✓ Desktop agent connected

The terminal connects to your local machine via the Nerve Agent
desktop app, allowing:

• Access to local project files
• Running local dev servers
• Git operations with SSH keys
• npm/yarn/pnpm commands
• Full terminal capabilities

ALLOWED DIRECTORIES
──────────────────────────────────────────────────────────────────
☑️ ~/projects/
☑️ ~/workspace/
☐ ~/Documents/
☐ Full home directory

[Manage Permissions]
```

### Security Model

```
TERMINAL SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SANDBOXING
──────────────────────────────────────────────────────────────────
• Commands run in allowed directories only
• Dangerous commands require confirmation
• No access outside project folders
• Env vars isolated per project

DANGEROUS COMMAND CONFIRMATION
──────────────────────────────────────────────────────────────────
The following require explicit approval:
• rm -rf (destructive delete)
• git push --force
• Commands with sudo
• System-level changes

AUDIT LOG
──────────────────────────────────────────────────────────────────
All terminal commands are logged for security review.
[View Audit Log]
```

---

## Quick Actions

### Sprint Task Integration

```
QUICK ACTIONS — Current Sprint
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current Task: Stripe webhook integration

RELATED ACTIONS
──────────────────────────────────────────────────────────────────
▶ Implement with Claude
  "Implement the Stripe webhook handler for this task"

▶ Pull from Vault
  Found: "Stripe Checkout Flow" block

▶ Run Tests
  npm test -- --grep "stripe"

▶ Mark Complete
  Finish task and move to next

[Start Task Timer]
```

### Common Commands

```
COMMAND PALETTE                                      Cmd+Shift+P
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────┐
│ >                                                                │
└─────────────────────────────────────────────────────────────────┘

RECENT
──────────────────────────────────────────────────────────────────
> npm run dev
> git status
> npx prisma studio

DEV
──────────────────────────────────────────────────────────────────
> npm run dev          Start development server
> npm run build        Build for production
> npm run lint         Run ESLint

DATABASE
──────────────────────────────────────────────────────────────────
> npx prisma studio    Open Prisma Studio
> npx prisma migrate   Run migrations
> npx prisma generate  Generate client

GIT
──────────────────────────────────────────────────────────────────
> git status           Show changes
> git pull             Pull latest
> git push             Push changes
```

---

## Data Model

```typescript
interface TerminalSession {
  id: string
  project: Project
  workingDirectory: string
  isActive: boolean
  createdAt: Date
}

interface TerminalCommand {
  id: string
  session: TerminalSession
  command: string
  output: string
  exitCode: number
  executedAt: Date
  duration: number
}

interface ClaudeCodeInteraction {
  id: string
  session: TerminalSession
  prompt: string
  response: string
  filesModified: string[]
  accepted: boolean
  createdAt: Date
}
```

---

## Integrations

### Sprint Stack
- Tasks can be implemented directly
- Time tracked while in terminal
- Task completion from terminal

### Vault
- Pull code blocks into project
- Save new patterns to Vault

### Agent Actions
- Agents can execute terminal commands
- Setup agents use terminal internally

### Environment Variables
- Access project env vars
- Managed securely
