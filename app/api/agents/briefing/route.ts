import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase-server";
import { getMultifamilyNews } from "@/lib/news";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// GET = triggered by Vercel cron or manual visit
export async function GET(req: Request) {
  // Allow manual trigger with ?preview=true to see the email in browser
  const preview = new URL(req.url).searchParams.get("preview") === "true";

  const supabase = createClient();

  // ── Pull pipeline data ─────────────────────────────────────────────────────
  const [dealsRes, contactsRes, companiesRes, newsItems] = await Promise.all([
    supabase.from("deals").select("title, stage, value, updated_at, company:companies(name)").neq("stage", "Closed Won").neq("stage", "Closed Lost").order("updated_at"),
    supabase.from("contacts").select("first_name, last_name, title, email, company:companies(name)").limit(30),
    supabase.from("companies").select("name, city, market, for_sale, sale_price").eq("for_sale", true).limit(10),
    getMultifamilyNews(),
  ]);

  const deals = dealsRes.data ?? [];
  const contacts = contactsRes.data ?? [];
  const forSaleProps = companiesRes.data ?? [];

  // Flag deals not touched in 7+ days
  const now = Date.now();
  const staleDeals = deals.filter(d => {
    const updated = new Date(d.updated_at).getTime();
    return (now - updated) > 7 * 24 * 60 * 60 * 1000;
  });

  // ── Ask Claude for today's recommendation ──────────────────────────────────
  const aiPrompt = `You are Atlas, Annie Bing's BD assistant for Florida multifamily real estate.

Today's date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

OPEN DEALS (${deals.length}):
${deals.map(d => {
  const co = Array.isArray(d.company) ? d.company[0] : d.company;
  return `• ${d.title} — ${d.stage} — $${d.value?.toLocaleString() ?? "?"} — ${(co as { name: string } | null)?.name ?? "?"} — last updated ${new Date(d.updated_at).toLocaleDateString()}`;
}).join("\n") || "No open deals"}

STALE DEALS (not touched in 7+ days): ${staleDeals.length}
${staleDeals.map(d => {
  const co = Array.isArray(d.company) ? d.company[0] : d.company;
  return `• ${d.title} at ${(co as { name: string } | null)?.name ?? "?"}`;
}).join("\n")}

CONTACTS (${contacts.length} total)

FOR SALE PROPERTIES (${forSaleProps.length}):
${forSaleProps.map(p => `• ${p.name} — ${p.city} — ${p.sale_price ? `$${Number(p.sale_price).toLocaleString()}` : "price TBD"}`).join("\n") || "None"}

Write a crisp morning briefing in 3 parts:
1. TOP PRIORITY TODAY (1 sentence — the single most important action Annie should take)
2. PIPELINE WATCH (2-3 bullet points on deals that need attention)
3. OPPORTUNITY (one specific property or contact worth pursuing today and why)

Be direct, specific, and actionable. No fluff.`;

  const aiRes = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 400,
    messages: [{ role: "user", content: aiPrompt }],
  });

  const aiInsight = aiRes.content[0].type === "text" ? aiRes.content[0].text : "";

  // ── Build email HTML ───────────────────────────────────────────────────────
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const newsHtml = newsItems.length > 0 ? `
    <div style="margin-top:32px">
      <h2 style="font-size:14px;font-weight:600;color:#94a3b8;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 16px">
        📰 Multifamily News
      </h2>
      ${newsItems.map(item => `
        <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #1e293b">
          <a href="${item.link}" style="color:#818cf8;font-size:14px;font-weight:500;text-decoration:none;line-height:1.4">${item.title}</a>
          <p style="color:#64748b;font-size:12px;margin:4px 0 0">${item.source} · ${item.date}</p>
          ${item.summary ? `<p style="color:#94a3b8;font-size:13px;margin:6px 0 0;line-height:1.5">${item.summary}</p>` : ""}
        </div>
      `).join("")}
    </div>
  ` : "";

  const forSaleHtml = forSaleProps.length > 0 ? `
    <div style="margin-top:32px">
      <h2 style="font-size:14px;font-weight:600;color:#94a3b8;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 16px">
        🏢 Properties For Sale in Your Database
      </h2>
      ${forSaleProps.map(p => `
        <div style="margin-bottom:8px">
          <span style="color:#e2e8f0;font-size:13px;font-weight:500">${p.name}</span>
          <span style="color:#64748b;font-size:13px"> · ${p.city ?? "FL"}</span>
          ${p.sale_price ? `<span style="color:#34d399;font-size:13px"> · $${Number(p.sale_price).toLocaleString()}</span>` : ""}
        </div>
      `).join("")}
    </div>
  ` : "";

  const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px">

    <!-- Header -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px">
      <div style="width:40px;height:40px;background:#4f46e5;border-radius:10px;display:flex;align-items:center;justify-content:center">
        <span style="color:white;font-weight:700;font-size:16px">A</span>
      </div>
      <div>
        <div style="color:white;font-weight:700;font-size:18px">Atlas</div>
        <div style="color:#64748b;font-size:12px">Morning Briefing · ${today}</div>
      </div>
    </div>

    <!-- AI Insight -->
    <div style="background:#1e1b4b;border:1px solid #3730a3;border-radius:12px;padding:20px;margin-bottom:32px">
      <div style="color:#a5b4fc;font-size:12px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:12px">✦ Atlas Insight</div>
      <div style="color:#e2e8f0;font-size:14px;line-height:1.7;white-space:pre-wrap">${aiInsight}</div>
    </div>

    <!-- Pipeline stats -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:32px">
      <div style="background:#111827;border:1px solid #1e293b;border-radius:10px;padding:16px;text-align:center">
        <div style="color:white;font-size:24px;font-weight:700">${deals.length}</div>
        <div style="color:#64748b;font-size:12px;margin-top:4px">Open Deals</div>
      </div>
      <div style="background:#111827;border:1px solid #1e293b;border-radius:10px;padding:16px;text-align:center">
        <div style="color:${staleDeals.length > 0 ? "#f87171" : "#34d399"};font-size:24px;font-weight:700">${staleDeals.length}</div>
        <div style="color:#64748b;font-size:12px;margin-top:4px">Need Follow-up</div>
      </div>
      <div style="background:#111827;border:1px solid #1e293b;border-radius:10px;padding:16px;text-align:center">
        <div style="color:#34d399;font-size:24px;font-weight:700">${forSaleProps.length}</div>
        <div style="color:#64748b;font-size:12px;margin-top:4px">For Sale</div>
      </div>
    </div>

    ${forSaleHtml}
    ${newsHtml}

    <!-- Footer -->
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #1e293b;text-align:center">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://atlas-one-omega.vercel.app"}/dashboard"
         style="display:inline-block;padding:12px 24px;background:#4f46e5;color:white;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">
        Open Atlas →
      </a>
      <p style="color:#334155;font-size:12px;margin-top:16px">Atlas BD Command Center · annie.bing@fmmla.com</p>
    </div>

  </div>
</body>
</html>`;

  // ── Send or preview ────────────────────────────────────────────────────────
  if (preview) {
    return new Response(emailHtml, { headers: { "Content-Type": "text/html" } });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Atlas <onboarding@resend.dev>",
    to: "annie.bing@fmmla.com",
    subject: `☀️ Atlas Morning Briefing — ${today}`,
    html: emailHtml,
  });

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({ ok: true, message: `Briefing sent to annie.bing@fmmla.com`, news: newsItems.length, deals: deals.length });
}
