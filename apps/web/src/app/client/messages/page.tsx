import { MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function ClientMessagesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#08080a]">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-[#08080a]/80 backdrop-blur-xl">
        <div className="flex h-16 items-center px-6">
          <h1 className="text-xl font-semibold text-white">Messages</h1>
        </div>
      </header>

      <main className="flex-1 p-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-zinc-600" />
            </div>
            <h2 className="text-lg font-medium text-white mb-2">Coming Soon</h2>
            <p className="text-zinc-500 max-w-sm mx-auto">
              Direct messaging with your developer will be available here. For now, use email or your
              preferred communication channel.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
