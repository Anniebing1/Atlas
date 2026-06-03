"use client";

import { useState } from "react";
import { createDeal } from "@/lib/actions";

const STAGES = ["Qualified", "Discovery", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

export default function AddDealForm({
  companyId,
  companyName,
  contacts,
}: {
  companyId: string;
  companyName: string;
  contacts: Record<string, unknown>[];
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:text-indigo-400 hover:border-indigo-700 text-sm transition-colors"
      >
        + Add to pipeline
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        fd.append("company_id", companyId);
        await createDeal(fd);
        setOpen(false);
      }}
      className="space-y-3"
    >
      <input name="title" required placeholder={`Deal with ${companyName}`} className="input-field" />
      <div className="grid grid-cols-2 gap-3">
        <input name="value" placeholder="Value e.g. 50000" className="input-field" />
        <select name="stage" className="input-field">
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {contacts.length > 0 && (
        <select name="contact_id" className="input-field">
          <option value="">No contact</option>
          {contacts.map(c => (
            <option key={c.id as string} value={c.id as string}>
              {c.first_name as string} {c.last_name as string}
            </option>
          ))}
        </select>
      )}
      <div className="flex gap-2">
        <button type="submit" className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          Add Deal
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
