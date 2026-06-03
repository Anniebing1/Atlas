import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddDealForm from "@/components/AddDealForm";
import DraftEmailButton from "@/components/DraftEmailButton";

export const dynamic = "force-dynamic";

function Detail({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-slate-500 text-xs uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-white text-sm">{value}</p>
    </div>
  );
}

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

const classColors: Record<string, string> = {
  A: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
  B: "bg-blue-900/50 text-blue-300 border-blue-700/50",
  C: "bg-amber-900/50 text-amber-300 border-amber-700/50",
};

export default async function CompanyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();

  const [{ data: company }, { data: contacts }, { data: deals }] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).single(),
    supabase.from("contacts").select("*").eq("company_id", id),
    supabase.from("deals").select("*").eq("company_id", id).order("updated_at", { ascending: false }),
  ]);

  if (!company) notFound();

  const c = company as Record<string, unknown>;

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 max-w-5xl">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard/companies" className="hover:text-slate-300 transition-colors">Properties</Link>
          <span>/</span>
          <span className="text-slate-300">{c.name as string}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{c.name as string}</h1>
              {c.building_class && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${classColors[c.building_class as string] ?? "bg-slate-800 text-slate-300 border-slate-700"}`}>
                  Class {c.building_class as string}
                </span>
              )}
              {c.for_sale && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-900/50 text-rose-300 border border-rose-700/50">
                  FOR SALE {c.sale_price ? `• ${formatPrice(c.sale_price as number)}` : ""}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm">
              {[c.city, c.state].filter(Boolean).join(", ")}
              {c.market ? ` · ${c.market}` : ""}
            </p>
          </div>
          <DraftEmailButton company={c} contacts={contacts ?? []} />
        </div>

        {/* Property details grid */}
        <div className="bg-[#111827] border border-slate-700/50 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold text-sm mb-4">Property Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            <Detail label="Address" value={c.address as string} />
            <Detail label="City" value={c.city as string} />
            <Detail label="Market" value={c.market as string} />
            <Detail label="Units" value={c.units as number} />
            <Detail label="Building Class" value={c.building_class ? `Class ${c.building_class}` : null} />
            <Detail label="Year Built" value={c.year_built as number} />
            <Detail label="Owner" value={c.owner_name as string} />
            <Detail label="Property Manager" value={c.manager_name as string} />
            {(c.for_sale as boolean) && <Detail label="For Sale Price" value={c.sale_price ? formatPrice(c.sale_price as number) : "Listed"} />}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Contacts */}
          <div className="bg-[#111827] border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="text-white font-semibold text-sm">Contacts</h2>
              <Link href="/dashboard/contacts" className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors">+ Add</Link>
            </div>
            {!contacts || contacts.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-slate-500 text-sm mb-3">No contacts linked yet</p>
                <Link href="/dashboard/contacts" className="text-indigo-400 hover:text-indigo-300 text-xs underline">
                  Add a contact →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-800/50">
                {contacts.map((contact) => {
                  const ct = contact as Record<string, unknown>;
                  return (
                    <li key={ct.id as string} className="px-5 py-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{ct.first_name as string} {ct.last_name as string}</p>
                        <p className="text-slate-500 text-xs">{ct.title as string}</p>
                      </div>
                      <div className="text-right">
                        {ct.email && (
                          <a href={`mailto:${ct.email}`} className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors">
                            {ct.email as string}
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Deals */}
          <div className="bg-[#111827] border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/50">
              <h2 className="text-white font-semibold text-sm">Pipeline Deals</h2>
            </div>
            {!deals || deals.length === 0 ? (
              <div className="px-5 py-6">
                <p className="text-slate-500 text-sm mb-4">No deals yet for this property</p>
                <AddDealForm companyId={id} companyName={c.name as string} contacts={contacts ?? []} />
              </div>
            ) : (
              <div>
                <ul className="divide-y divide-slate-800/50">
                  {deals.map((deal) => {
                    const d = deal as Record<string, unknown>;
                    return (
                      <li key={d.id as string} className="px-5 py-3.5 flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">{d.title as string}</p>
                          <p className="text-slate-500 text-xs">{d.stage as string}</p>
                        </div>
                        <p className="text-white text-sm font-medium">
                          {d.value ? formatPrice(d.value as number) : "—"}
                        </p>
                      </li>
                    );
                  })}
                </ul>
                <div className="px-5 py-4 border-t border-slate-800">
                  <AddDealForm companyId={id} companyName={c.name as string} contacts={contacts ?? []} />
                </div>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
