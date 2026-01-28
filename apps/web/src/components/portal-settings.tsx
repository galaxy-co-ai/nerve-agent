"use client"

import { useState } from "react"
import { Globe, Copy, Check, RefreshCw, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { enablePortal, disablePortal, regeneratePortalToken } from "@/lib/actions/portal"

interface PortalSettingsProps {
  projectSlug: string
  portalEnabled: boolean
  portalToken: string | null
  portalLastAccess: Date | null
}

export function PortalSettings({
  projectSlug,
  portalEnabled,
  portalToken,
  portalLastAccess,
}: PortalSettingsProps) {
  const [enabled, setEnabled] = useState(portalEnabled)
  const [token, setToken] = useState(portalToken)
  const [copied, setCopied] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const portalUrl = token ? `${window.location.origin}/portal/${token}` : null

  async function handleToggle(newEnabled: boolean) {
    setIsToggling(true)
    try {
      if (newEnabled) {
        const newToken = await enablePortal(projectSlug)
        setToken(newToken)
        setEnabled(true)
      } else {
        await disablePortal(projectSlug)
        setEnabled(false)
      }
    } finally {
      setIsToggling(false)
    }
  }

  async function handleRegenerate() {
    setIsRegenerating(true)
    try {
      const newToken = await regeneratePortalToken(projectSlug)
      setToken(newToken)
    } finally {
      setIsRegenerating(false)
    }
  }

  async function handleCopy() {
    if (!portalUrl) return

    try {
      await navigator.clipboard.writeText(portalUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Client Portal</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="portal-toggle" className="text-sm text-muted-foreground">
              {enabled ? "Enabled" : "Disabled"}
            </Label>
            <Switch
              id="portal-toggle"
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={isToggling}
            />
          </div>
        </div>
        <CardDescription>
          Share a read-only view with your client
        </CardDescription>
      </CardHeader>

      {enabled && token && (
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-mono truncate">
              {portalUrl}
            </div>
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href={portalUrl || "#"} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {portalLastAccess
                ? `Last accessed: ${new Date(portalLastAccess).toLocaleDateString()}`
                : "Never accessed"}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
              {isRegenerating ? "Regenerating..." : "New Link"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Regenerating creates a new link and invalidates the old one.
          </p>
        </CardContent>
      )}
    </Card>
  )
}
