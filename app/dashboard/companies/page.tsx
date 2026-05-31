import Sidebar from "@/components/Sidebar";
import { getCompanies } from "@/lib/data";
import { createCompany, deleteCompany } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Companies</h1>
            <p className="text-slate-400 mt-1 text-sm">{companies.length} company{companies.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Add company form */}
        <div className="bg-[#111827] border border-slate-700/50 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold text-sm mb-4">Add a company</h2>
          <form action={createCompany} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input name="name" required placeholder="Company name *" className="input-field" />
            <input name="website" placeholder="Website (optional)" className="input-field" />
            <input name="industry" placeholder="Industry (optional)" className="input-field" />
            <input name="notes" placeholder="Notes (optional)" className="input-field" />
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
                + Add Company
              </button>
            </div>
          </form>
        </div>

        {/* Companies list */}
        <div className="bg-[#111827] border border-slate-700/50 rounded-xl overflow-hidden">
          {companies.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-500 text-sm">No companies yet — add one above</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Industry</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Website</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-white font-medium">{c.name}</td>
                    <td className="px-4 py-3.5 text-slate-400">{c.industry ?? "—"}</td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {c.website ? <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{c.website}</a> : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <form action={deleteCompany.bind(null, c.id)}>
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
