# Agent Actions

## Overview

Agent Actions let you automate repetitive development tasks. Instead of manually setting up repos, configuring integrations, and scaffolding code for the 20th time, click a button and let an AI agent do it.

## Philosophy

- **Delegate the boring stuff** — Setup, scaffolding, configuration
- **Keep you in control** — Review before execution, approve changes
- **Learn your patterns** — Agents use your preferences and history
- **Fail gracefully** — Clear errors, easy rollback

---

## Agent Types

### 1. Project Setup Agent
**Purpose:** Initialize a new project from scratch

**Capabilities:**
- Create GitHub repository
- Initialize Next.js/React/etc project
- Set up Vercel project
- Configure Supabase database
- Set up Sentry error tracking
- Configure environment variables
- Apply your standard folder structure

```
AGENT: Project Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This agent will:
✓ Create GitHub repo: yourusername/results-roofing
✓ Initialize Next.js 15 with TypeScript
✓ Install your standard dependencies
✓ Set up Vercel project with env vars
✓ Create Supabase project
✓ Configure Sentry
✓ Apply folder structure from template

Estimated time: ~3 minutes

[Run Agent]  [Customize]
```

---

### 2. Database Setup Agent
**Purpose:** Set up database schema and migrations

**Capabilities:**
- Create Prisma schema from data model
- Generate migrations
- Set up seed data
- Configure row-level security (Supabase)
- Create database types

```
AGENT: Database Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Source: Planning Document #4 (Information Architecture)

This agent will:
✓ Generate Prisma schema from data model
✓ Create initial migration
✓ Set up seed data for development
✓ Configure RLS policies in Supabase
✓ Generate TypeScript types

Preview schema: [View]

[Run Agent]  [Edit Data Model First]
```

---

### 3. Integration Setup Agent
**Purpose:** Configure third-party integrations

**Capabilities:**
- Stripe: Products, prices, webhooks
- Auth: Clerk/Auth.js configuration
- Email: Resend templates
- Storage: Uploadthing setup
- Analytics: PostHog configuration

```
AGENT: Stripe Integration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This agent will:
✓ Create Stripe products from your pricing spec
✓ Set up webhook endpoint
✓ Configure webhook events
✓ Add Stripe keys to Vercel env vars
✓ Generate checkout and portal code

Required credentials:
● Stripe Secret Key: [sk_live_••••••••]
● Stripe Webhook Secret: [whsec_••••••••]

[Run Agent]
```

---

### 4. Code Generation Agent
**Purpose:** Generate code from specifications

**Capabilities:**
- Generate components from design specs
- Create API routes from schema
- Build forms from data models
- Generate test files
- Scaffold features from Vault patterns

```
AGENT: Generate CRUD for Entity
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Entity: Project
Source: Prisma schema

This agent will create:
✓ API routes: GET, POST, PUT, DELETE
✓ Server actions: createProject, updateProject, deleteProject
✓ React Query hooks: useProject, useProjects
✓ Form component: ProjectForm
✓ List component: ProjectList
✓ Detail component: ProjectDetail

Output location: src/features/projects/

[Run Agent]  [Customize Output]
```

---

### 5. Deployment Agent
**Purpose:** Handle deployment pipeline

**Capabilities:**
- Deploy to staging
- Run pre-deploy checks
- Generate changelog
- Notify client
- Deploy to production
- Post-deploy verification

```
AGENT: Deploy to Staging
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pre-deploy checks:
✓ TypeScript: No errors
✓ Lint: Passed
✓ Tests: 45/45 passing
✓ Build: Successful

This agent will:
✓ Deploy to Vercel preview
✓ Run smoke tests
✓ Generate changelog from commits
✓ Update client portal
✓ Send notification email (optional)

[Deploy]  [Skip Notification]
```

---

## Agent Execution

### Execution Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   PREVIEW   │────▶│   RUNNING   │────▶│  COMPLETE   │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                    │
      │                   │                    │
      ▼                   ▼                    ▼
   Review what        Real-time           Summary of
   agent will do      progress log        what was done
```

### Progress View

```
AGENT RUNNING: Project Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[████████████████████░░░░░░░░░░░░]  67%

✓ Created GitHub repository
  → github.com/yourusername/results-roofing

✓ Initialized Next.js project
  → Applied your standard configuration

✓ Installed dependencies
  → 47 packages installed

● Setting up Vercel project...
  → Creating project...

○ Creating Supabase project
○ Configuring Sentry

──────────────────────────────────────────────────────────────────
[View Full Logs]  [Cancel]
```

### Completion Summary

```
AGENT COMPLETE: Project Setup                          3m 24s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATED RESOURCES
● GitHub: github.com/yourusername/results-roofing
● Vercel: results-roofing.vercel.app
● Supabase: results-roofing (us-east-1)
● Sentry: results-roofing

ENVIRONMENT VARIABLES SET
● NEXT_PUBLIC_SUPABASE_URL
● NEXT_PUBLIC_SUPABASE_ANON_KEY
● SUPABASE_SERVICE_KEY
● SENTRY_DSN
● SENTRY_AUTH_TOKEN

NEXT STEPS
→ Clone repo: git clone git@github.com:yourusername/results-roofing.git
→ Install deps: npm install
→ Start dev: npm run dev

[Open in VS Code]  [View on GitHub]
```

---

## Error Handling

### Recoverable Errors

```
AGENT ERROR: Stripe Integration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Created Stripe products (3)
✓ Set up webhook endpoint
✗ Failed to configure webhook events

Error: Invalid webhook secret format

The webhook secret should start with "whsec_"

[Fix & Retry]  [Skip This Step]  [Cancel]
```

### Rollback

```
AGENT FAILED: Project Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Created GitHub repository
✓ Initialized Next.js project
✗ Failed to create Vercel project

Error: Vercel API rate limit exceeded

ROLLBACK OPTIONS
○ Keep completed steps, retry failed
○ Rollback everything, start fresh
○ Keep and fix manually

[Rollback All]  [Keep & Continue Later]
```

---

## Custom Agents

### Creating Custom Agents

```
CREATE CUSTOM AGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: [Feature Scaffold                    ]
Description: [Create a new feature module with standard structure]

STEPS
1. [Create folder structure              ] [+ Variables]
2. [Generate index.ts                    ] [+ Variables]
3. [Create components/index.ts           ] [+ Variables]
4. [Create hooks/index.ts                ] [+ Variables]
5. [Create types.ts                      ] [+ Variables]
[+ Add Step]

VARIABLES
● featureName: string (required)
● includeTests: boolean (default: true)

TEMPLATE SOURCE
○ From scratch
● From existing feature: [src/features/projects ▾]

[Save Agent]  [Test Run]
```

### Agent Templates

Pre-built agents you can customize:

```
AGENT TEMPLATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project Setup
├── Full Stack (Next.js + Supabase + Vercel)
├── Static Site (Next.js + Vercel)
└── API Only (Next.js API routes)

Database
├── Prisma + PostgreSQL
├── Drizzle + PostgreSQL
└── Supabase Direct

Integrations
├── Stripe Payments
├── Clerk Auth
├── Resend Email
├── Uploadthing Files
└── PostHog Analytics

Code Generation
├── CRUD Feature
├── Form from Schema
├── API Route from Schema
└── Component from Design
```

---

## Agent Definitions

### Schema

```typescript
interface AgentDefinition {
  id: string
  name: string
  description: string
  category: "SETUP" | "DATABASE" | "INTEGRATION" | "CODE" | "DEPLOY" | "CUSTOM"
  isBuiltIn: boolean
  steps: AgentStep[]
  variables: AgentVariable[]
  requiredCredentials: string[]
  estimatedDuration: number  // seconds
}

interface AgentStep {
  id: string
  name: string
  action: string          // Function to execute
  params: object          // Parameters using variables
  canSkip: boolean
  rollbackAction?: string
}

interface AgentVariable {
  name: string
  type: "string" | "boolean" | "select"
  required: boolean
  default?: any
  options?: string[]      // For select type
}
```

### Execution Record

```typescript
interface AgentExecution {
  id: string
  agent: AgentDefinition
  project: Project
  task?: Task
  status: "PENDING" | "RUNNING" | "COMPLETE" | "FAILED" | "CANCELLED"
  startedAt: Date
  completedAt?: Date
  logs: AgentLog[]
  results: object          // Created resources
  error?: string
}

interface AgentLog {
  timestamp: Date
  level: "INFO" | "WARN" | "ERROR"
  step: string
  message: string
  details?: object
}
```

---

## Security

### Credential Management

- Credentials stored in encrypted Vault
- Never logged or exposed in UI
- Scoped to specific agent types
- Rotation reminders

### Execution Sandboxing

- Agents run in isolated context
- Limited API access per agent type
- Rate limiting on external APIs
- Audit log of all actions

### Approval Requirements

High-impact agents require confirmation:
- Creating billable resources
- Modifying production
- Accessing sensitive credentials
- Deleting anything

---

## Integrations

### Sprint Stack
- Agent-able tasks flagged automatically
- One-click execution from task view
- Time tracked as "Agent execution"

### Vault
- Agents use code patterns from Vault
- Generated code saved to Vault (optional)

### Intelligence Layer
- Claude API powers code generation
- Context from planning docs
- Style matching from existing code

---

## Data Model

See `data-models.md` for complete schema. Key entities:
- `AgentDefinition`
- `AgentExecution`
