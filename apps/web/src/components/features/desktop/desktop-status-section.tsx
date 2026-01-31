"use client"

import { useState } from "react"
import {
  NerveCard,
  NerveCardHeader,
  NerveCardTitle,
  NerveCardDescription,
  NerveCardContent,
  NerveButton,
  NerveBadge,
  NerveSeparator,
  NerveAlertDialog,
  NerveAlertDialogTrigger,
  NerveAlertDialogContent,
  NerveAlertDialogHeader,
  NerveAlertDialogTitle,
  NerveAlertDialogDescription,
  NerveAlertDialogFooter,
  NerveAlertDialogCancel,
  NerveAlertDialogAction,
} from "@/components/nerve"
import { DesktopPairingDialog } from "./desktop-pairing-dialog"
import { useDesktopConnection, type DesktopDevice } from "@/hooks/use-desktop-connection"
import {
  Monitor,
  Laptop,
  Apple,
  Trash2,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// =============================================================================
// Helpers
// =============================================================================

function getPlatformIcon(platform: string) {
  const platformLower = platform.toLowerCase()
  if (platformLower.includes("mac") || platformLower.includes("darwin")) {
    return <Apple className="h-4 w-4" />
  }
  if (platformLower.includes("linux")) {
    return <Laptop className="h-4 w-4" />
  }
  return <Monitor className="h-4 w-4" />
}

function formatPlatformName(platform: string): string {
  const platformLower = platform.toLowerCase()
  if (platformLower.includes("win32") || platformLower.includes("windows")) {
    return "Windows"
  }
  if (platformLower.includes("darwin") || platformLower.includes("mac")) {
    return "macOS"
  }
  if (platformLower.includes("linux")) {
    return "Linux"
  }
  return platform
}

// =============================================================================
// Device Item Component
// =============================================================================

interface DeviceItemProps {
  device: DesktopDevice
  onUnpair: (deviceId: string) => Promise<boolean>
}

function DeviceItem({ device, onUnpair }: DeviceItemProps) {
  const [isUnpairing, setIsUnpairing] = useState(false)

  const handleUnpair = async () => {
    setIsUnpairing(true)
    await onUnpair(device.id)
    setIsUnpairing(false)
  }

  const displayName = device.name || `${formatPlatformName(device.platform)} Device`
  const lastSeen = device.lastSeenAt
    ? formatDistanceToNow(new Date(device.lastSeenAt), { addSuffix: true })
    : "Never"

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        {/* Platform icon */}
        <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
          {getPlatformIcon(device.platform)}
        </div>

        {/* Device info */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-100">{displayName}</span>
            <NerveBadge
              variant={device.isOnline ? "success" : "default"}
              size="sm"
              dot
            >
              {device.isOnline ? "Online" : "Offline"}
            </NerveBadge>
          </div>
          <p className="text-xs text-zinc-500">
            {formatPlatformName(device.platform)} &middot; Last seen {lastSeen}
          </p>
        </div>
      </div>

      {/* Unpair button */}
      <NerveAlertDialog>
        <NerveAlertDialogTrigger asChild>
          <NerveButton
            variant="ghost"
            size="icon-sm"
            className="text-zinc-500 hover:text-[var(--nerve-error)]"
            disabled={isUnpairing}
          >
            {isUnpairing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </NerveButton>
        </NerveAlertDialogTrigger>
        <NerveAlertDialogContent>
          <NerveAlertDialogHeader>
            <NerveAlertDialogTitle>Unpair Device</NerveAlertDialogTitle>
            <NerveAlertDialogDescription>
              Are you sure you want to unpair "{displayName}"? You&apos;ll need to
              re-enter the pairing code to connect this device again.
            </NerveAlertDialogDescription>
          </NerveAlertDialogHeader>
          <NerveAlertDialogFooter>
            <NerveAlertDialogCancel>Cancel</NerveAlertDialogCancel>
            <NerveAlertDialogAction onClick={handleUnpair}>
              Unpair
            </NerveAlertDialogAction>
          </NerveAlertDialogFooter>
        </NerveAlertDialogContent>
      </NerveAlertDialog>
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

interface DesktopStatusSectionProps {
  userId: string
}

export function DesktopStatusSection({ userId }: DesktopStatusSectionProps) {
  const { status, isLoading, error, refreshStatus, unpairDevice } =
    useDesktopConnection(userId)

  const hasDevices = status.devices.length > 0
  const onlineCount = status.devices.filter((d) => d.isOnline).length

  return (
    <NerveCard elevation={1}>
      <NerveCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-zinc-400" />
            <NerveCardTitle>Desktop App</NerveCardTitle>
          </div>
          {hasDevices && (
            <NerveBadge variant={status.connected ? "success" : "default"} dot>
              {status.connected
                ? `${onlineCount} connected`
                : "Disconnected"}
            </NerveBadge>
          )}
        </div>
        <NerveCardDescription>
          Connect the NERVE desktop app for file access, clipboard sync, and
          system notifications
        </NerveCardDescription>
      </NerveCardHeader>

      <NerveCardContent>
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8 text-zinc-500">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            Loading...
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center py-8 text-[var(--nerve-error)]">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && !hasDevices && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-zinc-800/80 flex items-center justify-center mb-4">
              <WifiOff className="h-8 w-8 text-zinc-500" />
            </div>
            <p className="text-zinc-300 font-medium mb-1">
              No desktop app connected
            </p>
            <p className="text-sm text-zinc-500 mb-4">
              Connect the desktop app to enable file access and more
            </p>
            <DesktopPairingDialog onPairingSuccess={refreshStatus}>
              <NerveButton variant="primary" size="md">
                <Monitor className="h-4 w-4 mr-2" />
                Connect Desktop App
              </NerveButton>
            </DesktopPairingDialog>
          </div>
        )}

        {/* Devices List */}
        {!isLoading && !error && hasDevices && (
          <div>
            {/* Connection status header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                {status.connected ? (
                  <>
                    <Wifi className="h-4 w-4 text-[var(--nerve-success)]" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4" />
                    <span>All devices offline</span>
                  </>
                )}
              </div>
              <DesktopPairingDialog onPairingSuccess={refreshStatus}>
                <NerveButton variant="ghost" size="sm">
                  Add Device
                </NerveButton>
              </DesktopPairingDialog>
            </div>

            {/* Device list */}
            <div className="divide-y divide-zinc-700/50">
              {status.devices.map((device, index) => (
                <DeviceItem
                  key={device.id}
                  device={device}
                  onUnpair={unpairDevice}
                />
              ))}
            </div>
          </div>
        )}
      </NerveCardContent>
    </NerveCard>
  )
}
