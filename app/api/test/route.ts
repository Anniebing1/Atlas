import Anthropic from "@anthropic-ai/sdk";

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) {
    return Response.json({ error: "ANTHROPIC_API_KEY not set in Vercel env vars" });
  }

  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 20,
      messages: [{ role: "user", content: "Say hi" }],
    });
    return Response.json({ ok: true, response: msg.content[0] });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) });
  }
}
