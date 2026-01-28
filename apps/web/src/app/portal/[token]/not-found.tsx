import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function PortalNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Portal Not Found</h1>
          <p className="text-muted-foreground text-center text-sm">
            This project portal doesn&apos;t exist or has been disabled.
            Please contact the project owner if you believe this is an error.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
