import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import LivePipelineTable from "@/components/LivePipelineTable";
import ActivityFeed from "@/components/ActivityFeed";
import { getDashboardStats, getDeals } from "@/lib/data";

export const dynamic = "force-dynamic";

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

export default async function Dashboard() {
  const [stats, deals] = await Promise.all([getDashboardStats(), getDeals()]);

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Good morning, Annie 👋</h1>
          <p className="text-slate-400 mt-1 text-sm">Here&apos;s what&apos;s happening in your pipeline today.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Open Deals" value={String(stats.openDeals)} change={stats.openDeals === 0 ? "Add your first deal →" : `${stats.totalDeals} total deals`} positive />
          <StatCard label="Pipeline Value" value={formatCurrency(stats.pipelineValue)} change={stats.pipelineValue === 0 ? "No open deals yet" : "Open pipeline"} positive />
          <StatCard label="Win Rate" value={`${stats.winRate}%`} change={stats.totalDeals === 0 ? "No deals yet" : `${stats.totalDeals} deals tracked`} positive />
          <StatCard label="Companies" value="—" change="Add via Companies page" positive />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LivePipelineTable deals={deals} />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>
      </main>
    </div>
  );
}
