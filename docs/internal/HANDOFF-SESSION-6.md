# HANDOFF - Session 6

## What We Built Tonight

### 1. Note Tag System
- **File**: `apps/web/src/app/(dashboard)/notes/page.tsx`
- Tag badges on note cards (top-right corner)
- Color-coded: idea (purple), task (orange), reference (blue), insight (green), decision (yellow)
- Tag filter pills with URL params (`?tag=idea`)
- Filters compose with project filter

### 2. Typography System
- **File**: `apps/web/src/components/ui/typography.tsx`
- 15 reusable components: H1-H4, P, Lead, Large, Small, Muted
- InlineCode, Kbd, Blockquote, List, OrderedList
- Table components
- Applied across dashboard, projects, library, notes, calls pages

### 3. AI Agent Workspace Drawer
- **File**: `apps/web/src/components/agent/agent-drawer.tsx`
- Orange tab on right edge, slides out drawer on click
- 4 tabs:
  - **Inbox**: Proactive suggestions with approve/edit/dismiss
  - **Chat**: Conversational interface (mock data)
  - **Actions**: Manual triggers (generate, analyze, automate)
  - **Memory**: User profile, learned patterns, agent settings
- Persistent input at bottom
- Quiet hours notice

### 4. Dock Repositioned
- **File**: `apps/web/src/components/shared/floating-dock.tsx`
- Centered horizontally at bottom of screen

### 5. Agent Backend Foundation (IN PROGRESS)
Created but **NOT YET MIGRATED OR TESTED**:

**Prisma Schema Additions** (`apps/web/prisma/schema.prisma`):
```
- AgentPreferences (user settings, learned patterns, quiet hours)
- AgentSuggestion (inbox items awaiting user action)
- AgentConversation (chat sessions)
- AgentMessage (individual messages)
```

**Agent Library** (`apps/web/src/lib/agent/`):
- `prompts.ts` - SOUL system prompt (direct, opinionated, useful)
- `context.ts` - Builds user context (projects, blockers, stuck tasks, stats)
- `actions.ts` - Action registry with permission levels
- `tools.ts` - Claude tool definitions (7 tools)
- `core.ts` - Main agent loop, chat function, heartbeat

---

## What's NOT Done (Next Session)

### 1. Run Prisma Migration
```bash
cd apps/web
npx prisma migrate dev --name add-agent-models
```

### 2. Create API Routes
Need to create these in `apps/web/src/app/api/agent/`:
- `chat/route.ts` - POST: Send message, get streaming response
- `suggestions/route.ts` - GET: List inbox, POST: Respond to suggestion
- `preferences/route.ts` - GET/PUT: User agent settings
- `trigger/route.ts` - POST: Fire event trigger (blocker created, etc.)
- `cron/route.ts` - GET: Vercel cron for periodic heartbeat

### 3. Wire Up UI
Update `agent-drawer.tsx` to:
- Fetch real suggestions from `/api/agent/suggestions`
- Send messages to `/api/agent/chat` with streaming
- Load/save preferences from `/api/agent/preferences`
- Trigger actions through the API

### 4. Hook Into Existing Flows
- When blocker created → trigger agent analysis
- When sprint completed → offer client update
- On dashboard load → check for pending suggestions

---

## Key Files Reference

```
apps/web/
├── prisma/schema.prisma        # Agent models added (lines 784-880)
├── src/
│   ├── lib/agent/
│   │   ├── prompts.ts          # SOUL + context prompts
│   │   ├── context.ts          # buildAgentContext()
│   │   ├── actions.ts          # AGENT_ACTIONS registry
│   │   ├── tools.ts            # AGENT_TOOLS for Claude
│   │   └── core.ts             # chatWithAgent(), runHeartbeat()
│   ├── components/
│   │   ├── agent/
│   │   │   └── agent-drawer.tsx  # Full UI (needs API wiring)
│   │   └── ui/
│   │       └── typography.tsx    # Typography components
│   └── app/
│       └── (dashboard)/
│           └── layout.tsx        # AgentDrawer added
```

---

## Agent Soul Summary

The agent personality is defined in `lib/agent/prompts.ts`:
- **Direct**: No "Great question!" or filler
- **Opinionated**: Has preferences, pushes back on bad ideas
- **Concise by default**: Respects user's time
- **Proactive**: Surfaces issues before asked
- **Respectful**: Quiet hours, learns patterns

Key line: *"Direct. Opinionated. Useful."*

---

## Moltbot Research Summary

We studied Moltbot's architecture extensively. Key takeaways implemented:
- SOUL as system prompt (personality definition)
- USER learning (patterns, preferences)
- HEARTBEAT (proactive background checks)
- Anti-sycophancy ("skip the pleasantries")
- Quiet hours respect
- Multi-file identity system (translated to Prisma models)

---

## Git Status
- Branch: `main`
- Last commit: `8247f04` - Agent workspace drawer + typography system
- **Uncommitted**: Agent backend files (schema + lib/agent/)

Before committing, need to:
1. Run migration
2. Verify typecheck passes
3. Test at least one API route

---

## Environment Notes
- Anthropic SDK needs `ANTHROPIC_API_KEY` in `.env`
- Agent uses `claude-sonnet-4-20250514` model

---

*Session 6 in progress. Agent UI complete, backend foundation laid. Next: migrate + API routes + wire up.*
