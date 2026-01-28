"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderKanban, Home, RotateCcw } from "lucide-react"
import Link from "next/link"

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Projects error:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <FolderKanban className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Projects Error</CardTitle>
          <CardDescription>
            Unable to load project data. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-mono text-xs text-muted-foreground break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 justify-center">
          <Button onClick={reset} variant="default">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/projects">
              <FolderKanban className="mr-2 h-4 w-4" />
              All Projects
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
