# NERVE AGENT

> A project operating system for solo builders. Not a flexible tool you configure — a **framework you follow**.

## The Philosophy

Every PM tool is built for *teams*. They assume you need collaboration features, approval workflows, and communication overhead. But when you're solo, the bottleneck is **attention** and **context-switching**.

Nerve Agent is the anti-Notion. The anti-Linear. Built for the chaos of being a one-person studio where you're the strategist, designer, developer, PM, and accountant all at once.

### Core Principles

1. **Be your single pane of glass** — stop alt-tabbing between 12 apps
2. **Think ahead for you** — surface what matters *right now*
3. **Remember everything** — so you can context-switch fearlessly
4. **Automate the bullshit** — status updates, follow-ups, organization
5. **Generate client-facing artifacts** — without you lifting a finger
6. **Force rigorous planning** — so you never start building before you're ready
7. **Learn from your history** — estimates improve, mistakes don't repeat

---

## The Four Phases

Every project flows through four phases. No skipping.

```
┌─────────────────────────────────────────────────────────────────────┐
│  PLAN          →     SPRINT       →     SHIP        →    SUPPORT   │
│  ────────          ──────────         ──────           ─────────   │
│  Planning Wizard    Sprint Stack      Deploy Pipeline   Feedback   │
│  ↓ Complete docs    ↓ Execute         ↓ Ship & notify   Loop       │
│  ↓ Generate roadmap ↓ Track progress  ↓ Client review   ↓ Iterate  │
│  ↓ Pre-build sprints↓ Auto time track ↓ Production      ↓ Prevent  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core Modules

### Phase 1: PLAN
- **Planning Wizard** — Guided framework of documents, same order every project
- **Roadmap Generation** — Auto-generated from completed planning docs
- **Sprint Pre-Planning** — All sprints outlined before code is written

### Phase 2: SPRINT
- **Sprint Stack** — Pre-planned sprints with detailed tasks
- **Passive Time Tracking** — Auto-tracks based on screen activity
- **Adaptive Estimation** — AI adjusts estimates based on your historical performance
- **Agent Actions** — AI agents execute repetitive tasks automatically

### Phase 3: SHIP
- **Deploy Pipeline** — Local → Staging → Production with one-click deploys
- **Auto Changelog** — Generated from commits
- **Client Notifications** — Auto-notify on preview deploys
- **Sentry Integration** — Errors auto-create tickets

### Phase 4: SUPPORT
- **Feedback Loop** — Quality metrics, issue tracking, lessons learned
- **Prevention Engine** — Pre-flight checklists generated from past bugs
- **Client Portal** — Auto-generated progress view for clients

---

## Supporting Systems

### Intelligence Layer
- **Call Intelligence** — Drop transcript, get brief + action items + decisions
- **Knowledge Engine** — Natural language queries across all project context
- **Adaptive Estimation** — Learns your actual velocity over time

### Library (Reusable Code)
- **Blocks** — Large reusable code chunks (auth flows, payment integration)
- **Patterns** — Smaller code patterns (error handling, optimistic UI)
- **Features** — Complete features saved for future projects
- **Queries** — Database queries and patterns

### Living UI Library
- **Component Library** — Your personal shadcn fork
- **Polish Queue** — Track micro-improvements over time
- **Design Tokens** — Centralized, consistent
- **Usage Tracking** — Know which components are battle-tested

### Tech Stack Roster
- **Visual Grid** — Tools with actual brand logos
- **Per-Project Customization** — Track which tools each project uses
- **Version Tracking** — Know what versions you're running

### Financial Nerve
- **Auto Time → Revenue** — Calculate from passive tracking
- **Profitability Analysis** — Revenue vs. hours per project
- **Invoice Generation** — From tracked time
- **Payment Status** — Stripe sync

### Client Portal (Auto-Generated)
- **Progress View** — Pulls from Sprint Stack
- **Pending Items** — What you're waiting on from them
- **Staging Links** — Preview deployments
- **Feedback Collection** — Creates tickets automatically

### Daily Driver
- **Today's Focus** — Curated hit list, not everything
- **Blockers Cleared** — Stuff that was stuck but isn't anymore
- **Client Waiting** — Where YOU are the bottleneck
- **Follow Up Queue** — Automated nudge system

### Notes & Writing Studio
- **AI Writing Assistant** — Brainstorm, continue, rewrite with Claude
- **Auto-Tagging** — AI categorizes and tags your notes automatically
- **Wiki-Style Linking** — Connect notes with [[links]] and see backlinks
- **Context Graph** — Visualize how your knowledge connects

### Bookmarks (Link Library)
- **Save Anything** — Browser extension for one-click saves
- **Auto-Organization** — AI categorizes by type, topic, and project
- **Semantic Search** — Find links by meaning, not just keywords
- **Reading List** — Track articles to read later

### Integrated Terminal (Code Studio)
- **Claude Code Built-In** — AI-assisted development in the browser
- **Local File Access** — Full access to your project files
- **Git Integration** — Commit, push, branch without leaving
- **Vercel Deploy** — Ship to staging/production in one click

### Password Manager
- **Project-Organized** — Credentials grouped by project
- **Zero-Knowledge Encryption** — We can't see your passwords
- **Secure Sharing** — Share credentials with clients safely
- **Linked to Env Vars** — Credentials connect to environment variables

### Environment Variables Manager
- **All Projects, All Envs** — Dev, staging, production in one view
- **Vercel Sync** — Push/pull env vars to Vercel
- **Missing Var Detection** — Know what's not set before it breaks
- **Credential Linking** — Pull values from Password Vault

---

## Tech Stack

```
Frontend:       Next.js 15 + React 19 + shadcn/ui (Pro) + Tailwind
Backend:        Next.js API Routes + Server Actions
Database:       PostgreSQL (Supabase)
Auth:           Clerk
AI:             Claude API (Anthropic)
Time Tracking:  Electron companion app (screen monitoring)
Errors:         Sentry
Payments:       Stripe
Analytics:      PostHog
Realtime:       Pusher (or Supabase Realtime)
File Storage:   Uploadthing
Email:          Resend + React Email
Hosting:        Vercel
```

---

## Project Structure

```
nerve-agent/
├── README.md                 # This file
├── docs/
│   ├── VISION.md            # Full product vision
│   ├── ARCHITECTURE.md      # System architecture
│   └── USER-FLOWS.md        # Key user journeys
├── specs/
│   ├── 01-planning-wizard.md
│   ├── 02-sprint-stack.md
│   ├── 03-time-tracking.md
│   ├── 04-agent-actions.md
│   ├── 05-call-intelligence.md
│   ├── 06-library.md
│   ├── 07-ui-library.md
│   ├── 08-feedback-loop.md
│   ├── 09-client-portal.md
│   ├── 10-financial.md
│   ├── 11-daily-driver.md
│   ├── 12-notes.md
│   ├── 13-bookmarks.md
│   ├── 14-terminal.md
│   ├── 15-passwords.md
│   ├── 16-env-vars.md
│   └── data-models.md
└── assets/
    └── (diagrams, mockups)
```

---

## What Makes It Different

| Traditional PM Tools | Nerve Agent |
|---------------------|-------------|
| Built for teams | Built for YOU |
| You organize everything | It organizes for you |
| Manual status updates | Auto-generated artifacts |
| Context lives in your head | Context lives in the system |
| Separate tools for everything | Single source of truth |
| Generic and flexible | Opinionated and fast |
| Estimates are guesses | Estimates learn from history |
| Manual setup every project | Agents do repetitive work |
| Bookmark toolbar chaos | Organized, searchable link library |
| Terminal in separate window | Code Studio built into the app |
| Passwords scattered everywhere | Project-organized credential vault |

---

## Getting Started

*Coming soon — this is the specification phase.*

---

## License

Private — Internal use only.
