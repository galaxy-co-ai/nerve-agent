import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", ".dark"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // =================================================================
      // NERVE GOLD PALETTE v2.0
      // Cool pale gold - sophisticated, desaturated, premium
      // Inspired by: Brushed metallic knobs, champagne gold
      // =================================================================
      colors: {
        // Nerve Gold - Primary accent (cool pale gold)
        gold: {
          50: "#FDF6E8",   // Cream highlight
          100: "#F5E6C4",  // Light champagne
          200: "#E8D4A0",  // Soft gold
          300: "#D4B878",  // Medium gold
          400: "#C9A84C",  // PRIMARY - cool pale gold
          500: "#B8943C",  // Rich gold
          600: "#9A7B2E",  // Deep gold
          700: "#7A5F20",  // Dark gold
          800: "#5C4718",  // Very dark gold
          900: "#3E3010",  // Nearly black gold
          950: "#201808",  // Deepest gold
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
      // NERVE ANIMATIONS v2.0
      // =================================================================
      animation: {
        // Glow pulse for attention
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        // Subtle float for ambient elements
        float: "float 6s ease-in-out infinite",
        // Shimmer effect for loading states
        shimmer: "shimmer 2s linear infinite",
        // Progress bar indeterminate state
        "progress-indeterminate": "progress-indeterminate 1.5s ease-in-out infinite",
        // Ambient breathing effect
        "ambient-pulse": "ambient-pulse 3s ease-in-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(201, 168, 76, 0.25)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(201, 168, 76, 0.4), 0 0 60px rgba(201, 168, 76, 0.15)",
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
        "progress-indeterminate": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "50%": {
            transform: "translateX(0%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "ambient-pulse": {
          "0%, 100%": {
            opacity: "0.6",
          },
          "50%": {
            opacity: "1",
          },
        },
      },

      // =================================================================
      // NERVE BOX SHADOWS v2.0
      // More dramatic elevation + cool pale gold glow
      // =================================================================
      boxShadow: {
        // Elevation levels - more dramatic for clear hierarchy
        "elevation-1": "0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)",
        "elevation-2": "0 4px 8px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)",
        "elevation-3": "0 8px 16px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)",
        "elevation-4": "0 16px 32px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.3)",

        // Gold glow levels - updated for cool pale gold
        "glow-gold-subtle": "0 0 12px rgba(201, 168, 76, 0.15)",
        "glow-gold-soft": "0 0 16px rgba(201, 168, 76, 0.25), 0 0 32px rgba(201, 168, 76, 0.15)",
        "glow-gold-medium": "0 0 20px rgba(201, 168, 76, 0.4), 0 0 40px rgba(201, 168, 76, 0.25)",
        "glow-gold-intense": "0 0 16px rgba(201, 168, 76, 0.6), 0 0 32px rgba(201, 168, 76, 0.4), 0 0 64px rgba(201, 168, 76, 0.25)",

        // Ambient underglow - like the glow bleeding from under active tabs
        "glow-gold-ambient": "0 4px 12px rgba(201, 168, 76, 0.4), 0 0 20px rgba(201, 168, 76, 0.15)",

        // Success glow
        "glow-success": "0 0 15px rgba(34, 197, 94, 0.3), 0 0 30px rgba(34, 197, 94, 0.1)",

        // Error glow
        "glow-error": "0 0 15px rgba(239, 68, 68, 0.3), 0 0 30px rgba(239, 68, 68, 0.1)",

        // Inner shadows for wells/recessed areas - deeper for hardware feel
        "inner-subtle": "inset 0 1px 2px rgba(0, 0, 0, 0.3)",
        "inner-medium": "inset 0 2px 4px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(0, 0, 0, 0.3)",
        "inner-deep": "inset 0 3px 6px rgba(0, 0, 0, 0.6), inset 0 1px 3px rgba(0, 0, 0, 0.4)",

        // Raised surface with top highlight (bevel effect)
        raised: "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 4px rgba(0, 0, 0, 0.4)",

        // Bevel full (top highlight + bottom shadow)
        bevel: "inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.2)",
      },

      // =================================================================
      // NERVE BACKDROP BLUR
      // =================================================================
      backdropBlur: {
        xs: "2px",
      },

      // =================================================================
      // TYPOGRAPHY v2.0
      // Geist font family - technical, modern, audio software DNA
      // =================================================================
      fontFamily: {
        sans: ["Geist Variable", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["Geist Mono Variable", "JetBrains Mono", "Fira Code", "monospace"],
      },
      letterSpacing: {
        label: "0.1em",    // For uppercase labels (audio plugin style)
        "label-tight": "0.08em",
        "label-wide": "0.12em",
      },
      fontSize: {
        // Label sizes (all-caps style)
        "label-xs": ["0.625rem", { lineHeight: "1", letterSpacing: "0.12em" }],  // 10px
        "label-sm": ["0.6875rem", { lineHeight: "1", letterSpacing: "0.1em" }],  // 11px
        "label-base": ["0.75rem", { lineHeight: "1", letterSpacing: "0.08em" }], // 12px
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
