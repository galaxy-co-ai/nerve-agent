"use client"

import { DesktopStatusSection } from "@/components/features/desktop"

interface SettingsDesktopSectionProps {
  userId: string
}

export function SettingsDesktopSection({ userId }: SettingsDesktopSectionProps) {
  return <DesktopStatusSection userId={userId} />
}
