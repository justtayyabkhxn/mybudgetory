import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/utils/getUserFromToken";
import { CATEGORIES } from "@/lib/categoryConfig";
import { isValidDate, sanitizeQuery } from "@/lib/askQuery";

const MAX_QUESTION = 300;

// Only the question and today's date go to the model — never the user's
// transactions. The client runs the returned query over its own data.
function buildPrompt(question: string, today: string): string {
  const weekday = new Date(`${today}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  return `You turn a question about a user's own money into a JSON query for their budgeting app. You never see their data and never calculate totals.
Today is ${today} (${weekday}). Weeks start on Monday. Currency is ₹.

Return ONLY a JSON object:
{"answerable", "reason", "metric", "type", "categories", "search", "paymentMode", "from", "to", "compareFrom", "compareTo", "groupBy", "limit", "label", "compareLabel"}

metric — pick one:
- "total": how much was spent or earned ("how much did I spend on food last month")
- "count": how many transactions / how often
- "average": average per transaction
- "daily_average": average per day ("my daily spend this month")
- "largest" / "smallest": biggest or smallest transaction(s); limit = how many (default 1)
- "list": show recent transactions; limit default 10
- "breakdown": split by groupBy — "category" (where my money goes), "month", "weekday" (which day I spend most), "day", "paymentMode" (UPI vs cash)
- "net": income minus expenses, savings ("how much did I save this month")
- "compare": this period vs another ("food this month vs last month", "did I spend more than last week"); from/to = the main period, compareFrom/compareTo = the other one
- "net_worth": net worth, bank balance, how much money they have ("what's my net worth", "net worth vs the same day last month"). Uses single days, not ranges: "to" = the day to measure ("" = now), "compareTo" = another day to compare with ("" = none), "from" and "compareFrom" = "". "Same day last month" = today's date one month earlier; "at the start of the month" = the 1st.

type: "expense" for spend/cost/paid/bought, "income" for earned/received/salary, "all" for net, when both are asked, or when the question is neutral ("show my last 5 transactions", "how many transactions this week").
categories: those named, from ${CATEGORIES.map((c) => c.name).join(", ")}; [] means all. Food/eating out/groceries/restaurants → Food, cabs/Uber/fuel/trains/flights → Travel, movies/Netflix/subscriptions → Entertainment, rent/electricity/recharge → Bills.
search: a merchant or item to match in titles and notes when it is not a category ("Swiggy", "coffee", "Zomato"), else "".
paymentMode: "UPI" or "Cash" only if asked, else "".
from/to: inclusive YYYY-MM-DD.
- today = ${today}; yesterday = the day before.
- this week = this week's Monday to today; last week = the previous Monday to Sunday.
- this month = the 1st of this month to today; last month = the whole previous month.
- this year = 1 January to today; last N days = the N days ending today.
- a named month ("in August") = that month in the most recent year that is not in the future.
- no time mentioned = "" and "" (all time).
label: a short title for the answer, no numbers — e.g. "Food spending · last month", "Biggest expense · this week".
compareLabel: a short name for the comparison period, e.g. "last month".
Set "answerable": false with a short "reason" when none of the metrics can answer it: advice, predictions, budgets or goals, loans, or anything not about their own money.

Question: ${JSON.stringify(question)}`;
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

  let question: string;
  let today: string;
  try {
    const body = await req.json();
    question = String(body.question ?? "").trim();
    today = String(body.today ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!question) {
    return NextResponse.json({ error: "Ask a question first" }, { status: 400 });
  }
  if (question.length > MAX_QUESTION) {
    return NextResponse.json({ error: "That question is too long" }, { status: 400 });
  }
  // The client sends its local date so "this week" matches the user's timezone.
  if (!isValidDate(today)) today = new Date().toISOString().slice(0, 10);

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: buildPrompt(question, today) }],
        response_format: { type: "json_object" },
        max_tokens: 1500,
        temperature: 0,
        // Mapping a question to a filter needs little thinking; this keeps each
        // question well inside the account-wide tokens-per-minute limit.
        reasoning_effort: "low",
      }),
    });

    if (groqRes.status === 429) {
      return NextResponse.json({ error: "Lots of questions right now — try again in a few seconds" }, { status: 429 });
    }
    if (!groqRes.ok) {
      console.error("Groq API error:", await groqRes.text());
      return NextResponse.json({ error: "Couldn't answer right now, try again" }, { status: 502 });
    }

    const json = await groqRes.json();
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "");
    } catch {
      return NextResponse.json({ error: "Couldn't understand that, try rephrasing" }, { status: 502 });
    }

    if (parsed.answerable === false) {
      const reason = typeof parsed.reason === "string" && parsed.reason.trim()
        ? parsed.reason.trim().slice(0, 160)
        : "That isn't something I can work out from your transactions";
      return NextResponse.json({ answerable: false, reason });
    }

    return NextResponse.json({ answerable: true, query: sanitizeQuery(parsed) });
  } catch (err) {
    console.error("Groq fetch failed:", err);
    return NextResponse.json({ error: "Failed to reach Groq" }, { status: 500 });
  }
}
