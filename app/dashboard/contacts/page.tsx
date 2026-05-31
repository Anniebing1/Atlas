import Sidebar from "@/components/Sidebar";
import { getContacts, getCompanies } from "@/lib/data";
import { createContact, deleteContact } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([getContacts(), getCompanies()]);

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Contacts</h1>
          <p className="text-slate-400 mt-1 text-sm">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Add contact form */}
        <div className="bg-[#111827] border border-slate-700/50 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold text-sm mb-4">Add a contact</h2>
          <form action={createContact} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input name="first_name" required placeholder="First name *" className="input-field" />
            <input name="last_name" required placeholder="Last name *" className="input-field" />
            <input name="email" type="email" placeholder="Email (optional)" className="input-field" />
            <input name="title" placeholder="Job title (optional)" className="input-field" />
            <select name="company_id" className="input-field">
              <option value="">No company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input name="notes" placeholder="Notes (optional)" className="input-field" />
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
              <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
                + Add Contact
              </button>
            </div>
          </form>
        </div>

        {/* Contacts list */}
        <div className="bg-[#111827] border border-slate-700/50 rounded-xl overflow-hidden">
          {contacts.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-500 text-sm">No contacts yet — add one above</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Company</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-white font-medium">{c.first_name} {c.last_name}</td>
                    <td className="px-4 py-3.5 text-slate-400">{c.title ?? "—"}</td>
                    <td className="px-4 py-3.5 text-slate-400">{c.company?.name ?? "—"}</td>
                    <td className="px-4 py-3.5 text-slate-400">{c.email ?? "—"}</td>
                    <td className="px-5 py-3.5 text-right">
                      <form action={deleteContact.bind(null, c.id)}>
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
