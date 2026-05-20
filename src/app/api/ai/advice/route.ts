import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/utils/getUserFromToken";

interface CategoryEntry {
  category: string;
  amount: number;
}

interface WeeklyPayload {
  type: "weekly";
  weekExpenses: number;
  weekIncome: number;
  categories: CategoryEntry[];
  bestDay: { day: string; amount: number } | null;
  worstDay: { day: string; amount: number } | null;
}

interface MonthlyPayload {
  type: "monthly";
  monthName: string;
  totalExpenses: number;
  totalIncome: number;
  savings: number;
  savingsRate: number;
  expenseDelta: number;
  categories: CategoryEntry[];
}

type Payload = WeeklyPayload | MonthlyPayload;

function buildPrompt(data: Payload): string {
  if (data.type === "weekly") {
    const catLines = data.categories
      .slice(0, 5)
      .map((c) => `  - ${c.category}: ₹${c.amount.toLocaleString("en-IN")}`)
      .join("\n");

    return `You are a friendly, sharp personal finance advisor for an Indian user. Based on last week's spending, give honest, specific advice for the coming week.

Last week:
- Expenses: ₹${data.weekExpenses.toLocaleString("en-IN")}
- Income received: ₹${data.weekIncome.toLocaleString("en-IN")}
- Net: ₹${(data.weekIncome - data.weekExpenses).toLocaleString("en-IN")}
- Top spending categories:
${catLines}
${data.bestDay ? `- Best (lowest) spending day: ${data.bestDay.day} — ₹${data.bestDay.amount.toLocaleString("en-IN")}` : ""}
${data.worstDay ? `- Heaviest spending day: ${data.worstDay.day} — ₹${data.worstDay.amount.toLocaleString("en-IN")}` : ""}

Write 3–4 sentences. Be specific — reference actual rupee amounts and category names from the data. Give 2–3 concrete, actionable tips for the coming week. Use a warm but direct tone. Write in flowing paragraphs, no bullet points. Do not open with a greeting like "Hi" or "Hello".`;
  }

  // monthly
  const catLines = data.categories
    .slice(0, 5)
    .map((c) => `  - ${c.category}: ₹${c.amount.toLocaleString("en-IN")}`)
    .join("\n");

  const deltaText =
    data.expenseDelta === 0
      ? "same as the previous month"
      : data.expenseDelta > 0
      ? `${data.expenseDelta}% more than last month`
      : `${Math.abs(data.expenseDelta)}% less than last month`;

  return `You are a friendly, sharp personal finance advisor for an Indian user. Based on last month's data, give an honest review and clear goals for this new month.

${data.monthName} summary:
- Total expenses: ₹${data.totalExpenses.toLocaleString("en-IN")} (${deltaText})
- Total income: ₹${data.totalIncome.toLocaleString("en-IN")}
- Savings: ₹${data.savings.toLocaleString("en-IN")} (${data.savingsRate}% savings rate)
- Category breakdown:
${catLines}

Write 4–5 sentences. Acknowledge what went well and what needs attention. Give 2–3 specific, actionable goals for this month — use actual rupee amounts. Warm but direct tone. Flowing paragraphs, no bullet points. Do not open with a greeting.`;
}

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const prompt = buildPrompt(payload);

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 320,
        temperature: 0.72,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq API error:", errText);
      return NextResponse.json({ error: "Groq API error" }, { status: 502 });
    }

    const json = await groqRes.json();
    const advice: string = json.choices?.[0]?.message?.content?.trim() ?? "";

    if (!advice) {
      return NextResponse.json({ error: "Empty response from Groq" }, { status: 502 });
    }

    return NextResponse.json({ advice });
  } catch (err) {
    console.error("Groq fetch failed:", err);
    return NextResponse.json({ error: "Failed to reach Groq" }, { status: 500 });
  }
}
