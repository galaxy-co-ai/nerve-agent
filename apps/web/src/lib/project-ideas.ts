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
  // =====================================================
  // TOP 25 - "Drop Everything and Build This" Tier
  // =====================================================
  {
    id: "churn-whisperer",
    name: "Churn Whisperer",
    tagline: "Predict who's canceling next week—and why",
    category: "saas",
  },
  {
    id: "twitter-dm-dealflow",
    name: "Twitter DM Deal Flow",
    tagline: "CRM for the DMs where you actually close deals",
    category: "saas",
  },
  {
    id: "competitor-changelog-radar",
    name: "Competitor Radar",
    tagline: "Get notified the moment competitors ship something new",
    category: "developer",
  },
  {
    id: "screenshot-to-tailwind",
    name: "Screenshot → Tailwind",
    tagline: "Paste any UI, get production-ready code",
    category: "developer",
  },
  {
    id: "revenue-attribution-indie",
    name: "Revenue Attribution",
    tagline: "Know which tweet actually drove that paying customer",
    category: "saas",
  },
  {
    id: "pre-money-validation",
    name: "Pre-Money Validation",
    tagline: "Collect $5 deposits before you write a line of code",
    category: "saas",
  },
  {
    id: "hn-reddit-alerts",
    name: "Mention Alerts",
    tagline: "Your product mentioned on HN or Reddit? Know in 5 minutes",
    category: "developer",
  },
  {
    id: "async-demo-autopilot",
    name: "Async Demo Autopilot",
    tagline: "Stop doing the same Zoom call 50 times",
    category: "saas",
  },
  {
    id: "support-to-docs",
    name: "Support → Docs",
    tagline: "One click turns support tickets into help articles",
    category: "saas",
  },
  {
    id: "mrr-milestone-broadcaster",
    name: "MRR Milestones",
    tagline: "Auto-celebrate revenue milestones with beautiful graphics",
    category: "saas",
  },
  {
    id: "founder-accountability",
    name: "Founder Match",
    tagline: "Weekly accountability with someone at your revenue stage",
    category: "productivity",
  },
  {
    id: "anti-meeting-tool",
    name: "Anti-Meeting",
    tagline: "Loom + AI action items. Status updates without the calendar cancer",
    category: "productivity",
  },
  {
    id: "pricing-page-lab",
    name: "Pricing Page Lab",
    tagline: "A/B test price points, not just button colors",
    category: "saas",
  },
  {
    id: "domain-handle-checker",
    name: "Name Checker",
    tagline: "Domain, Twitter, GitHub, npm—all available? One search",
    category: "developer",
  },
  {
    id: "exit-interview-intel",
    name: "Exit Intel",
    tagline: "Cancellation surveys that actually get responses",
    category: "saas",
  },
  {
    id: "stripe-invoice-glowup",
    name: "Invoice Glow-Up",
    tagline: "Make Stripe invoices look like you have a design team",
    category: "finance",
  },
  {
    id: "uptime-for-indies",
    name: "Uptime for Indies",
    tagline: "Is it up? Text me if not. $5/month",
    category: "developer",
  },
  {
    id: "thread-to-blog",
    name: "Thread → Blog",
    tagline: "Viral tweet thread to SEO-ready blog post, one click",
    category: "creative",
  },
  {
    id: "customer-interview-vault",
    name: "Interview Vault",
    tagline: "All your user interviews—searchable, with insights extracted",
    category: "saas",
  },
  {
    id: "feature-voting-simple",
    name: "Feature Voting",
    tagline: "Canny without the Canny pricing",
    category: "saas",
  },
  {
    id: "microsaas-flip-market",
    name: "Micro Flip Market",
    tagline: "Buy and sell SaaS projects under $50K",
    category: "marketplace",
  },
  {
    id: "dunning-savior",
    name: "Dunning Savior",
    tagline: "Recover 40% of failed payments automatically",
    category: "finance",
  },
  {
    id: "solo-ops-stack",
    name: "Solo Ops Stack",
    tagline: "Contracts, invoices, expenses, taxes—one dashboard",
    category: "finance",
  },
  {
    id: "api-usage-pricer",
    name: "API Pricer",
    tagline: "Model usage-based pricing before you launch and regret it",
    category: "developer",
  },
  {
    id: "cold-email-scout",
    name: "Deliverability Scout",
    tagline: "Check if your cold email hits inbox before you burn your domain",
    category: "saas",
  },

  // =====================================================
  // DEVELOPER TOOLS
  // =====================================================
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

  // =====================================================
  // SAAS & BUSINESS
  // =====================================================
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
    id: "appointment-booker",
    name: "Appointment Booker",
    tagline: "Calendly clone with built-in payments and reminders",
    category: "saas",
  },

  // =====================================================
  // PRODUCTIVITY
  // =====================================================
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
    id: "decision-journal",
    name: "Decision Journal",
    tagline: "Log decisions, revisit outcomes, learn from patterns",
    category: "productivity",
  },
  {
    id: "energy-tracker",
    name: "Energy Tracker",
    tagline: "Find your peak hours by logging energy levels daily",
    category: "productivity",
  },

  // =====================================================
  // HEALTH & FITNESS
  // =====================================================
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
    tagline: "Don't break the chain—gamified fitness consistency",
    category: "health",
  },

  // =====================================================
  // FINANCE
  // =====================================================
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
    id: "side-project-revenue",
    name: "Side Project Revenue",
    tagline: "Track MRR across all your indie hacker projects",
    category: "finance",
  },

  // =====================================================
  // CREATIVE TOOLS
  // =====================================================
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

  // =====================================================
  // EDUCATION
  // =====================================================
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

  // =====================================================
  // MARKETPLACE
  // =====================================================
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

  // =====================================================
  // E-COMMERCE
  // =====================================================
  {
    id: "digital-product-shop",
    name: "Digital Product Shop",
    tagline: "Sell templates, courses, and downloads with zero fees",
    category: "ecommerce",
  },
  {
    id: "abandoned-cart-recovery",
    name: "Abandoned Cart Recovery",
    tagline: "Win back 15% of lost sales with smart email sequences",
    category: "ecommerce",
  },

  // =====================================================
  // MOBILE
  // =====================================================
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
