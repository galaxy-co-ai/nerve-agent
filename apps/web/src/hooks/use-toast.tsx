"use client"

import * as React from "react"

export interface Toast {
  id: string
  variant?: "default" | "success" | "error" | "warning" | "info"
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 11)
    const newToast = { ...toast, id }

    setToasts((prev) => [...prev, newToast])

    // Auto-remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, toast.duration || 5000)
    }

    return id
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Convenience functions
export function useToastActions() {
  const { addToast } = useToast()

  return {
    success: (title: string, description?: string) =>
      addToast({ variant: "success", title, description }),
    error: (title: string, description?: string) =>
      addToast({ variant: "error", title, description }),
    warning: (title: string, description?: string) =>
      addToast({ variant: "warning", title, description }),
    info: (title: string, description?: string) =>
      addToast({ variant: "info", title, description }),
    custom: (toast: Omit<Toast, "id">) => addToast(toast),
  }
}
