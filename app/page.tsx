import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1e] px-4">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="2.5" />
            <circle cx="16" cy="16" r="4" fill="white" />
            <line x1="16" y1="4" x2="16" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="24" x2="16" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="4" y1="16" x2="8" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="16" x2="28" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Atlas</h1>
        <p className="mt-2 text-slate-400 text-sm">Business Development Command Center</p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm bg-[#111827] border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-1">Sign in</h2>
        <p className="text-slate-400 text-sm mb-6">
          Enter your email and we&apos;ll send you a magic link — no password needed.
        </p>

        <form action="/dashboard" method="get">
          <label className="block text-sm text-slate-300 mb-1.5" htmlFor="email">
            Work email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm mb-4"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors"
          >
            Send magic link
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          (Email auth will be live after Supabase is connected)
        </p>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Previewing?{" "}
        <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 underline">
          Go straight to the dashboard →
        </Link>
      </p>
    </main>
  );
}
