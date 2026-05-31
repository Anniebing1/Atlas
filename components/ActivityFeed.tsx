const activities = [
  { type: "email", text: "Sent follow-up to Sarah Chen", time: "10 min ago", color: "bg-blue-500" },
  { type: "meeting", text: "Call booked with Vantage Capital", time: "1 hr ago", color: "bg-purple-500" },
  { type: "deal", text: "Northfield moved to Negotiation", time: "3 hrs ago", color: "bg-amber-500" },
  { type: "note", text: "Added note on Stratos Partners", time: "Yesterday", color: "bg-slate-500" },
  { type: "won", text: "Luminary Inc. marked Closed Won 🎉", time: "1 week ago", color: "bg-emerald-500" },
];

export default function ActivityFeed() {
  return (
    <div className="bg-[#111827] border border-slate-700/50 rounded-xl overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-slate-700/50">
        <h2 className="text-white font-semibold text-sm">Recent Activity</h2>
      </div>
      <ul className="divide-y divide-slate-800/50">
        {activities.map((a, i) => (
          <li key={i} className="px-5 py-4 flex gap-3 items-start">
            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${a.color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-slate-300 text-sm leading-snug">{a.text}</p>
              <p className="text-slate-600 text-xs mt-0.5">{a.time}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* AI nudge */}
      <div className="m-4 p-3.5 bg-indigo-900/30 border border-indigo-700/40 rounded-lg">
        <p className="text-indigo-300 text-xs font-semibold mb-1">✦ AI Insight</p>
        <p className="text-slate-300 text-xs leading-relaxed">
          Vantage Capital has been in Discovery for 18 days — consider scheduling a proposal call this week.
        </p>
      </div>
    </div>
  );
}
