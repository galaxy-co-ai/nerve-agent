"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error for future Sentry integration
    console.error("Global application error:", error)
  }, [error])

  return (
    <html>
      <body className="bg-zinc-950 text-zinc-50">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg">
            <div className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <svg
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold">Critical Error</h1>
              <p className="mt-2 text-sm text-zinc-400">
                A critical error occurred. Please refresh the page or try again later.
              </p>
              {process.env.NODE_ENV === "development" && (
                <div className="mt-4 w-full rounded-lg bg-zinc-800 p-4 text-left">
                  <p className="font-mono text-xs text-zinc-400 break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="mt-2 text-xs text-zinc-500">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}
              <div className="mt-6 flex gap-2">
                <button
                  onClick={reset}
                  className="inline-flex items-center justify-center rounded-md bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
                >
                  Try again
                </button>
{/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Can't use Link in global error boundary */}
                <a
                  href="/"
                  className="inline-flex items-center justify-center rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-800 transition-colors"
                >
                  Go home
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
