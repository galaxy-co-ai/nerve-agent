<div align="center">

# NERVE AGENT

**A project operating system for solo builders.**

Not a flexible tool you configure — a framework you follow.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Documentation](docs/) · [Report Bug](https://github.com/galaxy-co-ai/nerve-agent/issues) · [Request Feature](https://github.com/galaxy-co-ai/nerve-agent/issues)

</div>

---

## The Problem

Every PM tool is built for *teams*. They assume you need collaboration features, approval workflows, and communication overhead.

But when you're solo, the bottleneck is **attention** and **context-switching**.

You're the strategist, designer, developer, PM, and accountant — all at once. You don't need another tool that requires constant care and feeding.

## The Solution

Nerve Agent is the **anti-Notion**. The **anti-Linear**. Built for the chaos of being a one-person studio.

| Traditional PM Tools | Nerve Agent |
|---------------------|-------------|
| Built for teams | Built for **you** |
| You organize everything | It organizes for you |
| Manual status updates | Auto-generated artifacts |
| Context lives in your head | Context lives in the system |
| Generic and flexible | Opinionated and fast |
| Estimates are guesses | Estimates learn from history |

### Core Principles

1. **Be your single pane of glass** — stop alt-tabbing between 12 apps
2. **Think ahead for you** — surface what matters *right now*
3. **Remember everything** — context-switch fearlessly
4. **Automate the bullshit** — status updates, follow-ups, organization
5. **Force rigorous planning** — never start building before you're ready
6. **Learn from your history** — estimates improve, mistakes don't repeat

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

## Features

### Daily Driver
Morning command center showing today's focus, blockers cleared, client waiting items, and follow-up queue.

### Sprint Stack
Pre-planned sprints with AI-adjusted estimates based on your historical performance. Passive time tracking via companion app.

### Notes & Writing Studio
AI writing assistant with wiki-style `[[linking]]`, auto-tagging, and context graphs.

### Library
Personal library of reusable code — blocks, patterns, features, and queries saved across projects.

### Client Portal
Auto-generated progress view for clients with staging links and feedback collection.

### Call Intelligence
Drop a transcript, get a brief + action items + decisions extracted automatically.

### Agent Actions
AI agents execute repetitive setup tasks automatically.

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL ([Neon](https://neon.tech) recommended)
- [Clerk](https://clerk.com) account
- [Anthropic](https://anthropic.com) API key

### Installation

```bash
# Clone the repository
git clone https://github.com/galaxy-co-ai/nerve-agent.git
cd nerve-agent

# Install dependencies
cd apps/web
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Tech Stack

```
Frontend:       Next.js 15 + React 19 + TypeScript
UI:             shadcn/ui + Tailwind CSS + Framer Motion
Database:       PostgreSQL (Neon) + Prisma ORM
Auth:           Clerk
AI:             Claude API (Anthropic)
Hosting:        Vercel
```

---

## Project Structure

```
nerve-agent/
├── apps/web/              # Next.js application
│   ├── src/app/           # App router pages
│   ├── src/components/    # React components
│   ├── src/lib/           # Utilities
│   └── prisma/            # Database schema
├── docs/                  # Documentation
│   ├── VISION.md          # Product vision
│   ├── ARCHITECTURE.md    # System architecture
│   └── USER-FLOWS.md      # User journeys
└── specs/                 # Feature specifications (16 modules)
```

---

## Roadmap

- [x] Core planning and project structure
- [x] Dashboard / Daily Driver
- [x] Notes with AI assistance
- [x] Agent drawer with multi-LLM support
- [ ] Sprint Stack execution
- [ ] Time tracking integration
- [ ] Client Portal
- [ ] Library system

See [open issues](https://github.com/galaxy-co-ai/nerve-agent/issues) for more.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

```bash
# Fork, clone, then:
git checkout -b feature/your-feature
# Make changes
npm run validate  # Must pass
git commit -m 'feat: Add your feature'
git push origin feature/your-feature
# Open a PR
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

Built with obsession by [GalaxyCo.ai](https://galaxyco.ai)

</div>
