# NERVE AGENT — System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         NERVE AGENT                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   PLAN      │  │   SPRINT    │  │    SHIP     │             │
│  │             │  │             │  │             │             │
│  │ • Wizard    │  │ • Stack     │  │ • Pipeline  │             │
│  │ • Docs      │→ │ • Tracking  │→ │ • Preview   │             │
│  │ • Roadmap   │  │ • Agents    │  │ • Changelog │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         ↓                ↓                ↓                     │
│  ┌──────────────────────────────────────────────────┐          │
│  │              FEEDBACK LOOP                        │          │
│  │  Quality metrics • Issues • Lessons • Checklists  │          │
│  └──────────────────────────────────────────────────┘          │
│                           ↓                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   VAULT     │  │  UI LIBRARY │  │ TECH STACK  │             │
│  │             │  │             │  │             │             │
│  │ • Blocks    │  │ • Components│  │ • Roster    │             │
│  │ • Patterns  │  │ • Tokens    │  │ • Per-proj  │             │
│  │ • Features  │  │ • Polish Q  │  │ • Logos     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │           INTELLIGENCE LAYER                      │          │
│  │                                                   │          │
│  │  • Call transcripts → Briefs                     │          │
│  │  • Time tracking → Adaptive estimates            │          │
│  │  • Errors → Auto-tickets                         │          │
│  │  • Context queries → Instant answers             │          │
│  │  • Agent tasks → Automated execution             │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  FINANCIAL  │  │   CLIENT    │  │   DAILY     │             │
│  │             │  │   PORTAL    │  │   DRIVER    │             │
│  │ • Time→$    │  │ • Auto-gen  │  │ • Today     │             │
│  │ • Invoices  │  │ • Progress  │  │ • Blocked   │             │
│  │ • Profit    │  │ • Feedback  │  │ • Waiting   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
```
Next.js 15          App Router, Server Components, Server Actions
React 19            Latest concurrent features
TypeScript 5.3      Strict mode
Tailwind CSS 3.4    Utility-first styling
shadcn/ui Pro       Component library (full Pro access)
Radix Primitives    Accessible component primitives
Framer Motion       Animations
Lucide Icons        Icon set
```

### Backend
```
Next.js API Routes  RESTful endpoints where needed
Server Actions      Mutations and form handling
Edge Runtime        Where appropriate for performance
```

### Database
```
PostgreSQL          Primary database (via Supabase)
Supabase            Postgres hosting + Realtime + Auth backup
Prisma              ORM and migrations
```

### Authentication
```
Clerk               User auth, session management
                    Supports org features if needed later
```

### AI/Intelligence
```
Claude API          Anthropic's Claude for:
                    - Call transcript processing
                    - Knowledge base queries
                    - Agent task execution
                    - Estimate adjustments
                    - Brief generation
```

### Time Tracking
```
Electron App        Companion desktop app for screen monitoring
                    - Window/app detection
                    - Idle detection
                    - Project mapping rules
                    - Secure local processing
                    - API sync to main app
```

### Error Tracking
```
Sentry              Error monitoring with:
                    - Auto-ticket creation via webhook
                    - Source maps
                    - Performance monitoring
```

### Payments
```
Stripe              Payment processing:
                    - Invoice generation
                    - Payment tracking
                    - Webhook integration for status
```

### File Storage
```
Uploadthing         File uploads for:
                    - Vault code blocks
                    - Client assets
                    - Call recordings
```

### Email
```
Resend              Transactional email
React Email         Email templates
```

### Analytics
```
PostHog             Product analytics (self-hosted option)
```

### Realtime
```
Pusher              Realtime updates
(or Supabase)       Alternative: Supabase Realtime
```

### Hosting
```
Vercel              Primary hosting:
                    - Edge functions
                    - Preview deployments
                    - Analytics
                    - Cron jobs
```

---

## Application Structure

```
nerve-agent/
├── apps/
│   ├── web/                    # Main Next.js application
│   │   ├── app/
│   │   │   ├── (auth)/         # Auth pages (sign-in, sign-up)
│   │   │   ├── (dashboard)/    # Main app pages
│   │   │   │   ├── daily/      # Daily Driver
│   │   │   │   ├── projects/   # Project list & War Room
│   │   │   │   ├── sprints/    # Sprint Stack & execution
│   │   │   │   ├── vault/      # Knowledge base
│   │   │   │   ├── library/    # UI Library
│   │   │   │   ├── stack/      # Tech Stack Roster
│   │   │   │   ├── finance/    # Financial tracking
│   │   │   │   └── settings/   # App settings
│   │   │   ├── portal/         # Client portal (public)
│   │   │   │   └── [slug]/     # Per-project portal
│   │   │   ├── api/
│   │   │   │   ├── ai/         # AI endpoints
│   │   │   │   ├── webhooks/   # Sentry, Stripe, etc.
│   │   │   │   ├── agents/     # Agent execution
│   │   │   │   └── time/       # Time tracking sync
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/             # shadcn components
│   │   │   ├── features/       # Feature-specific components
│   │   │   └── layouts/        # Layout components
│   │   ├── lib/
│   │   │   ├── db/             # Database utilities
│   │   │   ├── ai/             # AI utilities
│   │   │   ├── agents/         # Agent definitions
│   │   │   └── utils/          # General utilities
│   │   └── styles/
│   │
│   └── desktop/                # Electron time tracking app
│       ├── src/
│       │   ├── main/           # Main process
│       │   ├── renderer/       # UI (if any)
│       │   └── tracking/       # Screen monitoring logic
│       └── package.json
│
├── packages/
│   ├── database/               # Prisma schema & migrations
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       └── client.ts
│   │
│   ├── ui/                     # Shared UI components
│   │   └── src/
│   │
│   └── types/                  # Shared TypeScript types
│       └── src/
│
├── docs/                       # Documentation
├── specs/                      # Feature specifications
└── package.json                # Workspace root
```

---

## Database Schema Overview

### Core Entities

```
User                    # From Clerk, extended with preferences
Project                 # A client project
PlanningDocument        # One of 8 planning docs per project
Sprint                  # A sprint within a project
Task                    # A task within a sprint
TimeEntry               # Auto-tracked time entries
```

### Supporting Entities

```
CallBrief               # Generated from transcripts
CallTranscript          # Raw transcript storage
Decision                # Extracted decisions
ActionItem              # Extracted action items
Blocker                 # Things blocking progress
```

### Quality & Feedback

```
Issue                   # Bugs, errors, problems
Lesson                  # Lessons learned
ChecklistItem           # Pre-flight checklist items
QualityMetric           # Tracked quality data
```

### Vault

```
VaultBlock              # Reusable code blocks
VaultPattern            # Code patterns
VaultFeature            # Complete features
VaultQuery              # Database queries
```

### UI Library

```
UIComponent             # Component definitions
UIVariant               # Component variants
UIToken                 # Design tokens
PolishItem              # Polish queue items
```

### Financial

```
Invoice                 # Generated invoices
Payment                 # Payment records (Stripe sync)
```

### Agents

```
AgentDefinition         # Custom agent definitions
AgentExecution          # Agent run history
```

See `specs/data-models.md` for complete schema.

---

## Key Integrations

### GitHub Integration
- Create repositories via API
- Set up branch protection
- Manage issues and PRs
- Webhook for commit tracking

### Vercel Integration
- Create projects
- Trigger deployments
- Manage environment variables
- Preview URL generation

### Supabase Integration
- Database provisioning
- Auth configuration
- Realtime subscriptions

### Sentry Integration
- Project creation
- Error webhook for auto-tickets
- Source map uploads

### Stripe Integration
- Invoice creation
- Payment tracking
- Webhook for payment status

### Clerk Integration
- User authentication
- Session management
- Organization support (future)

---

## Security Considerations

### Authentication
- All routes protected via Clerk middleware
- Client portal uses separate, simpler auth (magic link or password)

### API Security
- Rate limiting on AI endpoints
- Webhook signature verification
- Input validation with Zod

### Data Security
- Row-level security in Supabase
- Encrypted secrets storage
- Audit logging for sensitive actions

### Desktop App Security
- Local-only screen monitoring (no screenshots sent)
- Only window titles and app names synced
- User-controlled project mapping rules

---

## Performance Considerations

### Frontend
- Server Components by default
- Client Components only when needed
- Optimistic UI updates
- Edge caching where appropriate

### Database
- Proper indexing on query patterns
- Connection pooling via Prisma
- Pagination on list views

### AI
- Streaming responses for long operations
- Background processing for heavy tasks
- Caching for repeated queries

---

## Deployment

### Environments
```
Development     localhost:3000
Preview         Auto-deployed on PR
Staging         staging.nerve.app
Production      nerve.app
```

### CI/CD
```
GitHub Actions  - Type checking
                - Linting
                - Tests
                - Preview deployments

Vercel          - Production deployments
                - Edge function deployment
```

---

## Monitoring

### Application
- Vercel Analytics (Web Vitals)
- PostHog (User analytics)
- Sentry (Error tracking)

### Infrastructure
- Vercel Dashboard (Function metrics)
- Supabase Dashboard (Database metrics)
- Stripe Dashboard (Payment metrics)
