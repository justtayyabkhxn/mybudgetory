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
  comment?: string;
  paymentMode: "Cash" | "UPI";
}

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function heatColor(expense: number): { bg: string; bar: string; intensity: number } {
  if (expense === 0)    return { bg: "", bar: "", intensity: 0 };
  if (expense < 300)   return { bg: "bg-emerald-500/10", bar: "bg-emerald-500", intensity: 0.25 };
  if (expense < 700)   return { bg: "bg-yellow-500/10",  bar: "bg-yellow-400",  intensity: 0.5  };
  if (expense < 1500)  return { bg: "bg-orange-500/10",  bar: "bg-orange-400",  intensity: 0.75 };
  return                      { bg: "bg-red-500/10",     bar: "bg-red-400",     intensity: 1    };
}

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
      className="mt-5 bg-gray-900/60 border border-gray-700/40 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
          <Activity size={15} className="text-purple-400" />
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
                  : "bg-white/[0.02] border-white/5"
              }`}
            >
              <span className={`text-[9px] font-black uppercase tracking-wider ${isToday ? "text-indigo-400" : "text-gray-600"}`}>
                {DAYS[dow].slice(0, 2)}
              </span>

              {recent.length > 1 ? (
                <svg width="100%" height={H} viewBox={`-4 -4 ${(recent.length - 1) * W + 8} ${H + 8}`} preserveAspectRatio="none" className="overflow-visible">
                  <defs>
                    <linearGradient id={`grad-${dow}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={isToday ? "#818cf8" : "#7c3aed"} stopOpacity="0.3" />
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
                  <div className="w-full h-px bg-white/6" />
                </div>
              )}

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

function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-1.5 animate-pulse">
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-800/40 rounded-xl" />
      ))}
    </div>
  );
}

export default function CalendarPage() {
  useAuthGuard();

  const [txs, setTxs]                = useState<Transaction[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewMonth, setViewMonth]     = useState(new Date().getMonth());
  const [viewYear, setViewYear]       = useState(new Date().getFullYear());

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

  const getTxsForDay  = (day: number) => txs.filter(tx => {
    const d = new Date(tx.date);
    return d.getDate() === day && d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  });
  const getExpenseForDay = (day: number) => getTxsForDay(day).filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const getIncomeForDay  = (day: number) => getTxsForDay(day).filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const isToday = (day: number) => day === todayObj.getDate() && viewMonth === todayObj.getMonth() && viewYear === todayObj.getFullYear();

  const monthTxs     = txs.filter(tx => { const d = new Date(tx.date); return d.getMonth() === viewMonth && d.getFullYear() === viewYear; });
  const monthIncome  = monthTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const monthNet     = monthIncome - monthExpense;

  const selectedTxs = selectedDay !== null ? getTxsForDay(selectedDay) : [];
  const selectedExp = selectedTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const selectedInc = selectedTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);

  const isCurrentMonth = viewMonth === todayObj.getMonth() && viewYear === todayObj.getFullYear();
  const maxDayExpense  = Math.max(...Array.from({ length: daysInMonth }, (_, i) => getExpenseForDay(i + 1)), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-6 pb-28">
      <div className="max-w-3xl mx-auto">
        <Header />

        {/* Page title */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center">
              <CalendarDays size={18} className="text-sky-400" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Calendar</h1>
          </div>
          <MenuButton />
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={prevMonth}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 transition-all cursor-pointer flex-shrink-0"
          >
            <ChevronLeft size={18} className="text-gray-400" />
          </button>

          <div className="flex-1 flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${viewMonth}-${viewYear}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="text-xl font-black tracking-tight text-white"
              >
                {MONTHS[viewMonth]} <span className="text-gray-500">{viewYear}</span>
              </motion.p>
            </AnimatePresence>
            {!isCurrentMonth && (
              <button
                onClick={goToday}
                className="text-[10px] font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer mt-0.5"
              >
                ← Back to today
              </button>
            )}
          </div>

          <button
            onClick={nextMonth}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 transition-all cursor-pointer flex-shrink-0"
          >
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Month stats */}
        {!loading && (
          <motion.div
            key={`stats-${viewMonth}-${viewYear}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-3 gap-3 mb-5"
          >
            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp size={12} className="text-emerald-400" />
                <p className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider">Income</p>
              </div>
              <p className="text-lg font-black text-emerald-400 tabular-nums leading-none">₹{monthIncome.toLocaleString()}</p>
            </div>
            <div className="bg-red-950/40 border border-red-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingDown size={12} className="text-red-400" />
                <p className="text-[10px] font-bold text-red-400/70 uppercase tracking-wider">Expenses</p>
              </div>
              <p className="text-lg font-black text-red-400 tabular-nums leading-none">₹{monthExpense.toLocaleString()}</p>
            </div>
            <div className={`border rounded-2xl p-4 ${monthNet >= 0 ? "bg-indigo-950/40 border-indigo-500/20" : "bg-orange-950/40 border-orange-500/20"}`}>
              <div className="flex items-center gap-1.5 mb-2">
                <Wallet size={12} className={monthNet >= 0 ? "text-indigo-400" : "text-orange-400"} />
                <p className={`text-[10px] font-bold uppercase tracking-wider ${monthNet >= 0 ? "text-indigo-400/70" : "text-orange-400/70"}`}>Net</p>
              </div>
              <p className={`text-lg font-black tabular-nums leading-none ${monthNet >= 0 ? "text-indigo-400" : "text-orange-400"}`}>
                {monthNet >= 0 ? "+" : "−"}₹{Math.abs(monthNet).toLocaleString()}
              </p>
            </div>
          </motion.div>
        )}

        {/* Calendar grid */}
        <div className="bg-gray-900/50 border border-gray-700/40 rounded-2xl p-4 mb-3">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-3">
            {DAYS.map((d, i) => (
              <div key={d} className={`text-center text-[10px] font-black uppercase tracking-widest py-1 ${i === 0 || i === 6 ? "text-gray-700" : "text-gray-500"}`}>
                {d.slice(0, 2)}
              </div>
            ))}
          </div>

          {loading ? (
            <CalendarSkeleton />
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`e-${i}`} className="h-16" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day        = i + 1;
                const expense    = getExpenseForDay(day);
                const income     = getIncomeForDay(day);
                const heat       = heatColor(expense);
                const isSelected = selectedDay === day;
                const todayCell  = isToday(day);
                const hasTxs     = getTxsForDay(day).length > 0;
                const barWidth   = expense > 0 ? Math.max((expense / maxDayExpense) * 100, 8) : 0;

                return (
                  <motion.button
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`h-16 rounded-xl flex flex-col items-start justify-between p-2 cursor-pointer transition-all duration-200 relative overflow-hidden border ${
                      isSelected
                        ? "ring-2 ring-indigo-500 border-indigo-500/50 bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                        : todayCell
                          ? "border-sky-400/40 bg-sky-500/6"
                          : hasTxs
                            ? `${heat.bg} border-white/6`
                            : "border-gray-800/50 hover:border-gray-700/60 bg-transparent"
                    }`}
                  >
                    {/* Day number */}
                    <div className="flex items-start justify-between w-full">
                      <span className={`text-xs font-black leading-none flex items-center justify-center ${
                        todayCell
                          ? "bg-sky-500 text-white w-5 h-5 rounded-full text-[10px]"
                          : isSelected
                            ? "text-indigo-300"
                            : "text-gray-400"
                      }`}>
                        {day}
                      </span>
                      {income > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                      )}
                    </div>

                    {/* Expense amount */}
                    <div className="w-full">
                      {expense > 0 && (
                        <p className={`text-[9px] font-black tabular-nums mb-1 ${
                          heat.intensity >= 1 ? "text-red-400" :
                          heat.intensity >= 0.75 ? "text-orange-400" :
                          heat.intensity >= 0.5 ? "text-yellow-400" :
                          "text-emerald-400"
                        }`}>
                          ₹{expense >= 1000 ? `${(expense / 1000).toFixed(1)}k` : expense}
                        </p>
                      )}
                      {/* Spend bar */}
                      {expense > 0 && (
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.6, delay: i * 0.01, ease: "easeOut" }}
                            className={`h-full rounded-full ${heat.bar}`}
                            style={{ opacity: 0.7 + heat.intensity * 0.3 }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap text-[10px] text-gray-600 mb-5 px-1">
          {[
            { color: "bg-emerald-500/40", label: "<₹300" },
            { color: "bg-yellow-500/40",  label: "₹300–700" },
            { color: "bg-orange-500/40",  label: "₹700–1.5k" },
            { color: "bg-red-500/40",     label: ">₹1.5k" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-sm ${color}`} />
              <span>{label}</span>
            </div>
          ))}
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
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.99 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 overflow-hidden rounded-2xl border border-indigo-500/20 bg-gray-900/90 backdrop-blur-sm"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/50">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
                    {DAYS[new Date(viewYear, viewMonth, selectedDay).getDay()]}
                  </p>
                  <h3 className="text-base font-black text-white">
                    {MONTHS[viewMonth]} {selectedDay}, {viewYear}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {selectedExp > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                      <TrendingDown size={10} /> ₹{selectedExp.toLocaleString()}
                    </span>
                  )}
                  {selectedInc > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      <TrendingUp size={10} /> ₹{selectedInc.toLocaleString()}
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Transaction list */}
              <div className="px-4 py-3">
                {selectedTxs.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays size={28} className="text-gray-700 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-semibold">No transactions</p>
                    <p className="text-xs text-gray-600 mt-0.5">Nothing recorded on this day</p>
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
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/6 border border-gray-800/50 hover:border-gray-700/60 transition-all duration-150"
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
