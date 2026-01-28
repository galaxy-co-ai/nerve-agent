/**
 * Smart file filtering for codebase analysis
 * Prioritizes important files while staying within token limits
 */

export interface FileEntry {
  path: string
  content: string
}

export interface FilteredCodebase {
  files: FileEntry[]
  truncatedPaths: string[] // Files that were path-only listed
  totalFiles: number
  estimatedTokens: number
}

// Priority 1: Always include full content
const PRIORITY_FILES = [
  "package.json",
  "README.md",
  "readme.md",
  "README",
  "tsconfig.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "vite.config.ts",
  "vite.config.js",
]

// Priority 2: Include if found (important for structure)
const IMPORTANT_PATTERNS = [
  /^prisma\/schema\.prisma$/,
  /^src\/app\/.*\/route\.ts$/,
  /^src\/pages\/api\/.*\.ts$/,
  /^app\/.*\/route\.ts$/,
  /^pages\/api\/.*\.ts$/,
  /^\.env\.example$/,
  /^docker-compose\.ya?ml$/,
  /^Dockerfile$/,
]

// Skip these entirely
const SKIP_PATTERNS = [
  /node_modules\//,
  /\.git\//,
  /\.next\//,
  /dist\//,
  /build\//,
  /\.cache\//,
  /coverage\//,
  /\.vscode\//,
  /\.idea\//,
  /\.DS_Store$/,
  /\.env$/,
  /\.env\.local$/,
  /\.env\.production$/,
  /\.pnp\..*$/,
  /yarn\.lock$/,
  /package-lock\.json$/,
  /pnpm-lock\.yaml$/,
  /\.map$/,
  /\.min\.js$/,
  /\.min\.css$/,
  /\.chunk\.js$/,
  /\.bundle\.js$/,
  /\.(png|jpg|jpeg|gif|ico|svg|webp|avif)$/i,
  /\.(woff|woff2|ttf|eot|otf)$/i,
  /\.(mp3|mp4|wav|avi|mov|webm)$/i,
  /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i,
  /\.(zip|tar|gz|rar|7z)$/i,
]

// Files to include (code files)
const CODE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".prisma",
  ".graphql",
  ".gql",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".yaml",
  ".yml",
  ".toml",
  ".md",
  ".mdx",
  ".sql",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".kt",
  ".swift",
  ".rb",
  ".php",
  ".vue",
  ".svelte",
]

// Rough token estimate (1 token ~ 4 chars)
function estimateTokens(content: string): number {
  return Math.ceil(content.length / 4)
}

// Maximum lines for large files
const MAX_LINES_LARGE_FILE = 100

// Token budget for AI context
const TOKEN_BUDGET = 50000 // ~50k tokens leaves room for prompt and response

/**
 * Filter and prioritize files from a codebase for AI analysis
 */
export function filterCodebaseFiles(
  allFiles: Map<string, string>
): FilteredCodebase {
  const result: FilteredCodebase = {
    files: [],
    truncatedPaths: [],
    totalFiles: allFiles.size,
    estimatedTokens: 0,
  }

  // Separate files by priority
  const priority1: FileEntry[] = []
  const priority2: FileEntry[] = []
  const priority3: FileEntry[] = []
  const pathsOnly: string[] = []

  for (const [path, content] of allFiles) {
    // Skip excluded files
    if (SKIP_PATTERNS.some((pattern) => pattern.test(path))) {
      continue
    }

    const fileName = path.split("/").pop() || path

    // Priority 1: Critical config files
    if (PRIORITY_FILES.includes(fileName)) {
      priority1.push({ path, content })
      continue
    }

    // Priority 2: Important structural files
    if (IMPORTANT_PATTERNS.some((pattern) => pattern.test(path))) {
      priority2.push({ path, content })
      continue
    }

    // Check if it's a code file we care about
    const hasCodeExtension = CODE_EXTENSIONS.some((ext) =>
      path.toLowerCase().endsWith(ext)
    )

    if (!hasCodeExtension) {
      continue
    }

    // Priority 3: Other code files
    priority3.push({ path, content })
  }

  // Add priority 1 files (always full content)
  for (const file of priority1) {
    const tokens = estimateTokens(file.content)
    if (result.estimatedTokens + tokens < TOKEN_BUDGET) {
      result.files.push(file)
      result.estimatedTokens += tokens
    }
  }

  // Add priority 2 files (full content if they fit)
  for (const file of priority2) {
    const tokens = estimateTokens(file.content)
    if (result.estimatedTokens + tokens < TOKEN_BUDGET) {
      result.files.push(file)
      result.estimatedTokens += tokens
    } else {
      // Truncate large files
      const truncated = truncateFile(file.content, MAX_LINES_LARGE_FILE)
      const truncatedTokens = estimateTokens(truncated)
      if (result.estimatedTokens + truncatedTokens < TOKEN_BUDGET) {
        result.files.push({ path: file.path, content: truncated })
        result.estimatedTokens += truncatedTokens
      } else {
        pathsOnly.push(file.path)
      }
    }
  }

  // Add priority 3 files
  // Sort by path to get a logical ordering (src/ first, etc.)
  priority3.sort((a, b) => a.path.localeCompare(b.path))

  for (const file of priority3) {
    const tokens = estimateTokens(file.content)
    const remainingBudget = TOKEN_BUDGET - result.estimatedTokens

    if (remainingBudget < 500) {
      // Not much room left, just list paths
      pathsOnly.push(file.path)
      continue
    }

    if (tokens < remainingBudget * 0.3) {
      // Small file, include full content
      result.files.push(file)
      result.estimatedTokens += tokens
    } else if (tokens < remainingBudget) {
      // Medium file, truncate
      const truncated = truncateFile(file.content, MAX_LINES_LARGE_FILE)
      const truncatedTokens = estimateTokens(truncated)
      result.files.push({ path: file.path, content: truncated })
      result.estimatedTokens += truncatedTokens
    } else {
      // Large file, just list path
      pathsOnly.push(file.path)
    }
  }

  result.truncatedPaths = pathsOnly

  return result
}

/**
 * Truncate file content to a maximum number of lines
 */
function truncateFile(content: string, maxLines: number): string {
  const lines = content.split("\n")
  if (lines.length <= maxLines) {
    return content
  }

  const truncated = lines.slice(0, maxLines).join("\n")
  return `${truncated}\n\n// ... truncated (${lines.length - maxLines} more lines)`
}

/**
 * Format the filtered codebase as a string for AI analysis
 */
export function formatCodebaseForAI(filtered: FilteredCodebase): string {
  let output = `# Codebase Analysis\n\n`
  output += `Total files in project: ${filtered.totalFiles}\n`
  output += `Files analyzed: ${filtered.files.length}\n`
  output += `Estimated tokens: ~${filtered.estimatedTokens}\n\n`

  // Full file contents
  output += `## File Contents\n\n`
  for (const file of filtered.files) {
    output += `### ${file.path}\n\`\`\`\n${file.content}\n\`\`\`\n\n`
  }

  // Path-only listing
  if (filtered.truncatedPaths.length > 0) {
    output += `## Additional Files (paths only)\n\n`
    output += filtered.truncatedPaths.map((p) => `- ${p}`).join("\n")
    output += "\n"
  }

  return output
}
