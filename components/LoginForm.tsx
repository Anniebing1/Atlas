"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    // Check env vars are present
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      setError(`Missing config: URL=${!!url} KEY=${!!key}`);
      setStatus("error");
      return;
    }

    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out after 10s — check Supabase project status")), 10000)
      );

      const supabase = createClient();
      const authCall = supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });

      const { error } = await Promise.race([authCall, timeout]);

      if (error) {
        setError(error.message);
        setStatus("error");
      } else {
        setStatus("sent");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center py-4">
        <div className="text-3xl mb-3">📬</div>
        <p className="text-white font-medium mb-1">Check your email</p>
        <p className="text-slate-400 text-sm">
          We sent a magic link to <span className="text-indigo-400">{email}</span>.<br />
          Click it to sign in — no password needed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-sm text-slate-300 mb-1.5" htmlFor="email">
        Work email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        required
        className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm mb-4"
      />
      {error && (
        <p className="text-rose-400 text-xs mb-3 bg-rose-950/40 border border-rose-800 rounded p-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-medium text-sm transition-colors"
      >
        {status === "loading" ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}
