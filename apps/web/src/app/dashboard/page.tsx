import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-zinc-800 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold">
              NERVE AGENT
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/projects"
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
              >
                Projects
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">
              {user?.firstName || user?.emailAddresses[0]?.emailAddress}
            </span>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="text-zinc-400">
            Your command center for everything.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard
            title="Daily Driver"
            description="Today's focus, blockers, and follow-ups"
            href="/dashboard/daily"
            status="Coming Soon"
          />
          <DashboardCard
            title="Projects"
            description="Manage your active projects"
            href="/dashboard/projects"
            status="Coming Soon"
          />
          <DashboardCard
            title="Sprint Stack"
            description="Current sprint tasks and progress"
            href="/dashboard/sprints"
            status="Coming Soon"
          />
          <DashboardCard
            title="Time Tracking"
            description="View tracked time across projects"
            href="/dashboard/time"
            status="Coming Soon"
          />
          <DashboardCard
            title="Development Backlog"
            description="Track NERVE AGENT development progress"
            href="/backlog"
            status="Active"
            highlight
          />
        </div>
      </main>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
  status,
  highlight,
}: {
  title: string;
  description: string;
  href: string;
  status: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block p-6 rounded-lg border transition-colors ${
        highlight
          ? "border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/50"
          : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            status === "Active"
              ? "bg-green-500/20 text-green-400"
              : "bg-zinc-700 text-zinc-400"
          }`}
        >
          {status}
        </span>
      </div>
      <p className="text-sm text-zinc-400">{description}</p>
    </Link>
  );
}
