import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/utils/getUserFromToken";

interface MonthEntry {
  month: string;
  balance: number;
  delta: number | null;
}

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });

  let bankBalance: number;
  let monthlyData: MonthEntry[];
  try {
    ({ bankBalance, monthlyData } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const monthLines = monthlyData
    .map(m =>
      `  ${m.month}: ₹${m.balance.toLocaleString("en-IN")}` +
      (m.delta !== null ? ` (${m.delta >= 0 ? "+" : ""}₹${m.delta.toLocaleString("en-IN")})` : " — first entry")
    )
    .join("\n");

  const prompt = `You are a sharp personal finance advisor for an Indian user. Analyze their net worth data and respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{"advice":"3-4 sentence paragraph","healthScore":75,"healthReason":"short phrase"}

Rules:
- advice: reference actual rupee amounts, give 2 specific actionable tips, warm but direct tone, no greeting
- healthScore: integer 0-100. 80-100=strong consistent growth, 60-79=good with minor dips, 40-59=flat/irregular, 20-39=declining trend, 0-19=significant decline
- healthReason: one short phrase (5-7 words max) explaining the score

Current net worth: ₹${bankBalance.toLocaleString("en-IN")}
Monthly history (oldest first):
${monthLines}`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 420,
        temperature: 0.6,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq API error:", errText);
      return NextResponse.json({ error: "Groq API error" }, { status: 502 });
    }

    const json = await groqRes.json();
    const raw = json.choices?.[0]?.message?.content?.trim() ?? "";

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.advice || typeof parsed.healthScore !== "number") {
      return NextResponse.json({ error: "Unexpected response shape" }, { status: 502 });
    }

    return NextResponse.json({
      advice: parsed.advice,
      healthScore: Math.max(0, Math.min(100, Math.round(parsed.healthScore))),
      healthReason: parsed.healthReason ?? "",
    });
  } catch (err) {
    console.error("Groq networth advice failed:", err);
    return NextResponse.json({ error: "Failed to reach Groq" }, { status: 500 });
  }
}
