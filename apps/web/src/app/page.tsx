import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth();

  // Redirect authenticated users to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold">NERVE AGENT</span>
          <div className="flex items-center gap-3">
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors">
                Get Started
              </button>
            </SignUpButton>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl px-6">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Your entire workflow.
            <br />
            <span className="text-zinc-400">One command center.</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            NERVE AGENT is the project operating system for solo builders.
            Planning, sprints, time tracking, client portals, invoicing — all in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <SignUpButton mode="modal">
              <button className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors">
                Get Started Free
              </button>
            </SignUpButton>
            <Link
              href="/backlog"
              className="px-6 py-3 text-zinc-400 hover:text-white transition-colors"
            >
              View Development Progress →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-zinc-500">
          Built by GalaxyCo
        </div>
      </footer>
    </div>
  );
}
