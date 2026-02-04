import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import {
  MilestoneCardSkeleton,
  ActivityFeedSkeleton,
} from "@/components/client/skeletons"

export default function ProjectDetailLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#08080a]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-[#08080a]/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-zinc-900/50 border-zinc-800 p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </Card>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Milestones */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            <div className="space-y-3">
              <MilestoneCardSkeleton />
              <MilestoneCardSkeleton />
              <MilestoneCardSkeleton />
            </div>
          </div>

          {/* Right - Activity & Developer */}
          <div className="space-y-4">
            {/* Developer Card */}
            <Card className="bg-zinc-900/50 border-zinc-800 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </Card>

            {/* Activity */}
            <Card className="bg-zinc-900/50 border-zinc-800 p-4">
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <ActivityFeedSkeleton count={5} />
              </div>
            </Card>
          </div>
        </div>

        {/* Sprints Section */}
        <Card className="bg-zinc-900/50 border-zinc-800 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-zinc-800">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
