const deals = [
  { company: "Meridian Group", contact: "Sarah Chen", stage: "Proposal", value: "$85,000", updated: "Today" },
  { company: "Vantage Capital", contact: "James Park", stage: "Discovery", value: "$210,000", updated: "Yesterday" },
  { company: "Northfield Co.", contact: "Lisa Moore", stage: "Negotiation", value: "$60,000", updated: "2 days ago" },
  { company: "Stratos Partners", contact: "David Kim", stage: "Qualified", value: "$140,000", updated: "3 days ago" },
  { company: "Luminary Inc.", contact: "Rachel Torres", stage: "Closed Won", value: "$95,000", updated: "1 week ago" },
];

const stageColors: Record<string, string> = {
  "Qualified": "bg-blue-900/50 text-blue-300",
  "Discovery": "bg-purple-900/50 text-purple-300",
  "Proposal": "bg-amber-900/50 text-amber-300",
  "Negotiation": "bg-orange-900/50 text-orange-300",
  "Closed Won": "bg-emerald-900/50 text-emerald-300",
};

export default function PipelineTable() {
  return (
    <div className="bg-[#111827] border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm">Active Deals</h2>
        <button className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors">
          View all →
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Company</th>
            <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Contact</th>
            <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Stage</th>
            <th className="text-right px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Value</th>
            <th className="text-right px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Updated</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal, i) => (
            <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
              <td className="px-5 py-3.5 text-white font-medium">{deal.company}</td>
              <td className="px-4 py-3.5 text-slate-400">{deal.contact}</td>
              <td className="px-4 py-3.5">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stageColors[deal.stage] ?? "bg-slate-800 text-slate-300"}`}>
                  {deal.stage}
                </span>
              </td>
              <td className="px-5 py-3.5 text-right text-white font-medium">{deal.value}</td>
              <td className="px-5 py-3.5 text-right text-slate-500 text-xs">{deal.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
