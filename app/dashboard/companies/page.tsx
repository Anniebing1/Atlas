import Sidebar from "@/components/Sidebar";
import CompaniesSearch from "@/components/CompaniesSearch";

export const dynamic = "force-dynamic";

export default function CompaniesPage() {
  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Properties</h1>
          <p className="text-slate-400 mt-1 text-sm">1,123 Florida multifamily properties from CoStar</p>
        </div>
        <CompaniesSearch />
      </main>
    </div>
  );
}
