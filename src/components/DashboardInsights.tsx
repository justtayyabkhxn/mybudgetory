"use client";

import { useMemo, useState } from "react";
import {
  Zap, Flame, Activity, Calendar, Calculator,
  TrendingDown, TrendingUp, Clock, Target,
} from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/categoryConfig";

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
type Transaction = {
  _id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
};

interface Props {
  txs: Transaction[];
  inflow: number;
  expense: number;
  loading: boolean;
}

/* ─────────────────────────────────────────────────────────────
   Shared SVG helpers
───────────────────────────────────────────────────────────── */
function toXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

/* ─────────────────────────────────────────────────────────────
   SpeedometerGauge  (exported → used in budget-goals page)
   Semi-circle gauge: left=0%, top=50%, right=100%
   sweep=1 (CW in SVG y-down) = going up through the top
───────────────────────────────────────────────────────────── */
export function SpeedometerGauge({
  pct,
  hex = "#6366f1",
  size = 120,
}: {
  pct: number;
  hex?: string;
  size?: number;
}) {
  const cx = 60, cy = 60, r = 46;
  const safePct = Math.min(Math.max(pct, 0.1), 99.9);

  // Track: full semi-circle from left (180°) to right (~0°), going CW through top
  const trackEnd = toXY(cx, cy, r, 0.2); // tiny offset to avoid degenerate 180° arc
  const trackPath = `M ${(cx - r).toFixed(1)} ${cy} A ${r} ${r} 0 0 1 ${trackEnd.x.toFixed(1)} ${trackEnd.y.toFixed(1)}`;

  // Filled arc from left (180°) to needle angle
  const needleAngleDeg = 180 - (safePct / 100) * 179.8;
  const filledEnd = toXY(cx, cy, r, needleAngleDeg);
  const filledPath = `M ${(cx - r).toFixed(1)} ${cy} A ${r} ${r} 0 0 1 ${filledEnd.x.toFixed(1)} ${filledEnd.y.toFixed(1)}`;

  // Needle tip
  const needleLen = 34;
  const tip = toXY(cx, cy, needleLen, needleAngleDeg);

  // Zone markers (tick marks at 60% and 80%)
  const tick60 = toXY(cx, cy, r + 5, 180 - 0.6 * 179.8);
  const tick60inner = toXY(cx, cy, r - 3, 180 - 0.6 * 179.8);
  const tick80 = toXY(cx, cy, r + 5, 180 - 0.8 * 179.8);
  const tick80inner = toXY(cx, cy, r - 3, 180 - 0.8 * 179.8);

  return (
    <svg viewBox="0 0 120 70" style={{ width: size, height: size * 0.583 }}>
      {/* Track */}
      <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" strokeLinecap="round" />
      {/* Filled */}
      <path d={filledPath} fill="none" stroke={hex} strokeWidth="9" strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${hex}80)` }} />
      {/* Zone ticks */}
      <line x1={tick60.x.toFixed(1)} y1={tick60.y.toFixed(1)} x2={tick60inner.x.toFixed(1)} y2={tick60inner.y.toFixed(1)}
        stroke="rgba(234,179,8,0.6)" strokeWidth="1.5" />
      <line x1={tick80.x.toFixed(1)} y1={tick80.y.toFixed(1)} x2={tick80inner.x.toFixed(1)} y2={tick80inner.y.toFixed(1)}
        stroke="rgba(249,115,22,0.6)" strokeWidth="1.5" />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={tip.x.toFixed(1)} y2={tip.y.toFixed(1)}
        stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Pivot */}
      <circle cx={cx} cy={cy} r="5" fill="white" />
      <circle cx={cx} cy={cy} r="2.5" fill={hex} />
      {/* Labels */}
      <text x="9"  y="68" fontSize="7" fill="rgba(255,255,255,0.25)" textAnchor="middle">0</text>
      <text x="111" y="68" fontSize="7" fill="rgba(255,255,255,0.25)" textAnchor="middle">100</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   HealthGauge  — full-circle, stroke-dasharray
───────────────────────────────────────────────────────────── */
function HealthGauge({ score }: { score: number }) {
  const r = 36, circ = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(score, 100)) / 100) * circ;
  const hex =
    score >= 80 ? "#4ade80" :
    score >= 60 ? "#facc15" :
    score >= 40 ? "#fb923c" : "#f87171";
  const label =
    score >= 80 ? "Excellent" :
    score >= 60 ? "Good" :
    score >= 40 ? "Fair" : "Needs Work";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-[88px] h-[88px]">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle cx="44" cy="44" r={r} fill="none" stroke={hex} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${filled.toFixed(1)} ${circ.toFixed(1)}`}
            style={{ filter: `drop-shadow(0 0 6px ${hex}90)`, transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-black leading-none" style={{ color: hex }}>{score}</span>
          <span className="text-[9px] text-gray-600">/100</span>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color: hex }}>{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   InsightCard wrapper
───────────────────────────────────────────────────────────── */
function InsightCard({
  icon, iconBg, title, children, className = "",
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-5 ${className}`}>
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RaceBar  — labelled dual progress bar
───────────────────────────────────────────────────────────── */
function RaceBar({
  label, pct, color, bgColor,
}: {
  label: string; pct: number; color: string; bgColor: string;
}) {
  const safePct = Math.min(pct, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="font-bold tabular-nums" style={{ color }}>{safePct.toFixed(0)}%</span>
      </div>
      <div className={`h-2.5 rounded-full overflow-hidden ${bgColor}`}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${safePct}%`,
            background: color,
            boxShadow: `0 0 8px ${color}80`,
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
export default function DashboardInsights({ txs, inflow, expense, loading }: Props) {
  const [cutPct, setCutPct] = useState(20);

  const now = new Date();
  const dayOfMonth  = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft    = daysInMonth - dayOfMonth;

  /* ── filter current month ── */
  const monthTxs = useMemo(() => txs.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }), [txs]);

  /* ── 1. VELOCITY ── */
  const dailyRate        = dayOfMonth > 0 ? expense / dayOfMonth : 0;
  const projectedEnd     = Math.round(dailyRate * daysInMonth);
  const remainingAtRate  = Math.round(dailyRate * daysLeft);

  const velocityStatus =
    inflow > 0 && projectedEnd > inflow * 1.1 ? "critical" :
    inflow > 0 && projectedEnd > inflow * 0.85 ? "warning" : "on-track";

  const velocityColor =
    velocityStatus === "critical" ? "#f87171" :
    velocityStatus === "warning"  ? "#fb923c" : "#4ade80";

  /* ── 2. MONTH RACE ── */
  const timeElapsedPct     = (dayOfMonth / daysInMonth) * 100;
  const budgetConsumedPct  = inflow > 0 ? (expense / inflow) * 100 : 0;
  const isOverpacing       = budgetConsumedPct > timeElapsedPct + 5;

  /* ── 3. HEALTH SCORE ── */
  const healthScore = useMemo(() => {
    if (inflow === 0) return 50;
    // Savings rate component (0-55)
    const sr      = (inflow - expense) / inflow;
    const srScore = Math.max(0, Math.min(55, sr * 100 * 0.55));
    // Streak component (0-25) — consecutive days ≤ daily average
    const dailyExpMap: Record<string, number> = {};
    monthTxs.filter(tx => tx.type === "expense").forEach(tx => {
      const key = new Date(tx.date).toDateString();
      dailyExpMap[key] = (dailyExpMap[key] || 0) + tx.amount;
    });
    const avgPerDay = dayOfMonth > 0 ? expense / dayOfMonth : 0;
    let streak = 0;
    for (let i = 0; i < dayOfMonth; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const spend = dailyExpMap[d.toDateString()] || 0;
      if (spend <= avgPerDay) streak++;
      else break;
    }
    const streakScore = Math.min(25, streak * 3);
    // Activity bonus (0-20): just having data is worth something
    const actScore = monthTxs.length > 0 ? Math.min(20, monthTxs.length * 2) : 0;
    return Math.round(Math.min(100, srScore + streakScore + actScore));
  }, [txs, inflow, expense, dayOfMonth]);

  /* ── 4. STREAK ── */
  const { streak, avgPerDay } = useMemo(() => {
    const dailyExpMap: Record<string, number> = {};
    monthTxs.filter(tx => tx.type === "expense").forEach(tx => {
      const key = new Date(tx.date).toDateString();
      dailyExpMap[key] = (dailyExpMap[key] || 0) + tx.amount;
    });
    const avg = dayOfMonth > 0 ? expense / dayOfMonth : 0;
    let s = 0;
    for (let i = 0; i < dayOfMonth; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const spend = dailyExpMap[d.toDateString()] || 0;
      if (spend <= avg) s++;
      else break;
    }
    return { streak: s, avgPerDay: avg };
  }, [monthTxs, expense, dayOfMonth]);

  /* ── 5. WHAT IF ── */
  const topCategories = useMemo(() => {
    const catSpend: Record<string, number> = {};
    monthTxs.filter(tx => tx.type === "expense").forEach(tx => {
      catSpend[tx.category] = (catSpend[tx.category] || 0) + tx.amount;
    });
    return Object.entries(catSpend).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [monthTxs]);

  /* ── 6. WEEKLY DIGEST ── */
  const digest = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const week = txs.filter(tx => new Date(tx.date) >= cutoff);
    const weekExp  = week.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const weekInc  = week.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);

    const daily: Record<string, number> = {};
    week.filter(t => t.type === "expense").forEach(t => {
      const k = new Date(t.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
      daily[k] = (daily[k] || 0) + t.amount;
    });
    const days   = Object.entries(daily);
    const best   = days.length ? days.reduce((a, b) => a[1] < b[1] ? a : b) : null;
    const worst  = days.length ? days.reduce((a, b) => a[1] > b[1] ? a : b) : null;

    const cats: Record<string, number> = {};
    week.filter(t => t.type === "expense").forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0] || null;

    return { weekExp, weekInc, best, worst, topCat };
  }, [txs]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.02] h-32" />
        ))}
      </div>
    );
  }

  /* ── no data guard ── */
  if (monthTxs.length === 0) return null;

  return (
    <div className="space-y-4 mt-6">

      {/* ─────── Row 1: Velocity + Race (full width) ─────── */}
      <InsightCard
        icon={<Zap size={14} className="text-yellow-400" />}
        iconBg="bg-yellow-500/10"
        title="Spending Pace"
      >
        {/* Velocity headline */}
        <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-600 mb-0.5">Daily rate</p>
            <p className="text-2xl font-black" style={{ color: velocityColor }}>
              ₹{Math.round(dailyRate).toLocaleString()}
              <span className="text-sm font-medium text-gray-500 ml-1">/day</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 mb-0.5">Projected month-end</p>
            <p className="text-xl font-black" style={{ color: velocityColor }}>
              ₹{projectedEnd.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 mb-0.5">Remaining at this rate</p>
            <p className="text-lg font-bold text-gray-300">
              +₹{remainingAtRate.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Status pill */}
        <div className="mb-5">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 border"
            style={{
              color: velocityColor,
              borderColor: `${velocityColor}40`,
              background: `${velocityColor}12`,
            }}
          >
            {velocityStatus === "critical" && <><TrendingDown size={11} /> Overspending pace — cut back now</>}
            {velocityStatus === "warning"  && <><Clock size={11} /> Slightly ahead of budget — keep an eye</>}
            {velocityStatus === "on-track" && <><TrendingUp size={11} /> On track — great pacing this month</>}
          </span>
        </div>

        {/* Race Bars */}
        <div className="space-y-3">
          <RaceBar
            label={`Time elapsed (Day ${dayOfMonth} of ${daysInMonth})`}
            pct={timeElapsedPct}
            color="#818cf8"
            bgColor="bg-indigo-500/10"
          />
          <RaceBar
            label={`Budget consumed vs income`}
            pct={budgetConsumedPct}
            color={isOverpacing ? "#f87171" : "#4ade80"}
            bgColor={isOverpacing ? "bg-red-500/10" : "bg-green-500/10"}
          />
        </div>
        {isOverpacing && (
          <p className="text-[11px] text-red-400 mt-2">
            Spending bar is ahead of time bar — you are using budget faster than the month is moving.
          </p>
        )}
      </InsightCard>

      {/* ─────── Row 2: Health Score + Streak ─────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Health Score */}
        <InsightCard
          icon={<Activity size={14} className="text-blue-400" />}
          iconBg="bg-blue-500/10"
          title="Health Score"
        >
          <div className="flex flex-col items-center gap-3 pt-1">
            <HealthGauge score={healthScore} />
            <div className="w-full space-y-1 text-[11px] text-gray-600">
              <div className="flex justify-between">
                <span>Savings rate</span>
                <span className="text-gray-400">{inflow > 0 ? Math.round(((inflow - expense) / inflow) * 100) : 0}%</span>
              </div>
              <div className="flex justify-between">
                <span>Streak bonus</span>
                <span className="text-gray-400">{Math.min(25, streak * 3)} pts</span>
              </div>
            </div>
          </div>
        </InsightCard>

        {/* Streak Counter */}
        <InsightCard
          icon={<Flame size={14} className="text-orange-400" />}
          iconBg="bg-orange-500/10"
          title="Streak"
        >
          <div className="flex flex-col items-center gap-2 pt-1">
            <div className="relative">
              <span
                className="text-5xl font-black"
                style={{
                  color: streak >= 7 ? "#f97316" : streak >= 3 ? "#fb923c" : "#6b7280",
                  textShadow: streak >= 3 ? `0 0 20px ${streak >= 7 ? "#f97316" : "#fb923c"}60` : "none",
                }}
              >
                {streak}
              </span>
              {streak >= 3 && (
                <span className="absolute -top-1 -right-4 text-lg">
                  {streak >= 7 ? "🔥" : "✨"}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 text-center leading-snug">
              {streak === 0
                ? "No streak yet today"
                : streak === 1
                ? "1 day under avg — keep going!"
                : `${streak} days under daily avg`}
            </p>
            <div className="text-[11px] text-gray-600 text-center">
              Avg ₹{Math.round(avgPerDay).toLocaleString()}/day
            </div>
            {/* Mini streak dots */}
            <div className="flex gap-1 flex-wrap justify-center mt-1">
              {[...Array(Math.min(dayOfMonth, 10))].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: i < streak
                      ? (streak >= 7 ? "#f97316" : "#fb923c")
                      : "rgba(255,255,255,0.1)",
                  }}
                />
              ))}
            </div>
          </div>
        </InsightCard>
      </div>

      {/* ─────── Row 3: Weekly Digest ─────── */}
      <InsightCard
        icon={<Calendar size={14} className="text-violet-400" />}
        iconBg="bg-violet-500/10"
        title="Weekly Digest — Last 7 Days"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total spent */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
            <p className="text-[10px] text-gray-600 mb-1">Total spent</p>
            <p className="text-base font-black text-rose-400">
              ₹{digest.weekExp.toLocaleString()}
            </p>
          </div>
          {/* Income */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
            <p className="text-[10px] text-gray-600 mb-1">Income received</p>
            <p className="text-base font-black text-emerald-400">
              ₹{digest.weekInc.toLocaleString()}
            </p>
          </div>
          {/* Best day */}
          <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/10 p-3">
            <p className="text-[10px] text-gray-600 mb-1 flex items-center gap-1">
              <TrendingDown size={9} className="text-emerald-400" /> Best day
            </p>
            {digest.best ? (
              <>
                <p className="text-xs font-bold text-emerald-300 truncate">{digest.best[0]}</p>
                <p className="text-[11px] text-gray-500">₹{digest.best[1].toLocaleString()}</p>
              </>
            ) : <p className="text-xs text-gray-600">No data</p>}
          </div>
          {/* Worst day */}
          <div className="rounded-xl bg-rose-500/[0.06] border border-rose-500/10 p-3">
            <p className="text-[10px] text-gray-600 mb-1 flex items-center gap-1">
              <TrendingUp size={9} className="text-rose-400" /> Worst day
            </p>
            {digest.worst ? (
              <>
                <p className="text-xs font-bold text-rose-300 truncate">{digest.worst[0]}</p>
                <p className="text-[11px] text-gray-500">₹{digest.worst[1].toLocaleString()}</p>
              </>
            ) : <p className="text-xs text-gray-600">No data</p>}
          </div>
        </div>
        {digest.topCat && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <Target size={11} />
            <span>
              Heaviest category this week:{" "}
              <span
                className="font-semibold"
                style={{ color: CATEGORY_COLORS[digest.topCat[0]]?.hex || "#6366f1" }}
              >
                {digest.topCat[0]}
              </span>{" "}
              — ₹{digest.topCat[1].toLocaleString()}
            </span>
          </div>
        )}
      </InsightCard>

      {/* ─────── Row 4: What If Calculator ─────── */}
      {topCategories.length > 0 && (
        <InsightCard
          icon={<Calculator size={14} className="text-cyan-400" />}
          iconBg="bg-cyan-500/10"
          title="What If You Spent Less?"
        >
          {/* Cut % selector */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-500">Cut spending by</span>
            {[10, 20, 30, 50].map((n) => (
              <button
                key={n}
                onClick={() => setCutPct(n)}
                className="text-xs font-bold px-2.5 py-1 rounded-lg border transition-all duration-150 cursor-pointer"
                style={
                  cutPct === n
                    ? { background: "#0891b220", borderColor: "#0891b250", color: "#22d3ee" }
                    : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "#6b7280" }
                }
              >
                {n}%
              </button>
            ))}
          </div>

          {/* Category rows */}
          <div className="space-y-2.5">
            {topCategories.map(([cat, monthlyAmt]) => {
              const saved = Math.round(monthlyAmt * (cutPct / 100));
              const annualSaved = saved * 12;
              const hex = CATEGORY_COLORS[cat]?.hex || "#6366f1";
              return (
                <div key={cat} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-8 rounded-full shrink-0"
                      style={{ background: hex, boxShadow: `0 0 6px ${hex}60` }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-200">{cat}</p>
                      <p className="text-[11px] text-gray-600">₹{monthlyAmt.toLocaleString()}/month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-cyan-400">
                      Save ₹{annualSaved.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-gray-600">per year</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-gray-700 mt-3">
            Based on your {now.toLocaleString("default", { month: "long" })} spending patterns.
          </p>
        </InsightCard>
      )}
    </div>
  );
}
