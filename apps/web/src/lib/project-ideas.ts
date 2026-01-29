// Curated project ideas for first-time user onboarding
// Sources: Upsilon IT, Eleken, StartupIdeasDB

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
  // SaaS & Business Tools
  {
    id: "freelancer-invoicing",
    name: "Freelancer Invoicing Tool",
    tagline: "Time tracking that automatically generates beautiful invoices",
    category: "saas",
  },
  {
    id: "waitlist-manager",
    name: "Waitlist Manager",
    tagline: "Pre-launch signup pages with viral referral mechanics",
    category: "saas",
  },
  {
    id: "client-feedback-tool",
    name: "Client Feedback Collector",
    tagline: "Gather and organize design revisions in one place",
    category: "saas",
  },
  {
    id: "simple-crm",
    name: "Simple CRM for Freelancers",
    tagline: "Track clients, projects, and follow-ups without the bloat",
    category: "saas",
  },
  {
    id: "contract-generator",
    name: "Contract Generator",
    tagline: "DIY legal documents for freelancers and startups",
    category: "saas",
  },
  {
    id: "subscription-manager",
    name: "Subscription Box Manager",
    tagline: "Handle recurring orders, renewals, and customer preferences",
    category: "saas",
  },
  {
    id: "appointment-scheduler",
    name: "Smart Appointment Scheduler",
    tagline: "Calendly alternative with built-in payments",
    category: "saas",
  },
  {
    id: "employee-onboarding",
    name: "Employee Onboarding App",
    tagline: "Streamline new hire paperwork and training",
    category: "saas",
  },

  // Developer Tools
  {
    id: "snippet-library",
    name: "Code Snippet Library",
    tagline: "Personal repository for reusable code with search",
    category: "developer",
  },
  {
    id: "api-mockup-tool",
    name: "API Mockup Tool",
    tagline: "Create realistic API responses for frontend development",
    category: "developer",
  },
  {
    id: "regex-builder",
    name: "Visual Regex Builder",
    tagline: "Build and test regular expressions without the headache",
    category: "developer",
  },
  {
    id: "tech-stack-planner",
    name: "Tech Stack Planner",
    tagline: "Get recommendations for your startup's architecture",
    category: "developer",
  },
  {
    id: "code-quality-checker",
    name: "AI Code Quality Checker",
    tagline: "Automated code review powered by LLMs",
    category: "developer",
  },
  {
    id: "beta-testing-hub",
    name: "Beta Testing Hub",
    tagline: "Connect your app with early adopters for feedback",
    category: "developer",
  },
  {
    id: "db-query-optimizer",
    name: "Database Query Optimizer",
    tagline: "AI suggestions to speed up slow queries",
    category: "developer",
  },

  // Productivity & Personal
  {
    id: "habit-tracker",
    name: "Habit Tracker",
    tagline: "Build better routines with streaks and analytics",
    category: "productivity",
  },
  {
    id: "focus-timer",
    name: "Focus Timer App",
    tagline: "Pomodoro with website blocking and session insights",
    category: "productivity",
  },
  {
    id: "meal-planner",
    name: "Meal Planning App",
    tagline: "Weekly menus with automatic grocery lists",
    category: "productivity",
  },
  {
    id: "plant-care-app",
    name: "Plant Care Companion",
    tagline: "Never forget to water your plants again",
    category: "productivity",
  },
  {
    id: "digital-journal",
    name: "Digital Journal",
    tagline: "Private journaling with mood tracking and prompts",
    category: "productivity",
  },
  {
    id: "personal-finance",
    name: "Personal Finance Tracker",
    tagline: "See where your money goes with smart categorization",
    category: "finance",
  },
  {
    id: "wardrobe-organizer",
    name: "Virtual Closet Organizer",
    tagline: "Catalog your clothes and plan outfits",
    category: "productivity",
  },

  // Health & Fitness
  {
    id: "workout-planner",
    name: "Home Workout Planner",
    tagline: "Personalized routines that adapt to your progress",
    category: "health",
  },
  {
    id: "running-coach",
    name: "AI Running Coach",
    tagline: "Training plans that prevent injury and improve performance",
    category: "health",
  },
  {
    id: "wellness-tracker",
    name: "Holistic Wellness Tracker",
    tagline: "Monitor sleep, mood, nutrition, and fitness together",
    category: "health",
  },
  {
    id: "meditation-app",
    name: "Meditation Timer",
    tagline: "Simple mindfulness with guided sessions",
    category: "health",
  },
  {
    id: "fitness-challenges",
    name: "Fitness Challenge Platform",
    tagline: "Host competitions that keep people accountable",
    category: "health",
  },

  // Education & Learning
  {
    id: "language-exchange",
    name: "Language Exchange App",
    tagline: "Practice conversations with native speakers",
    category: "education",
  },
  {
    id: "flashcard-app",
    name: "Smart Flashcard App",
    tagline: "Spaced repetition that actually works",
    category: "education",
  },
  {
    id: "online-tutoring",
    name: "Online Tutoring Platform",
    tagline: "Connect students with subject matter experts",
    category: "education",
  },
  {
    id: "skill-assessments",
    name: "Skill Assessment Tool",
    tagline: "Test and certify abilities with shareable badges",
    category: "education",
  },
  {
    id: "course-creator",
    name: "Micro Course Creator",
    tagline: "Build and sell bite-sized educational content",
    category: "education",
  },

  // Marketing & Growth
  {
    id: "social-scheduler",
    name: "Social Media Scheduler",
    tagline: "Plan and auto-post across all platforms",
    category: "saas",
  },
  {
    id: "email-marketing",
    name: "Simple Email Marketing",
    tagline: "Drip campaigns without the complexity",
    category: "saas",
  },
  {
    id: "seo-rank-tracker",
    name: "SEO Rank Tracker",
    tagline: "Monitor your search positions daily",
    category: "saas",
  },
  {
    id: "hashtag-analyzer",
    name: "Hashtag Performance Tracker",
    tagline: "Find what tags actually drive engagement",
    category: "saas",
  },
  {
    id: "influencer-finder",
    name: "Micro Influencer Finder",
    tagline: "Discover authentic creators in your niche",
    category: "saas",
  },

  // Marketplaces & Platforms
  {
    id: "local-services",
    name: "Local Services Marketplace",
    tagline: "Connect neighbors with trusted service providers",
    category: "marketplace",
  },
  {
    id: "freelance-niche",
    name: "Niche Freelance Marketplace",
    tagline: "Specialized talent for specialized work",
    category: "marketplace",
  },
  {
    id: "handmade-goods",
    name: "Handmade Goods Marketplace",
    tagline: "Etsy alternative for artisan products",
    category: "marketplace",
  },
  {
    id: "digital-art-market",
    name: "Digital Art Commission Platform",
    tagline: "Connect artists with clients for custom work",
    category: "marketplace",
  },
  {
    id: "local-food-sourcing",
    name: "Farm to Restaurant Platform",
    tagline: "Connect local farms with restaurant buyers",
    category: "marketplace",
  },

  // E-commerce Tools
  {
    id: "abandoned-cart",
    name: "Abandoned Cart Recovery",
    tagline: "Win back lost sales with smart email sequences",
    category: "ecommerce",
  },
  {
    id: "dynamic-pricing",
    name: "Dynamic Pricing Tool",
    tagline: "Automatically adjust prices based on demand",
    category: "ecommerce",
  },
  {
    id: "review-analyzer",
    name: "Customer Review Analyzer",
    tagline: "Extract insights from product reviews at scale",
    category: "ecommerce",
  },
  {
    id: "returns-manager",
    name: "Returns Management System",
    tagline: "Streamline the returns process for everyone",
    category: "ecommerce",
  },

  // Creative Tools
  {
    id: "resume-builder",
    name: "AI Resume Builder",
    tagline: "Create ATS-friendly resumes in minutes",
    category: "creative",
  },
  {
    id: "logo-preview",
    name: "Logo Preview Tool",
    tagline: "See your logo on mockups before finalizing",
    category: "creative",
  },
  {
    id: "font-pairing",
    name: "Font Pairing Generator",
    tagline: "Find typography combinations that work together",
    category: "creative",
  },
  {
    id: "color-palette",
    name: "Color Palette Extractor",
    tagline: "Pull exact colors from any image",
    category: "creative",
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
