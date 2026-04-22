"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, CalendarDays, X,
  Activity, TrendingDown, TrendingUp, Wallet,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuButton from "@/components/Menu";
import BottomNav from "@/components/BottomNav";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryConfig";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiFetch } from "@/utils/apiFetch";
import Link from "next/link";

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

const DAYS    = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS  = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Heat colour based on daily spend ────────────────────────────────────────
function heatClass(expense: number) {
  if (expense === 0) return { cell: "", dot: "" };
  if (expense < 300)  return { cell: "bg-emerald-500/10 border-emerald-500/25", dot: "text-emerald-400" };
  if (expense < 700)  return { cell: "bg-yellow-500/10 border-yellow-500/25",  dot: "text-yellow-400"  };
  if (expense < 1500) return { cell: "bg-orange-500/10 border-orange-500/25",  dot: "text-orange-400"  };
  return               { cell: "bg-red-500/10 border-red-500/25",              dot: "text-red-400"     };
}

// ─── Weekly Rhythm ─────────────────────────────────────────────────────────
function WeeklyRhythm({ txs }: { txs: Transaction[] }) {
  const today = new Date().getDay();

  const dayData = useMemo(() => Array.from({ length: 7 }, (_, dow) => {
    const dateMap: Record<string, number> = {};
    txs.forEach(tx => {
      if (tx.type !== "expense") return;
      const d = new Date(tx.date);
      if (d.getDay() !== dow) return;
      const key = d.toISOString().split("T")[0];
      dateMap[key] = (dateMap[key] || 0) + tx.amount;
    });
    const sorted = Object.entries(dateMap).sort(([a], [b]) => b.localeCompare(a)).map(([, v]) => v);
    const recent = sorted.slice(0, 8).reverse();
    const avg    = sorted.length ? sorted.reduce((s, v) => s + v, 0) / sorted.length : 0;
    return { dow, avg, recent, count: sorted.length };
  }), [txs]);

  const maxAvg = Math.max(...dayData.map(d => d.avg), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="mt-6 bg-gray-900/60 border border-gray-700/60 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
          <Activity size={14} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-sm font-black text-white">Weekly Rhythm</h2>
          <p className="text-[10px] text-gray-500">avg spend by day of week</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dayData.map(({ dow, avg, recent, count }) => {
          const isToday = dow === today;
          const barPct  = (avg / maxAvg) * 100;
          const maxR    = Math.max(...recent, 1);
          const W = 32, H = 24;

          return (
            <div
              key={dow}
              className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all ${
                isToday
                  ? "bg-indigo-500/10 border-indigo-500/30"
                  : "bg-white/[0.02] border-white/6"
              }`}
            >
              <span className={`text-[9px] font-black uppercase tracking-wider ${isToday ? "text-indigo-400" : "text-gray-600"}`}>
                {DAYS[dow].slice(0, 2)}
              </span>

              {/* Sparkline */}
              {recent.length > 1 ? (
                <svg width="100%" height={H} viewBox={`-4 -4 ${(recent.length - 1) * W + 8} ${H + 8}`} preserveAspectRatio="none" className="overflow-visible">
                  <defs>
                    <linearGradient id={`grad-${dow}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={isToday ? "#818cf8" : "#7c3aed"} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={isToday ? "#818cf8" : "#7c3aed"} stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <polyline
                    points={recent.map((v, i) => `${i * W},${H - (v / maxR) * H}`).join(" ")}
                    fill="none"
                    stroke={`url(#grad-${dow})`}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {recent.map((v, i) => i === recent.length - 1 && (
                    <circle key={i} cx={i * W} cy={H - (v / maxR) * H} r="3.5" fill={isToday ? "#818cf8" : "#7c3aed"} />
                  ))}
                </svg>
              ) : (
                <div className="h-6 w-full flex items-center justify-center">
                  <div className="w-full h-px bg-white/8" />
                </div>
              )}

              {/* Bar */}
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 0.8, delay: dow * 0.06, ease: "easeOut" }}
                  className={`h-full rounded-full ${isToday ? "bg-indigo-400" : "bg-purple-500/60"}`}
                />
              </div>

              <span className={`text-[9px] font-bold tabular-nums ${avg > 0 ? (isToday ? "text-indigo-300" : "text-gray-400") : "text-gray-700"}`}>
                {avg > 0 ? `₹${Math.round(avg) >= 1000 ? `${(Math.round(avg) / 1000).toFixed(1)}k` : Math.round(avg)}` : "—"}
              </span>

              {count > 0 && <span className="text-[8px] text-gray-700">{count}×</span>}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Calendar skeleton ─────────────────────────────────────────────────────
function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-1.5 animate-pulse">
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-800/40 rounded-xl" />
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function CalendarPage() {
  useAuthGuard();

  const [txs, setTxs]               = useState<Transaction[]>([]);
  const [loading, setLoading]        = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewMonth, setViewMonth]    = useState(new Date().getMonth());
  const [viewYear, setViewYear]      = useState(new Date().getFullYear());

  const todayObj = new Date();

  useEffect(() => {
    apiFetch("/api/transactions")
      .then(r => r.json())
      .then(data => { if (data.transactions) setTxs(data.transactions); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const prevMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const goToday = () => {
    setSelectedDay(null);
    setViewMonth(todayObj.getMonth());
    setViewYear(todayObj.getFullYear());
  };

  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const getTxsForDay = (day: number) =>
    txs.filter(tx => {
      const d = new Date(tx.date);
      return d.getDate() === day && d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });

  const getExpenseForDay  = (day: number) => getTxsForDay(day).filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const getIncomeForDay   = (day: number) => getTxsForDay(day).filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const isToday = (day: number) => day === todayObj.getDate() && viewMonth === todayObj.getMonth() && viewYear === todayObj.getFullYear();

  // Month totals
  const monthTxs     = txs.filter(tx => { const d = new Date(tx.date); return d.getMonth() === viewMonth && d.getFullYear() === viewYear; });
  const monthIncome  = monthTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const monthNet     = monthIncome - monthExpense;

  const selectedTxs = selectedDay !== null ? getTxsForDay(selectedDay) : [];
  const selectedExp = selectedTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const selectedInc = selectedTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);

  const isCurrentMonth = viewMonth === todayObj.getMonth() && viewYear === todayObj.getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-6 pb-28">
      <div className="max-w-2xl mx-auto">
        <Header />

        {/* Page title */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
              <CalendarDays size={18} className="text-sky-400" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Calendar</h1>
          </div>
          <MenuButton />
        </div>

        {/* Month navigator */}
        <div className="flex items-center justify-between mb-4 bg-gray-900/60 border border-gray-700/60 rounded-2xl px-4 py-3">
          <button
            onClick={prevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${viewMonth}-${viewYear}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className="text-lg font-black text-white"
              >
                {MONTHS[viewMonth]} {viewYear}
              </motion.p>
            </AnimatePresence>
            {!isCurrentMonth && (
              <button
                onClick={goToday}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer mt-0.5"
              >
                ← Back to today
              </button>
            )}
          </div>

          <button
            onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Month stats */}
        {!loading && (
          <motion.div
            key={`stats-${viewMonth}-${viewYear}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-3 gap-2 mb-4"
          >
            <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={11} className="text-emerald-400" />
                <p className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider">Income</p>
              </div>
              <p className="text-base font-black text-emerald-400 tabular-nums">₹{monthIncome.toLocaleString()}</p>
            </div>
            <div className="bg-red-900/20 border border-red-500/20 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown size={11} className="text-red-400" />
                <p className="text-[10px] font-bold text-red-400/70 uppercase tracking-wider">Expenses</p>
              </div>
              <p className="text-base font-black text-red-400 tabular-nums">₹{monthExpense.toLocaleString()}</p>
            </div>
            <div className={`border rounded-2xl p-3 ${monthNet >= 0 ? "bg-indigo-900/20 border-indigo-500/20" : "bg-orange-900/20 border-orange-500/20"}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Wallet size={11} className={monthNet >= 0 ? "text-indigo-400" : "text-orange-400"} />
                <p className={`text-[10px] font-bold uppercase tracking-wider ${monthNet >= 0 ? "text-indigo-400/70" : "text-orange-400/70"}`}>Net</p>
              </div>
              <p className={`text-base font-black tabular-nums ${monthNet >= 0 ? "text-indigo-400" : "text-orange-400"}`}>
                {monthNet >= 0 ? "+" : ""}₹{Math.abs(monthNet).toLocaleString()}
              </p>
            </div>
          </motion.div>
        )}

        {/* Calendar grid */}
        <div className="bg-gray-900/60 border border-gray-700/60 rounded-2xl p-4 mb-3">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d, i) => (
              <div key={d} className={`text-center text-[11px] font-black uppercase tracking-wider py-1.5 ${i === 0 || i === 6 ? "text-gray-600" : "text-gray-500"}`}>
                {d.slice(0, 2)}
              </div>
            ))}
          </div>

          {loading ? (
            <CalendarSkeleton />
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty leading cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`e-${i}`} className="h-16" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day        = i + 1;
                const expense    = getExpenseForDay(day);
                const income     = getIncomeForDay(day);
                const heat       = heatClass(expense);
                const isSelected = selectedDay === day;
                const todayCell  = isToday(day);
                const hasTxs     = getTxsForDay(day).length > 0;

                return (
                  <motion.button
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`h-16 rounded-xl border flex flex-col items-start justify-start p-1.5 cursor-pointer transition-all duration-200 relative overflow-hidden ${
                      isSelected
                        ? "ring-2 ring-indigo-500 border-indigo-500/60 bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                        : todayCell
                          ? "border-indigo-400/40 bg-indigo-500/8"
                          : hasTxs
                            ? `${heat.cell}`
                            : "border-gray-800/60 hover:border-gray-700 bg-transparent"
                    }`}
                  >
                    {/* Day number */}
                    <span className={`text-xs font-black leading-none ${
                      todayCell
                        ? "bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center"
                        : isSelected
                          ? "text-indigo-300"
                          : "text-gray-400"
                    }`}>
                      {day}
                    </span>

                    {/* Expense */}
                    {expense > 0 && (
                      <span className={`text-[8px] leading-none font-bold mt-auto ${heat.dot} tabular-nums`}>
                        ₹{expense >= 1000 ? `${(expense / 1000).toFixed(1)}k` : expense}
                      </span>
                    )}

                    {/* Income dot */}
                    {income > 0 && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap text-[10px] text-gray-500 mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500/40" />
            <span>&lt;₹300</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-yellow-500/30 border border-yellow-500/40" />
            <span>₹300–700</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-orange-500/30 border border-orange-500/40" />
            <span>₹700–1.5k</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-red-500/30 border border-red-500/40" />
            <span>&gt;₹1.5k</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>income</span>
          </div>
        </div>

        {/* Day detail panel */}
        <AnimatePresence>
          {selectedDay !== null && (
            <motion.div
              key={`panel-${selectedDay}`}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 overflow-hidden rounded-2xl border border-indigo-500/20 bg-gray-900/80 backdrop-blur-md"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/60">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {DAYS[new Date(viewYear, viewMonth, selectedDay).getDay()]}
                  </p>
                  <h3 className="text-lg font-black text-white">
                    {MONTHS[viewMonth]} {selectedDay}, {viewYear}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Day summary chips */}
              {selectedTxs.length > 0 && (
                <div className="flex gap-2 px-5 pt-3">
                  {selectedExp > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">
                      <TrendingDown size={11} /> ₹{selectedExp.toLocaleString()}
                    </span>
                  )}
                  {selectedInc > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      <TrendingUp size={11} /> ₹{selectedInc.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-700/40 text-gray-400 border border-gray-700/60">
                    {selectedTxs.length} txn{selectedTxs.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Transaction list */}
              <div className="px-4 py-3">
                {selectedTxs.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays size={32} className="text-gray-700 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-semibold">No transactions</p>
                    <p className="text-xs text-gray-600 mt-1">Nothing recorded on this day</p>
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {selectedTxs.map((tx, idx) => {
                      const colors = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS["Others"];
                      const Icon   = CATEGORY_ICONS[tx.category]  || CATEGORY_ICONS["Others"];
                      return (
                        <motion.li
                          key={tx._id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15, delay: idx * 0.04 }}
                        >
                          <Link
                            href={`/transactions/${tx._id}`}
                            className="flex items-center gap-3 p-3 bg-white/3 hover:bg-white/6 rounded-xl border border-gray-800/60 hover:border-gray-700 transition-all duration-150 group"
                          >
                            <div className={`${colors.bg} border ${colors.border} p-2 rounded-lg flex-shrink-0`}>
                              <Icon className={`${colors.text} w-3.5 h-3.5`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-gray-100 truncate">{tx.title}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>{tx.category}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${tx.paymentMode === "UPI" ? "bg-indigo-500/15 text-indigo-400" : "bg-yellow-500/15 text-yellow-400"}`}>{tx.paymentMode}</span>
                              </div>
                            </div>
                            <span className={`font-black text-sm flex-shrink-0 ${tx.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                              {tx.type === "income" ? "+" : "−"}₹{tx.amount.toLocaleString()}
                            </span>
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weekly Rhythm */}
        {!loading && <WeeklyRhythm txs={txs} />}
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}
