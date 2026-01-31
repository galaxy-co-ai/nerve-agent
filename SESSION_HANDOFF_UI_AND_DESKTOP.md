# Session Handoff: NERVE UI Consistency + Desktop App Integration

**Date:** January 31, 2026
**Project:** nerve-agent (web app)
**Priority:** Desktop integration first, then UI consistency

---

## IMMEDIATE PRIORITY: Desktop App Integration UI

The **nerve-agent-desktop** companion app is fully built and waiting. The web app has all the backend APIs ready - you just need to build the UI components.

### What Already Exists in Web App (Backend Complete)

```
API Routes:
- POST /api/desktop/pair      → generates 6-digit pairing code
- POST /api/desktop/verify    → verifies code, returns auth token
- GET /api/desktop/status     → returns connection status + devices list
- DELETE /api/desktop/device/[id] → removes paired device
- POST /api/pusher/auth       → Pusher channel authorization

Files:
- src/lib/pusher.ts           → Pusher server client
- Prisma models: DesktopDevice, DesktopPairingCode
```

### What You Need to Build

#### 1. Desktop Pairing Component (Modal)
**Location:** Dashboard or Settings page

**Features:**
- "Connect Desktop App" button triggers modal
- Modal displays large 6-digit code (from `/api/desktop/pair`)
- 5-minute countdown timer showing expiration
- Code should be prominent, easy to read (like 2FA codes)
- On successful pairing: close modal, show success toast, refresh device list
- Include download link for desktop app (GitHub releases)

**API Response:**
```typescript
// POST /api/desktop/pair
{ code: "123456", expiresAt: "ISO string", expiresIn: 300 }
```

#### 2. Desktop Status Component
**Location:** Dashboard sidebar or Settings page

**Features:**
- Connection status indicator (green dot = online, gray = offline)
- List of paired devices showing:
  - Device name/platform (Windows, macOS, Linux)
  - Last seen timestamp (relative: "2 minutes ago")
  - "Unpair" button → calls `DELETE /api/desktop/device/[id]`
- Empty state: "No desktop app connected" with pairing CTA button

**API Response:**
```typescript
// GET /api/desktop/status
{
  connected: boolean,
  devices: [{
    id: string,
    deviceId: string,
    name: string | null,
    platform: string,
    lastSeen: string
  }]
}
```

#### 3. Pusher Client Setup (if not done)
- Subscribe to `private-desktop-{userId}` channel on client side
- Listen for `client-desktop-connected` and `client-desktop-status` events
- Update UI reactively when desktop app connects/disconnects

**Design Notes:**
- Use NERVE components (NerveCard, NerveButton, NerveBadge, NerveDialog)
- The pairing modal is the key UX moment - make the 6-digit code very prominent
- Status component can be minimal - just need to show connection state
- Match existing Settings page patterns

---

## SECONDARY PRIORITY: NERVE UI Consistency

### Context
The user wants all pages to match the NERVE design system aesthetic seen in the Daily Driver page. The design is:
- Dark background with subtle dot grid texture
- Neumorphic cards with soft shadows and subtle borders
- Gold/amber accent (#facc15 range) for active states & branding
- Hardware-style toggles and controls
- Minimal but purposeful iconography

### What Was Completed This Session

#### 1. Created Visual Component Showcase
**File:** `apps/web/src/app/(dashboard)/library/design-systems/nerve/showcase/page.tsx`

A live preview page showing all NERVE components rendered:
- Buttons (all variants, sizes, loading states)
- Badges (semantic colors, tag variants, with dots)
- Cards (elevation levels 1-3, interactive/glow/selected/glass variants)
- Form Controls (input, textarea, switch, checkbox, progress, skeleton)
- Alerts and separators
- Hardware Controls (PowerButton, PillToggle, DialKnob, Orb, Readout)
- Tabs
- Primitives (Surface, Glow, Well, ChromeShell)

Each component shows live preview + copyable code.

**Access:** `/library/design-systems/nerve/showcase`

#### 2. Added "Live Preview" Button to NERVE Design System Page
**File:** `apps/web/src/app/(dashboard)/library/design-systems/[slug]/collapsible-hero.tsx`

Added a "Live Preview" button that only appears for the NERVE design system, linking to the showcase.

### UI Audit Results - Pages That Need NERVE Treatment

| Page | Current State | What's Needed |
|------|--------------|---------------|
| **Projects** | Generic shadcn Card/Badge, hardcoded colors | Replace with NerveCard, NerveBadge with semantic variants |
| **Library** | Partial - uses amber instead of gold, no elevation | Apply NerveCard with elevation, use gold tokens |
| **Calls** | Flat cards, generic badges | NerveCard with elevation, NerveBadge for sentiment |
| **Settings** | Plain form components | NerveCard for sections, NerveButton, NerveInput |
| **Notes** | Was thought to be done but user said not updated | Audit and apply NERVE components |

### How to Apply NERVE Components

For each page:
1. Import from `@/components/nerve`
2. Replace `Card` → `NerveCard elevation={1}` (or 2 for elevated)
3. Replace `Badge` → `NerveBadge variant="success|warning|error|info|primary"`
4. Replace `Button` → `NerveButton variant="primary|secondary|ghost|outline"`
5. Add `variant="interactive"` to clickable cards
6. Use design system color tokens (not hardcoded colors)

### Key NERVE Components Available

```typescript
// Layout
NerveCard, NerveCardHeader, NerveCardTitle, NerveCardContent, NerveCardFooter
// Props: elevation={1|2|3}, variant="default|raised|glow|interactive|glass|selected"

// Feedback
NerveBadge
// Props: variant="primary|success|warning|error|info|idea|task|reference|insight|decision", dot, size

// Forms
NerveButton  // variant="primary|secondary|ghost|outline|destructive", loading
NerveInput   // label, error, leftElement, rightElement
NerveTextarea, NerveSelect, NerveCheckbox, NerveSwitch

// Overlays
NerveDialog, NerveSheet, NervePopover, NerveTooltip, NerveAlertDialog

// Hardware Controls (for special UI)
PowerButton, PillToggle, DialKnob, Orb, Readout

// Primitives
Surface, Glow, Well, ChromeShell
```

---

## File Locations Reference

```
nerve-agent/apps/web/src/
├── components/nerve/           # All NERVE components
│   ├── index.ts               # Barrel export
│   ├── components/            # NerveButton, NerveCard, etc.
│   ├── controls/              # PowerButton, DialKnob, etc.
│   ├── primitives/            # Surface, Glow, Well
│   └── backgrounds/           # DotGrid, Noise, Vignette
├── app/(dashboard)/
│   ├── projects/page.tsx      # NEEDS NERVE treatment
│   ├── library/
│   │   └── design-systems/
│   │       └── nerve/showcase/page.tsx  # NEW - component showcase
│   ├── notes/page.tsx         # Check if needs work
│   ├── calls/page.tsx         # NEEDS NERVE treatment
│   └── settings/page.tsx      # NEEDS NERVE treatment + DESKTOP UI
└── lib/
    ├── pusher.ts              # Pusher server client (exists)
    └── actions/               # Server actions
```

---

## Suggested Order of Work

1. **Build Desktop Pairing Modal** (Settings or Dashboard)
   - Create `DesktopPairingDialog` component
   - Large 6-digit code display
   - Countdown timer
   - Success/error handling

2. **Build Desktop Status Component** (Settings)
   - Device list with status indicators
   - Unpair functionality
   - Empty state with pairing CTA

3. **Set up Pusher Client** (if needed)
   - Real-time connection status updates

4. **Test end-to-end with desktop app**
   - Coordinate with desktop app agent

5. **Then continue UI consistency work**
   - Projects page
   - Calls page
   - Settings page (will already be touched for desktop)
   - Library page

---

## Desktop App Info (For Reference)

- **Repo:** `C:\Users\Owner\workspace\nerve-agent-desktop`
- **GitHub:** https://github.com/galaxy-co-ai/nerve-agent-desktop (private)
- **Tech:** Electron 28 + TypeScript + Pusher
- **Status:** MVP complete, waiting for web app UI to test pairing

The desktop app will:
1. User enters 6-digit code from web app
2. Desktop calls `POST /api/desktop/verify` with code + deviceId
3. On success, desktop stores auth token and connects to Pusher
4. Desktop announces via `client-desktop-connected` event
5. Web app should update UI to show "Connected"

---

## Commands

```bash
# Navigate to web app
cd C:\Users\Owner\workspace\nerve-agent\apps\web

# Type check
npm run typecheck

# Dev server
npm run dev

# Full validation before commit
npm run validate
```

---

## Summary

**Do first:** Desktop integration UI (pairing modal + status component)
**Do second:** NERVE UI consistency across pages
**Reference:** Use `/library/design-systems/nerve/showcase` to see all components
**Coordinate:** Desktop app agent is waiting to test end-to-end pairing
