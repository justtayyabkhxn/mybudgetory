import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import NetWorth from "@/models/NetWorth";
import Transaction from "@/models/Transaction";
import { decrypt } from "@/utils/crypto";
import { getUserId, unauthorized } from "@/lib/auth";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Max days back we will fill history for. */
const MAX_BACKFILL_DAYS = 365;

/** UTC midnight of the day the given date falls in. */
function toUTCDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/** Amounts are stored encrypted ("<ivHex>:<cipherHex>"). Older rows may be plain. */
const ENCRYPTED = /^[0-9a-f]{32}:[0-9a-f]+$/i;
function readAmount(raw: string): number {
  if (!raw) return NaN;
  if (!ENCRYPTED.test(raw)) return parseFloat(raw);
  try {
    return parseFloat(decrypt(raw));
  } catch {
    return NaN;
  }
}

/**
 * Ensures the balance history has one point per day.
 *
 * Recorded snapshots are anchors and are never overwritten (except today's,
 * which tracks the live balance). Days between two anchors are filled by linear
 * interpolation and flagged `estimated` — the transaction log can't reconstruct
 * them, since the balance also moves through manual edits.
 *
 * Before the first recorded snapshot there is nothing to interpolate between, so
 * days back to Jan 1 are reconstructed by walking transaction flows backwards
 * from that first snapshot. Those are estimates too, and their error compounds
 * the further back they go.
 */
export async function POST(req: NextRequest) {
  const userId = getUserId(req.headers.get("authorization") || "");
  if (!userId) return unauthorized();

  try {
    await connectDB();

    const doc = await NetWorth.findOne({ userId });
    if (!doc) return NextResponse.json({ message: "No record found" });

    const today = toUTCDay(new Date());
    const todayMs = today.getTime();
    const currentBalance = Number(doc.bankBalance) || 0;
    const windowStartMs = todayMs - MAX_BACKFILL_DAYS * DAY_MS;

    // Index recorded snapshots by UTC day. Balances are coerced because some
    // older rows stored them as strings; days with more than one entry keep the
    // last, so we never write a duplicate for a day.
    const byDay = new Map<number, { _id: unknown; balance: number }>();
    for (const h of doc.history as { _id: unknown; date: Date; balance: unknown }[]) {
      const balance = Number(h.balance);
      if (!Number.isFinite(balance)) continue;
      byDay.set(toUTCDay(new Date(h.date)).getTime(), { _id: h._id, balance });
    }

    // Anchors inside the window, plus today (always the live balance)
    const anchorDays = [...byDay.keys()]
      .filter(ms => ms >= windowStartMs && ms < todayMs)
      .sort((a, b) => a - b);
    const anchors: { ms: number; balance: number }[] = [
      ...anchorDays.map(ms => ({ ms, balance: byDay.get(ms)!.balance })),
      { ms: todayMs, balance: currentBalance },
    ];

    const round = (n: number) => Math.round(n * 100) / 100;
    const toInsert: { date: Date; balance: number; estimated: boolean }[] = [];

    for (let i = 0; i < anchors.length - 1; i++) {
      const from = anchors[i];
      const to = anchors[i + 1];
      const span = to.ms - from.ms;
      for (let ms = from.ms + DAY_MS; ms < to.ms; ms += DAY_MS) {
        if (byDay.has(ms)) continue;
        const ratio = (ms - from.ms) / span;
        toInsert.push({
          date: new Date(ms),
          balance: round(from.balance + (to.balance - from.balance) * ratio),
          estimated: true,
        });
      }
    }

    // Pre-history: walk backwards from the first anchor to the start of the year.
    const firstAnchor = anchors[0];
    const yearStartMs = Date.UTC(today.getUTCFullYear(), 0, 1);
    const preStartMs = Math.max(yearStartMs, windowStartMs);
    const preTxns = firstAnchor.ms > preStartMs
      ? await Transaction.find({
          userId,
          date: { $gte: new Date(preStartMs), $lte: new Date(firstAnchor.ms) },
        }).select("amount type date").lean()
      : [];

    // With no transactions there is nothing to reconstruct from — a flat line
    // back to January would be invented, not estimated.
    if (preTxns.length > 0) {
      const netByDay = new Map<number, number>();
      for (const t of preTxns as unknown as { amount: string; type: string; date: Date }[]) {
        const amt = readAmount(t.amount);
        if (isNaN(amt)) continue;
        const key = toUTCDay(new Date(t.date)).getTime();
        netByDay.set(key, (netByDay.get(key) ?? 0) + (t.type === "income" ? amt : -amt));
      }

      // balance(d-1) = balance(d) - net flow on day d
      let balance = firstAnchor.balance;
      for (let ms = firstAnchor.ms; ms > preStartMs; ms -= DAY_MS) {
        balance -= netByDay.get(ms) ?? 0;
        if (!Number.isFinite(balance)) break;
        const prev = ms - DAY_MS;
        if (!byDay.has(prev)) {
          toInsert.push({ date: new Date(prev), balance: round(balance), estimated: true });
        }
      }
    }

    const existingToday = byDay.get(todayMs);
    if (existingToday) {
      // Keep today's entry in step with the live balance, and promote it to a
      // real reading if it had been filled in as an estimate
      await NetWorth.findOneAndUpdate(
        { userId, "history._id": existingToday._id },
        { $set: { "history.$.balance": currentBalance, "history.$.estimated": false } },
      );
    } else {
      toInsert.push({ date: today, balance: currentBalance, estimated: false });
    }

    if (toInsert.length > 0) {
      await NetWorth.findOneAndUpdate(
        { userId },
        { $push: { history: { $each: toInsert, $sort: { date: 1 } } } },
      );
    }

    return NextResponse.json({
      date: today,
      balance: currentBalance,
      filled: toInsert.length,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
