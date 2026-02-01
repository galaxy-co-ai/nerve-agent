"use client"

import * as React from "react"
import {
  NerveToastProvider,
  NerveToastViewport,
  NerveToast,
  NerveToastTitle,
  NerveToastDescription,
  NerveToastClose,
} from "./components/nerve-toast"
import { NerveButton } from "./components/nerve-button"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts, removeToast } = useToast()

  return (
    <NerveToastProvider>
      {toasts.map((toast) => (
        <NerveToast
          key={toast.id}
          variant={toast.variant}
          open={true}
          onOpenChange={(open) => {
            if (!open) removeToast(toast.id)
          }}
        >
          <div className="flex-1 min-w-0">
            <NerveToastTitle>{toast.title}</NerveToastTitle>
            {toast.description && (
              <NerveToastDescription>{toast.description}</NerveToastDescription>
            )}
          </div>

          {(toast.action || toast.secondaryAction) && (
            <div className="flex gap-2 shrink-0">
              {toast.action && (
                <NerveButton
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    toast.action?.onClick()
                    removeToast(toast.id)
                  }}
                >
                  {toast.action.label}
                </NerveButton>
              )}
              {toast.secondaryAction && (
                <NerveButton
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toast.secondaryAction?.onClick()
                    removeToast(toast.id)
                  }}
                >
                  {toast.secondaryAction.label}
                </NerveButton>
              )}
            </div>
          )}

          <NerveToastClose />
        </NerveToast>
      ))}
      <NerveToastViewport />
    </NerveToastProvider>
  )
}
