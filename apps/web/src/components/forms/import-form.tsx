"use client"

import { useState } from "react"
import { FolderOpen, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { importProject } from "@/lib/actions/import"
import type { CodebaseAnalysis } from "@/lib/ai/analyze-codebase"

type ImportStep = "input" | "analyzing" | "review" | "creating"

interface AnalysisResult {
  analysis: CodebaseAnalysis
  stats: {
    totalFiles: number
    analyzedFiles: number
    estimatedTokens: number
  }
}

export function ImportForm() {
  const [step, setStep] = useState<ImportStep>("input")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [pending, setPending] = useState(false)
  const [localPath, setLocalPath] = useState("")

  async function handleAnalyze() {
    if (!localPath.trim()) {
      setError("Please enter a directory path")
      return
    }

    setStep("analyzing")
    setError(null)
    setPending(true)

    try {
      const response = await fetch("/api/analyze-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: localPath.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed")
      }

      setResult(data)
      setStep("review")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze codebase")
      setStep("input")
    } finally {
      setPending(false)
    }
  }

  async function handleCreateProject(formData: FormData) {
    if (!result) return

    setStep("creating")
    setPending(true)

    try {
      formData.append("analysis", JSON.stringify(result.analysis))
      await importProject(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
      setStep("review")
      setPending(false)
    }
  }

  function resetForm() {
    setStep("input")
    setError(null)
    setResult(null)
    setLocalPath("")
  }

  // Analyzing step
  if (step === "analyzing") {
    return (
      <Card className="max-w-2xl">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-lg font-medium">Analyzing codebase...</p>
              <p className="text-sm text-muted-foreground mt-1">
                AI is reviewing your files and generating a project plan
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Creating step
  if (step === "creating") {
    return (
      <Card className="max-w-2xl">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-lg font-medium">Creating project...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Setting up your project with sprints and tasks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Review step
  if (step === "review" && result) {
    const { analysis, stats } = result
    const totalTasks = analysis.sprints.reduce((sum, s) => sum + s.tasks.length, 0)
    const totalHours = analysis.sprints.reduce(
      (sum, s) => sum + s.tasks.reduce((t, task) => t + task.estimatedHours, 0),
      0
    )

    return (
      <Card className="max-w-3xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <CardTitle>Analysis Complete</CardTitle>
          </div>
          <CardDescription>
            Review the generated project plan before creating
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.analyzedFiles}</p>
              <p className="text-xs text-muted-foreground">Files Analyzed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{analysis.sprints.length}</p>
              <p className="text-xs text-muted-foreground">Sprints</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{totalTasks}</p>
              <p className="text-xs text-muted-foreground">Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{totalHours}h</p>
              <p className="text-xs text-muted-foreground">Estimated</p>
            </div>
          </div>

          {/* Project info */}
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                Project Name
              </Label>
              <p className="font-medium">{analysis.projectName}</p>
            </div>
            {analysis.description && (
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  Description
                </Label>
                <p className="text-sm text-muted-foreground">{analysis.description}</p>
              </div>
            )}
          </div>

          {/* Sprints preview */}
          <div className="space-y-3">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
              Sprints
            </Label>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {analysis.sprints.map((sprint, i) => (
                <div
                  key={i}
                  className="p-3 border rounded-lg bg-background"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">
                      Sprint {i + 1}: {sprint.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {sprint.tasks.length} tasks
                    </span>
                  </div>
                  {sprint.description && (
                    <p className="text-xs text-muted-foreground">{sprint.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Create form */}
          <form action={handleCreateProject} className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                name="clientName"
                placeholder="e.g., Personal Project, Acme Corp"
                required
              />
              <p className="text-xs text-muted-foreground">
                Who is this project for?
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Start Over
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  // Input step (default)
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Import Codebase</CardTitle>
        <CardDescription>
          Point to a local directory and AI will generate a project plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="path">Directory Path</Label>
          <Input
            id="path"
            placeholder="C:\Users\Owner\projects\my-app"
            value={localPath}
            onChange={(e) => setLocalPath(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Full path to the project directory
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={!localPath.trim() || pending}
          className="w-full"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FolderOpen className="mr-2 h-4 w-4" />
              Analyze Codebase
            </>
          )}
        </Button>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">What happens next?</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>AI scans your codebase structure</li>
            <li>Generates project plan with sprints and tasks</li>
            <li>Review and adjust before creating</li>
            <li>Project is created with all sprints and tasks</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
