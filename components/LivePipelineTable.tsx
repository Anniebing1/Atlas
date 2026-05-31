import Link from "next/link";
import type { Deal } from "@/lib/data";

const stageColors: Record<string, string> = {
  "Qualified": "bg-blue-900/50 text-blue-300",
  "Discovery": "bg-purple-900/50 text-purple-300",
  "Proposal": "bg-amber-900/50 text-amber-300",
  "Negotiation": "bg-orange-900/50 text-orange-300",
  "Closed Won": "bg-emerald-900/50 text-emerald-300",
  "Closed Lost": "bg-rose-900/50 text-rose-300",
};

function formatCurrency(n: number | null) {
  if (!n) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

export default function LivePipelineTable({ deals }: { deals: Deal[] }) {
  return (
    <div className="bg-[#111827] border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">Active Deals</h2>
        <Link href="/dashboard/deals" className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors">
          View all →
        </Link>
      </div>

      {deals.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-slate-500 text-sm mb-3">No deals yet</p>
          <Link href="/dashboard/deals" className="inline-block px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            + Add your first deal
          </Link>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Deal</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Company</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Stage</th>
              <th className="text-right px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Value</th>
            </tr>
          </thead>
          <tbody>
            {deals.slice(0, 6).map((deal) => (
              <tr key={deal.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="px-5 py-3.5 text-white font-medium">{deal.title}</td>
                <td className="px-4 py-3.5 text-slate-400">{deal.company?.name ?? "—"}</td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stageColors[deal.stage] ?? "bg-slate-800 text-slate-300"}`}>
                    {deal.stage}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right text-white font-medium">{formatCurrency(deal.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
