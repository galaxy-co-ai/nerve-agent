"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, CheckCircle, ExternalLink } from "lucide-react"

export default function PortalLoginPage() {
  const [email, setEmail] = useState("")
  const [projectCode, setProjectCode] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [devLink, setDevLink] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setMessage("")
    setDevLink(null)

    try {
      const response = await fetch("/api/portal/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, projectSlug: projectCode }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message)
        if (data.devMode && data.magicLink) {
          setDevLink(data.magicLink)
        }
      } else {
        setStatus("error")
        setMessage(data.error || "Something went wrong")
      }
    } catch {
      setStatus("error")
      setMessage("Failed to send magic link")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Client Portal Access</CardTitle>
          <CardDescription>
            Enter your email and project code to receive a magic link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="font-medium">{message}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  The link will expire in 1 hour.
                </p>
              </div>
              {devLink && (
                <div className="mt-4 p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground mb-2">
                    Development mode - click to access:
                  </p>
                  <a
                    href={devLink}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Portal
                  </a>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setStatus("idle")
                  setDevLink(null)
                }}
                className="mt-4"
              >
                Request Another Link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "loading"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectCode">Project Code</Label>
                <Input
                  id="projectCode"
                  type="text"
                  placeholder="e.g., results-roofing"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  required
                  disabled={status === "loading"}
                />
                <p className="text-xs text-muted-foreground">
                  Your developer will provide this code
                </p>
              </div>

              {status === "error" && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {message}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={status === "loading"}>
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="fixed bottom-4 text-center w-full text-sm text-muted-foreground">
        Powered by NERVE AGENT
      </div>
    </div>
  )
}
