"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircleQuestion, Loader2, Mic, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Sheet from "@/components/Sheet";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { CATEGORY_COLORS, CATEGORIES } from "@/lib/categoryConfig";
import {
  runQuery,
  runNetWorth,
  type AskQuery,
  type AskResult,
  type AskTxn,
  type NetWorthData,
} from "@/lib/askQuery";

const SUGGESTIONS = [
  "How much did I spend on food last month?",
  "Biggest expense this week?",
  "Where does my money go this month?",
  "How much did I save this month?",
  "Food this month vs last month",
  "Which day do I spend the most?",
  "Net worth vs the same day last month",
];

interface Answer {
  query: AskQuery;
  result: AskResult;
}

function localDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function loadTransactions(token: string): Promise<AskTxn[]> {
  const res = await fetch("/api/transactions", { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Couldn't load your transactions");
  const data = await res.json();
  return (data.transactions ?? []).map((t: Record<string, unknown>) => ({
    id: String(t._id),
    title: String(t.title ?? ""),
    amount: Number(t.amount) || 0,
    category: String(t.category ?? "Others"),
    type: t.type === "income" ? "income" : "expense",
    date: localDate(new Date(String(t.date))),
    comment: String(t.comment ?? ""),
    paymentMode: String(t.paymentMode ?? "UPI"),
  }));
}

async function loadNetWorth(token: string): Promise<NetWorthData> {
  const res = await fetch("/api/networth", { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Couldn't load your net worth");
  const data = await res.json();
  return {
    bankBalance: Number(data.bankBalance) || 0,
    assetsTotal: Number(data.assetsTotal) || 0,
    history: (data.history ?? []).map((h: Record<string, unknown>) => ({
      date: localDate(new Date(String(h.date))),
      balance: Number(h.balance) || 0,
      assets: Number(h.assets) || 0,
      estimated: Boolean(h.estimated),
    })),
  };
}

const shortDate = (s: string, withYear = false) =>
  new Date(`${s}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    ...(withYear && { year: "numeric" }),
    timeZone: "UTC",
  });

function periodText(from: string, to: string): string {
  if (!from && !to) return "All time";
  if (from && !to) return `Since ${shortDate(from, true)}`;
  if (!from && to) return `Until ${shortDate(to, true)}`;
  if (from === to) return shortDate(from, true);
  return `${shortDate(from, from.slice(0, 4) !== to.slice(0, 4))} – ${shortDate(to, true)}`;
}

/** How the question was understood, so a misread is easy to spot. */
function queryChips(q: AskQuery): string[] {
  if (q.metric === "net_worth") {
    const chips = [q.to ? `As of ${shortDate(q.to, true)}` : "Now"];
    if (q.compareTo) chips.push(`vs ${shortDate(q.compareTo, true)}`);
    return [...chips, "Bank + assets"];
  }
  const chips = [periodText(q.from, q.to)];
  if (q.metric === "compare") chips.push(`vs ${periodText(q.compareFrom, q.compareTo)}`);
  if (q.metric !== "net") chips.push(q.type === "income" ? "Income" : q.type === "all" ? "Income & expenses" : "Expenses");
  chips.push(...q.categories);
  if (q.search) chips.push(`“${q.search}”`);
  if (q.paymentMode) chips.push(q.paymentMode);
  return chips;
}

export default function AskMoney() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const txnsRef = useRef<Promise<AskTxn[]> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Not masked by privacy mode: the user explicitly asked for these numbers.
  const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  // Voice fills the box; the user still taps Ask.
  const speech = useSpeechToText((heard) => setQuestion(heard.slice(0, 300)));
  const { listening, stop: stopListening } = speech;

  useEffect(() => {
    if (!open || loading) stopListening();
  }, [open, loading, stopListening]);

  const openSheet = () => {
    setOpen(true);
    setError("");
    // Fetch fresh transactions while the user types; awaited when they ask.
    const token = localStorage.getItem("token");
    txnsRef.current = token ? loadTransactions(token) : null;
    txnsRef.current?.catch(() => {}); // surfaced on ask, not as an unhandled rejection
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const close = () => {
    if (loading) return;
    setOpen(false);
  };

  const ask = async (text = question) => {
    const q = text.trim();
    if (!q || loading) return;
    setQuestion(q);
    const token = localStorage.getItem("token");
    if (!token) return setError("You must be logged in");
    if (!navigator.onLine) return setError("Ask needs a connection");

    setError("");
    setLoading(true);
    try {
      const txnsPromise = txnsRef.current ?? (txnsRef.current = loadTransactions(token));
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: q, today: localDate(new Date()) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't answer that");
      if (!data.answerable) {
        setAnswer(null);
        setError(data.reason);
        return;
      }
      const query: AskQuery = data.query;
      const today = localDate(new Date());
      // Net worth comes from balance + assets, not the transaction list.
      const result = query.metric === "net_worth"
        ? runNetWorth(query, await loadNetWorth(token), today)
        : runQuery(query, await txnsPromise, today);
      setAnswer({ query, result });
    } catch (err) {
      txnsRef.current = null; // retry the fetch next time
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const trigger = (
    <button
      onClick={openSheet}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-canvas/80
                 text-left text-sm text-gray-500 hover:text-ink
                 ring-1 ring-transparent hover:ring-primary/40 transition-all duration-200 cursor-pointer"
    >
      <span className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-primary text-on-primary">
        <MessageCircleQuestion size={16} strokeWidth={2.5} />
      </span>
      <span className="min-w-0">
        <span className="block font-bold text-ink">Ask</span>
        <span className="hidden sm:block truncate text-xs">Questions about your money</span>
      </span>
    </button>
  );

  return (
    <>
      {trigger}
      <Sheet
        open={open}
        onClose={close}
        titleId="ask-money-title"
        title={<><MessageCircleQuestion size={18} className="text-primary" strokeWidth={2.5} />Ask your money</>}
      >
        <p className="text-xs text-gray-500 mb-4">
          Answers are worked out from your own data — only your question is sent to the AI.
        </p>

        <input
          ref={inputRef}
          value={question}
          onChange={(e) => { setQuestion(e.target.value); if (error) setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); ask(); } }}
          placeholder="e.g. How much did I spend on food last month?"
          maxLength={300}
          disabled={loading}
          readOnly={listening}
          className="w-full bg-canvas-soft/80 rounded-xl px-3.5 py-3 text-sm text-ink placeholder:text-gray-500
                     focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 disabled:opacity-60"
        />

        {listening && (
          <p className="mt-2 text-xs font-semibold text-negative" aria-live="polite">
            Listening… tap the mic when you&apos;re done
          </p>
        )}
        {speech.error && !listening && (
          <p role="alert" className="mt-2 text-xs font-semibold text-negative">{speech.error}</p>
        )}
        {error && <p role="alert" className="mt-2 text-xs font-semibold text-negative">{error}</p>}

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => ask()}
            disabled={loading || listening || !question.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold
                       bg-primary text-on-primary hover:bg-primary-active transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Working it out…</> : "Ask"}
          </button>
          {speech.supported && (
            <button
              type="button"
              onClick={() => (listening ? stopListening() : (setError(""), speech.start()))}
              disabled={loading}
              aria-label={listening ? "Stop voice input" : "Ask by voice"}
              aria-pressed={listening}
              className="relative shrink-0 w-12 flex items-center justify-center rounded-xl font-bold
                         bg-primary text-on-primary hover:bg-primary-active transition-colors duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {listening && <span className="absolute inset-1 rounded-lg bg-on-primary/25 animate-ping" aria-hidden />}
              <Mic size={18} strokeWidth={2.5} className="relative" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {answer ? (
            <motion.div
              key={JSON.stringify(answer.query)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-4"
            >
              <AnswerCard answer={answer} money={money} />
            </motion.div>
          ) : (
            <motion.div key="suggestions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4">
              <p className="text-[11px] font-semibold text-gray-500 mb-2">Try asking</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    disabled={loading}
                    className="px-2.5 py-1.5 rounded-full bg-canvas-soft/80 text-xs font-semibold text-ink/80
                               hover:text-ink hover:bg-canvas-soft transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Sheet>
    </>
  );
}

function AnswerCard({ answer, money }: { answer: Answer; money: (n: number) => string }) {
  const { query: q, result: r } = answer;
  const incomeView = q.type === "income";

  return (
    <div className="rounded-2xl bg-canvas-soft/80 p-4">
      <p className="text-xs font-bold text-gray-500">{q.label}</p>

      {r.kind === "empty" && (
        <p className="mt-2 text-sm text-ink">
          {q.metric === "net_worth"
            ? "No net-worth record for that date yet."
            : "No matching transactions. Try a wider date range."}
        </p>
      )}

      {r.kind === "amount" && (
        <>
          <p className="mt-1 text-3xl font-black text-ink tabular-nums">{money(r.value)}</p>
          <p className="text-xs text-gray-500">{r.note}</p>
        </>
      )}

      {r.kind === "count" && (
        <>
          <p className="mt-1 text-3xl font-black text-ink tabular-nums">
            {r.count} <span className="text-base font-bold text-gray-500">transaction{r.count === 1 ? "" : "s"}</span>
          </p>
          <p className="text-xs text-gray-500">{money(r.total)} in total</p>
        </>
      )}

      {r.kind === "net" && (
        <>
          <p className={`mt-1 text-3xl font-black tabular-nums ${r.net >= 0 ? "text-positive" : "text-negative"}`}>
            {r.net < 0 && "−"}{money(Math.abs(r.net))}
          </p>
          <p className="text-xs text-gray-500">
            {r.net >= 0 ? "saved" : "overspent"} · earned {money(r.income)}, spent {money(r.expense)}
          </p>
        </>
      )}

      {r.kind === "compare" && (() => {
        const diff = r.current - r.previous;
        const pct = r.previous > 0 ? Math.round((Math.abs(diff) / r.previous) * 100) : null;
        // More spending is bad news; more income is good news.
        const good = incomeView ? diff >= 0 : diff <= 0;
        const Arrow = diff >= 0 ? ArrowUpRight : ArrowDownRight;
        return (
          <>
            <p className="mt-1 text-3xl font-black text-ink tabular-nums">{money(r.current)}</p>
            <p className="text-xs text-gray-500">
              vs {money(r.previous)} {q.compareLabel}
            </p>
            {diff !== 0 && (
              <p
                className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${
                  good ? "bg-green-500/15 text-positive" : "bg-red-500/15 text-negative"
                }`}
              >
                <Arrow size={13} />
                {money(Math.abs(diff))} {diff > 0 ? "more" : "less"}
                {pct !== null && ` (${pct}%)`}
              </p>
            )}
          </>
        );
      })()}

      {r.kind === "net_worth" && (() => {
        const { now, then } = r;
        const diff = then ? now.total - then.total : 0;
        const pct = then && then.total !== 0 ? Math.round((Math.abs(diff) / Math.abs(then.total)) * 100) : null;
        const Arrow = diff >= 0 ? ArrowUpRight : ArrowDownRight;
        return (
          <>
            <p className="mt-1 text-3xl font-black text-ink tabular-nums">{money(now.total)}</p>
            <p className="text-xs text-gray-500">
              {now.live ? "today" : `on ${shortDate(now.date, true)}`}
              {!now.live && now.date !== q.to && " (closest record)"}
              {now.estimated && " · estimated"} · bank {money(now.cash)} + assets {money(now.assets)}
            </p>
            {r.thenRequested && !then && (
              <p className="mt-2 text-xs text-gray-500">
                No net-worth record from on or before {shortDate(r.thenRequested, true)} to compare with.
              </p>
            )}
            {then && (
              <>
                <p className="mt-2 text-xs text-gray-500">
                  vs {money(then.total)} on {shortDate(then.date, true)}
                  {then.date !== r.thenRequested && " (closest record)"}
                  {then.estimated && " · estimated"}
                </p>
                {diff !== 0 && (
                  <p
                    className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${
                      diff > 0 ? "bg-green-500/15 text-positive" : "bg-red-500/15 text-negative"
                    }`}
                  >
                    <Arrow size={13} />
                    {money(Math.abs(diff))} {diff > 0 ? "up" : "down"}
                    {pct !== null && ` (${pct}%)`}
                  </p>
                )}
              </>
            )}
          </>
        );
      })()}

      {r.kind === "items" && (
        <>
          <ul className="mt-2 space-y-1.5">
            {r.items.map((t) => {
              const cat = CATEGORIES.find((c) => c.name === t.category) ?? CATEGORIES[CATEGORIES.length - 1];
              const color = CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS.Others;
              const Icon = cat.icon;
              return (
                <li key={t.id} className="flex items-center gap-2.5">
                  <span className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${color.bg} ${color.text}`}>
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{t.title}</p>
                    <p className="truncate text-[11px] text-gray-500">
                      {t.category} · {shortDate(t.date)}
                      {t.comment && ` · ${t.comment}`}
                    </p>
                  </div>
                  <span className={`shrink-0 text-sm font-bold tabular-nums ${t.type === "income" ? "text-positive" : "text-ink"}`}>
                    {money(t.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
          {r.count > r.items.length && (
            <p className="mt-2 text-[11px] text-gray-500">
              Top {r.items.length} of {r.count} matching · {money(r.total)} in total
            </p>
          )}
        </>
      )}

      {r.kind === "breakdown" && (() => {
        const max = Math.max(...r.rows.map((row) => row.value));
        return (
          <>
            <p className="mt-1 text-xs text-gray-500">{money(r.total)} in total</p>
            <ul className="mt-2 space-y-2">
              {r.rows.map((row) => {
                const token = q.groupBy === "category" ? CATEGORY_COLORS[row.key]?.token : undefined;
                return (
                  <li key={row.key}>
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="font-semibold text-ink">{row.label}</span>
                      <span className="font-bold text-ink tabular-nums">{money(row.value)}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-canvas/80 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(2, (row.value / max) * 100)}%` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className={`h-full rounded-full ${token ? "" : "bg-primary"}`}
                        style={token ? { backgroundColor: `var(${token})` } : undefined}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        );
      })()}

      <div className="mt-3 flex flex-wrap gap-1">
        {queryChips(q).map((chip) => (
          <span key={chip} className="rounded-full bg-canvas/80 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
