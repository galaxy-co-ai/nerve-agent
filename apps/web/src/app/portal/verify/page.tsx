"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

function PortalVerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [projectName, setProjectName] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No token provided")
      return
    }

    async function verifyToken() {
      try {
        const response = await fetch(`/api/portal/magic-link?token=${token}`)
        const data = await response.json()

        if (data.success) {
          setStatus("success")
          setProjectName(data.projectName)
          // Redirect to portal after a short delay
          setTimeout(() => {
            router.push(`/portal/${data.portalToken}`)
          }, 1500)
        } else {
          setStatus("error")
          setMessage(data.error || "Verification failed")
        }
      } catch {
        setStatus("error")
        setMessage("Failed to verify token")
      }
    }

    verifyToken()
  }, [token, router])

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        {status === "loading" && (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Verifying your access...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-lg">Welcome!</p>
              <p className="text-muted-foreground">
                Redirecting to {projectName} portal...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="font-medium text-lg">Verification Failed</p>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <Button onClick={() => router.push("/portal/login")} className="mt-4">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingFallback() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PortalVerifyPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <PortalVerifyContent />
      </Suspense>
    </div>
  )
}
