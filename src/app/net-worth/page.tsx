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

function SkeletonBar() {
  return <div className="animate-pulse h-24 bg-gray-800/60 rounded-2xl" />;
}

export default function NetWorthPage() {
  useAuthGuard();

  const [bankBalance, setBankBalance] = useState<number>(0);
  const [history, setHistory] = useState<{ date: string; balance: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const [saving, setSaving] = useState(false);

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
      // 1. Take / update this week's Monday snapshot
      await apiFetch("/api/networth/snapshot", { method: "POST" }).catch(() => {});
      // 2. Fetch fresh data (history now includes the updated snapshot)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-8 pb-28">
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

          {/* Balance History Chart */}
          {!loading && history.length > 0 && (() => {
            const last = history[history.length - 1].balance;
            const prev = history.length > 1 ? history[history.length - 2].balance : null;
            const change = prev !== null ? last - prev : 0;
            const changePct = prev !== null && prev !== 0 ? ((change / Math.abs(prev)) * 100).toFixed(1) : null;
            const isUp = prev === null || change >= 0;
            return (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl overflow-hidden"
                style={{ background: "linear-gradient(135deg, #0f1f17 0%, #0a0f1a 60%, #0d1a2a 100%)" }}
              >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={14} className="text-emerald-400" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Balance History</p>
                    </div>
                    <p className="text-2xl font-black text-white">₹{last.toLocaleString()}</p>
                  </div>
                  {changePct && (
                    <div className={`flex flex-col items-end gap-1`}>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isUp ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                        {isUp ? "▲" : "▼"} {Math.abs(Number(changePct))}%
                      </span>
                      <span className="text-[10px] text-gray-600">vs first entry</span>
                    </div>
                  )}
                </div>

                {/* Chart */}
                <div className="h-[200px] px-2 pb-4">
                  <Line
                    data={{
                      labels: history.map(h => {
                        const d = new Date(h.date);
                        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                      }),
                      datasets: [{
                        label: "Balance",
                        data: history.map(h => h.balance),
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
                        pointRadius: history.length === 1 ? 5 : 4,
                        pointHoverRadius: 7,
                        pointBackgroundColor: isUp ? "#34d399" : "#f87171",
                        pointBorderColor: isUp ? "#065f46" : "#7f1d1d",
                        pointBorderWidth: 2,
                        borderWidth: 2.5,
                      }],
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
                            label: (item) => ` ₹${Number(item.raw).toLocaleString()}`,
                          },
                        },
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: "#64748b",
                            font: { size: 10 },
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 8,
                          },
                          grid: { display: false },
                          border: { display: false },
                        },
                        y: {
                          position: "left",
                          ticks: {
                            color: "#64748b",
                            font: { size: 10 },
                            maxTicksLimit: 4,
                            callback: (v) => `₹${Number(v).toLocaleString()}`,
                          },
                          grid: { color: "rgba(255,255,255,0.06)" },
                          border: { display: false },
                        },
                      },
                    }}
                  />
                </div>
              </motion.div>
            );
          })()}
        </div>
      </div>

      <Footer />
      <FloatingTransactionButton />
      <BottomNav />
    </div>
  );
}
