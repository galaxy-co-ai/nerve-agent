import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">NERVE AGENT</h1>
        <p className="text-zinc-400 mb-8">Project operating system for solo builders</p>
        <Link
          href="/backlog"
          className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
        >
          View Development Backlog
        </Link>
      </div>
    </div>
  );
}
