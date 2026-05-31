import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import PipelineTable from "@/components/PipelineTable";
import ActivityFeed from "@/components/ActivityFeed";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Good morning, Annie 👋</h1>
          <p className="text-slate-400 mt-1 text-sm">Here&apos;s what&apos;s happening in your pipeline today.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Open Deals" value="24" change="+3 this week" positive />
          <StatCard label="Pipeline Value" value="$1.2M" change="+$140k this week" positive />
          <StatCard label="Meetings Booked" value="8" change="-2 vs last week" positive={false} />
          <StatCard label="Win Rate" value="34%" change="+4% this quarter" positive />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PipelineTable />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>
      </main>
    </div>
  );
}
