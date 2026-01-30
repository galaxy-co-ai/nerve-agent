import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),

  // =================================================================
  // DEV SERVER STABILITY (Windows)
  // =================================================================
  // Note: webpackDevMiddleware was removed in Next.js 15+
  // File watching is now configured via webpack config directly

  // Experimental settings for stability
  experimental: {
    // Reduce memory pressure
    webpackMemoryOptimizations: true,
  },

  // Turbopack config (Next.js 16+ uses Turbopack by default)
  // Empty config signals we're aware webpack config exists but want Turbopack for builds
  turbopack: {},

  // Webpack config for file watching on Windows (dev only)
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["**/node_modules/**", "**/.git/**"],
      };
    }
    return config;
  },
};

export default nextConfig;
