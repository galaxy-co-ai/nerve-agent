import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // =================================================================
      // NERVE GOLD PALETTE
      // Premium gold accent that doesn't look brown
      // =================================================================
      colors: {
        // Nerve Gold - Primary accent
        gold: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24", // PRIMARY
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          950: "#451A03",
        },

        // shadcn/ui CSS variable colors (keep for compatibility)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },

      // =================================================================
      // BORDER RADIUS
      // =================================================================
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // =================================================================
      // NERVE ANIMATIONS
      // =================================================================
      animation: {
        // Glow pulse for attention
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        // Subtle float for ambient elements
        float: "float 6s ease-in-out infinite",
        // Shimmer effect for loading states
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(251, 191, 36, 0.2)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(251, 191, 36, 0.4), 0 0 60px rgba(251, 191, 36, 0.1)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        shimmer: {
          "0%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },
      },

      // =================================================================
      // NERVE BOX SHADOWS
      // Elevation system + glow effects
      // =================================================================
      boxShadow: {
        // Elevation levels
        "elevation-1": "0 1px 2px rgba(0, 0, 0, 0.3)",
        "elevation-2": "0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)",
        "elevation-3": "0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)",
        "elevation-4": "0 8px 16px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)",

        // Gold glow levels
        "glow-gold-subtle": "0 0 10px rgba(251, 191, 36, 0.1)",
        "glow-gold-soft": "0 0 15px rgba(251, 191, 36, 0.2), 0 0 30px rgba(251, 191, 36, 0.1)",
        "glow-gold-medium": "0 0 20px rgba(251, 191, 36, 0.3), 0 0 40px rgba(251, 191, 36, 0.15)",
        "glow-gold-intense": "0 0 15px rgba(251, 191, 36, 0.4), 0 0 30px rgba(251, 191, 36, 0.25), 0 0 60px rgba(251, 191, 36, 0.1)",

        // Success glow
        "glow-success": "0 0 15px rgba(34, 197, 94, 0.3), 0 0 30px rgba(34, 197, 94, 0.1)",

        // Error glow
        "glow-error": "0 0 15px rgba(239, 68, 68, 0.3), 0 0 30px rgba(239, 68, 68, 0.1)",

        // Inner shadows for wells/recessed areas
        "inner-subtle": "inset 0 1px 2px rgba(0, 0, 0, 0.2)",
        "inner-medium": "inset 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2)",
        "inner-deep": "inset 0 3px 6px rgba(0, 0, 0, 0.4), inset 0 1px 3px rgba(0, 0, 0, 0.3)",

        // Raised surface with top highlight
        raised: "inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 4px rgba(0, 0, 0, 0.3)",
      },

      // =================================================================
      // NERVE BACKDROP BLUR
      // =================================================================
      backdropBlur: {
        xs: "2px",
      },

      // =================================================================
      // TYPOGRAPHY EXTENSIONS
      // =================================================================
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      letterSpacing: {
        label: "0.05em", // For uppercase labels
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
