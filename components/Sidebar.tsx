import Link from "next/link";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: "⬡" },
  { label: "Pipeline", href: "/dashboard/deals", icon: "◈" },
  { label: "Contacts", href: "/dashboard/contacts", icon: "◎" },
  { label: "Companies", href: "/dashboard/companies", icon: "▦" },
  { label: "Tasks", href: "/dashboard/tasks", icon: "✓" },
  { label: "AI Insights", href: "/dashboard/insights", icon: "✦" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-[#0d1424] border-r border-slate-800 flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="2.5" />
            <circle cx="16" cy="16" r="4" fill="white" />
          </svg>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">Atlas</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors text-sm font-medium"
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-5 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">Annie Bing</p>
            <p className="text-slate-500 text-xs truncate">annie@fmmla.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
