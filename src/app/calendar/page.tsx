"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays, X, Activity } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuButton from "@/components/Menu";
import BottomNav from "@/components/BottomNav";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryConfig";
import { SkeletonTransactionRow } from "@/components/SkeletonLoader";

interface Transaction {
  _id: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
  comment: string;
  paymentMode: "Cash" | "UPI";
}

const DAYS     = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Weekly Rhythm ────────────────────────────────────────────────────────────
function WeeklyRhythm({ txs }: { txs: Transaction[] }) {
  const dayData = Array.from({ length: 7 }, (_, dow) => {
    // All expense-only dates for this weekday
    const dateMap: Record<string, number> = {};
    txs.forEach((tx) => {
      if (tx.type !== "expense") return;
      const d = new Date(tx.date);
      if (d.getDay() !== dow) return;
      const key = d.toISOString().split("T")[0];
      dateMap[key] = (dateMap[key] || 0) + tx.amount;
    });
    const sorted = Object.entries(dateMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, v]) => v);
    const recent  = sorted.slice(0, 8).reverse();
    const avg     = sorted.length ? sorted.reduce((s, v) => s + v, 0) / sorted.length : 0;
    return { dow, avg, recent, count: sorted.length };
  });

  const maxAvg = Math.max(...dayData.map((d) => d.avg), 1);
  const today  = new Date().getDay();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="mt-6 bg-gray-900/80 border border-gray-700 rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-purple-400" />
        <h2 className="text-sm font-black text-white uppercase tracking-widest">Weekly Rhythm</h2>
        <span className="text-xs text-gray-600 ml-1">avg spend by day of week</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {dayData.map(({ dow, avg, recent, count }) => {
          const isToday  = dow === today;
          const barPct   = (avg / maxAvg) * 100;
          const maxR     = Math.max(...recent, 1);
          const w        = 32; // svg width units per point
          const h        = 28;

          return (
            <div
              key={dow}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                isToday
                  ? "bg-indigo-500/10 border-indigo-500/30"
                  : "bg-white/[0.03] border-white/8"
              }`}
            >
              {/* Day label */}
              <span className={`text-[9px] font-black uppercase tracking-wider ${isToday ? "text-indigo-400" : "text-gray-500"}`}>
                {DAYS_SHORT[dow].slice(0, 2)}
              </span>

              {/* Sparkline */}
              {recent.length > 1 ? (
                <svg
                  width="100%"
                  height={h}
                  viewBox={`-4 -4 ${(recent.length - 1) * w + 8} ${h + 8}`}
                  preserveAspectRatio="none"
                  className="overflow-visible"
                >
                  <polyline
                    points={recent.map((v, i) => `${i * w},${h - (v / maxR) * h}`).join(" ")}
                    fill="none"
                    stroke={isToday ? "#818cf8" : "#7c3aed60"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {recent.map((v, i) => (
                    <circle
                      key={i}
                      cx={i * w}
                      cy={h - (v / maxR) * h}
                      r="3"
                      fill={isToday ? "#818cf8" : "#7c3aed"}
                    />
                  ))}
                </svg>
              ) : (
                <div className="h-7 w-full flex items-center justify-center">
                  <div className="w-full h-px bg-white/10" />
                </div>
              )}

              {/* Relative bar */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 0.7, delay: dow * 0.07, ease: "easeOut" }}
                  className={`h-full rounded-full ${isToday ? "bg-indigo-400" : "bg-purple-500/70"}`}
                />
              </div>

              {/* Average */}
              <span className={`text-[9px] font-bold ${avg > 0 ? (isToday ? "text-indigo-300" : "text-gray-400") : "text-gray-700"}`}>
                {avg > 0 ? `₹${Math.round(avg) >= 1000 ? `${(Math.round(avg)/1000).toFixed(1)}k` : Math.round(avg)}` : "—"}
              </span>

              {/* Occurrence count */}
              {count > 0 && (
                <span className="text-[8px] text-gray-700">{count}×</span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage() {
  const router = useRouter();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const today = new Date();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      JSON.parse(atob(token.split(".")[1]));
    } catch {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }
    fetchTransactions(token);
  }, []);

  const fetchTransactions = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.transactions) setTxs(data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // All days of the month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  // Get transactions for a given day
  const getTxsForDay = (day: number) =>
    txs.filter((tx) => {
      const d = new Date(tx.date);
      return (
        d.getDate() === day &&
        d.getMonth() === viewMonth &&
        d.getFullYear() === viewYear
      );
    });

  const getExpenseForDay = (day: number) =>
    getTxsForDay(day)
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

  const hasIncome = (day: number) =>
    getTxsForDay(day).some((tx) => tx.type === "income");

  const getCellBg = (expense: number) => {
    if (expense === 0) return "";
    if (expense < 200) return "bg-green-500/10 border-green-500/20";
    if (expense < 500) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const selectedTxs = selectedDay !== null ? getTxsForDay(selectedDay) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-8 pb-28">
      <div className="max-w-5xl mx-auto">
        <Header />

        {/* Page Header */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="flex items-center gap-2">
            <CalendarDays className="text-sky-400" size={28} />
            <h1 className="text-3xl font-extrabold tracking-tight">Calendar</h1>
          </div>
          <MenuButton />
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <motion.h2
            key={`${viewMonth}-${viewYear}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold text-gray-100"
          >
            {MONTH_NAMES[viewMonth]} {viewYear}
          </motion.h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-4 mb-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-bold text-gray-500 py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          {loading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-800/50 rounded-lg h-14"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells before first day */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-14" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const expense = getExpenseForDay(day);
                const income = hasIncome(day);
                const cellBg = getCellBg(expense);
                const isSelected = selectedDay === day;
                const isTodayCell = isToday(day);

                return (
                  <motion.button
                    key={day}
                    onClick={() =>
                      setSelectedDay(isSelected ? null : day)
                    }
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`h-14 rounded-lg border flex flex-col items-center justify-start pt-1 px-1 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "ring-2 ring-indigo-500 border-indigo-500/50 bg-indigo-500/10"
                        : cellBg || "border-gray-800 hover:border-gray-600"
                    } ${
                      isTodayCell
                        ? "ring-2 ring-indigo-400 border-indigo-400/50"
                        : ""
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        isTodayCell ? "text-indigo-400" : "text-gray-300"
                      }`}
                    >
                      {day}
                    </span>
                    {expense > 0 && (
                      <span className="text-[9px] leading-tight font-semibold text-red-300 mt-0.5">
                        ₹{expense >= 1000 ? `${(expense / 1000).toFixed(1)}k` : expense}
                      </span>
                    )}
                    {income && (
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-0.5" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap text-xs text-gray-400 mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500/40" />
            <span>Low (&lt;₹200)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500/40" />
            <span>Medium (₹200-500)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500/30 border border-red-500/40" />
            <span>High (&gt;₹500)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span>Has income</span>
          </div>
        </div>

        {/* Expanded Day Panel */}
        <AnimatePresence>
          {selectedDay !== null && (
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="bg-gray-900/90 border border-indigo-500/20 rounded-2xl p-5 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-100">
                  {MONTH_NAMES[viewMonth]} {selectedDay}, {viewYear}
                </h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-400 hover:text-white cursor-pointer p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {selectedTxs.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No transactions on this day.
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedTxs.map((tx) => {
                    const colors =
                      CATEGORY_COLORS[tx.category] || CATEGORY_COLORS["Others"];
                    const Icon =
                      CATEGORY_ICONS[tx.category] || CATEGORY_ICONS["Others"];

                    return (
                      <li
                        key={tx._id}
                        className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-gray-800 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`${colors.bg} border ${colors.border} p-2 rounded-lg`}
                          >
                            <Icon className={`${colors.text} w-4 h-4`} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-100">
                              {tx.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {tx.category} &bull; {tx.paymentMode}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-bold text-sm ${
                            tx.type === "income"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}₹
                          {tx.amount.toLocaleString()}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Day summary */}
              {selectedTxs.length > 0 && (
                <div className="flex gap-4 mt-4 pt-3 border-t border-gray-700">
                  <div>
                    <p className="text-xs text-gray-400">Expenses</p>
                    <p className="text-sm font-bold text-red-400">
                      ₹
                      {selectedTxs
                        .filter((t) => t.type === "expense")
                        .reduce((s, t) => s + t.amount, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Income</p>
                    <p className="text-sm font-bold text-green-400">
                      ₹
                      {selectedTxs
                        .filter((t) => t.type === "income")
                        .reduce((s, t) => s + t.amount, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Transactions</p>
                    <p className="text-sm font-bold text-gray-300">
                      {selectedTxs.length}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton for transaction list */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonTransactionRow key={i} />
            ))}
          </div>
        )}

        {/* Weekly Rhythm */}
        {!loading && <WeeklyRhythm txs={txs} />}
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}
