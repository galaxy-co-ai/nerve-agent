import { CheckCircle, Circle, Clock, AlertCircle, FileText, ExternalLink } from "lucide-react";

type Status = "done" | "in-progress" | "blocked" | "not-started";
type Priority = "p0" | "p1" | "p2" | "p3";

interface Module {
  id: string;
  name: string;
  description: string;
  specFile: string;
  status: Status;
  priority: Priority;
  phase: number;
  tasks: Task[];
  dependencies?: string[];
}

interface Task {
  id: string;
  title: string;
  status: Status;
  notes?: string;
}

const modules: Module[] = [
  // Phase 1 - Core Loop
  {
    id: "daily-driver",
    name: "Daily Driver",
    description: "Morning command center - today's focus, blockers, follow-ups",
    specFile: "11-daily-driver.md",
    status: "done",
    priority: "p0",
    phase: 1,
    tasks: [
      { id: "dd-1", title: "Create daily driver page layout", status: "done", notes: "/dashboard with stats" },
      { id: "dd-2", title: "Build Today's Focus component", status: "done", notes: "Shows in-progress task" },
      { id: "dd-3", title: "Build Blockers Cleared component", status: "done", notes: "/dashboard/blockers page" },
      { id: "dd-4", title: "Build Client Waiting component", status: "done", notes: "Stats card on dashboard" },
      { id: "dd-5", title: "Build Follow-up Queue component", status: "done", notes: "Blocker follow-up tracking" },
      { id: "dd-6", title: "Build Time Summary component", status: "done", notes: "Stats + /dashboard/week" },
      { id: "dd-7", title: "Aggregate data from other modules", status: "done", notes: "All modules integrated" },
    ],
  },
  {
    id: "projects",
    name: "Projects",
    description: "Project CRUD, settings, and overview",
    specFile: "data-models.md",
    status: "done",
    priority: "p0",
    phase: 1,
    tasks: [
      { id: "proj-1", title: "Set up Prisma schema for Project model", status: "done", notes: "Full schema with relations" },
      { id: "proj-2", title: "Create project list page", status: "done", notes: "/projects with cards" },
      { id: "proj-3", title: "Create project detail page", status: "done", notes: "Stats, sprints, blockers" },
      { id: "proj-4", title: "Build project settings/edit form", status: "done", notes: "/projects/[slug]/edit" },
      { id: "proj-5", title: "Add project creation flow", status: "done", notes: "/projects/new" },
    ],
  },
  {
    id: "sprint-stack",
    name: "Sprint Stack",
    description: "Pre-planned sprints with tasks and adaptive estimates",
    specFile: "02-sprint-stack.md",
    status: "done",
    priority: "p0",
    phase: 1,
    dependencies: ["projects"],
    tasks: [
      { id: "ss-1", title: "Set up Sprint and Task Prisma models", status: "done", notes: "Full schema" },
      { id: "ss-2", title: "Create sprint list view", status: "done", notes: "/sprints page" },
      { id: "ss-3", title: "Create sprint detail/kanban view", status: "done", notes: "Sprint detail with tasks" },
      { id: "ss-4", title: "Build task detail panel", status: "done", notes: "Task cards with actions" },
      { id: "ss-5", title: "Implement task status transitions", status: "done", notes: "TODO/IN_PROGRESS/COMPLETED" },
      { id: "ss-6", title: "Build blocker workflow", status: "done", notes: "Add/resolve/delete blockers" },
      { id: "ss-7", title: "Add time tracking integration hooks", status: "done", notes: "Task time entries" },
      { id: "ss-8", title: "Build sprint completion flow", status: "done", notes: "Status transitions" },
    ],
  },
  {
    id: "time-tracking",
    name: "Time Tracking",
    description: "Passive screen-based time tracking via desktop app",
    specFile: "03-time-tracking.md",
    status: "in-progress",
    priority: "p0",
    phase: 1,
    dependencies: ["projects", "sprint-stack"],
    tasks: [
      { id: "tt-1", title: "Set up Electron project in apps/desktop", status: "not-started", notes: "Desktop app pending" },
      { id: "tt-2", title: "Implement window activity detection", status: "not-started" },
      { id: "tt-3", title: "Implement idle detection", status: "not-started" },
      { id: "tt-4", title: "Build project mapping rules system", status: "not-started" },
      { id: "tt-5", title: "Create sync API endpoints", status: "not-started" },
      { id: "tt-6", title: "Build time entry models and storage", status: "done", notes: "Prisma + server actions" },
      { id: "tt-7", title: "Create daily timeline view in web app", status: "done", notes: "/time page" },
      { id: "tt-8", title: "Build weekly summary view", status: "done", notes: "/time/week + /time/reports" },
    ],
  },
  // Phase 2 - Intelligence
  {
    id: "call-intelligence",
    name: "Call Intelligence",
    description: "Transcript → brief + action items + decisions",
    specFile: "05-call-intelligence.md",
    status: "not-started",
    priority: "p1",
    phase: 2,
    dependencies: ["projects"],
    tasks: [
      { id: "ci-1", title: "Build transcript upload UI", status: "not-started" },
      { id: "ci-2", title: "Integrate Claude API for processing", status: "not-started" },
      { id: "ci-3", title: "Create CallBrief model and storage", status: "not-started" },
      { id: "ci-4", title: "Build brief review/edit UI", status: "not-started" },
      { id: "ci-5", title: "Extract and store Decisions", status: "not-started" },
      { id: "ci-6", title: "Extract and store Action Items", status: "not-started" },
      { id: "ci-7", title: "Build follow-up scheduling system", status: "not-started" },
      { id: "ci-8", title: "Create shareable brief view", status: "not-started" },
      { id: "ci-9", title: "Build knowledge search across calls", status: "not-started" },
    ],
  },
  {
    id: "notes",
    name: "Notes & Writing Studio",
    description: "AI writing assistant with auto-tagging and wiki links",
    specFile: "12-notes.md",
    status: "in-progress",
    priority: "p1",
    phase: 2,
    tasks: [
      { id: "notes-1", title: "Build note editor with markdown support", status: "done", notes: "Full CRUD + edit page" },
      { id: "notes-2", title: "Implement wiki-style [[linking]]", status: "done", notes: "NoteContent component" },
      { id: "notes-3", title: "Build backlinks panel", status: "done", notes: "Shows notes linking to current" },
      { id: "notes-4", title: "Integrate Claude for AI writing assist", status: "not-started" },
      { id: "notes-5", title: "Build auto-tagging system", status: "not-started" },
      { id: "notes-6", title: "Create note library/browser", status: "done", notes: "/notes with search & filters" },
      { id: "notes-7", title: "Build context graph visualization", status: "not-started" },
      { id: "notes-8", title: "Add quick note shortcut (Cmd+Shift+N)", status: "not-started" },
    ],
  },
  {
    id: "library",
    name: "Library",
    description: "Reusable code blocks, patterns, features, queries",
    specFile: "06-library.md",
    status: "in-progress",
    priority: "p1",
    phase: 2,
    tasks: [
      { id: "lib-1", title: "Create LibraryItem model (blocks, patterns, features, queries)", status: "done", notes: "Prisma schema complete" },
      { id: "lib-2", title: "Build library browser UI", status: "done", notes: "/library page with stats" },
      { id: "lib-3", title: "Create block/pattern detail view", status: "done", notes: "/library/[id] page" },
      { id: "lib-4", title: "Build 'Add to Library' flow", status: "done", notes: "Dialog component" },
      { id: "lib-5", title: "Implement copy-to-clipboard functionality", status: "done", notes: "With usage tracking" },
      { id: "lib-6", title: "Build search with AI-assisted queries", status: "not-started" },
      { id: "lib-7", title: "Track usage analytics", status: "done", notes: "Usage count + last used" },
    ],
  },
  // Phase 3 - Client-Facing
  {
    id: "client-portal",
    name: "Client Portal",
    description: "Auto-generated progress view for clients",
    specFile: "09-client-portal.md",
    status: "not-started",
    priority: "p1",
    phase: 3,
    dependencies: ["projects", "sprint-stack"],
    tasks: [
      { id: "cp-1", title: "Create portal route structure", status: "not-started" },
      { id: "cp-2", title: "Build magic link authentication", status: "not-started" },
      { id: "cp-3", title: "Create project overview component", status: "not-started" },
      { id: "cp-4", title: "Build sprint progress display", status: "not-started" },
      { id: "cp-5", title: "Create staging preview embed", status: "not-started" },
      { id: "cp-6", title: "Build feedback collection widget", status: "not-started" },
      { id: "cp-7", title: "Create pending items display", status: "not-started" },
      { id: "cp-8", title: "Build portal branding customization", status: "not-started" },
    ],
  },
  {
    id: "financial",
    name: "Financial Nerve",
    description: "Time → revenue, invoicing, payments via Stripe",
    specFile: "10-financial.md",
    status: "not-started",
    priority: "p1",
    phase: 3,
    dependencies: ["projects", "time-tracking"],
    tasks: [
      { id: "fin-1", title: "Build project rate configuration", status: "not-started" },
      { id: "fin-2", title: "Create revenue calculation from time entries", status: "not-started" },
      { id: "fin-3", title: "Build financial dashboard", status: "not-started" },
      { id: "fin-4", title: "Create invoice generation flow", status: "not-started" },
      { id: "fin-5", title: "Integrate Stripe for payments", status: "not-started" },
      { id: "fin-6", title: "Build payment webhook handling", status: "not-started" },
      { id: "fin-7", title: "Create profitability reports", status: "not-started" },
    ],
  },
  {
    id: "feedback-loop",
    name: "Feedback Loop",
    description: "Quality metrics, issue tracking, lessons learned",
    specFile: "08-feedback-loop.md",
    status: "not-started",
    priority: "p1",
    phase: 3,
    dependencies: ["projects", "sprint-stack"],
    tasks: [
      { id: "fl-1", title: "Create Issue model and CRUD", status: "not-started" },
      { id: "fl-2", title: "Set up Sentry webhook for auto-ticketing", status: "not-started" },
      { id: "fl-3", title: "Build issue resolution flow with root cause", status: "not-started" },
      { id: "fl-4", title: "Create Lesson model and capture flow", status: "not-started" },
      { id: "fl-5", title: "Build checklist system", status: "not-started" },
      { id: "fl-6", title: "Create pre-deploy checklist view", status: "not-started" },
      { id: "fl-7", title: "Build quality metrics dashboard", status: "not-started" },
    ],
  },
  // Phase 4 - Power Features
  {
    id: "planning-wizard",
    name: "Planning Wizard",
    description: "8-document planning framework with approval gates",
    specFile: "01-planning-wizard.md",
    status: "not-started",
    priority: "p2",
    phase: 4,
    dependencies: ["projects"],
    tasks: [
      { id: "pw-1", title: "Create PlanningDocument model", status: "not-started" },
      { id: "pw-2", title: "Build document editor with guided prompts", status: "not-started" },
      { id: "pw-3", title: "Implement sequential unlocking logic", status: "not-started" },
      { id: "pw-4", title: "Build approval workflow", status: "not-started" },
      { id: "pw-5", title: "Integrate Claude for AI suggestions", status: "not-started" },
      { id: "pw-6", title: "Create roadmap generation from completed docs", status: "not-started" },
      { id: "pw-7", title: "Build sprint generation from scope", status: "not-started" },
      { id: "pw-8", title: "Create progress overview UI", status: "not-started" },
    ],
  },
  {
    id: "agent-actions",
    name: "Agent Actions",
    description: "AI agents execute repetitive tasks automatically",
    specFile: "04-agent-actions.md",
    status: "not-started",
    priority: "p2",
    phase: 4,
    dependencies: ["projects", "sprint-stack", "library"],
    tasks: [
      { id: "aa-1", title: "Create AgentDefinition model", status: "not-started" },
      { id: "aa-2", title: "Build agent execution engine", status: "not-started" },
      { id: "aa-3", title: "Create Project Setup agent", status: "not-started" },
      { id: "aa-4", title: "Create Database Setup agent", status: "not-started" },
      { id: "aa-5", title: "Create Integration Setup agents (Stripe, Clerk, etc)", status: "not-started" },
      { id: "aa-6", title: "Build agent progress UI", status: "not-started" },
      { id: "aa-7", title: "Create custom agent builder", status: "not-started" },
      { id: "aa-8", title: "Implement rollback functionality", status: "not-started" },
    ],
  },
  {
    id: "terminal",
    name: "Integrated Terminal",
    description: "Claude Code terminal with local file access",
    specFile: "14-terminal.md",
    status: "not-started",
    priority: "p2",
    phase: 4,
    dependencies: ["projects"],
    tasks: [
      { id: "term-1", title: "Build terminal UI component", status: "not-started" },
      { id: "term-2", title: "Create desktop agent for local file access", status: "not-started" },
      { id: "term-3", title: "Integrate Claude Code for AI commands", status: "not-started" },
      { id: "term-4", title: "Build file browser panel", status: "not-started" },
      { id: "term-5", title: "Create Git integration UI", status: "not-started" },
      { id: "term-6", title: "Build Vercel deploy integration", status: "not-started" },
      { id: "term-7", title: "Add project switching", status: "not-started" },
    ],
  },
  {
    id: "ui-library",
    name: "UI Library",
    description: "Living shadcn component library with polish queue",
    specFile: "07-ui-library.md",
    status: "not-started",
    priority: "p2",
    phase: 4,
    tasks: [
      { id: "ui-1", title: "Create UIComponent and UIVariant models", status: "not-started" },
      { id: "ui-2", title: "Build component catalog browser", status: "not-started" },
      { id: "ui-3", title: "Create component detail view with preview", status: "not-started" },
      { id: "ui-4", title: "Build design tokens editor", status: "not-started" },
      { id: "ui-5", title: "Create polish queue system", status: "not-started" },
      { id: "ui-6", title: "Track component usage across projects", status: "not-started" },
    ],
  },
  {
    id: "bookmarks",
    name: "Bookmarks",
    description: "Link library with auto-organization and semantic search",
    specFile: "13-bookmarks.md",
    status: "not-started",
    priority: "p3",
    phase: 4,
    tasks: [
      { id: "bm-1", title: "Create Bookmark model", status: "not-started" },
      { id: "bm-2", title: "Build bookmark browser UI", status: "not-started" },
      { id: "bm-3", title: "Create browser extension", status: "not-started" },
      { id: "bm-4", title: "Implement auto-categorization", status: "not-started" },
      { id: "bm-5", title: "Build semantic search", status: "not-started" },
      { id: "bm-6", title: "Create reading list feature", status: "not-started" },
      { id: "bm-7", title: "Add broken link detection", status: "not-started" },
    ],
  },
  {
    id: "passwords",
    name: "Password Manager",
    description: "Project-organized credentials with zero-knowledge encryption",
    specFile: "15-passwords.md",
    status: "not-started",
    priority: "p3",
    phase: 4,
    dependencies: ["projects"],
    tasks: [
      { id: "pwd-1", title: "Design encryption architecture", status: "not-started" },
      { id: "pwd-2", title: "Create Credential model with encryption", status: "not-started" },
      { id: "pwd-3", title: "Build master password setup flow", status: "not-started" },
      { id: "pwd-4", title: "Create credential browser UI", status: "not-started" },
      { id: "pwd-5", title: "Build credential detail view", status: "not-started" },
      { id: "pwd-6", title: "Create secure sharing feature", status: "not-started" },
      { id: "pwd-7", title: "Build password generator", status: "not-started" },
    ],
  },
  {
    id: "env-vars",
    name: "Environment Variables",
    description: "Centralized env var management with Vercel sync",
    specFile: "16-env-vars.md",
    status: "not-started",
    priority: "p3",
    phase: 4,
    dependencies: ["projects", "passwords"],
    tasks: [
      { id: "env-1", title: "Create EnvironmentVariable model", status: "not-started" },
      { id: "env-2", title: "Build env var dashboard", status: "not-started" },
      { id: "env-3", title: "Create per-environment value management", status: "not-started" },
      { id: "env-4", title: "Build Vercel sync integration", status: "not-started" },
      { id: "env-5", title: "Link to Password Vault credentials", status: "not-started" },
      { id: "env-6", title: "Create missing var detection", status: "not-started" },
      { id: "env-7", title: "Build env var templates", status: "not-started" },
    ],
  },
];

// Foundation tasks that need to happen first
const foundationTasks: Task[] = [
  { id: "f-1", title: "Set up Prisma with Neon", status: "done", notes: "Schema pushed, client generated" },
  { id: "f-2", title: "Configure Clerk authentication", status: "done", notes: "Sign in/up working, dark theme" },
  { id: "f-3", title: "Install and configure shadcn/ui", status: "done", notes: "15+ components installed" },
  { id: "f-4", title: "Set up Claude API integration", status: "not-started" },
  { id: "f-5", title: "Create base layout with navigation", status: "done", notes: "Sidebar, nav, user menu complete" },
  { id: "f-6", title: "Set up Vercel deployment", status: "done", notes: "Deployed and live" },
  { id: "f-7", title: "Create GitHub repository", status: "done", notes: "github.com/galaxy-co-ai/nerve-agent" },
];

function StatusIcon({ status }: { status: Status }) {
  switch (status) {
    case "done":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "in-progress":
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case "blocked":
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case "not-started":
      return <Circle className="w-5 h-5 text-zinc-600" />;
  }
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const colors = {
    p0: "bg-red-500/20 text-red-400 border-red-500/30",
    p1: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    p2: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    p3: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${colors[priority]}`}>
      {priority.toUpperCase()}
    </span>
  );
}

function ProgressBar({ tasks }: { tasks: Task[] }) {
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const total = tasks.length;
  const donePercent = (done / total) * 100;
  const inProgressPercent = (inProgress / total) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full flex">
          <div className="bg-green-500 transition-all" style={{ width: `${donePercent}%` }} />
          <div className="bg-yellow-500 transition-all" style={{ width: `${inProgressPercent}%` }} />
        </div>
      </div>
      <span className="text-sm text-zinc-500 tabular-nums">
        {done}/{total}
      </span>
    </div>
  );
}

function ModuleCard({ module }: { module: Module }) {
  return (
    <div className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusIcon status={module.status} />
          <h3 className="font-semibold">{module.name}</h3>
        </div>
        <PriorityBadge priority={module.priority} />
      </div>
      <p className="text-sm text-zinc-400 mb-3">{module.description}</p>
      <ProgressBar tasks={module.tasks} />
      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
        <FileText className="w-3 h-3" />
        <span>{module.specFile}</span>
        {module.dependencies && (
          <>
            <span className="mx-1">•</span>
            <span>Depends on: {module.dependencies.join(", ")}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function BacklogPage() {
  const phases = [1, 2, 3, 4];
  const phaseNames = {
    1: "Core Loop",
    2: "Intelligence",
    3: "Client-Facing",
    4: "Power Features",
  };

  const totalTasks = modules.flatMap((m) => m.tasks).length + foundationTasks.length;
  const doneTasks = modules.flatMap((m) => m.tasks).filter((t) => t.status === "done").length +
    foundationTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = modules.flatMap((m) => m.tasks).filter((t) => t.status === "in-progress").length +
    foundationTasks.filter((t) => t.status === "in-progress").length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold">NERVE AGENT</h1>
                <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30">
                  DEVELOPMENT BACKLOG
                </span>
              </div>
              <p className="text-sm text-zinc-500 mt-1">
                Living backlog for building NERVE AGENT • Remove this page when complete
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold tabular-nums">
                {doneTasks}/{totalTasks}
              </div>
              <div className="text-sm text-zinc-500">tasks complete</div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mt-4">
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full flex">
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
                />
                <div
                  className="bg-yellow-500 transition-all"
                  style={{ width: `${(inProgressTasks / totalTasks) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-zinc-500">
              <span>{doneTasks} done</span>
              <span>{inProgressTasks} in progress</span>
              <span>{totalTasks - doneTasks - inProgressTasks} remaining</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Foundation Tasks */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Foundation
          </h2>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <div className="space-y-2">
              {foundationTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3">
                  <StatusIcon status={task.status} />
                  <span className={task.status === "done" ? "line-through text-zinc-500" : ""}>
                    {task.title}
                  </span>
                  {task.notes && (
                    <span className="text-xs text-zinc-500 italic">— {task.notes}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Phases */}
        {phases.map((phase) => {
          const phaseModules = modules.filter((m) => m.phase === phase);
          return (
            <section key={phase} className="mb-12">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    phase === 1
                      ? "bg-red-500"
                      : phase === 2
                      ? "bg-orange-500"
                      : phase === 3
                      ? "bg-blue-500"
                      : "bg-zinc-500"
                  }`}
                ></span>
                Phase {phase}: {phaseNames[phase as keyof typeof phaseNames]}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phaseModules.map((module) => (
                  <ModuleCard key={module.id} module={module} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Quick Links */}
        <section className="mt-16 pt-8 border-t border-zinc-800">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/galaxy-co-ai/nerve-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub Repository
            </a>
            <a
              href="https://vercel.com/galaxy-co/nerve-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Vercel Dashboard
            </a>
            <a
              href="/specs"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              View Specs
            </a>
          </div>
        </section>

        {/* Footer Note */}
        <footer className="mt-16 pt-8 border-t border-zinc-800 text-center text-sm text-zinc-600">
          <p>
            This backlog page is temporary. Once NERVE AGENT is complete, delete{" "}
            <code className="px-1 py-0.5 bg-zinc-900 rounded">src/app/backlog/</code> and this will be
            a fully functional app.
          </p>
        </footer>
      </main>
    </div>
  );
}
