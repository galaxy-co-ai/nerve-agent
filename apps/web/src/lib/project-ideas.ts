// Curated project ideas for first-time user onboarding
// Every idea here is validated - no duds allowed at Nerve Agent

export interface ProjectIdea {
  id: string
  name: string
  tagline: string
  category: ProjectCategory
}

export type ProjectCategory =
  | "saas"
  | "mobile"
  | "marketplace"
  | "developer"
  | "creative"
  | "health"
  | "productivity"
  | "ecommerce"
  | "education"
  | "finance"

export const PROJECT_IDEAS: ProjectIdea[] = [
  // === DEVELOPER TOOLS (High demand, clear value) ===
  {
    id: "api-uptime-monitor",
    name: "API Uptime Monitor",
    tagline: "Get Slack alerts before your customers notice downtime",
    category: "developer",
  },
  {
    id: "changelog-generator",
    name: "Changelog Generator",
    tagline: "Auto-generate release notes from your Git commits",
    category: "developer",
  },
  {
    id: "env-secrets-manager",
    name: "Env Secrets Manager",
    tagline: "Share environment variables securely across your team",
    category: "developer",
  },
  {
    id: "feature-flag-dashboard",
    name: "Feature Flag Dashboard",
    tagline: "Roll out features to 1% of users, then scale up safely",
    category: "developer",
  },
  {
    id: "error-tracking-lite",
    name: "Error Tracking Lite",
    tagline: "Sentry alternative that doesn't cost $500/month",
    category: "developer",
  },
  {
    id: "webhook-debugger",
    name: "Webhook Debugger",
    tagline: "Inspect, replay, and test incoming webhooks locally",
    category: "developer",
  },
  {
    id: "cron-job-monitor",
    name: "Cron Job Monitor",
    tagline: "Know instantly when scheduled tasks fail silently",
    category: "developer",
  },

  // === SAAS & BUSINESS (Solo-friendly, recurring revenue) ===
  {
    id: "client-portal-builder",
    name: "Client Portal Builder",
    tagline: "White-label dashboards for your freelance clients",
    category: "saas",
  },
  {
    id: "invoice-autopilot",
    name: "Invoice Autopilot",
    tagline: "Track time, generate invoices, get paid automatically",
    category: "saas",
  },
  {
    id: "proposal-templates",
    name: "Proposal Templates",
    tagline: "Win more clients with beautiful, trackable proposals",
    category: "saas",
  },
  {
    id: "contract-vault",
    name: "Contract Vault",
    tagline: "Store, e-sign, and never lose a client contract again",
    category: "saas",
  },
  {
    id: "waitlist-viral",
    name: "Viral Waitlist",
    tagline: "Pre-launch pages with referral rewards built in",
    category: "saas",
  },
  {
    id: "testimonial-collector",
    name: "Testimonial Collector",
    tagline: "Capture video testimonials without the awkward asks",
    category: "saas",
  },
  {
    id: "feedback-widget",
    name: "Feedback Widget",
    tagline: "Embeddable feedback forms that actually get responses",
    category: "saas",
  },
  {
    id: "appointment-booker",
    name: "Appointment Booker",
    tagline: "Calendly clone with built-in payments and reminders",
    category: "saas",
  },
  {
    id: "nps-tracker",
    name: "NPS Tracker",
    tagline: "Measure customer loyalty with one-click surveys",
    category: "saas",
  },

  // === PRODUCTIVITY (Daily use, habit-forming) ===
  {
    id: "focus-mode-app",
    name: "Focus Mode App",
    tagline: "Block distractions and track deep work sessions",
    category: "productivity",
  },
  {
    id: "meeting-cost-timer",
    name: "Meeting Cost Timer",
    tagline: "Show the real-time dollar cost of every meeting",
    category: "productivity",
  },
  {
    id: "standup-bot",
    name: "Async Standup Bot",
    tagline: "Daily standups without the daily meetings",
    category: "productivity",
  },
  {
    id: "decision-journal",
    name: "Decision Journal",
    tagline: "Log decisions, revisit outcomes, learn from patterns",
    category: "productivity",
  },
  {
    id: "reading-queue",
    name: "Reading Queue",
    tagline: "Save articles, get daily digests, track what you've read",
    category: "productivity",
  },
  {
    id: "energy-tracker",
    name: "Energy Tracker",
    tagline: "Find your peak hours by logging energy levels daily",
    category: "productivity",
  },
  {
    id: "weekly-review-app",
    name: "Weekly Review App",
    tagline: "Guided reflection prompts every Sunday evening",
    category: "productivity",
  },

  // === HEALTH & FITNESS (High engagement, personal) ===
  {
    id: "running-intelligence",
    name: "Running Intelligence",
    tagline: "AI training plans that adapt to how your body feels",
    category: "health",
  },
  {
    id: "sleep-debt-tracker",
    name: "Sleep Debt Tracker",
    tagline: "Know exactly how much sleep you owe yourself",
    category: "health",
  },
  {
    id: "meal-prep-planner",
    name: "Meal Prep Planner",
    tagline: "Weekly menus with macros and auto grocery lists",
    category: "health",
  },
  {
    id: "workout-streak",
    name: "Workout Streak",
    tagline: "Don't break the chain - gamified fitness consistency",
    category: "health",
  },
  {
    id: "supplement-tracker",
    name: "Supplement Tracker",
    tagline: "Never forget your vitamins, track what actually works",
    category: "health",
  },
  {
    id: "hydration-coach",
    name: "Hydration Coach",
    tagline: "Smart water reminders based on activity and weather",
    category: "health",
  },

  // === FINANCE (Clear ROI, trust required) ===
  {
    id: "subscription-tracker",
    name: "Subscription Tracker",
    tagline: "Find forgotten subscriptions bleeding your bank account",
    category: "finance",
  },
  {
    id: "freelancer-taxes",
    name: "Freelancer Tax Prep",
    tagline: "Quarterly estimates and write-off tracking for 1099s",
    category: "finance",
  },
  {
    id: "net-worth-tracker",
    name: "Net Worth Tracker",
    tagline: "One dashboard for all accounts, updated automatically",
    category: "finance",
  },
  {
    id: "side-project-revenue",
    name: "Side Project Revenue",
    tagline: "Track MRR across all your indie hacker projects",
    category: "finance",
  },
  {
    id: "expense-splitter",
    name: "Expense Splitter",
    tagline: "Split bills with roommates without the awkward math",
    category: "finance",
  },

  // === CREATIVE TOOLS (Visual, shareable) ===
  {
    id: "portfolio-builder",
    name: "Portfolio Builder",
    tagline: "Ship a stunning portfolio site in under an hour",
    category: "creative",
  },
  {
    id: "color-palette-ai",
    name: "Color Palette AI",
    tagline: "Generate brand colors from a single inspiration image",
    category: "creative",
  },
  {
    id: "social-media-kit",
    name: "Social Media Kit",
    tagline: "Templates that auto-resize for every platform",
    category: "creative",
  },
  {
    id: "font-pairing-tool",
    name: "Font Pairing Tool",
    tagline: "Find typography combinations that actually work",
    category: "creative",
  },
  {
    id: "mockup-generator",
    name: "Mockup Generator",
    tagline: "See your designs on devices in seconds",
    category: "creative",
  },

  // === EDUCATION (Skill-building, retention) ===
  {
    id: "spaced-repetition",
    name: "Spaced Repetition",
    tagline: "Remember anything forever with science-backed flashcards",
    category: "education",
  },
  {
    id: "skill-tree-tracker",
    name: "Skill Tree Tracker",
    tagline: "Visualize your learning path like an RPG character",
    category: "education",
  },
  {
    id: "course-notes-ai",
    name: "Course Notes AI",
    tagline: "Turn video courses into searchable, summarized notes",
    category: "education",
  },
  {
    id: "accountability-pods",
    name: "Accountability Pods",
    tagline: "Find learning partners, check in weekly, stay on track",
    category: "education",
  },
  {
    id: "tutorial-tracker",
    name: "Tutorial Tracker",
    tagline: "Stop losing tutorials in browser tabs, organize them",
    category: "education",
  },

  // === MARKETPLACE (Network effects, transaction-based) ===
  {
    id: "freelancer-referrals",
    name: "Freelancer Referrals",
    tagline: "Get paid for sending overflow work to trusted peers",
    category: "marketplace",
  },
  {
    id: "beta-testers-hub",
    name: "Beta Testers Hub",
    tagline: "Find early adopters hungry to test new products",
    category: "marketplace",
  },
  {
    id: "micro-consulting",
    name: "Micro Consulting",
    tagline: "Sell 15-minute expert calls, no scheduling hassle",
    category: "marketplace",
  },

  // === E-COMMERCE (Transaction revenue) ===
  {
    id: "digital-product-shop",
    name: "Digital Product Shop",
    tagline: "Sell templates, courses, and downloads with zero fees",
    category: "ecommerce",
  },
  {
    id: "print-on-demand",
    name: "Print on Demand Hub",
    tagline: "Design merch once, sell forever, ship automatically",
    category: "ecommerce",
  },
  {
    id: "abandoned-cart-recovery",
    name: "Abandoned Cart Recovery",
    tagline: "Win back 15% of lost sales with smart email sequences",
    category: "ecommerce",
  },

  // === MOBILE-FIRST (App store potential) ===
  {
    id: "voice-journal",
    name: "Voice Journal",
    tagline: "Speak your thoughts, get them transcribed and organized",
    category: "mobile",
  },
  {
    id: "parking-reminder",
    name: "Parking Reminder",
    tagline: "Never forget where you parked or when the meter expires",
    category: "mobile",
  },
]

// Get 3 random ideas, avoiding repeats within session
export function getRandomIdeas(exclude: string[] = []): ProjectIdea[] {
  const available = PROJECT_IDEAS.filter((idea) => !exclude.includes(idea.id))
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

// Get ideas by category
export function getIdeasByCategory(category: ProjectCategory): ProjectIdea[] {
  return PROJECT_IDEAS.filter((idea) => idea.category === category)
}

// Category display names
export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  saas: "SaaS & Business",
  mobile: "Mobile Apps",
  marketplace: "Marketplaces",
  developer: "Developer Tools",
  creative: "Creative Tools",
  health: "Health & Fitness",
  productivity: "Productivity",
  ecommerce: "E-commerce",
  education: "Education",
  finance: "Finance",
}
