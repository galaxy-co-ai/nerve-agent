# Environment Variables Manager

## Overview

A centralized manager for all your environment variables across projects and environments. See what's set, what's missing, sync to Vercel, and never lose track of that one API key again.

## Philosophy

- **One source of truth** — All env vars in one place
- **Environment-aware** — Dev, staging, production tracked separately
- **Sync everywhere** — Push to Vercel, pull from .env files
- **Never lose keys** — Linked to Password Vault credentials

---

## Environment Dashboard

### Project View

```
ENVIRONMENT VARIABLES — Results Roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENVIRONMENTS
──────────────────────────────────────────────────────────────────
[Development]  [Staging]  [Production]

DEVELOPMENT VARIABLES                                   15 vars
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATABASE
──────────────────────────────────────────────────────────────────
DATABASE_URL               ✓ Set   postgresql://...
DIRECT_URL                 ✓ Set   postgresql://...

AUTH (Clerk)
──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY    ✓ Set   pk_test_...
CLERK_SECRET_KEY                      ✓ Set   sk_test_...
CLERK_WEBHOOK_SECRET                  ✗ Missing

PAYMENTS (Stripe)
──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY   ✓ Set   pk_test_...
STRIPE_SECRET_KEY                     ✓ Set   sk_test_... 🔑
STRIPE_WEBHOOK_SECRET                 ✓ Set   whsec_...  🔑

STORAGE
──────────────────────────────────────────────────────────────────
UPLOADTHING_SECRET                    ✓ Set   sk_live_...
UPLOADTHING_APP_ID                    ✓ Set   ...

MONITORING
──────────────────────────────────────────────────────────────────
SENTRY_DSN                            ✓ Set   https://...
SENTRY_AUTH_TOKEN                     ✗ Missing

──────────────────────────────────────────────────────────────────
🔑 = Linked to Password Vault

[+ Add Variable]  [Import .env]  [Sync to Vercel]
```

### Environment Comparison

```
ENVIRONMENT COMPARISON — Results Roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Variable                    Development   Staging   Production
──────────────────────────────────────────────────────────────────
DATABASE_URL                ✓ dev         ✓ stg     ✓ prod
CLERK_SECRET_KEY            ✓ test        ✓ test    ✓ live
STRIPE_SECRET_KEY           ✓ test        ✓ test    ✓ live
STRIPE_WEBHOOK_SECRET       ✓             ✗ MISSING ✓
SENTRY_DSN                  ✓             ✓         ✓
SENTRY_AUTH_TOKEN           ✗ MISSING     ✗ MISSING ✗ MISSING

LEGEND
──────────────────────────────────────────────────────────────────
✓ Set           Variable is configured
✗ MISSING       Variable not set (may cause errors)
test/live       Indicates test vs production keys

ISSUES
──────────────────────────────────────────────────────────────────
⚠️ STRIPE_WEBHOOK_SECRET missing in Staging
   Webhooks will fail in staging environment
   [Set Now]

⚠️ SENTRY_AUTH_TOKEN missing in all environments
   Source map uploads will fail
   [Set Now]
```

---

## Variable Management

### Add Variable

```
ADD ENVIRONMENT VARIABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Variable Name:
┌─────────────────────────────────────────────────────────────────┐
│ STRIPE_WEBHOOK_SECRET                                           │
└─────────────────────────────────────────────────────────────────┘

Category: [Payments ▾]

VALUES PER ENVIRONMENT
──────────────────────────────────────────────────────────────────
Development:
┌─────────────────────────────────────────────────────────────────┐
│ whsec_test_abc123...                                            │
└─────────────────────────────────────────────────────────────────┘
☑️ Same as development for Staging

Production:
┌─────────────────────────────────────────────────────────────────┐
│ whsec_live_xyz789...                                            │
└─────────────────────────────────────────────────────────────────┘

LINK TO PASSWORD VAULT
──────────────────────────────────────────────────────────────────
☑️ Link to credential: [Stripe Live Keys ▾] → Webhook Secret

VISIBILITY
──────────────────────────────────────────────────────────────────
○ Server-only (recommended for secrets)
○ Public (NEXT_PUBLIC_* prefix, exposed to browser)

[Save Variable]
```

### Edit Variable

```
EDIT VARIABLE — STRIPE_SECRET_KEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VALUES
──────────────────────────────────────────────────────────────────
Development:  sk_test_••••••••••••••••    [Reveal] [Copy]
Staging:      sk_test_••••••••••••••••    [Reveal] [Copy]
Production:   sk_live_••••••••••••••••    [Reveal] [Copy]

LINKED CREDENTIAL
──────────────────────────────────────────────────────────────────
🔑 Stripe Live Keys → Secret Key
   Last synced: 2 hours ago
   [Sync Now]  [Unlink]

HISTORY
──────────────────────────────────────────────────────────────────
Jan 28   Production value updated
Jan 15   Variable created
Jan 15   Linked to credential

[Save]  [Delete Variable]
```

---

## Import/Export

### Import from .env

```
IMPORT FROM .ENV FILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Drop .env file here or click to browse]

PREVIEW
──────────────────────────────────────────────────────────────────
Found 12 variables in .env.local:

☑️ DATABASE_URL                Already exists (update?)
☑️ NEXT_PUBLIC_CLERK_PUB...    Already exists (same value)
☑️ CLERK_SECRET_KEY            Already exists (update?)
☑️ STRIPE_SECRET_KEY           New variable
☑️ STRIPE_WEBHOOK_SECRET       New variable
...

Import to environment: [Development ▾]

[Import Selected]  [Import All]
```

### Export to .env

```
EXPORT TO .ENV FILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Environment: [Development ▾]

PREVIEW
──────────────────────────────────────────────────────────────────
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Storage
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."

# Monitoring
SENTRY_DSN="https://..."

[Copy to Clipboard]  [Download .env.local]
```

---

## Vercel Sync

### Sync Status

```
VERCEL SYNC — Results Roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Vercel Project: results-roofing
Last synced: 2 hours ago

SYNC STATUS
──────────────────────────────────────────────────────────────────
Variable                    Nerve Agent    Vercel     Status
──────────────────────────────────────────────────────────────────
DATABASE_URL                ✓              ✓          ✓ Synced
CLERK_SECRET_KEY            ✓              ✓          ✓ Synced
STRIPE_SECRET_KEY           ✓ (updated)    ✓ (old)    ⚠️ Out of sync
STRIPE_WEBHOOK_SECRET       ✓              ✗          ⚠️ Not in Vercel
NEW_VARIABLE                ✗              ✓          ⚠️ Only in Vercel

ACTIONS
──────────────────────────────────────────────────────────────────
⚠️ 3 variables out of sync

[Push All to Vercel]  [Pull from Vercel]  [Review Changes]
```

### Sync Confirmation

```
PUSH TO VERCEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The following changes will be made to Vercel:

UPDATES (2)
──────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY
  Current: sk_live_old...
  New:     sk_live_new...

STRIPE_WEBHOOK_SECRET
  Will be added to Vercel (Production)

Environment targets:
☑️ Production
☑️ Preview
☑️ Development

⚠️ This will trigger a redeployment

[Confirm Push]  [Cancel]
```

---

## Templates

### Variable Templates

```
VARIABLE TEMPLATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pre-configured variable sets for common services:

AUTHENTICATION
──────────────────────────────────────────────────────────────────
📦 Clerk
   • NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   • CLERK_SECRET_KEY
   • CLERK_WEBHOOK_SECRET
   [Apply Template]

📦 NextAuth
   • NEXTAUTH_SECRET
   • NEXTAUTH_URL
   [Apply Template]

PAYMENTS
──────────────────────────────────────────────────────────────────
📦 Stripe
   • NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   • STRIPE_SECRET_KEY
   • STRIPE_WEBHOOK_SECRET
   [Apply Template]

DATABASE
──────────────────────────────────────────────────────────────────
📦 Supabase
   • NEXT_PUBLIC_SUPABASE_URL
   • NEXT_PUBLIC_SUPABASE_ANON_KEY
   • SUPABASE_SERVICE_KEY
   • DATABASE_URL
   • DIRECT_URL
   [Apply Template]
```

### Apply Template

```
APPLY TEMPLATE: Stripe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This will create the following variables:

VARIABLES TO CREATE
──────────────────────────────────────────────────────────────────
○ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY    (already exists)
☑️ STRIPE_SECRET_KEY                     (will create)
☑️ STRIPE_WEBHOOK_SECRET                 (will create)

LINK TO CREDENTIALS
──────────────────────────────────────────────────────────────────
Link to existing credential: [Stripe Live Keys ▾]

Auto-fill values from linked credential?
☑️ Yes, populate from Password Vault

[Apply Template]
```

---

## Validation

### Missing Variables Check

```
VALIDATION — Results Roofing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Checking against: package.json, code references

MISSING IN DEVELOPMENT
──────────────────────────────────────────────────────────────────
❌ CLERK_WEBHOOK_SECRET
   Referenced in: src/app/api/webhooks/clerk/route.ts
   [Add Variable]

❌ SENTRY_AUTH_TOKEN
   Referenced in: next.config.js (source map upload)
   [Add Variable]

UNUSED VARIABLES
──────────────────────────────────────────────────────────────────
⚠️ OLD_API_KEY
   Not referenced anywhere in code
   Last used: Unknown
   [Delete]  [Keep]

ALL ENVIRONMENTS
──────────────────────────────────────────────────────────────────
Development:  13/15 required ⚠️
Staging:      12/15 required ⚠️
Production:   14/15 required ⚠️
```

### Pre-Deploy Check

```
PRE-DEPLOY ENVIRONMENT CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Checking Production environment...

✓ DATABASE_URL                Set
✓ CLERK_SECRET_KEY            Set (live key detected) ✓
✓ STRIPE_SECRET_KEY           Set (live key detected) ✓
✓ STRIPE_WEBHOOK_SECRET       Set
✓ SENTRY_DSN                  Set

WARNINGS
──────────────────────────────────────────────────────────────────
⚠️ NEXT_PUBLIC_API_URL is set to localhost
   This may cause issues in production
   [Fix]

All critical variables present. Safe to deploy.

[Continue Deploy]  [Review Variables]
```

---

## Security

### Sensitive Variable Handling

```
SECURITY SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENCRYPTION
──────────────────────────────────────────────────────────────────
All variable values are encrypted at rest using AES-256

VISIBILITY RULES
──────────────────────────────────────────────────────────────────
• Values hidden by default (shown as •••••)
• Reveal requires click + brief display
• Copy doesn't reveal value
• Audit log tracks all access

SENSITIVE PATTERNS
──────────────────────────────────────────────────────────────────
Auto-detected as sensitive:
• *_SECRET*
• *_KEY*
• *_TOKEN*
• *PASSWORD*
• *_DSN*

These variables:
• Never shown in logs
• Require confirmation to reveal
• Tracked in audit log
```

### Access Log

```
VARIABLE ACCESS LOG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECENT ACCESS
──────────────────────────────────────────────────────────────────
Today 2:34 PM    Revealed: STRIPE_SECRET_KEY (Production)
Today 2:30 PM    Copied: DATABASE_URL (Development)
Today 11:20 AM   Synced to Vercel (5 variables)
Yesterday        Added: SENTRY_AUTH_TOKEN
Yesterday        Updated: STRIPE_WEBHOOK_SECRET
```

---

## Data Model

```typescript
interface EnvironmentVariable {
  id: string
  project: Project
  name: string
  category: VariableCategory
  values: EnvironmentValue[]
  linkedCredential?: Credential
  linkedCredentialField?: string
  isPublic: boolean              // NEXT_PUBLIC_ prefix
  isSensitive: boolean
  createdAt: Date
  updatedAt: Date
}

interface EnvironmentValue {
  id: string
  variable: EnvironmentVariable
  environment: "DEVELOPMENT" | "STAGING" | "PRODUCTION"
  value: string                  // Encrypted
  vercelSynced: boolean
  vercelSyncedAt?: Date
}

interface VariableCategory {
  id: string
  name: string                   // "Database", "Auth", "Payments"
  icon: string
  order: number
}
```

---

## Integrations

### Password Vault
- Variables link to credentials
- Auto-sync when credential updates
- One source of truth

### Terminal
- Env vars available in terminal sessions
- Loaded from correct environment

### Agent Actions
- Agents set env vars during setup
- Vercel sync automated

### Vercel
- Two-way sync supported
- Push/pull capabilities
- Deployment triggers tracked

### Projects
- Variables scoped to projects
- Templates speed up setup
