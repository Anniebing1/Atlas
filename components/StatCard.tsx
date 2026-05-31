interface StatCardProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

export default function StatCard({ label, value, change, positive }: StatCardProps) {
  return (
    <div className="bg-[#111827] border border-slate-700/50 rounded-xl p-5">
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
      <p className="text-white text-3xl font-bold mb-2">{value}</p>
      <p className={`text-xs font-medium ${positive ? "text-emerald-400" : "text-rose-400"}`}>
        {change}
      </p>
    </div>
  );
}
