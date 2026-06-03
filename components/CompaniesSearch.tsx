"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Company = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  market: string | null;
  units: number | null;
  building_class: string | null;
  year_built: number | null;
  owner_name: string | null;
  manager_name: string | null;
  for_sale: boolean;
  sale_price: number | null;
};

const MARKETS = ["Fort Myers, FL", "Naples, FL", "Punta Gorda, FL"];
const CLASSES = ["A", "B", "C"];

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

const classColors: Record<string, string> = {
  A: "bg-emerald-900/50 text-emerald-300",
  B: "bg-blue-900/50 text-blue-300",
  C: "bg-amber-900/50 text-amber-300",
};

export default function CompaniesSearch() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [market, setMarket] = useState("");
  const [bClass, setBClass] = useState("");
  const [forSale, setForSale] = useState(false);
  const [yearMax, setYearMax] = useState("");
  const [unitsMin, setUnitsMin] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (market) params.set("market", market);
    if (bClass) params.set("class", bClass);
    if (forSale) params.set("for_sale", "true");
    if (yearMax) params.set("year_max", yearMax);
    if (unitsMin) params.set("units_min", unitsMin);
    params.set("page", String(page));

    const res = await fetch(`/api/companies?${params}`);
    const json = await res.json();
    setResults(json.data ?? []);
    setTotal(json.count ?? 0);
    setLoading(false);
  }, [search, market, bClass, forSale, yearMax, unitsMin, page]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  function resetFilters() {
    setSearch(""); setMarket(""); setBClass(""); setForSale(false);
    setYearMax(""); setUnitsMin(""); setPage(1);
  }

  const totalPages = Math.ceil(total / 50);
  const hasFilters = search || market || bClass || forSale || yearMax || unitsMin;

  return (
    <div>
      {/* Filter bar */}
      <div className="bg-[#111827] border border-slate-700/50 rounded-xl p-4 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, city, owner..."
            className="input-field col-span-2 sm:col-span-3 lg:col-span-2"
          />
          <select value={market} onChange={e => { setMarket(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Markets</option>
            {MARKETS.map(m => <option key={m} value={m}>{m.replace(", FL", "")}</option>)}
          </select>
          <select value={bClass} onChange={e => { setBClass(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Classes</option>
            {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
          <input
            value={yearMax}
            onChange={e => { setYearMax(e.target.value); setPage(1); }}
            placeholder="Built before (year)"
            className="input-field"
            type="number"
          />
          <input
            value={unitsMin}
            onChange={e => { setUnitsMin(e.target.value); setPage(1); }}
            placeholder="Min units"
            className="input-field"
            type="number"
          />
        </div>
        <div className="flex items-center gap-4 mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={forSale}
              onChange={e => { setForSale(e.target.checked); setPage(1); }}
              className="w-4 h-4 rounded accent-indigo-500"
            />
            <span className="text-slate-300 text-sm">For sale only</span>
          </label>
          {hasFilters && (
            <button onClick={resetFilters} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Clear filters ×
            </button>
          )}
          <span className="ml-auto text-slate-500 text-sm">
            {loading ? "Searching..." : `${total.toLocaleString()} properties`}
          </span>
        </div>
      </div>

      {/* Results table */}
      <div className="bg-[#111827] border border-slate-700/50 rounded-xl overflow-hidden">
        {results.length === 0 && !loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">No properties match your filters</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Property</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Class</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Units</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Built</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Owner</th>
                <th className="text-right px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">For Sale</th>
              </tr>
            </thead>
            <tbody>
              {results.map((c) => (
                <tr key={c.id} onClick={() => router.push(`/dashboard/companies/${c.id}`)} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer">
                  <td className="px-5 py-3 text-white font-medium max-w-[200px] truncate">{c.name}</td>
                  <td className="px-4 py-3 text-slate-400">{c.city ?? "—"}</td>
                  <td className="px-4 py-3">
                    {c.building_class ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${classColors[c.building_class] ?? "bg-slate-800 text-slate-300"}`}>
                        Class {c.building_class}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{c.units ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{c.year_built ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-[150px] truncate">{c.owner_name ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    {c.for_sale ? (
                      <span className="text-emerald-400 font-medium text-xs">
                        {c.sale_price ? formatPrice(c.sale_price) : "Yes"}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-slate-400 hover:text-white disabled:opacity-30 text-sm transition-colors"
            >
              ← Previous
            </button>
            <span className="text-slate-500 text-sm">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-slate-400 hover:text-white disabled:opacity-30 text-sm transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
