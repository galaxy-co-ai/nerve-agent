# Data Models

## Core Entities

### User
Extended from Clerk with app-specific preferences.

```prisma
model User {
  id                    String   @id // Clerk user ID
  email                 String   @unique
  name                  String?
  avatarUrl             String?

  // Preferences
  defaultView           String   @default("daily") // daily, projects
  theme                 String   @default("dark")  // dark, light, system
  weekStartsOn          Int      @default(1)       // 0=Sun, 1=Mon

  // Time tracking
  workingHoursStart     String   @default("09:00")
  workingHoursEnd       String   @default("17:00")

  // Relationships
  projects              Project[]
  timeEntries           TimeEntry[]
  agentExecutions       AgentExecution[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### Project
A client project with all its phases.

```prisma
model Project {
  id                    String   @id @default(cuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id])

  // Basic info
  name                  String
  slug                  String   @unique
  clientName            String
  description           String?

  // Status
  status                ProjectStatus @default(PLANNING)
  phase                 ProjectPhase  @default(PLAN)
  health                Int           @default(100) // 0-100

  // Dates
  startDate             DateTime?
  targetEndDate         DateTime?
  actualEndDate         DateTime?

  // Financial
  contractValue         Decimal?
  hourlyRate            Decimal?
  paymentStructure      String?  // "half-half", "weekly", "milestone"

  // Client portal
  portalEnabled         Boolean  @default(true)
  portalPassword        String?  // Hashed, optional

  // Tech stack (JSON array of tech stack item IDs)
  techStack             Json     @default("[]")

  // Relationships
  planningDocuments     PlanningDocument[]
  sprints               Sprint[]
  callBriefs            CallBrief[]
  blockers              Blocker[]
  issues                Issue[]
  invoices              Invoice[]
  timeEntries           TimeEntry[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum ProjectStatus {
  PLANNING
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}

enum ProjectPhase {
  PLAN
  SPRINT
  SHIP
  SUPPORT
}
```

### PlanningDocument
One of the 8 planning documents per project.

```prisma
model PlanningDocument {
  id                    String   @id @default(cuid())
  projectId             String
  project               Project  @relation(fields: [projectId], references: [id])

  // Document type (1-8)
  type                  PlanningDocType
  order                 Int      // 1-8

  // Status
  status                DocStatus @default(NOT_STARTED)

  // Content (JSON structure varies by type)
  content               Json     @default("{}")

  // Approval
  approvedAt            DateTime?

  // Blockers specific to this doc
  blockerNotes          String?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@unique([projectId, type])
}

enum PlanningDocType {
  PROJECT_BRIEF           // 1
  TECHNICAL_DISCOVERY     // 2
  SCOPE_DEFINITION        // 3
  INFORMATION_ARCHITECTURE // 4
  DESIGN_SYSTEM           // 5
  INTEGRATION_MAPPING     // 6
  TIMELINE_MILESTONES     // 7
  RISK_REGISTER           // 8
}

enum DocStatus {
  NOT_STARTED
  IN_PROGRESS
  BLOCKED
  COMPLETE
}
```

### Sprint
A sprint within a project.

```prisma
model Sprint {
  id                    String   @id @default(cuid())
  projectId             String
  project               Project  @relation(fields: [projectId], references: [id])

  // Basic info
  number                Int      // Sprint 1, 2, 3...
  name                  String   // "Foundation", "Core Dashboard", etc.
  description           String?

  // Status
  status                SprintStatus @default(NOT_STARTED)

  // Time estimates
  estimatedHours        Decimal
  adjustedHours         Decimal? // AI-adjusted estimate
  actualHours           Decimal  @default(0)

  // Dates
  plannedStartDate      DateTime?
  plannedEndDate        DateTime?
  actualStartDate       DateTime?
  actualEndDate         DateTime?

  // Relationships
  tasks                 Task[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@unique([projectId, number])
}

enum SprintStatus {
  NOT_STARTED
  IN_PROGRESS
  BLOCKED
  COMPLETED
}
```

### Task
A task within a sprint.

```prisma
model Task {
  id                    String   @id @default(cuid())
  sprintId              String
  sprint                Sprint   @relation(fields: [sprintId], references: [id])

  // Basic info
  title                 String
  description           String?
  order                 Int      // Order within sprint

  // Status
  status                TaskStatus @default(TODO)

  // Categorization (for adaptive estimation)
  category              String?  // "integration", "ui-component", "api", etc.
  tags                  Json     @default("[]")

  // Time estimates
  estimatedHours        Decimal
  adjustedHours         Decimal? // AI-adjusted
  actualHours           Decimal  @default(0)

  // Agent-able
  agentable             Boolean  @default(false)
  agentDefinitionId     String?
  agentDefinition       AgentDefinition? @relation(fields: [agentDefinitionId], references: [id])

  // Blocker reference
  blockerId             String?
  blocker               Blocker? @relation(fields: [blockerId], references: [id])

  // Completion
  completedAt           DateTime?

  // Relationships
  timeEntries           TimeEntry[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  BLOCKED
  COMPLETED
}
```

### TimeEntry
Auto-tracked or manual time entries.

```prisma
model TimeEntry {
  id                    String   @id @default(cuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id])
  projectId             String
  project               Project  @relation(fields: [projectId], references: [id])
  taskId                String?
  task                  Task?    @relation(fields: [taskId], references: [id])

  // Time
  startTime             DateTime
  endTime               DateTime?
  durationMinutes       Int

  // Source
  source                TimeSource @default(AUTO)

  // Auto-tracking metadata
  appName               String?  // "VS Code", "Figma", etc.
  windowTitle           String?

  // Manual entry
  description           String?

  // Billing
  billable              Boolean  @default(true)
  invoiceId             String?
  invoice               Invoice? @relation(fields: [invoiceId], references: [id])

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum TimeSource {
  AUTO      // From desktop app
  MANUAL    // Manual entry
  ADJUSTED  // Adjusted during daily review
}
```

---

## Call Intelligence

### CallTranscript
Raw transcript storage.

```prisma
model CallTranscript {
  id                    String   @id @default(cuid())
  projectId             String?

  // Source
  source                String?  // "google-meet", "zoom", "manual"
  originalFilename      String?

  // Content
  rawContent            String   @db.Text

  // Processing
  processedAt           DateTime?

  // Relationships
  callBrief             CallBrief?

  createdAt             DateTime @default(now())
}
```

### CallBrief
Generated brief from transcript.

```prisma
model CallBrief {
  id                    String   @id @default(cuid())
  transcriptId          String   @unique
  transcript            CallTranscript @relation(fields: [transcriptId], references: [id])
  projectId             String?
  project               Project? @relation(fields: [projectId], references: [id])

  // Metadata
  title                 String
  date                  DateTime
  participants          Json     @default("[]") // Array of names

  // Generated content
  tldr                  Json     @default("[]") // Array of bullet points
  statusSnapshot        Json?    // Status at time of call

  // Shareable
  shareToken            String   @unique @default(cuid())

  // Relationships
  decisions             Decision[]
  actionItems           ActionItem[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### Decision
Extracted decisions from calls.

```prisma
model Decision {
  id                    String   @id @default(cuid())
  callBriefId           String
  callBrief             CallBrief @relation(fields: [callBriefId], references: [id])

  // Content
  title                 String
  description           String?

  // Status
  status                DecisionStatus @default(ALIGNED)

  // Timestamp reference in transcript
  timestampRef          String?

  createdAt             DateTime @default(now())
}

enum DecisionStatus {
  NEEDS_DISCUSSION
  ALIGNED
}
```

### ActionItem
Extracted action items from calls.

```prisma
model ActionItem {
  id                    String   @id @default(cuid())
  callBriefId           String
  callBrief             CallBrief @relation(fields: [callBriefId], references: [id])

  // Content
  title                 String
  assignee              String   // "Dalton", "Tareq", "Client"

  // Status
  status                ActionStatus @default(PENDING)

  // Link to task if converted
  taskId                String?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum ActionStatus {
  PENDING
  COMPLETED
  CONVERTED_TO_TASK
}
```

### Blocker
Things blocking progress.

```prisma
model Blocker {
  id                    String   @id @default(cuid())
  projectId             String
  project               Project  @relation(fields: [projectId], references: [id])

  // Content
  title                 String
  description           String?

  // Type
  type                  BlockerType @default(HARD)

  // Who's responsible
  waitingOn             String   // "client", "self", "third-party"

  // Status
  status                BlockerStatus @default(ACTIVE)

  // Aging
  createdAt             DateTime @default(now())
  resolvedAt            DateTime?

  // Auto follow-up
  lastFollowUpAt        DateTime?
  followUpCount         Int      @default(0)

  // Relationships
  tasks                 Task[]

  updatedAt             DateTime @updatedAt
}

enum BlockerType {
  HARD   // Needs external input
  SOFT   // Can be worked around
}

enum BlockerStatus {
  ACTIVE
  RESOLVED
}
```

---

## Quality & Feedback

### Issue
Bugs, errors, and problems.

```prisma
model Issue {
  id                    String   @id @default(cuid())
  projectId             String
  project               Project  @relation(fields: [projectId], references: [id])

  // Basic info
  title                 String
  description           String?

  // Source
  source                IssueSource @default(MANUAL)
  sentryId              String?  // Sentry issue ID if from Sentry
  sentryUrl             String?

  // Severity
  severity              IssueSeverity @default(MEDIUM)

  // Status
  status                IssueStatus @default(NEW)

  // Resolution
  rootCause             String?
  resolution            String?
  resolvedAt            DateTime?

  // Assigned sprint
  sprintId              String?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Relationships
  lessons               Lesson[]
}

enum IssueSource {
  MANUAL
  SENTRY
  CLIENT_FEEDBACK
}

enum IssueSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum IssueStatus {
  NEW
  INVESTIGATING
  IN_PROGRESS
  RESOLVED
  WONT_FIX
}
```

### Lesson
Lessons learned from issues.

```prisma
model Lesson {
  id                    String   @id @default(cuid())
  issueId               String?
  issue                 Issue?   @relation(fields: [issueId], references: [id])

  // Content
  title                 String
  description           String

  // Scope
  scope                 LessonScope @default(PROJECT)
  projectId             String?  // If project-specific

  // Generates checklist item?
  generatesChecklist    Boolean  @default(false)
  checklistItemId       String?

  createdAt             DateTime @default(now())
}

enum LessonScope {
  PROJECT   // Specific to one project
  GLOBAL    // Applies to all projects
}
```

### ChecklistItem
Pre-flight checklist items.

```prisma
model ChecklistItem {
  id                    String   @id @default(cuid())

  // Content
  title                 String
  description           String?

  // Categorization
  category              String   // "api", "forms", "integrations", etc.

  // Source
  autoGenerated         Boolean  @default(false)
  lessonId              String?  // If generated from lesson

  // Usage
  usageCount            Int      @default(0)
  lastUsedAt            DateTime?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

---

## The Vault

### VaultItem
Base for all vault items.

```prisma
model VaultItem {
  id                    String   @id @default(cuid())

  // Basic info
  name                  String
  description           String?
  type                  VaultItemType

  // Content
  files                 Json     @default("[]")  // Array of file paths/contents
  content               String?  @db.Text        // For patterns/queries

  // Documentation (AI-generated)
  documentation         String?  @db.Text

  // Categorization
  tags                  Json     @default("[]")

  // Usage tracking
  usageCount            Int      @default(0)
  lastUsedAt            DateTime?
  projectsUsedIn        Json     @default("[]")  // Array of project IDs

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum VaultItemType {
  BLOCK     // Large code chunks
  PATTERN   // Smaller patterns
  FEATURE   // Complete features
  QUERY     // Database queries
}
```

---

## UI Library

### UIComponent
Component in the living UI library.

```prisma
model UIComponent {
  id                    String   @id @default(cuid())

  // Basic info
  name                  String   @unique
  category              String   // "buttons", "forms", "cards", etc.
  description           String?

  // Status
  status                ComponentStatus @default(DRAFT)

  // Code
  code                  String   @db.Text

  // Usage tracking
  usageCount            Int      @default(0)
  projectsUsedIn        Json     @default("[]")

  // Issues
  issueCount            Int      @default(0)

  // Relationships
  variants              UIVariant[]
  polishItems           PolishItem[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum ComponentStatus {
  DRAFT
  REVIEWED
  APPROVED
}
```

### UIVariant
Variant of a component.

```prisma
model UIVariant {
  id                    String   @id @default(cuid())
  componentId           String
  component             UIComponent @relation(fields: [componentId], references: [id])

  // Basic info
  name                  String   // "primary", "secondary", "outline"

  // Properties (JSON of variant-specific props)
  properties            Json     @default("{}")

  // Preview code
  previewCode           String?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@unique([componentId, name])
}
```

### UIToken
Design tokens.

```prisma
model UIToken {
  id                    String   @id @default(cuid())

  // Basic info
  name                  String   @unique // "--color-primary"
  category              String   // "colors", "spacing", "radius", etc.

  // Values
  lightValue            String
  darkValue             String

  // Usage
  usageCount            Int      @default(0)

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### PolishItem
Items in the polish queue.

```prisma
model PolishItem {
  id                    String   @id @default(cuid())
  componentId           String
  component             UIComponent @relation(fields: [componentId], references: [id])

  // Content
  description           String

  // Status
  status                PolishStatus @default(PENDING)

  // Resolution
  notes                 String?
  resolvedAt            DateTime?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum PolishStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}
```

---

## Financial

### Invoice
Generated invoices.

```prisma
model Invoice {
  id                    String   @id @default(cuid())
  projectId             String
  project               Project  @relation(fields: [projectId], references: [id])

  // Basic info
  invoiceNumber         String   @unique

  // Amounts
  amount                Decimal
  currency              String   @default("USD")

  // Dates
  issuedAt              DateTime @default(now())
  dueAt                 DateTime
  paidAt                DateTime?

  // Status
  status                InvoiceStatus @default(DRAFT)

  // Stripe
  stripeInvoiceId       String?
  stripePaymentUrl      String?

  // Line items (JSON array)
  lineItems             Json     @default("[]")

  // Relationships
  timeEntries           TimeEntry[]
  payments              Payment[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  OVERDUE
  CANCELLED
}
```

### Payment
Payment records.

```prisma
model Payment {
  id                    String   @id @default(cuid())
  invoiceId             String
  invoice               Invoice  @relation(fields: [invoiceId], references: [id])

  // Amount
  amount                Decimal
  currency              String   @default("USD")

  // Stripe
  stripePaymentId       String?

  // Date
  paidAt                DateTime @default(now())

  createdAt             DateTime @default(now())
}
```

---

## Agents

### AgentDefinition
Definition of an agent task.

```prisma
model AgentDefinition {
  id                    String   @id @default(cuid())

  // Basic info
  name                  String
  description           String?

  // Type
  type                  AgentType @default(CUSTOM)
  category              String   // "setup", "development", "deployment", etc.

  // Instructions (for AI)
  instructions          String   @db.Text

  // Inputs needed (JSON schema)
  inputSchema           Json     @default("{}")

  // Task association
  taskMatcher           String?  // Regex or tag to match tasks

  // Status
  enabled               Boolean  @default(true)

  // Relationships
  tasks                 Task[]
  executions            AgentExecution[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum AgentType {
  STANDARD  // Built-in agents
  CUSTOM    // User-defined
}
```

### AgentExecution
Record of agent executions.

```prisma
model AgentExecution {
  id                    String   @id @default(cuid())
  agentDefinitionId     String
  agentDefinition       AgentDefinition @relation(fields: [agentDefinitionId], references: [id])
  userId                String
  user                  User     @relation(fields: [userId], references: [id])

  // Input/Output
  input                 Json     @default("{}")
  output                Json?

  // Status
  status                ExecutionStatus @default(RUNNING)

  // Timing
  startedAt             DateTime @default(now())
  completedAt           DateTime?

  // Error handling
  error                 String?

  // Result (e.g., URL of created resource)
  resultUrl             String?
  resultMessage         String?

  createdAt             DateTime @default(now())
}

enum ExecutionStatus {
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}
```

---

## Tech Stack

### TechStackItem
Available tech stack items.

```prisma
model TechStackItem {
  id                    String   @id @default(cuid())

  // Basic info
  name                  String   @unique
  category              String   // "core", "ui", "integrations", "dev-tools"

  // Display
  displayName           String
  logoUrl               String?

  // Version tracking
  currentVersion        String?

  // Documentation
  docsUrl               String?

  // Default in new projects?
  isDefault             Boolean  @default(false)

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

---

## Adaptive Estimation

### TaskMetric
Historical task metrics for estimation.

```prisma
model TaskMetric {
  id                    String   @id @default(cuid())

  // Task categorization
  category              String
  tags                  Json     @default("[]")

  // Metrics
  estimatedHours        Decimal
  actualHours           Decimal
  ratio                 Decimal  // actual / estimated

  // Context
  projectId             String
  taskId                String
  isFirstTime           Boolean  @default(false) // First time doing this type

  createdAt             DateTime @default(now())
}
```

---

## Indexes

```prisma
// Performance indexes
@@index([projectId])
@@index([sprintId])
@@index([userId])
@@index([status])
@@index([createdAt])
@@index([category])
```
