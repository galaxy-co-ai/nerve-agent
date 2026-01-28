import { NextRequest, NextResponse } from "next/server"
import { readdir, readFile, stat } from "fs/promises"
import { join, relative } from "path"
import { filterCodebaseFiles } from "@/lib/upload/file-filter"
import { analyzeCodebase } from "@/lib/ai/analyze-codebase"
import { requireUser } from "@/lib/auth"

export const maxDuration = 60

// Patterns to skip when scanning directories
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".cache",
  "coverage",
  ".vscode",
  ".idea",
  "__pycache__",
  "venv",
  ".env",
])

async function scanDirectory(
  dirPath: string,
  basePath: string,
  files: Map<string, string>,
  maxFiles = 500
): Promise<void> {
  if (files.size >= maxFiles) return

  const entries = await readdir(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    if (files.size >= maxFiles) break

    const fullPath = join(dirPath, entry.name)
    const relativePath = relative(basePath, fullPath).replace(/\\/g, "/")

    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name) && !entry.name.startsWith(".")) {
        await scanDirectory(fullPath, basePath, files, maxFiles)
      }
    } else if (entry.isFile()) {
      // Skip large files (> 1MB)
      const stats = await stat(fullPath)
      if (stats.size > 1024 * 1024) continue

      try {
        const content = await readFile(fullPath, "utf-8")
        // Skip binary files (contain null bytes)
        if (!content.includes("\0")) {
          files.set(relativePath, content)
        }
      } catch {
        // Skip files that can't be read as text
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUser()

    const { path: dirPath } = await request.json()

    if (!dirPath || typeof dirPath !== "string") {
      return NextResponse.json(
        { error: "Directory path is required" },
        { status: 400 }
      )
    }

    // Verify the path exists and is a directory
    try {
      const stats = await stat(dirPath)
      if (!stats.isDirectory()) {
        return NextResponse.json(
          { error: "Path is not a directory" },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: "Directory not found" },
        { status: 404 }
      )
    }

    // Scan the directory
    const files = new Map<string, string>()
    await scanDirectory(dirPath, dirPath, files)

    if (files.size === 0) {
      return NextResponse.json(
        { error: "No readable files found in directory" },
        { status: 400 }
      )
    }

    // Filter and analyze
    const filtered = filterCodebaseFiles(files)
    const analysis = await analyzeCodebase(filtered)

    return NextResponse.json({
      success: true,
      analysis,
      stats: {
        totalFiles: filtered.totalFiles,
        analyzedFiles: filtered.files.length,
        estimatedTokens: filtered.estimatedTokens,
      },
    })
  } catch (error) {
    console.error("Analysis error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to analyze codebase" },
      { status: 500 }
    )
  }
}
