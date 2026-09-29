import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/utils/getUserFromToken";
import { CATEGORIES } from "@/lib/categoryConfig";

const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);
const MAX_AMOUNT = 10_000_000;
const MAX_TEXT = 1000;

export interface QuickLogTransaction {
  title: string;
  amount: string;
  category: string;
  type: "income" | "expense";
  date: string; // YYYY-MM-DD
  comment: string;
  paymentMode: "Cash" | "UPI";
}

export interface QuickLogDebt {
  type: "lent" | "debt"; // lent = they owe me, debt = I owe them
  person: string;
  amount: string;
  reason: string;
  date: string; // YYYY-MM-DD, when it happened
  dueDate: string; // YYYY-MM-DD or ""
}

function buildPrompt(text: string, today: string): string {
  return `You turn a short note from an Indian user into budget transactions and loans. Today is ${today}.

Return ONLY a JSON object:
{"transactions": [{"title", "amount", "category", "type", "date", "paymentMode", "comment"}],
 "debts": [{"type", "person", "amount", "reason", "date", "dueDate"}],
 "skipped": ["original phrase", ...]}

Rules:
- One entry per distinct spend, income or loan. Commas and "and" usually separate entries, but "burger and fries for 200" is ONE entry.
- Loans go in debts, never in transactions:
  - type "lent" when the user lent money: "lent 500 to Rahul", "gave Amit 2k as a loan", "Rahul borrowed 300 from me", "Priya owes me 400".
  - type "debt" when the user borrowed: "borrowed 1k from Amit", "took 2000 from dad", "I owe Riya 250", "Amit lent me 500".
  - person: the name, capitalised. reason: what it was for (e.g. "Movie tickets"), else "".
  - date: when it happened, same date rules as below. dueDate: YYYY-MM-DD if a return or due date is mentioned ("return by 5 Oct", "due next week"), else "".
- Paying someone for something or giving a gift is a normal expense, not a loan.
- A repayment of an existing loan ("Rahul paid me back 500", "returned 1k to Amit") is not a new loan: put the phrase in skipped. Also put anything else you can't log in skipped.
Transaction fields:
- title: short item name, capitalised (e.g. "Burger"). Put the place, if any, in comment (e.g. "at Burger King"), else "".
- amount: a positive number, no currency symbol. "1.5k" = 1500, "2 lakh" = 200000.
- category: exactly one of ${CATEGORY_NAMES.join(", ")}. Food and drinks = Food, cabs/fuel/trains/flights = Travel, movies/subscriptions = Entertainment, rent/electricity/recharge = Bills. Use Others when unsure and for income.
- type: "expense" for spent/paid/bought, "income" for got/received/earned/salary.
- date: YYYY-MM-DD. "today" = ${today}, "yesterday" = the day before. A date without a year is in the year of today's date. "same day" or no date = the date of the previous entry, or today for the first entry.
- paymentMode: "Cash" only if cash is mentioned, otherwise "UPI".
- Use empty arrays for anything the note doesn't contain.

Note: ${JSON.stringify(text)}`;
}

function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

// A yearless date like "26 Dec" typed in January means last December.
function pullOutOfFuture(date: string, today: string): string {
  if (date <= today) return date;
  const lastYear = `${Number(date.slice(0, 4)) - 1}${date.slice(4)}`;
  return isValidDate(lastYear) && lastYear <= today ? lastYear : today;
}

function sanitize(raw: unknown, today: string): QuickLogTransaction | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const amount = typeof r.amount === "number" ? r.amount : parseFloat(String(r.amount ?? ""));
  if (!isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) return null;

  const title = String(r.title ?? "").trim().slice(0, 80);
  if (!title) return null;

  const type = r.type === "income" ? "income" : "expense";
  const category = CATEGORY_NAMES.includes(String(r.category)) ? String(r.category) : "Others";
  const rawDate = String(r.date ?? "");
  const date = isValidDate(rawDate) ? pullOutOfFuture(rawDate, today) : today;

  return {
    title,
    amount: String(Math.round(amount * 100) / 100),
    category,
    type,
    date,
    comment: String(r.comment ?? "").trim().slice(0, 200),
    paymentMode: r.paymentMode === "Cash" ? "Cash" : "UPI",
  };
}

function sanitizeDebt(raw: unknown, today: string): QuickLogDebt | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const amount = typeof r.amount === "number" ? r.amount : parseFloat(String(r.amount ?? ""));
  if (!isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) return null;

  const person = String(r.person ?? "").trim().slice(0, 60);
  if (!person) return null;

  const rawDate = String(r.date ?? "");
  const date = isValidDate(rawDate) ? pullOutOfFuture(rawDate, today) : today;
  // A due date is naturally in the future; just make sure it's real and not before the loan.
  const rawDue = String(r.dueDate ?? "");
  const dueDate = isValidDate(rawDue) && rawDue >= date ? rawDue : "";

  return {
    type: r.type === "debt" ? "debt" : "lent",
    person,
    amount: String(Math.round(amount * 100) / 100),
    reason: String(r.reason ?? "").trim().slice(0, 200),
    date,
    dueDate,
  };
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

  let text: string;
  let today: string;
  try {
    const body = await req.json();
    text = String(body.text ?? "").trim();
    today = String(body.today ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json({ error: "Type what you spent first" }, { status: 400 });
  }
  if (text.length > MAX_TEXT) {
    return NextResponse.json({ error: "That note is too long" }, { status: 400 });
  }
  // The client sends its local date so "today" matches the user's timezone.
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
        messages: [{ role: "user", content: buildPrompt(text, today) }],
        response_format: { type: "json_object" },
        // Reasoning tokens count against this; a 6-item note already used ~1k.
        max_tokens: 2400,
        temperature: 0,
      }),
    });

    if (!groqRes.ok) {
      console.error("Groq API error:", await groqRes.text());
      return NextResponse.json({ error: "Couldn't read that right now, try again" }, { status: 502 });
    }

    const json = await groqRes.json();
    const content: string = json.choices?.[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "Couldn't read that, try rephrasing" }, { status: 502 });
    }

    const out = (parsed ?? {}) as { transactions?: unknown; debts?: unknown; skipped?: unknown };
    const transactions = Array.isArray(out.transactions)
      ? out.transactions.slice(0, 20).map((t) => sanitize(t, today)).filter((t): t is QuickLogTransaction => t !== null)
      : [];
    const debts = Array.isArray(out.debts)
      ? out.debts.slice(0, 20).map((d) => sanitizeDebt(d, today)).filter((d): d is QuickLogDebt => d !== null)
      : [];
    const skipped = Array.isArray(out.skipped)
      ? out.skipped.map((s) => String(s).trim().slice(0, 120)).filter(Boolean).slice(0, 10)
      : [];

    return NextResponse.json({ transactions, debts, skipped });
  } catch (err) {
    console.error("Groq fetch failed:", err);
    return NextResponse.json({ error: "Failed to reach Groq" }, { status: 500 });
  }
}
