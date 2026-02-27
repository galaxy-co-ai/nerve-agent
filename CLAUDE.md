# CLAUDE.md — Project Context for AI Assistants

## Working Agreement

**Role clarity:** You (Claude) are the fullstack developer and UI/UX designer. The human is a non-technical founder who provides vision and approves work. Operate at a HIGH level of quality and output.

**Autonomous execution:**
- Do NOT ask the human to run commands you can run yourself
- Do NOT explain technical jargon — just solve problems
- Do NOT ask "what would you like to do?" — make informed decisions and execute
- When something breaks, fix it. Don't report it and wait.

**Workflow:**
- Lead with action, not questions
- Run validation before committing
- Commit and push completed work
- Restart servers, install packages, fix errors — all without being asked
- Only pause for approval on significant UX/design decisions

**Quality bar:**
- Production-ready code, not prototypes
- Consistent design system adherence (NERVE design system, not raw shadcn)
- Accessibility built-in
- No lazy shortcuts or TODOs left behind

---

## Project Overview

**NERVE AGENT** is a project operating system for solo developers/designers. It's an opinionated framework (not a flexible tool) that combines project management, time tracking, client portals, code intelligence, and more into a single application.

**Phase:** Active Development — core features built, several modules functional.

---

## Repository Structure

```
nerve-agent/                         # Monorepo root
├── CLAUDE.md                        # This file
├── README.md                        # Project overview and philosophy
├── package.json                     # Root scripts (dev, build, validate) + Husky
├── package-lock.json
│
├── apps/
│   └── web/                         # Next.js 16 web application (primary codebase)
│       ├── package.json             # All dependencies
│       ├── package-lock.json
│       ├── tsconfig.json
│       ├── tailwind.config.ts       # NERVE Gold palette + custom animations
│       ├── next.config.ts           # Turbopack enabled, webpack dev polling
│       ├── eslint.config.mjs        # Flat config (next/core-web-vitals + next/typescript)
│       ├── postcss.config.mjs
│       ├── vitest.config.ts         # jsdom, @/ alias, tests in __tests__/
│       ├── vitest.setup.ts
│       ├── components.json          # shadcn/ui config (new-york style, RSC)
│       ├── prisma.config.ts
│       ├── vercel.json              # Build & route config
│       ├── .env.example             # All required/optional env vars documented
│       │
│       ├── prisma/
│       │   └── schema.prisma        # Complete schema — 40+ models, ~1450 lines
│       │
│       ├── __mocks__/
│       │   └── prisma.ts            # Vitest mock for Prisma client
│       │
│       └── src/
│           ├── middleware.ts         # Clerk auth + org role routing
│           │
│           ├── app/                  # Next.js App Router pages
│           │   ├── layout.tsx        # Root layout (dark mode, Geist font, Providers)
│           │   ├── page.tsx          # Landing page
│           │   ├── globals.css       # ~1000 lines: NERVE CSS vars, utilities, themes
│           │   ├── error.tsx         # Error boundary
│           │   ├── global-error.tsx  # Global error boundary
│           │   │
│           │   ├── backlog/          # Living backlog tracker
│           │   ├── notes/            # Notes CRUD (list, view, edit)
│           │   ├── client/           # Client portal pages (layout, messages, projects, settings)
│           │   ├── portal/           # Public portal (brief, login, verify)
│           │   ├── sign-in/          # Clerk auth
│           │   ├── sign-up/          # Clerk auth
│           │   │
│           │   └── api/              # API routes (40+ endpoints)
│           │       ├── admin/        # Backfill endpoints
│           │       ├── agent/        # AI agent (actions, chat, cron, preferences, suggestions, trigger)
│           │       ├── ai/           # AI features (focus-plan, process-call, qa, search, writing)
│           │       ├── ax/           # AX ambient experience state
│           │       ├── chat/         # General chat
│           │       ├── comments/     # Threaded comments + reactions
│           │       ├── desktop/      # Desktop app sync (pair, verify, ping, devices, tasks, notes, time)
│           │       ├── folders/      # Note folders CRUD + reorder
│           │       ├── notes/        # Notes CRUD + organize + parse + bulk + auto-archive
│           │       ├── onboarding/   # Onboarding chat
│           │       ├── portal/       # Magic link auth
│           │       ├── presence/     # User presence/status
│           │       ├── projects/     # Projects + framework docs + checkpoints + workspace notes
│           │       ├── pusher/       # Pusher auth for realtime
│           │       └── time/         # Time entry anchoring
│           │
│           ├── components/
│           │   ├── nerve/            # NERVE Design System (USE THESE, not raw shadcn)
│           │   │   ├── DESIGN_SYSTEM.md   # Full design system documentation
│           │   │   ├── index.ts           # Barrel export for all NERVE components
│           │   │   ├── toaster.tsx
│           │   │   ├── components/        # Themed wrappers: NerveButton, NerveCard, NerveDialog, etc.
│           │   │   ├── primitives/        # Canvas, ChromeShell, Glow, Surface, Well
│           │   │   ├── controls/          # DialKnob, Orb, PillToggle, PowerButton, Readout
│           │   │   └── backgrounds/       # AmbientGlow, DotGrid, Noise, Vignette
│           │   │
│           │   ├── ui/               # Raw shadcn/ui components (base layer — used by NERVE wrappers)
│           │   ├── navigation/       # AppSidebar, NavMain, NavProjects, TeamSwitcher, etc.
│           │   ├── features/         # Feature components (AI editor, Claude chat, notes DnD, etc.)
│           │   ├── dialogs/          # Modal dialogs (add task, add note, brain dump, timer, etc.)
│           │   ├── forms/            # Form components (edit note, new call, import, portal feedback)
│           │   ├── client/           # Client portal components (sidebar, comments, feedback, etc.)
│           │   ├── agent/            # Agent drawer
│           │   ├── timer/            # Timer components (active timer, sidebar timer, provider)
│           │   ├── workspace/        # Project workspace (framework, progress, tech stack, chat)
│           │   ├── shared/           # Shared components (command palette, dock, copy button, etc.)
│           │   ├── providers.tsx      # ClerkProvider + NerveToaster
│           │   └── motion.tsx         # Framer Motion lazy wrapper
│           │
│           ├── hooks/                # Custom React hooks (7 files)
│           │   ├── use-comments.ts
│           │   ├── use-desktop-connection.ts
│           │   ├── use-mobile.tsx
│           │   ├── use-note-organization.ts
│           │   ├── use-presence.ts
│           │   ├── use-recent-items.ts
│           │   └── use-toast.tsx
│           │
│           └── lib/
│               ├── auth.ts           # Clerk auth + org roles + project access checks
│               ├── db.ts             # Prisma client (Neon serverless adapter)
│               ├── utils.ts          # cn() utility
│               ├── animations.ts     # Framer Motion animation presets
│               ├── presence.ts       # Presence system utilities
│               ├── pusher.ts         # Pusher server instance
│               ├── pusher-client.ts  # Pusher client singleton
│               │
│               ├── actions/          # Server Actions (primary data layer)
│               │   ├── blockers.ts, calls.ts, design-system.ts, desktop-sync.ts
│               │   ├── follow-ups.ts, import.ts, library.ts, notes.ts
│               │   ├── portal.ts, projects.ts, sidebar.ts, sprints.ts
│               │   ├── tasks.ts, time.ts
│               │   └── __tests__/    # Vitest tests for server actions
│               │
│               ├── agent/            # AI Agent system (core, actions, context, memory, tools, prompts)
│               ├── ai/               # AI utilities (providers, analyze-codebase, format-library-name)
│               ├── ax/               # AX — Ambient Experience system (confidence, patterns, signals)
│               ├── validations/      # Zod schemas (call, follow-up, note, task, time-entry)
│               ├── types/            # TypeScript type definitions
│               ├── upload/           # File upload utilities
│               └── seed/             # Database seeding
│
├── docs/
│   ├── VISION.md                    # Full product vision and user experience
│   ├── ARCHITECTURE.md              # Tech stack and system architecture
│   ├── USER-FLOWS.md                # Key user journeys (10 flows)
│   ├── DESIGN_SYSTEM.md             # Design system overview
│   └── internal/                    # Session handoff documents (6 sessions)
│
├── specs/                           # Module specifications (17 specs + data models)
│   ├── 01-planning-wizard.md  through  16-env-vars.md
│   ├── 17-smart-folders.md          # AI-powered note organization
│   └── data-models.md               # Complete Prisma schema spec
│
├── scripts/
│   ├── validate.sh                  # Unix validation script
│   └── validate.bat                 # Windows validation script
│
├── .github/
│   ├── workflows/ci.yml             # CI: typecheck + build + lint on push/PR to main
│   ├── dependabot.yml
│   └── ISSUE_TEMPLATE/
│
├── .husky/
│   ├── pre-commit                   # typecheck + lint
│   └── pre-push                     # typecheck + build
│
└── SESSION_HANDOFF_*.md             # Session handoff docs (root level)
```

---

## Tech Stack (Actual — Installed & Configured)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (Turbopack default) | ^16.1.6 |
| React | React 19 | ^19.0.0 |
| Language | TypeScript (strict) | ^5.7.3 |
| UI Base | shadcn/ui (new-york style, RSC) | — |
| UI System | **NERVE Design System** (custom layer on shadcn) | v2.0 |
| CSS | Tailwind CSS v4 | ^4.1.18 |
| Animation | Framer Motion | ^12.29.2 |
| Icons | Lucide React | ^0.563.0 |
| Database | PostgreSQL via Neon serverless | — |
| ORM | Prisma (Neon adapter) | ^7.3.0 |
| Auth | Clerk (Organizations + role-based) | ^6.37.0 |
| AI (Primary) | Anthropic Claude SDK | ^0.72.0 |
| AI (Secondary) | OpenAI SDK | ^4.77.0 |
| AI (Fast) | Mistral SDK | ^1.5.0 |
| Realtime | Pusher + pusher-js | ^5.3.2 / ^8.4.0 |
| Validation | Zod v4 | ^4.3.6 |
| DnD | @dnd-kit (core + sortable) | ^6.3.1 / ^10.0.0 |
| Graph | React Flow | ^11.11.4 |
| Dates | date-fns | ^4.1.0 |
| Web Scraping | Firecrawl | ^1.19.0 |
| Testing | Vitest + Testing Library + jsdom | ^4.0.18 |
| Linting | ESLint 9 (flat config) | ^9.18.0 |
| Git Hooks | Husky | ^9.1.7 |
| Hosting | Vercel | — |

---

## NERVE Design System — CRITICAL

**Always use NERVE components over raw shadcn.** The NERVE design system wraps shadcn/ui with a premium audio-plugin aesthetic (dark backgrounds, cool pale gold accents, tactile depth).

### Import pattern:
```tsx
// DO THIS — import from NERVE
import { NerveCard, NerveButton, NerveBadge, NerveInput } from "@/components/nerve"

// NOT THIS — don't use raw shadcn directly for user-facing UI
import { Card } from "@/components/ui/card"
```

### Available NERVE components:
- **Components:** NerveAlertDialog, NerveAlert, NerveAvatar, NerveBadge, NerveButton, NerveCard, NerveCheckbox, NerveDialog, NerveDropdownMenu, NerveInput, NerveLabel, NervePopover, NerveProgress, NerveSelect, NerveSeparator, NerveSheet, NerveSkeleton, NerveSwitch, NerveTabs, NerveTextarea, NerveToast, NerveToggle, NerveTooltip
- **Primitives:** Canvas, ChromeShell, Glow, Surface, Well
- **Controls:** DialKnob, Orb, PillToggle, PowerButton, Readout
- **Backgrounds:** AmbientGlow, DotGrid, Noise, Vignette

### Color palette:
- **Primary accent:** Cool pale gold (`gold-400: #C9A84C`)
- **Background:** Dark zinc/charcoal via CSS vars (`--nerve-bg-base`, `--nerve-bg-surface`, etc.)
- **Text:** `--nerve-text-primary`, `--nerve-text-secondary`, `--nerve-text-muted`
- **Full palette + animations + shadows:** See `tailwind.config.ts` and `globals.css`

### Design docs:
- `src/components/nerve/DESIGN_SYSTEM.md` — Full implementation guide
- `docs/DESIGN_SYSTEM.md` — Design system overview

---

## Authentication & Authorization

Clerk with Organizations. Three roles in hierarchy:

| Role | Access | Routes |
|------|--------|--------|
| `org:admin` | Full dashboard + settings | `/dev/*`, all API routes |
| `org:development` | Dev dashboard (no billing) | `/dev/*`, most API routes |
| `org:member` | Client portal only | `/client/*`, limited API |

**Key files:**
- `src/middleware.ts` — Route-level protection + role-based redirects
- `src/lib/auth.ts` — `requireUser()`, `requireAdmin()`, `requireDeveloper()`, `requireMember()`, `checkProjectAccess()`

---

## Database

**Prisma with Neon serverless adapter.** The schema is extensive (~1450 lines, 40+ models).

### Key model groups:
- **Core:** `User`, `Project`, `Sprint`, `Task`, `TimeEntry`, `Blocker`
- **Knowledge:** `Note`, `NoteFolder`, `NoteFolderCorrection`, `LibraryItem`, `LibraryTag`, `DesignSystem`
- **Call Intelligence:** `Call`, `FollowUp`
- **Client Portal:** `Client`, `ClientProjectAccess`, `PortalFeedback`, `PortalMagicLink`, `Deliverable`, `Invoice`, `Comment`, `ActivityEvent`, `UserPresence`
- **Project Framework:** `ProjectFrameworkDoc`, `ProjectCheckpoint`, `CheckpointSession`, `ProjectObjective`, `ProjectStep`, `ProjectWorkspaceNote`
- **AI Agent:** `AgentPreferences`, `AgentSuggestion`, `AgentConversation`, `AgentMessage`, `AgentLearnedPattern`, `AgentEstimateCalibration`
- **Desktop:** `DesktopDevice`, `DesktopPairingCode`, `ProjectLocalDirectory`
- **Time Verification:** `TimeAnchor` (blockchain merkle roots)
- **Misc:** `Faq`

### Database client:
```tsx
import { db } from "@/lib/db"
```

### Important:
- Always check `prisma/schema.prisma` before querying — only use fields that exist
- Use `cuid()` for IDs (not UUID)
- Many models have `userId` for multi-tenancy — always filter by authenticated user

---

## Data Layer — Server Actions

Server Actions in `src/lib/actions/` are the primary data access pattern. Each file exports async functions that:
1. Authenticate via `requireUser()` or role-specific functions
2. Validate input with Zod schemas from `src/lib/validations/`
3. Query/mutate via Prisma
4. Revalidate paths as needed

**Server Action files:** blockers, calls, design-system, desktop-sync, follow-ups, import, library, notes, portal, projects, sidebar, sprints, tasks, time

---

## API Routes

40+ API routes in `src/app/api/`. Major groups:

| Group | Purpose |
|-------|---------|
| `/api/agent/*` | AI agent system (chat, actions, cron, suggestions, trigger) |
| `/api/ai/*` | AI features (focus-plan, call processing, QA, search, writing) |
| `/api/desktop/*` | Desktop app sync (pair, verify, ping, tasks, notes, time entries) |
| `/api/notes/*` | Notes CRUD + AI organization + bulk ops + auto-archive |
| `/api/folders/*` | Note folder management + reorder |
| `/api/projects/[slug]/*` | Project framework docs, checkpoints, workspace notes |
| `/api/comments/*` | Threaded comments + reactions |
| `/api/presence/` | User online status |
| `/api/time/*` | Time entry blockchain anchoring |
| `/api/pusher/*` | Pusher authentication |

---

## Key Concepts

### The Four Phases
Every project flows: **PLAN → SPRINT → SHIP → SUPPORT**

### Project Workspace
A tabbed interface for managing projects:
- **Framework Tab** — 12 planning documents (Idea Audit through Retrospective)
- **Progress Tab** — Checkpoints with time tracking sessions
- **Tech Stack Tab** — Codebase analysis from linked local directory
- **Notes Tab** — Project-scoped workspace notes
- **Chat Tab** — AI workspace chat

### AX (Ambient Experience)
A background intelligence system that:
- Tracks user patterns and confidence levels
- Detects staleness in tasks/blockers
- Maps relationships between entities
- Provides quiet signals (non-intrusive nudges)
- Files in `src/lib/ax/`

### Smart Folders
AI-powered note organization:
- Auto-categorizes new notes into folders
- Learns from manual corrections (tracked in `NoteFolderCorrection`)
- Tracks confidence scores per organization decision
- Spec: `specs/17-smart-folders.md`

### Desktop Integration
Pusher-based real-time pairing between web app and companion desktop app:
- 6-digit pairing codes (XXX-XXX format)
- Project directory linking with tech stack detection
- Time entry + task status sync
- Components in `src/components/features/desktop/`

---

## Scripts & Validation

### From root (`/nerve-agent`):
```bash
npm run dev              # Start dev server (Turbopack)
npm run build            # Build production (prisma generate + next build)
npm run validate         # Full validation: typecheck + lint + build
npm run validate:quick   # TypeScript only
```

### From `apps/web/`:
```bash
npm run dev              # next dev --turbopack
npm run dev:stable       # Stable dev (4GB memory, fixed host)
npm run build            # prisma generate && next build
npm run typecheck        # tsc --noEmit
npm run lint             # eslint src --max-warnings=100
npm run lint:fix         # eslint src --fix
npm run validate         # typecheck + lint + build
npm run test             # vitest (watch mode)
npm run test:run         # vitest run (single pass)
npm run test:coverage    # vitest with coverage
```

### Git hooks (Husky):
- **pre-commit:** `typecheck` + `lint`
- **pre-push:** `typecheck` + `build`

### CI (GitHub Actions — `.github/workflows/ci.yml`):
- Runs on push/PR to `main`
- Two jobs: `validate` (typecheck + build with dummy env vars) and `lint` (max 100 warnings)
- Uses Node 20

---

## Quality Control (IMPORTANT)

**Before pushing, ensure:**
1. TypeScript compiles: `npm run typecheck` (from apps/web)
2. ESLint passes: `npm run lint` (max 100 warnings allowed)
3. Production build succeeds: `npm run build`
4. New dependencies added to `apps/web/package.json`
5. New UI components use NERVE wrappers from `src/components/nerve/`
6. Database queries only use fields in `prisma/schema.prisma`

**Common issues that break builds:**
- Missing `Suspense` boundary around `useSearchParams()` (Next.js requirement)
- Type mismatches (e.g., `string | null` vs `string`)
- Missing dependencies in package.json
- Querying non-existent Prisma schema fields
- Importing from wrong path (use `@/` alias, not relative)
- ESLint: unused vars must be prefixed with `_`

---

## Environment Variables

All env vars documented in `apps/web/.env.example`. Key groups:

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Neon pooled connection string |
| `DIRECT_URL` | Yes | Neon direct connection (migrations) |
| `ANTHROPIC_API_KEY` | Yes | Claude API for agent/AI features |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk auth (client) |
| `CLERK_SECRET_KEY` | Yes | Clerk auth (server) |
| `OPENAI_API_KEY` | Recommended | Embeddings, transcription |
| `MISTRAL_API_KEY` | Optional | Fast summaries |
| `PUSHER_APP_ID` / `PUSHER_SECRET` / `NEXT_PUBLIC_PUSHER_KEY` | For realtime | Desktop app sync |
| `CRON_SECRET` | Production | Secure cron endpoints |

---

## Code Conventions

- **TypeScript strict mode** — no implicit any
- **Server Components by default** — Client Components only when needed (hooks, interactivity)
- **NERVE components** for all user-facing UI — not raw shadcn
- **shadcn/ui base** in `src/components/ui/` — only used by NERVE wrappers
- **Zod** for all input validation (`src/lib/validations/`)
- **Server Actions** as the primary data layer (`src/lib/actions/`)
- **Prisma** for all database access via `db` singleton from `src/lib/db.ts`
- **Clerk** for auth — always call `requireUser()` or role-specific functions
- **Tailwind** for all styling — use NERVE CSS variables for theme consistency
- **Lucide** for icons
- **Framer Motion** for animations (lazy-loaded via `src/components/motion.tsx`)
- **`@/`** path alias for all imports from `src/`

### File organization:
- Pages: `src/app/` (App Router)
- NERVE UI: `src/components/nerve/` (preferred for all new UI)
- Base UI: `src/components/ui/` (shadcn base — don't use directly)
- Feature components: `src/components/features/`
- Dialogs: `src/components/dialogs/`
- Forms: `src/components/forms/`
- Server actions: `src/lib/actions/`
- Hooks: `src/hooks/`
- Validation schemas: `src/lib/validations/`
- AI/agent logic: `src/lib/agent/` and `src/lib/ai/`

---

## When Working on This Project

### If adding new features:
1. Check if a spec exists in `/specs/` — follow it
2. Use NERVE design system components, not raw shadcn
3. Add server actions to `src/lib/actions/`
4. Add Zod validation to `src/lib/validations/`
5. Check `prisma/schema.prisma` — add models if needed
6. Run `npm run validate` before committing

### If modifying the database:
1. Edit `prisma/schema.prisma`
2. Run `npx prisma generate` to update the client
3. For new migrations: `npx prisma migrate dev --name description`
4. Update affected server actions and API routes

### If adding new pages:
1. Create route in `src/app/` following App Router conventions
2. Use Server Components by default
3. Wrap client-side state/hooks in Client Components
4. Add to navigation in `src/components/navigation/app-sidebar.tsx`

### Spec file format:
- Overview section explaining the feature
- Philosophy (3-5 bullet points)
- ASCII UI mockups showing the interface
- Data model (TypeScript interfaces)
- Integrations section listing connections to other modules

---

## Design Principles

1. **Opinionated over flexible** — Make decisions for the user
2. **Zero friction** — Time tracking is passive, organization is automatic
3. **AI-native** — Claude assists everywhere (estimates, writing, code, organization)
4. **Project-centric** — Everything organized by project
5. **Quality compounds** — Bugs become lessons become checklists
6. **Single pane of glass** — Stop alt-tabbing between 12 apps

---

## Current Status

**Phase:** Active Development

**Built & Functional:**
- All 17 module specifications + data models
- Complete Prisma schema (40+ models, ~1450 lines)
- Clerk authentication with Organizations + role-based routing
- NERVE Design System v2.0 (full component library with audio-plugin aesthetic)
- Notes system with Smart Folders (AI organization, DnD, CRUD)
- Client Portal v2 (role-based access, threaded comments, presence, feedback)
- Project Workspace (framework docs, checkpoints, workspace notes, chat)
- AI Agent system (chat, suggestions, learned patterns, memory, cron)
- Call Intelligence (transcript processing, briefs, follow-ups)
- Library (code blocks, patterns, queries, design systems)
- Desktop app integration (Pusher pairing, device management, project linking)
- Timer system (active timer, time entries, sidebar widget)
- AX ambient experience system
- Command palette
- 40+ API endpoints
- CI/CD (GitHub Actions + Husky pre-commit/pre-push hooks)
- Vercel deployment configured

**Next priorities:**
- Daily Driver (morning command center)
- Financial module (invoicing, time → revenue)
- Bookmarks module
- Terminal integration

---

## Questions to Consider

When making changes, ask:
- Does this reduce cognitive load for a solo developer?
- Can this be automated or AI-assisted?
- Does it integrate with existing modules?
- Is it opinionated (makes decisions) or flexible (requires decisions)?
- Would a solo dev actually use this daily?
- Am I using NERVE components (not raw shadcn)?
