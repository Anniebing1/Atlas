import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase-server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Atlas — the AI brain of Annie Bing's Business Development command center for Florida multifamily real estate.

Annie is a BD professional targeting:
- Operations titles (VP Operations, Director Operations, COO)
- Construction titles (VP Construction, Director Construction, Construction Manager)
- Facilities titles (Facilities Manager, VP Facilities, Director Facilities)
- C-Suite (CEO, CFO, President)

Her database contains 1,100+ Florida multifamily properties from CoStar with fields stored in the "notes" column like:
  Address | City | Market | Units | Class | Year Built | Owner | Manager | FOR SALE: $amount

You will be given database context including property records, contacts, and stats.
Use this data to answer questions accurately. For questions about year built, units, markets etc — parse the notes field.

You can help Annie:
- Answer data questions ("how many properties built before 2000" — count from the records provided)
- Search and filter her properties by market, class, units, for-sale status
- Draft cold outreach emails personalized to a specific contact and property
- Suggest who to reach out to next and why
- Give BD strategy and coaching

Be concise, direct, and actionable. When you don't have enough data to answer precisely, say so and suggest what to search for.
When drafting emails, make them sharp, short (under 150 words), and specific — never generic.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const supabase = createClient();
    const lastMessage = (messages[messages.length - 1]?.content ?? "").toLowerCase();

    // Smart data fetching based on what the user is asking
    const wantsProperties = lastMessage.match(/propert|built|year|class|unit|market|naples|miami|tampa|fort myers|orlando|sale|owner|manager/);
    const wantsContacts = lastMessage.match(/contact|email|reach|coo|cfo|ceo|director|vp |facilit|operat|construct/);
    const wantsDeals = lastMessage.match(/deal|pipeline|stage|value|proposal|negotiat/);

    // Always pull counts
    const [{ count: companyCount }, { count: contactCount }, { count: dealCount }] = await Promise.all([
      supabase.from("companies").select("*", { count: "exact", head: true }),
      supabase.from("contacts").select("*", { count: "exact", head: true }),
      supabase.from("deals").select("*", { count: "exact", head: true }),
    ]);

    // Pull up to 200 company records so Atlas can actually answer data questions
    const companiesRes = wantsProperties !== null
      ? (await supabase.from("companies").select("name, notes").limit(200)).data ?? []
      : (await supabase.from("companies").select("name, notes").limit(20)).data ?? [];

    const contactsRes = (await supabase.from("contacts")
      .select("first_name, last_name, title, email, notes, company:companies(name)")
      .limit(50)).data ?? [];

    const dealsRes = wantsDeals !== null
      ? (await supabase.from("deals").select("title, value, stage, notes, company:companies(name)").limit(20)).data ?? []
      : [];

    // Parse year built from notes for "built before X" questions
    let yearStats = "";
    if (lastMessage.includes("built") || lastMessage.includes("year")) {
      const yearCounts: Record<string, number> = { "before 1980": 0, "1980-1999": 0, "2000-2009": 0, "2010-2019": 0, "2020+": 0, "unknown": 0 };
      for (const c of companiesRes) {
        const match = (c.notes ?? "").match(/Year Built: (\d{4})/);
        if (!match) { yearCounts["unknown"]++; continue; }
        const y = parseInt(match[1]);
        if (y < 1980) yearCounts["before 1980"]++;
        else if (y < 2000) yearCounts["1980-1999"]++;
        else if (y < 2010) yearCounts["2000-2009"]++;
        else if (y < 2020) yearCounts["2010-2019"]++;
        else yearCounts["2020+"]++;
      }
      yearStats = `\nYEAR BUILT BREAKDOWN (from ${companiesRes.length} sampled properties):\n` +
        Object.entries(yearCounts).map(([k, v]) => `  ${k}: ${v}`).join("\n");
    }

    const dbContext = `
DATABASE SUMMARY:
- Total companies/properties: ${companyCount}
- Total contacts: ${contactCount}
- Total deals: ${dealCount}
${yearStats}

PROPERTY SAMPLE (${companiesRes.length} records):
${companiesRes.slice(0, 50).map((c: Record<string, unknown>) => `• ${c.name} — ${String(c.notes ?? "").substring(0, 180)}`).join("\n")}
${companiesRes.length > 50 ? `\n...and ${companiesRes.length - 50} more properties loaded for analysis.` : ""}

CONTACTS (${contactsRes.length}):
${contactsRes.map((c: Record<string, unknown>) => {
  const co = Array.isArray(c.company) ? c.company[0] : c.company;
  return `• ${c.first_name} ${c.last_name} | ${c.title} | ${(co as { name: string } | null)?.name ?? "—"} | ${c.email ?? "no email"}`;
}).join("\n")}

DEALS:
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
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
