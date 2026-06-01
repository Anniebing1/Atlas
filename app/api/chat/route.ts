import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase-server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Jarvis — the AI brain inside Atlas, Annie Bing's Business Development command center for Florida multifamily real estate.

Annie is a BD professional targeting:
- Operations titles (VP Operations, Director Operations, COO)
- Construction titles (VP Construction, Director Construction, Construction Manager)
- Facilities titles (Facilities Manager, VP Facilities, Director Facilities)
- C-Suite (CEO, CFO, President)

Her database contains:
- 1,100+ Florida multifamily properties from CoStar (stored as "companies") with address, market, units, building class, year built, owner, manager, for-sale status
- 30+ ZoomInfo-enriched contacts at real estate companies with verified titles
- Deals pipeline she is building

When answering questions about her data, you will be given relevant records to work with.

You can help Annie:
- Search and filter her properties (e.g. "show me Class A properties in Naples for sale")
- Draft cold outreach emails personalized to a specific contact and property
- Summarize what she knows about a company or contact
- Suggest who to reach out to next
- Identify the best opportunities in her pipeline
- Give BD coaching and strategy advice

Be concise, direct, and actionable. You are her Jarvis — anticipate what she needs.
When drafting emails, make them sharp, short, and specific — not generic.`;

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  // Fetch relevant data from Supabase based on the latest message
  const supabase = createClient();
  const lastMessage = messages[messages.length - 1]?.content ?? "";

  // Pull a sample of companies and contacts as context
  const [companiesRes, contactsRes, dealsRes] = await Promise.all([
    supabase
      .from("companies")
      .select("id, name, industry, notes")
      .limit(10)
      .then((r) => r.data ?? []),
    supabase.from("contacts").select("id, first_name, last_name, title, email, notes, company:companies(name)").limit(20).then((r) => r.data ?? []),
    supabase.from("deals").select("id, title, value, stage, company:companies(name)").limit(10).then((r) => r.data ?? []),
  ]);

  // Also get total counts
  const [{ count: companyCount }, { count: contactCount }, { count: dealCount }] = await Promise.all([
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("deals").select("*", { count: "exact", head: true }),
  ]);

  const dbContext = `
DATABASE SUMMARY:
- ${companyCount} companies (FL multifamily properties)
- ${contactCount} contacts
- ${dealCount} deals in pipeline

RELEVANT COMPANIES (matching query):
${companiesRes.length > 0 ? companiesRes.map((c: { name: string; industry: string; notes: string }) => `• ${c.name} — ${c.notes?.substring(0, 150)}`).join("\n") : "No specific matches — answer from general knowledge of her database."}

ALL CONTACTS:
${contactsRes.map((c: Record<string, unknown>) => {
  const co = Array.isArray(c.company) ? c.company[0] : c.company;
  return `• ${c.first_name} ${c.last_name} | ${c.title} | ${(co as { name: string } | null)?.name ?? "—"} | ${c.email ?? "no email"}`;
}).join("\n")}

OPEN DEALS:
${dealsRes.length > 0 ? dealsRes.map((d: Record<string, unknown>) => {
  const co = Array.isArray(d.company) ? d.company[0] : d.company;
  return `• ${d.title} — ${d.stage} — $${typeof d.value === "number" ? d.value.toLocaleString() : "?"} — ${(co as { name: string } | null)?.name ?? "—"}`;
}).join("\n") : "No deals yet."}
`;

  const stream = await anthropic.messages.stream({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT + "\n\n" + dbContext,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
