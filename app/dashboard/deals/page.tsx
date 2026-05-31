import Sidebar from "@/components/Sidebar";
import { getDeals, getCompanies, getContacts } from "@/lib/data";
import { createDeal, deleteDeal } from "@/lib/actions";

export const dynamic = "force-dynamic";

const STAGES = ["Qualified", "Discovery", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

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

export default async function DealsPage() {
  const [deals, companies, contacts] = await Promise.all([getDeals(), getCompanies(), getContacts()]);

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Pipeline</h1>
          <p className="text-slate-400 mt-1 text-sm">{deals.length} deal{deals.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Add deal form */}
        <div className="bg-[#111827] border border-slate-700/50 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold text-sm mb-4">Add a deal</h2>
          <form action={createDeal} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input name="title" required placeholder="Deal name *" className="input-field" />
            <input name="value" placeholder="Value e.g. 50000" className="input-field" />
            <select name="stage" className="input-field">
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select name="company_id" className="input-field">
              <option value="">No company</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select name="contact_id" className="input-field">
              <option value="">No contact</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
            </select>
            <input name="notes" placeholder="Notes (optional)" className="input-field" />
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
              <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
                + Add Deal
              </button>
            </div>
          </form>
        </div>

        {/* Deals table */}
        <div className="bg-[#111827] border border-slate-700/50 rounded-xl overflow-hidden">
          {deals.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-500 text-sm">No deals yet — add one above</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Deal</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Company</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Contact</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Stage</th>
                  <th className="text-right px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Value</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-white font-medium">{deal.title}</td>
                    <td className="px-4 py-3.5 text-slate-400">{deal.company?.name ?? "—"}</td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {deal.contact ? `${deal.contact.first_name} ${deal.contact.last_name}` : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stageColors[deal.stage] ?? "bg-slate-800 text-slate-300"}`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-white font-medium">{formatCurrency(deal.value)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <form action={deleteDeal.bind(null, deal.id)}>
                        <button type="submit" className="text-rose-500 hover:text-rose-400 text-xs">Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
