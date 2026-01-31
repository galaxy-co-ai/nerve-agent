export const dynamic = "force-dynamic"

import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  NerveCard,
  NerveCardContent,
  NerveCardDescription,
  NerveCardHeader,
  NerveCardTitle,
  NerveButton,
  NerveInput,
  NerveSwitch,
  NerveSeparator,
  NerveLabel,
} from "@/components/nerve"
import { User, Bell, Palette, Key, Zap, Monitor } from "lucide-react"
import { requireUser } from "@/lib/auth"
import { SettingsDesktopSection } from "./settings-desktop-section"

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
        {/* Desktop App - Priority Section */}
        <SettingsDesktopSection userId={user.id} />

        {/* Profile */}
        <NerveCard elevation={1}>
          <NerveCardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-zinc-400" />
              <NerveCardTitle>Profile</NerveCardTitle>
            </div>
            <NerveCardDescription>
              Your personal information and account details
            </NerveCardDescription>
          </NerveCardHeader>
          <NerveCardContent className="space-y-4">
            <div className="grid gap-2">
              <NerveLabel htmlFor="name">Name</NerveLabel>
              <NerveInput id="name" defaultValue={user.name || ""} placeholder="Your name" />
            </div>
            <div className="grid gap-2">
              <NerveLabel htmlFor="email">Email</NerveLabel>
              <NerveInput
                id="email"
                defaultValue={user.email || ""}
                disabled
                className="bg-zinc-900/50"
              />
              <p className="text-xs text-zinc-500">Managed by your authentication provider</p>
            </div>
            <NerveButton className="mt-2">Save Changes</NerveButton>
          </NerveCardContent>
        </NerveCard>

        {/* Notifications */}
        <NerveCard elevation={1}>
          <NerveCardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-zinc-400" />
              <NerveCardTitle>Notifications</NerveCardTitle>
            </div>
            <NerveCardDescription>
              Configure how you receive updates and alerts
            </NerveCardDescription>
          </NerveCardHeader>
          <NerveCardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <NerveLabel>Daily Summary</NerveLabel>
                <p className="text-sm text-zinc-500">Receive a morning email with your daily focus</p>
              </div>
              <NerveSwitch />
            </div>
            <NerveSeparator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <NerveLabel>Blocker Alerts</NerveLabel>
                <p className="text-sm text-zinc-500">Get notified when blockers need attention</p>
              </div>
              <NerveSwitch defaultChecked />
            </div>
            <NerveSeparator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <NerveLabel>Client Updates</NerveLabel>
                <p className="text-sm text-zinc-500">Notifications when clients respond in portals</p>
              </div>
              <NerveSwitch defaultChecked />
            </div>
          </NerveCardContent>
        </NerveCard>

        {/* Appearance */}
        <NerveCard elevation={1}>
          <NerveCardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-zinc-400" />
              <NerveCardTitle>Appearance</NerveCardTitle>
            </div>
            <NerveCardDescription>
              Customize how Nerve Agent looks
            </NerveCardDescription>
          </NerveCardHeader>
          <NerveCardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <NerveLabel>Dark Mode</NerveLabel>
                <p className="text-sm text-zinc-500">Always use dark theme</p>
              </div>
              <NerveSwitch defaultChecked disabled />
            </div>
            <p className="text-xs text-zinc-500">Light mode coming soon. We&apos;re creatures of the night.</p>
          </NerveCardContent>
        </NerveCard>

        {/* Integrations */}
        <NerveCard elevation={1}>
          <NerveCardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-zinc-400" />
              <NerveCardTitle>Integrations</NerveCardTitle>
            </div>
            <NerveCardDescription>
              Connect your tools and services
            </NerveCardDescription>
          </NerveCardHeader>
          <NerveCardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <NerveLabel>GitHub</NerveLabel>
                <p className="text-sm text-zinc-500">Sync commits and PRs with your projects</p>
              </div>
              <NerveButton variant="outline" size="sm">Connect</NerveButton>
            </div>
            <NerveSeparator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <NerveLabel>Stripe</NerveLabel>
                <p className="text-sm text-zinc-500">Link payments and invoicing</p>
              </div>
              <NerveButton variant="outline" size="sm">Connect</NerveButton>
            </div>
            <NerveSeparator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <NerveLabel>Calendar</NerveLabel>
                <p className="text-sm text-zinc-500">Sync meetings and deadlines</p>
              </div>
              <NerveButton variant="outline" size="sm">Connect</NerveButton>
            </div>
          </NerveCardContent>
        </NerveCard>

        {/* API Keys */}
        <NerveCard elevation={1}>
          <NerveCardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-zinc-400" />
              <NerveCardTitle>API Keys</NerveCardTitle>
            </div>
            <NerveCardDescription>
              Manage your API credentials for AI features
            </NerveCardDescription>
          </NerveCardHeader>
          <NerveCardContent className="space-y-4">
            <div className="grid gap-2">
              <NerveLabel htmlFor="anthropic-key">Anthropic API Key</NerveLabel>
              <div className="flex gap-2">
                <NerveInput
                  id="anthropic-key"
                  type="password"
                  placeholder="sk-ant-..."
                  className="font-mono"
                />
                <NerveButton variant="outline">Save</NerveButton>
              </div>
              <p className="text-xs text-zinc-500">Used for AI writing assistance and project analysis</p>
            </div>
          </NerveCardContent>
        </NerveCard>
      </div>
    </>
  )
}
