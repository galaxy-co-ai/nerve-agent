# CLAUDE.md — Project Context for AI Assistants

## Project Overview

**NERVE AGENT** is a project operating system for solo developers/designers. It's an opinionated framework (not a flexible tool) that combines project management, time tracking, client portals, code intelligence, and more into a single application.

This is currently in **early development**. All specifications are complete and the Next.js codebase has been scaffolded with a living backlog page to track progress.

## Repository Structure

```
nerve-agent/
├── CLAUDE.md              # This file
├── README.md              # Project overview and philosophy
├── apps/
│   └── web/               # Next.js 15 web application
│       ├── package.json
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       ├── next.config.ts
│       └── src/app/
│           ├── page.tsx           # Landing page
│           ├── layout.tsx         # Root layout
│           ├── globals.css        # Global styles (dark mode)
│           └── backlog/
│               └── page.tsx       # LIVING BACKLOG (delete when done)
├── docs/
│   ├── VISION.md          # Full product vision and user experience
│   ├── ARCHITECTURE.md    # Tech stack and system architecture
│   └── USER-FLOWS.md      # Key user journeys (10 flows)
├── specs/
│   ├── 01-planning-wizard.md   # 8-document planning framework
│   ├── 02-sprint-stack.md      # Sprint execution + adaptive estimates
│   ├── 03-time-tracking.md     # Passive screen-based tracking
│   ├── 04-agent-actions.md     # AI automation for setup tasks
│   ├── 05-call-intelligence.md # Transcript → brief + actions
│   ├── 06-library.md           # Reusable code library
│   ├── 07-ui-library.md        # Living shadcn component library
│   ├── 08-feedback-loop.md     # Quality tracking + prevention
│   ├── 09-client-portal.md     # Auto-generated client portals
│   ├── 10-financial.md         # Time → revenue, invoicing
│   ├── 11-daily-driver.md      # Morning command center
│   ├── 12-notes.md             # AI writing assistant + wiki links
│   ├── 13-bookmarks.md         # Link library (LinkWarden-style)
│   ├── 14-terminal.md          # Claude Code terminal integration
│   ├── 15-passwords.md         # Project-organized credentials
│   ├── 16-env-vars.md          # Environment variable manager
│   └── data-models.md          # Complete Prisma schema
└── assets/                 # (future: diagrams, mockups)
```

## Tech Stack (Planned)

```
Frontend:       Next.js 15 + React 19 + TypeScript
UI:             shadcn/ui (Pro) + Tailwind CSS + Radix + Framer Motion
Backend:        Next.js API Routes + Server Actions
Database:       PostgreSQL via Supabase + Prisma ORM
Auth:           Clerk
AI:             Claude API (Anthropic)
Time Tracking:  Electron companion app
Errors:         Sentry (with auto-ticketing webhook)
Payments:       Stripe
Analytics:      PostHog
Realtime:       Pusher or Supabase Realtime
File Storage:   Uploadthing
Email:          Resend + React Email
Hosting:        Vercel
```

## Key Concepts

### The Four Phases
Every project flows: **PLAN → SPRINT → SHIP → SUPPORT**

### Planning Wizard
8 sequential documents that must be completed before development:
1. Project Brief
2. Technical Discovery
3. Scope Definition
4. Information Architecture
5. Design System & UI Specs
6. Integration Mapping
7. Timeline & Milestones
8. Risk Register

### Sprint Stack
Pre-planned sprints generated from planning docs. Features:
- AI-adjusted estimates based on historical performance
- Agent-able tasks (AI can execute setup/config automatically)
- Passive time tracking via desktop app

### Library
Personal library of reusable code:
- Blocks (large implementations like auth flows)
- Patterns (smaller code patterns)
- Features (complete features)
- Queries (database patterns)

### Daily Driver
Morning command center showing:
- Today's focus task
- Blockers cleared
- Client waiting items
- Follow-up queue

## Design Principles

1. **Opinionated over flexible** — Make decisions for the user
2. **Zero friction** — Time tracking is passive, organization is automatic
3. **AI-native** — Claude assists everywhere (estimates, writing, code)
4. **Project-centric** — Everything organized by project
5. **Quality compounds** — Bugs become lessons become checklists
6. **Single pane of glass** — Stop alt-tabbing between 12 apps

## When Working on This Project

### If adding new features:
1. Create a spec file in `/specs/` following the existing format
2. Update `README.md` to include the new module
3. Add relevant data models to `specs/data-models.md`
4. Consider how it integrates with existing modules

### Spec file format:
- Overview section explaining the feature
- Philosophy (3-5 bullet points)
- ASCII UI mockups showing the interface
- Data model (TypeScript interfaces)
- Integrations section listing connections to other modules

### Code conventions (for future development):
- TypeScript strict mode
- Prisma for database
- Server Components by default, Client Components when needed
- shadcn/ui components (we have Pro access)
- Tailwind for styling
- Zod for validation

## Current Status

**Phase:** Early Development
**Completed:**
- All 16 module specifications
- Data models (Prisma schema spec)
- Vision, Architecture, User Flows documentation
- Next.js 15 project scaffolding
- Living backlog page at /backlog
- GitHub repository (github.com/galaxy-co-ai/nerve-agent)

**Next:**
1. Manual Vercel setup (import from GitHub, root dir: apps/web)
2. Install dependencies locally (`npm install` in apps/web)
3. Foundation: Prisma, Clerk, shadcn/ui, Claude API, base layout
4. Phase 1: Daily Driver, Projects, Sprint Stack, Time Tracking

## Questions to Consider

When making changes, ask:
- Does this reduce cognitive load for a solo developer?
- Can this be automated or AI-assisted?
- Does it integrate with existing modules?
- Is it opinionated (makes decisions) or flexible (requires decisions)?
- Would a solo dev actually use this daily?
