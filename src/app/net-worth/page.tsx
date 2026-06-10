"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PiggyBank,
  RefreshCw,
  Pencil,
  Check,
  X,
  Landmark,
  TrendingUp,
  Brain,
  Sparkles,
  Target,
  Bot,
} from "lucide-react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingTransactionButton from "@/components/FloatingTransactionButton";
import MenuButton from "@/components/Menu";
import BottomNav from "@/components/BottomNav";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiFetch } from "@/utils/apiFetch";
import { toast } from "@/lib/toast";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

/* ── helpers ─────────────────────────────────────────────── */

const MILESTONES = [
  25000, 50000, 75000, 100000, 150000, 200000, 250000, 300000,
  400000, 500000, 750000, 1000000, 1500000, 2000000, 2500000,
  5000000, 7500000, 10000000, 20000000, 50000000, 100000000,
];

function nwCacheKey() {
  const d = new Date();
  const diff = d.getDay() === 0 ? -6 : 1 - d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return `ai_networth_${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;
}

function getMonthlyData(history: { date: string; balance: number }[], bankBalance: number) {
  const byMonth: Record<string, number> = {};
  history.forEach(h => {
    const d = new Date(h.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = h.balance;
  });
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  byMonth[currentKey] = bankBalance;
  const sorted = Object.keys(byMonth).sort();
  return sorted.map((key, i) => {
    const bal = byMonth[key];
    const prev = i > 0 ? byMonth[sorted[i - 1]] : null;
    const delta = prev !== null ? bal - prev : null;
    const [yr, mo] = key.split("-");
    const month = new Date(Number(yr), Number(mo) - 1, 1)
      .toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    return { month, balance: bal, delta };
  });
}

function getAvgMonthlyDelta(monthlyData: ReturnType<typeof getMonthlyData>) {
  const deltas = monthlyData.filter(m => m.delta !== null).map(m => m.delta!);
  if (!deltas.length) return 0;
  return Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length);
}

function formatAmount(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${amount.toLocaleString()}`;
}

function healthColor(score: number) {
  if (score >= 80) return { text: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/25", ring: "#34d399" };
  if (score >= 60) return { text: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/25", ring: "#60a5fa" };
  if (score >= 40) return { text: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/25", ring: "#facc15" };
  if (score >= 20) return { text: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/25", ring: "#fb923c" };
  return { text: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/25", ring: "#f87171" };
}

function SkeletonBar() {
  return <div className="animate-pulse h-24 bg-gray-800/60 rounded-2xl" />;
}

/* ── page ─────────────────────────────────────────────────── */

export default function NetWorthPage() {
  useAuthGuard();

  const [bankBalance, setBankBalance] = useState<number>(0);
  const [history, setHistory] = useState<{ date: string; balance: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const [saving, setSaving] = useState(false);

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [healthReason, setHealthReason] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  // Load cached AI insights on mount
  useEffect(() => {
    const cached = localStorage.getItem(nwCacheKey());
    if (cached) {
      try {
        const p = JSON.parse(cached);
        setAiAdvice(p.advice ?? null);
        setHealthScore(p.healthScore ?? null);
        setHealthReason(p.healthReason ?? null);
      } catch { /* ignore */ }
    }
  }, []);

  const fetchNetWorth = async () => {
    const res = await apiFetch("/api/networth");
    if (!res.ok) throw new Error();
    const data = await res.json();
    setBankBalance(data.bankBalance || 0);
    setHistory(data.history || []);
  };

  const refreshAll = async () => {
    setLoading(true);
    try {
      await apiFetch("/api/networth/snapshot", { method: "POST" }).catch(() => {});
      await fetchNetWorth();
    } catch {
      toast("Failed to load net worth", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshAll(); }, []);

  const handleUpdateBalance = async () => {
    const parsed = parseFloat(newBalance);
    if (isNaN(parsed) || parsed < 0) {
      toast("Enter a valid amount", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch("/api/networth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newBalance: parsed }),
      });
      const data = await res.json();
      if (res.ok) {
        setBankBalance(data.bankBalance);
        setEditMode(false);
        setNewBalance("");
        toast("Balance updated", "success");
      } else {
        toast(data.error || "Failed to update", "error");
      }
    } catch {
      toast("Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setNewBalance("");
  };

  const fetchAIAdvice = async (currentBalance: number, currentHistory: { date: string; balance: number }[]) => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError(false);
    try {
      const monthlyData = getMonthlyData(currentHistory, currentBalance);
      const res = await apiFetch("/api/ai/networth-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankBalance: currentBalance, monthlyData }),
      });
      const data = await res.json();
      if (data.advice) {
        setAiAdvice(data.advice);
        setHealthScore(data.healthScore ?? null);
        setHealthReason(data.healthReason ?? null);
        localStorage.setItem(nwCacheKey(), JSON.stringify(data));
      } else {
        setAiError(true);
      }
    } catch {
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 sm:p-8 pb-28">
      <div className="fixed inset-0 pointer-events-none auth-dot-grid opacity-[0.14]" />
      <div className="fixed top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent pointer-events-none z-50" />
      <div className="max-w-4xl mx-auto">
        <Header />

        {/* Page header */}
        <div className="flex items-center justify-between mt-4 mb-8">
          <div className="flex items-center gap-2">
            <PiggyBank className="text-amber-400" size={26} />
            <h1 className="text-3xl font-extrabold tracking-tight">Net Worth</h1>
            <button
              onClick={refreshAll}
              className="ml-1 p-1.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-green-400 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <MenuButton />
        </div>

        <div className="space-y-4">
          {/* Top row — 3 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Bank Balance card */}
            {loading ? (
              <SkeletonBar />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="bg-gradient-to-br from-amber-950/40 via-gray-900 to-gray-900 border border-amber-500/20 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <PiggyBank size={14} className="text-amber-400" />
                      </div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bank Balance</p>
                    </div>
                    {editMode ? (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="number"
                          autoFocus
                          value={newBalance}
                          onChange={e => setNewBalance(e.target.value)}
                          placeholder={bankBalance.toString()}
                          className="bg-gray-800/80 border border-amber-500/30 text-white rounded-xl px-3.5 py-2 text-xl font-black w-36 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          onKeyDown={e => { if (e.key === "Enter") handleUpdateBalance(); if (e.key === "Escape") handleCancelEdit(); }}
                        />
                        <button
                          onClick={handleUpdateBalance}
                          disabled={saving}
                          className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-all cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-3xl font-black text-amber-300 mt-2">
                        ₹{bankBalance.toLocaleString()}
                      </p>
                    )}
                  </div>
                  {!editMode && (
                    <button
                      onClick={() => { setEditMode(true); setNewBalance(bankBalance.toString()); }}
                      className="p-2 rounded-xl bg-gray-800/60 border border-gray-700 text-gray-500 hover:text-amber-400 hover:border-amber-500/30 transition-all cursor-pointer"
                      title="Edit balance"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Assets placeholder */}
            {loading ? (
              <SkeletonBar />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp size={14} className="text-blue-400" />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assets</p>
                </div>
                <p className="text-3xl font-black text-blue-300 mt-2">₹0</p>
                <p className="text-xs text-gray-600 mt-1">Coming soon</p>
              </motion.div>
            )}

            {/* Total Net Worth */}
            {loading ? (
              <SkeletonBar />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="bg-gradient-to-br from-emerald-950/40 via-gray-900 to-gray-900 border border-emerald-500/20 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Landmark size={14} className="text-emerald-400" />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Net Worth</p>
                </div>
                <p className="text-3xl font-black text-emerald-300 mt-2">
                  ₹{bankBalance.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1">Bank balance + assets</p>
              </motion.div>
            )}
          </div>

          {/* Month-over-Month Change Card */}
          {!loading && (() => {
            const byMonth: Record<string, number> = {};
            history.forEach(h => {
              const d = new Date(h.date);
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
              byMonth[key] = h.balance;
            });
            const now = new Date();
            const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
            byMonth[currentKey] = bankBalance;
            const sortedMonths = Object.keys(byMonth).sort();
            if (sortedMonths.length < 2) return null;
            const recent = sortedMonths.slice(-3);
            const rows = recent.map((key, i) => {
              const bal = byMonth[key];
              const prevBal = i > 0 ? byMonth[recent[i - 1]] : null;
              const delta = prevBal !== null ? bal - prevBal : null;
              const pct = prevBal !== null && prevBal !== 0 ? ((delta! / Math.abs(prevBal)) * 100).toFixed(1) : null;
              const [yr, mo] = key.split("-");
              const label = new Date(Number(yr), Number(mo) - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
              return { label, bal, delta, pct };
            });
            return (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5"
              >
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Month-over-Month</p>
                <div className="grid grid-cols-3 gap-3">
                  {rows.map((row, i) => {
                    const isUp = row.delta === null || row.delta >= 0;
                    return (
                      <div key={i} className="flex flex-col gap-1">
                        <p className="text-[11px] text-gray-500 font-semibold">{row.label}</p>
                        <p className="text-base font-black text-white">₹{row.bal.toLocaleString()}</p>
                        {row.delta !== null ? (
                          <span className={`text-[11px] font-bold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                            {isUp ? "▲" : "▼"} {row.pct}%
                            <span className="font-normal text-gray-600 ml-1">
                              ({isUp ? "+" : ""}₹{row.delta.toLocaleString()})
                            </span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-700">— first entry</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })()}

          {/* Health Score + Milestone row */}
          {!loading && (() => {
            const monthlyData = getMonthlyData(history, bankBalance);
            const avgDelta = getAvgMonthlyDelta(monthlyData);
            const nextMilestone = MILESTONES.find(m => m > bankBalance) ?? null;
            const remaining = nextMilestone !== null ? nextMilestone - bankBalance : 0;
            const monthsToMilestone = avgDelta > 0 && nextMilestone !== null
              ? Math.ceil(remaining / avgDelta)
              : null;
            const colors = healthScore !== null ? healthColor(healthScore) : null;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Health Score */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-violet-500/20 rounded-lg flex items-center justify-center">
                      <Brain size={14} className="text-violet-400" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net Worth Health</p>
                  </div>
                  {healthScore !== null && colors ? (
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full border-2 ${colors.border} ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-2xl font-black ${colors.text}`}>{healthScore}</span>
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${colors.text}`}>
                          {healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : healthScore >= 40 ? "Fair" : healthScore >= 20 ? "Weak" : "Poor"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{healthReason}</p>
                        <p className="text-[10px] text-gray-700 mt-1">Score out of 100 · AI assessed</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600">Generate AI insights below to see your score.</p>
                  )}
                </motion.div>

                {/* Next Milestone */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Target size={14} className="text-amber-400" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Next Milestone</p>
                  </div>
                  {nextMilestone !== null ? (
                    <>
                      <p className="text-2xl font-black text-amber-300">{formatAmount(nextMilestone)}</p>
                      <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all"
                          style={{ width: `${Math.min(100, Math.round((bankBalance / nextMilestone) * 100))}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1.5">
                        ₹{remaining.toLocaleString()} away
                        {monthsToMilestone !== null && (
                          <span className="text-amber-400 font-semibold ml-1">
                            · ~{monthsToMilestone} month{monthsToMilestone !== 1 ? "s" : ""} at current pace
                          </span>
                        )}
                        {avgDelta <= 0 && (
                          <span className="text-gray-600 ml-1">· grow your savings to see ETA</span>
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500">You&apos;ve passed all preset milestones!</p>
                  )}
                </motion.div>
              </div>
            );
          })()}

          {/* Balance History Chart with Projection */}
          {!loading && history.length > 0 && (() => {
            const monthlyData = getMonthlyData(history, bankBalance);
            const avgDelta = getAvgMonthlyDelta(monthlyData);

            const last = history[history.length - 1].balance;
            const prev = history.length > 1 ? history[history.length - 2].balance : null;
            const change = prev !== null ? last - prev : 0;
            const changePct = prev !== null && prev !== 0 ? ((change / Math.abs(prev)) * 100).toFixed(1) : null;
            const isUp = prev === null || change >= 0;

            // Build projection labels (+3mo, +6mo, +12mo from today)
            const now = new Date();
            const projLabel = (addMonths: number) => {
              const d = new Date(now.getFullYear(), now.getMonth() + addMonths, 1);
              return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
            };
            const proj3 = bankBalance + avgDelta * 3;
            const proj6 = bankBalance + avgDelta * 6;
            const proj12 = bankBalance + avgDelta * 12;

            const historyLabels = history.map(h => {
              const d = new Date(h.date);
              return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
            });
            const allLabels = [...historyLabels, projLabel(3), projLabel(6), projLabel(12)];
            const realData: (number | null)[] = [...history.map(h => h.balance), null, null, null];
            const projData: (number | null)[] = [
              ...Array(history.length - 1).fill(null),
              bankBalance,
              proj3,
              proj6,
              proj12,
            ];

            return (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl overflow-hidden"
                style={{ background: "linear-gradient(135deg, #0f1f17 0%, #0a0f1a 60%, #0d1a2a 100%)" }}
              >
                <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={14} className="text-emerald-400" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Balance History</p>
                    </div>
                    <p className="text-2xl font-black text-white">₹{last.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {changePct && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isUp ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                        {isUp ? "▲" : "▼"} {Math.abs(Number(changePct))}%
                      </span>
                    )}
                    {avgDelta !== 0 && (
                      <span className="text-[10px] text-gray-600">
                        avg {avgDelta >= 0 ? "+" : ""}₹{avgDelta.toLocaleString()}/mo
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-[220px] px-2 pb-4">
                  <Line
                    data={{
                      labels: allLabels,
                      datasets: [
                        {
                          label: "Balance",
                          data: realData,
                          borderColor: isUp ? "#34d399" : "#f87171",
                          backgroundColor: (ctx: any) => {
                            const { ctx: c, chartArea } = ctx.chart;
                            if (!chartArea) return "transparent";
                            const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                            if (isUp) {
                              g.addColorStop(0, "rgba(52,211,153,0.35)");
                              g.addColorStop(0.6, "rgba(52,211,153,0.08)");
                              g.addColorStop(1, "rgba(52,211,153,0)");
                            } else {
                              g.addColorStop(0, "rgba(248,113,113,0.35)");
                              g.addColorStop(0.6, "rgba(248,113,113,0.08)");
                              g.addColorStop(1, "rgba(248,113,113,0)");
                            }
                            return g;
                          },
                          fill: true,
                          tension: 0.45,
                          pointRadius: 4,
                          pointHoverRadius: 7,
                          pointBackgroundColor: isUp ? "#34d399" : "#f87171",
                          pointBorderColor: isUp ? "#065f46" : "#7f1d1d",
                          pointBorderWidth: 2,
                          borderWidth: 2.5,
                          spanGaps: false,
                        },
                        {
                          label: "Projected",
                          data: projData,
                          borderColor: "rgba(148,163,184,0.5)",
                          backgroundColor: "transparent",
                          fill: false,
                          tension: 0.3,
                          borderDash: [5, 4],
                          borderWidth: 1.5,
                          pointRadius: (ctx: any) => (ctx.dataIndex === history.length - 1 ? 0 : 4),
                          pointHoverRadius: 6,
                          pointBackgroundColor: "rgba(148,163,184,0.6)",
                          pointBorderColor: "rgba(148,163,184,0.3)",
                          pointBorderWidth: 1,
                          spanGaps: false,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: { mode: "index", intersect: false },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: "#0f172a",
                          borderColor: isUp ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)",
                          borderWidth: 1,
                          cornerRadius: 10,
                          padding: 12,
                          titleColor: "#64748b",
                          titleFont: { size: 11, weight: "bold" as const },
                          bodyColor: "#f1f5f9",
                          bodyFont: { size: 13, weight: "bold" as const },
                          callbacks: {
                            label: (item) => {
                              if (item.raw === null) return "";
                              const prefix = item.datasetIndex === 1 ? " Projected " : " Balance ";
                              return `${prefix}₹${Number(item.raw).toLocaleString()}`;
                            },
                          },
                        },
                      },
                      scales: {
                        x: {
                          ticks: { color: "#64748b", font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
                          grid: { display: false },
                          border: { display: false },
                        },
                        y: {
                          position: "left",
                          ticks: { color: "#64748b", font: { size: 10 }, maxTicksLimit: 4, callback: (v) => `₹${Number(v).toLocaleString()}` },
                          grid: { color: "rgba(255,255,255,0.06)" },
                          border: { display: false },
                        },
                      },
                    }}
                  />
                </div>

                {/* Projection legend */}
                {avgDelta !== 0 && (
                  <div className="px-6 pb-4 flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-px border-t-2 border-dashed border-gray-500" />
                      <span className="text-[10px] text-gray-600">Projected (avg {avgDelta >= 0 ? "+" : ""}₹{avgDelta.toLocaleString()}/mo)</span>
                    </div>
                    <div className="flex items-center gap-3 ml-auto text-[10px] text-gray-600">
                      <span>+3mo: <span className="text-gray-400 font-semibold">₹{Math.max(0, proj3).toLocaleString()}</span></span>
                      <span>+6mo: <span className="text-gray-400 font-semibold">₹{Math.max(0, proj6).toLocaleString()}</span></span>
                      <span>+12mo: <span className="text-gray-400 font-semibold">₹{Math.max(0, proj12).toLocaleString()}</span></span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* AI Net Worth Advisor */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/8 via-gray-900/60 to-gray-900/80 p-5"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 rounded-lg bg-violet-500/15 border border-violet-500/25">
                  <Bot size={14} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-violet-400">AI Net Worth Advisor</p>
                  <p className="text-[10px] text-gray-600">Powered by Llama 3.3 · refreshes weekly</p>
                </div>
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-violet-500/15 text-violet-300 border-violet-500/25">
                  AI
                </span>
              </div>

              {aiAdvice ? (
                <>
                  <p className="text-sm text-gray-300 leading-relaxed">{aiAdvice}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                      <span className="text-[10px] text-gray-600">Cached · refreshes next Monday</span>
                    </div>
                    <button
                      onClick={() => fetchAIAdvice(bankBalance, history)}
                      disabled={aiLoading}
                      className="text-[11px] text-gray-600 hover:text-violet-400 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <RefreshCw size={10} className={aiLoading ? "animate-spin" : ""} />
                      Refresh
                    </button>
                  </div>
                </>
              ) : aiLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <RefreshCw size={13} className="animate-spin" />
                  <span className="text-xs">Analyzing your net worth…</span>
                </div>
              ) : aiError ? (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-red-400">Could not load insights. Try again.</p>
                  <button
                    onClick={() => fetchAIAdvice(bankBalance, history)}
                    className="text-[11px] text-gray-500 hover:text-gray-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} /> Retry
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-xs text-gray-500">
                    Get a personalised analysis of your net worth trajectory, health score, and actionable tips.
                  </p>
                  <button
                    onClick={() => fetchAIAdvice(bankBalance, history)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-semibold hover:bg-violet-500/25 transition-all cursor-pointer"
                  >
                    <Sparkles size={13} />
                    Generate AI Insights
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
      <FloatingTransactionButton />
      <BottomNav />
    </div>
  );
}
