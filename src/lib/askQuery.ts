// "Ask your money": the AI turns a question into an AskQuery; everything below
// runs that query over the user's real transactions. The model never sees the
// data and never does arithmetic, so every number shown is computed here.

import { CATEGORIES } from "@/lib/categoryConfig";

export const METRICS = [
  "total", "count", "average", "daily_average", "largest", "smallest", "list", "breakdown", "net", "compare",
  "net_worth",
] as const;
export type Metric = (typeof METRICS)[number];

export const GROUP_BYS = ["category", "month", "weekday", "day", "paymentMode"] as const;
export type GroupBy = (typeof GROUP_BYS)[number];

export interface AskQuery {
  metric: Metric;
  type: "expense" | "income" | "all";
  categories: string[]; // [] = any
  search: string; // matched against title and note, "" = none
  paymentMode: "" | "UPI" | "Cash";
  from: string; // YYYY-MM-DD inclusive, "" = open
  to: string; // for "net_worth": the as-of date, "" = now
  compareFrom: string; // only for metric "compare"
  compareTo: string; // "compare": end of the other period; "net_worth": the date to compare with
  groupBy: GroupBy; // only for metric "breakdown"
  limit: number; // largest / smallest / list
  label: string; // short title written by the model, no numbers
  compareLabel: string;
}

export interface AskTxn {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string; // YYYY-MM-DD, local
  comment: string;
  paymentMode: string;
}

export type AskResult =
  | { kind: "amount"; value: number; count: number; note: string }
  | { kind: "count"; count: number; total: number }
  | { kind: "items"; items: AskTxn[]; count: number; total: number }
  | { kind: "breakdown"; rows: { key: string; label: string; value: number; count: number }[]; total: number }
  | { kind: "net"; income: number; expense: number; net: number }
  | { kind: "compare"; current: number; previous: number; currentCount: number; previousCount: number }
  | { kind: "net_worth"; now: NetWorthPoint; then: NetWorthPoint | null; thenRequested: string }
  | { kind: "empty" };

/** Net worth on a day: bank balance plus assets, as the Net Worth page adds them. */
export interface NetWorthPoint {
  date: string; // the day the figures are from (may be earlier than asked)
  cash: number;
  assets: number;
  total: number;
  live: boolean; // today's live balance rather than a recorded snapshot
  estimated: boolean; // an interpolated history point
}

/** Shape of GET /api/networth, with history dates already made local YYYY-MM-DD. */
export interface NetWorthData {
  bankBalance: number;
  assetsTotal: number;
  history: { date: string; balance: number; assets: number; estimated: boolean }[];
}

// ── Dates (YYYY-MM-DD strings, calendar maths in UTC to dodge DST) ──────────

export function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

// ── Validating what the model sent ──────────────────────────────────────────

const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);
const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const date = (v: unknown) => (typeof v === "string" && isValidDate(v) ? v : "");

/** Coerces the model's JSON into a safe, internally consistent query. */
export function sanitizeQuery(raw: unknown): AskQuery {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  let metric = pick(r.metric, METRICS, "total");
  let from = date(r.from);
  let to = date(r.to);
  if (from && to && from > to) [from, to] = [to, from];

  let compareFrom = date(r.compareFrom);
  let compareTo = date(r.compareTo);
  if (compareFrom && compareTo && compareFrom > compareTo) [compareFrom, compareTo] = [compareTo, compareFrom];
  if (metric === "net_worth") {
    // Single dates, not ranges: `to` is "as of", `compareTo` the other day.
    from = "";
    compareFrom = "";
    if (compareTo === to) compareTo = "";
  }
  if (metric === "compare" && !(compareFrom && compareTo)) {
    if (from && to) {
      // Default comparison: the same-length period just before.
      compareTo = addDays(from, -1);
      compareFrom = addDays(compareTo, -daysBetween(from, to));
    } else {
      metric = "total";
    }
  }

  const categories = Array.isArray(r.categories)
    ? [...new Set(r.categories.map(String).filter((c) => CATEGORY_NAMES.includes(c)))]
    : [];
  const limitRaw = typeof r.limit === "number" ? r.limit : parseInt(String(r.limit ?? ""), 10);
  const defaultLimit = metric === "list" ? 10 : metric === "largest" || metric === "smallest" ? 1 : 5;

  return {
    metric,
    type: metric === "net" ? "all" : pick(r.type, ["expense", "income", "all"] as const, "expense"),
    categories,
    search: str(r.search, 40),
    paymentMode: pick(r.paymentMode, ["", "UPI", "Cash"] as const, ""),
    from,
    to,
    compareFrom: metric === "compare" ? compareFrom : "",
    compareTo: metric === "compare" || metric === "net_worth" ? compareTo : "",
    groupBy: pick(r.groupBy, GROUP_BYS, "category"),
    limit: isFinite(limitRaw) ? Math.min(20, Math.max(1, Math.round(limitRaw))) : defaultLimit,
    label: str(r.label, 60) || "Your transactions",
    compareLabel: str(r.compareLabel, 40) || "before",
  };
}

// ── Running a query ──────────────────────────────────────────────────────────

function matches(q: AskQuery, t: AskTxn, from: string, to: string, anyType = false): boolean {
  if (!anyType && q.type !== "all" && t.type !== q.type) return false;
  if (q.categories.length && !q.categories.includes(t.category)) return false;
  if (q.paymentMode && (t.paymentMode || "UPI") !== q.paymentMode) return false;
  if (from && t.date < from) return false;
  if (to && t.date > to) return false;
  if (q.search) {
    const needle = q.search.toLowerCase();
    if (!`${t.title} ${t.comment}`.toLowerCase().includes(needle)) return false;
  }
  return true;
}

const sum = (xs: AskTxn[]) => Math.round(xs.reduce((s, t) => s + t.amount, 0) * 100) / 100;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function groupKey(t: AskTxn, by: GroupBy): string {
  switch (by) {
    case "category": return t.category;
    case "month": return t.date.slice(0, 7);
    case "day": return t.date;
    case "paymentMode": return t.paymentMode || "UPI";
    case "weekday": return String((new Date(`${t.date}T00:00:00Z`).getUTCDay() + 6) % 7); // Mon = 0
  }
}

function groupLabel(key: string, by: GroupBy): string {
  if (by === "weekday") return WEEKDAYS[Number(key)];
  if (by === "month") {
    return new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" });
  }
  if (by === "day") {
    return new Date(`${key}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
  }
  return key;
}

export function runQuery(q: AskQuery, txns: AskTxn[], today: string): AskResult {
  const inRange = txns.filter((t) => matches(q, t, q.from, q.to));

  switch (q.metric) {
    case "compare": {
      const previous = txns.filter((t) => matches(q, t, q.compareFrom, q.compareTo));
      if (!inRange.length && !previous.length) return { kind: "empty" };
      return {
        kind: "compare",
        current: sum(inRange),
        previous: sum(previous),
        currentCount: inRange.length,
        previousCount: previous.length,
      };
    }
    case "net": {
      const all = txns.filter((t) => matches(q, t, q.from, q.to, true));
      if (!all.length) return { kind: "empty" };
      const income = sum(all.filter((t) => t.type === "income"));
      const expense = sum(all.filter((t) => t.type === "expense"));
      return { kind: "net", income, expense, net: Math.round((income - expense) * 100) / 100 };
    }
  }

  if (!inRange.length) return { kind: "empty" };
  const total = sum(inRange);

  switch (q.metric) {
    case "count":
      return { kind: "count", count: inRange.length, total };
    case "average":
      return {
        kind: "amount",
        value: Math.round((total / inRange.length) * 100) / 100,
        count: inRange.length,
        note: `average of ${inRange.length} transaction${inRange.length === 1 ? "" : "s"}`,
      };
    case "daily_average": {
      // Up to today, and from the first matching day when the question had no start.
      const start = q.from || inRange.reduce((m, t) => (t.date < m ? t.date : m), inRange[0].date);
      const end = q.to && q.to < today ? q.to : today;
      const days = Math.max(1, daysBetween(start, end) + 1);
      return {
        kind: "amount",
        value: Math.round((total / days) * 100) / 100,
        count: inRange.length,
        note: `per day, over ${days} day${days === 1 ? "" : "s"}`,
      };
    }
    case "largest":
    case "smallest": {
      const sorted = [...inRange].sort((a, b) =>
        q.metric === "largest" ? b.amount - a.amount : a.amount - b.amount
      );
      return { kind: "items", items: sorted.slice(0, q.limit), count: inRange.length, total };
    }
    case "list": {
      const sorted = [...inRange].sort((a, b) => b.date.localeCompare(a.date));
      return { kind: "items", items: sorted.slice(0, q.limit), count: inRange.length, total };
    }
    case "breakdown": {
      const groups = new Map<string, AskTxn[]>();
      for (const t of inRange) {
        const k = groupKey(t, q.groupBy);
        groups.set(k, [...(groups.get(k) ?? []), t]);
      }
      const rows = [...groups].map(([key, ts]) => ({
        key,
        label: groupLabel(key, q.groupBy),
        value: sum(ts),
        count: ts.length,
      }));
      // Time-based groups read best in order; the rest biggest-first.
      if (q.groupBy === "month" || q.groupBy === "day" || q.groupBy === "weekday") {
        rows.sort((a, b) => a.key.localeCompare(b.key));
      } else {
        rows.sort((a, b) => b.value - a.value);
      }
      return { kind: "breakdown", rows, total };
    }
    default:
      return {
        kind: "amount",
        value: total,
        count: inRange.length,
        note: `across ${inRange.length} transaction${inRange.length === 1 ? "" : "s"}`,
      };
  }
}

// ── Net worth ────────────────────────────────────────────────────────────────

/** Net worth as of a day: live figures for today, else the latest snapshot on or before it. */
function netWorthOn(data: NetWorthData, day: string, today: string): NetWorthPoint | null {
  if (!day || day >= today) {
    const cash = data.bankBalance;
    const assets = data.assetsTotal;
    return { date: today, cash, assets, total: cash + assets, live: true, estimated: false };
  }
  let best: NetWorthData["history"][number] | null = null;
  for (const h of data.history) if (h.date <= day && (!best || h.date >= best.date)) best = h;
  if (!best) return null;
  return {
    date: best.date,
    cash: best.balance,
    assets: best.assets,
    total: best.balance + best.assets,
    live: false,
    estimated: best.estimated,
  };
}

export function runNetWorth(q: AskQuery, data: NetWorthData, today: string): AskResult {
  const now = netWorthOn(data, q.to, today);
  if (!now) return { kind: "empty" };
  return {
    kind: "net_worth",
    now,
    then: q.compareTo ? netWorthOn(data, q.compareTo, today) : null,
    thenRequested: q.compareTo,
  };
}
