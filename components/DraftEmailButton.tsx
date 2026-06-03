"use client";

import { useState } from "react";

export default function DraftEmailButton({
  company,
  contacts,
}: {
  company: Record<string, unknown>;
  contacts: Record<string, unknown>[];
}) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function draftEmail() {
    setLoading(true);
    setDraft("");

    const contactList = contacts.length > 0
      ? contacts.map(c => `${c.first_name} ${c.last_name}, ${c.title}`).join("; ")
      : "no contacts on file";

    const prompt = `Draft a cold outreach email for this property:
Property: ${company.name}
Location: ${company.city}, ${company.state}
Class: ${company.building_class}, Units: ${company.units}, Built: ${company.year_built}
Owner: ${company.owner_name ?? "unknown"}
Manager: ${company.manager_name ?? "unknown"}
For Sale: ${company.for_sale ? `Yes - ${company.sale_price}` : "No"}
Contacts: ${contactList}

Write a short, sharp cold email (under 120 words) targeting an operations, construction, or facilities decision maker at this property. Make it specific to this property. Sign off as Annie Bing.`;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
      setDraft(text);
    }
    setLoading(false);
  }

  async function copy() {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="shrink-0">
      {!draft ? (
        <button
          onClick={draftEmail}
          disabled={loading}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Drafting...
            </>
          ) : (
            "✦ Draft Email"
          )}
        </button>
      ) : (
        <div className="w-80">
          <div className="bg-[#111827] border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-xs font-semibold">✦ AI Draft</p>
              <div className="flex gap-2">
                <button onClick={copy} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button onClick={() => setDraft("")} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                  Clear
                </button>
                <button onClick={draftEmail} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                  Redraft
                </button>
              </div>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{draft}</p>
          </div>
        </div>
      )}
    </div>
  );
}
