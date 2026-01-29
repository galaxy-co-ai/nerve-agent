export const dynamic = "force-dynamic"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Palette, Key, Zap } from "lucide-react"
import { requireUser } from "@/lib/auth"

export default async function SettingsPage() {
  const user = await requireUser()

  return (
    <>
      <header className="flex h-16 shrink-0 items-center border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1 flex justify-center">
          <h1 className="text-lg font-bold tracking-tight">Settings</h1>
        </div>
        <div className="w-8" /> {/* Spacer for balance */}
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>
              Your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={user.name || ""} placeholder="Your name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Managed by your authentication provider</p>
            </div>
            <Button className="mt-2">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure how you receive updates and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Summary</Label>
                <p className="text-sm text-muted-foreground">Receive a morning email with your daily focus</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Blocker Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when blockers need attention</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Client Updates</Label>
                <p className="text-sm text-muted-foreground">Notifications when clients respond in portals</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>
              Customize how Nerve Agent looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Always use dark theme</p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <p className="text-xs text-muted-foreground">Light mode coming soon. We&apos;re creatures of the night.</p>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Integrations</CardTitle>
            </div>
            <CardDescription>
              Connect your tools and services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>GitHub</Label>
                <p className="text-sm text-muted-foreground">Sync commits and PRs with your projects</p>
              </div>
              <Button variant="outline" size="sm">Connect</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Stripe</Label>
                <p className="text-sm text-muted-foreground">Link payments and invoicing</p>
              </div>
              <Button variant="outline" size="sm">Connect</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Calendar</Label>
                <p className="text-sm text-muted-foreground">Sync meetings and deadlines</p>
              </div>
              <Button variant="outline" size="sm">Connect</Button>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-muted-foreground" />
              <CardTitle>API Keys</CardTitle>
            </div>
            <CardDescription>
              Manage your API credentials for AI features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="anthropic-key">Anthropic API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="anthropic-key"
                  type="password"
                  placeholder="sk-ant-..."
                  className="font-mono"
                />
                <Button variant="outline">Save</Button>
              </div>
              <p className="text-xs text-muted-foreground">Used for AI writing assistance and project analysis</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
