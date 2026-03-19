"use client";

import { useEffect, useState } from "react";
import Charts from "@/components/Charts";
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FloatingTransactionButton from "@/components/FloatingTransactionButton";
import BottomNav from "@/components/BottomNav";
import CountUp from "@/components/CountUp";
import { TrendingUp, TrendingDown, BarChartBig, Wallet, Sparkles, Flame } from "lucide-react";
import { motion } from "framer-motion";

// ─── Spending Heatmap ─────────────────────────────────────────────────────────
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS   = ["S","M","T","W","T","F","S"];

function getHeatColor(amount: number): string {
  if (amount === 0)    return "bg-white/[0.04]";
  if (amount < 150)   return "bg-emerald-800/70";
  if (amount < 400)   return "bg-emerald-500/75";
  if (amount < 800)   return "bg-amber-500/75";
  if (amount < 1500)  return "bg-orange-500/80";
  return                     "bg-red-500/85";
}

function SpendingHeatmap({ txs }: { txs: Transaction[] }) {
  const year = new Date().getFullYear();

  // Build date → expense map
  const expMap: Record<string, number> = {};
  txs.forEach((tx) => {
    if (tx.type !== "expense") return;
    const d = new Date(tx.date);
    if (d.getFullYear() !== year) return;
    const key = `${year}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    expMap[key] = (expMap[key] || 0) + tx.amount;
  });

  // Build weeks: columns of 7 day-slots (Sun→Sat)
  const jan1 = new Date(year, 0, 1);
  const startOffset = jan1.getDay(); // 0=Sun
  const totalCells = startOffset + 365 + (new Date(year, 1, 29).getMonth() === 1 ? 1 : 0); // rough
  const dec31 = new Date(year, 11, 31);
  const numDays = Math.round((dec31.getTime() - jan1.getTime()) / 86400000) + 1;

  type Cell = { date: string; amount: number } | null;
  const cells: Cell[] = Array(startOffset).fill(null);
  for (let i = 0; i < numDays; i++) {
    const d = new Date(year, 0, 1 + i);
    const key = `${year}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    cells.push({ date: key, amount: expMap[key] || 0 });
  }
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const numWeeks = cells.length / 7;
  // weeks[col][row]
  const weeks: Cell[][] = Array.from({ length: numWeeks }, (_, wi) =>
    cells.slice(wi * 7, wi * 7 + 7)
  );

  // Month label positions (which week col each month first appears)
  const monthCols: { label: string; col: number }[] = [];
  let lastM = -1;
  weeks.forEach((week, wi) => {
    week.forEach((cell) => {
      if (!cell) return;
      const m = parseInt(cell.date.split("-")[1]) - 1;
      if (m !== lastM) { monthCols.push({ label: MONTH_LABELS[m], col: wi }); lastM = m; }
    });
  });

  const totalSpent = Object.values(expMap).reduce((s, v) => s + v, 0);
  const activeDays = Object.values(expMap).filter((v) => v > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 mb-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Flame size={15} className="text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white tracking-tight">Spending Heatmap</p>
            <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest">{year} · every day</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="text-center">
            <p className="font-black text-orange-400">₹{totalSpent >= 1000 ? `${(totalSpent/1000).toFixed(1)}k` : totalSpent}</p>
            <p className="text-gray-600 text-[10px] uppercase tracking-wider">total</p>
          </div>
          <div className="text-center">
            <p className="font-black text-amber-400">{activeDays}</p>
            <p className="text-gray-600 text-[10px] uppercase tracking-wider">days</p>
          </div>
        </div>
      </div>

      {/* Grid (scrollable on mobile) */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex gap-[3px] ml-6 mb-1 relative h-4">
            {monthCols.map(({ label, col }) => (
              <div
                key={label}
                className="absolute text-[10px] text-gray-500 font-bold"
                style={{ left: `${col * 15}px` }}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-[3px] mr-1 justify-start">
              {DAY_LABELS.map((d, i) => (
                <div key={i} className="h-[12px] text-[9px] text-gray-600 font-bold w-4 flex items-center justify-end pr-1">
                  {i % 2 === 1 ? d : ""}
                </div>
              ))}
            </div>

            {/* Week columns */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((cell, di) => (
                    <div
                      key={di}
                      title={cell && cell.amount > 0 ? `${cell.date}  ₹${cell.amount.toLocaleString()}` : cell?.date || ""}
                      className={`w-[12px] h-[12px] rounded-[2px] transition-all duration-200 cursor-default
                        ${cell ? getHeatColor(cell.amount) : "opacity-0"}
                        ${cell && cell.amount > 0 ? "hover:ring-1 hover:ring-white/40 hover:scale-125" : ""}
                      `}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-[10px] text-gray-600">Less</span>
        {["bg-white/[0.04]","bg-emerald-800/70","bg-emerald-500/75","bg-amber-500/75","bg-orange-500/80","bg-red-500/85"].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-[2px] ${c}`} />
        ))}
        <span className="text-[10px] text-gray-600">More</span>
      </div>
    </motion.div>
  );
}

type Transaction = {
  _id: string;
  userId: string;
  amount: number;
  date: string;
  category: string;
  type: "income" | "expense";
  paymentMode: "Cash" | "UPI";
};

const ChartsPage = () => {
  const [inflow, setInflow] = useState(0);
  const [expense, setExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allTxs, setAllTxs] = useState<Transaction[]>([]);
  const [cashStats, setCashStats] = useState({ inflow: 0, expense: 0 });
  const [upiStats, setUpiStats] = useState({ inflow: 0, expense: 0 });

  const [dailyBarData, setDailyBarData] = useState<{
    categories: string[];
    inflow: number[];
    expense: number[];
  }>({ categories: [], inflow: [], expense: [] });

  const [monthlyBarData, setMonthlyBarData] = useState<{
    categories: string[];
    inflow: number[];
    expense: number[];
  }>({ categories: [], inflow: [], expense: [] });

  const [monthlySavingsData, setMonthlySavingsData] = useState<{
    categories: string[];
    data: number[];
  }>({ categories: [], data: [] });

  const [categoryWiseMonthlyData, setCategoryWiseMonthlyData] = useState<{
    categories: string[];
    data: number[];
  }>({ categories: [], data: [] });

  const [yearlyCategoryExpenseData, setYearlyCategoryExpenseData] = useState<{
    categories: string[];
    data: number[];
  }>({ categories: [], data: [] });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const txs: Transaction[] = data.transactions || [];

        setAllTxs(txs);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        const monthlyTxs = txs.filter((tx) => {
          const d = new Date(tx.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        // Payment mode stats
        let cashInflow = 0, cashExpense = 0, upiInflow = 0, upiExpense = 0;
        monthlyTxs.forEach((tx) => {
          if (tx.paymentMode === "Cash") {
            if (tx.type === "income") cashInflow += tx.amount;
            else cashExpense += tx.amount;
          } else {
            if (tx.type === "income") upiInflow += tx.amount;
            else upiExpense += tx.amount;
          }
        });
        setCashStats({ inflow: cashInflow, expense: cashExpense });
        setUpiStats({ inflow: upiInflow, expense: upiExpense });

        const inflowAmt = monthlyTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expenseAmt = monthlyTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        setInflow(inflowAmt);
        setExpense(expenseAmt);

        // Daily bar
        const inflowPerDay = Array(daysInMonth).fill(0);
        const expensePerDay = Array(daysInMonth).fill(0);
        monthlyTxs.forEach((tx) => {
          const day = new Date(tx.date).getDate() - 1;
          if (tx.type === "income") inflowPerDay[day] += tx.amount;
          else expensePerDay[day] += tx.amount;
        });
        setDailyBarData({
          categories: Array.from({ length: daysInMonth }, (_, i) => String(i + 1)),
          inflow: inflowPerDay,
          expense: expensePerDay,
        });

        // Monthly bar & savings
        const months = Array.from({ length: 12 }, (_, i) =>
          new Date(0, i).toLocaleString("default", { month: "short" })
        );
        const inflowPerMonth = Array(12).fill(0);
        const expensePerMonth = Array(12).fill(0);
        txs.forEach((tx) => {
          const m = new Date(tx.date).getMonth();
          if (tx.type === "income") inflowPerMonth[m] += tx.amount;
          else expensePerMonth[m] += tx.amount;
        });
        setMonthlyBarData({ categories: months, inflow: inflowPerMonth, expense: expensePerMonth });
        setMonthlySavingsData({ categories: months, data: inflowPerMonth.map((v, i) => v - expensePerMonth[i]) });

        // Yearly category
        const yearlyMap: Record<string, number> = {};
        txs.forEach((tx) => {
          if (tx.type === "expense" && new Date(tx.date).getFullYear() === currentYear) {
            yearlyMap[tx.category] = (yearlyMap[tx.category] || 0) + tx.amount;
          }
        });
        setYearlyCategoryExpenseData({ categories: Object.keys(yearlyMap), data: Object.values(yearlyMap) });

        // Category monthly
        const currentMonthName = now.toLocaleString("default", { month: "short" });
        const catMap: Record<string, number> = {};
        txs.forEach((tx) => {
          if (tx.type === "expense" && new Date(tx.date).toLocaleString("default", { month: "short" }) === currentMonthName) {
            catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
          }
        });
        setCategoryWiseMonthlyData({ categories: Object.keys(catMap), data: Object.values(catMap) });
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const savings = inflow - expense;
  const savingsRate = inflow > 0 ? Math.round((savings / inflow) * 100) : 0;
  const monthName = new Date().toLocaleString("default", { month: "long" });

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-5 pb-28">
      <div className="max-w-5xl mx-auto">
        <Header />

        <div className="flex justify-between items-center mt-4 mb-6">
          <div className="flex items-center gap-3">
            <BarChartBig className="w-7 h-7 text-indigo-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Charts</h1>
          </div>
          <Menu />
        </div>

        {/* Hero stats row */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-800/60 rounded-2xl p-5 h-24" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          >
            <div className="bg-gradient-to-br from-green-900/40 to-green-900/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-green-500/15 p-2.5 rounded-xl border border-green-500/20">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-green-400/70 uppercase tracking-wider">Income</p>
                <CountUp end={inflow} prefix="₹" className="text-xl font-black text-green-400" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-900/40 to-red-900/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-red-500/15 p-2.5 rounded-xl border border-red-500/20">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-400/70 uppercase tracking-wider">Expenses</p>
                <CountUp end={expense} prefix="₹" className="text-xl font-black text-red-400" />
              </div>
            </div>
            <div className={`bg-gradient-to-br ${savings >= 0 ? "from-emerald-900/40 to-emerald-900/10 border-emerald-500/20" : "from-orange-900/40 to-orange-900/10 border-orange-500/20"} border rounded-2xl p-4 flex items-center gap-3`}>
              <div className={`${savings >= 0 ? "bg-emerald-500/15 border-emerald-500/20" : "bg-orange-500/15 border-orange-500/20"} p-2.5 rounded-xl border`}>
                <Wallet className={`w-5 h-5 ${savings >= 0 ? "text-emerald-400" : "text-orange-400"}`} />
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${savings >= 0 ? "text-emerald-400/70" : "text-orange-400/70"}`}>Savings</p>
                <CountUp end={Math.abs(savings)} prefix={savings >= 0 ? "₹" : "-₹"} className={`text-xl font-black ${savings >= 0 ? "text-emerald-400" : "text-orange-400"}`} />
              </div>
            </div>
            <div className={`bg-gradient-to-br ${savingsRate >= 20 ? "from-indigo-900/40 to-indigo-900/10 border-indigo-500/20" : "from-gray-900/40 to-gray-900/10 border-gray-500/20"} border rounded-2xl p-4 flex items-center gap-3`}>
              <div className="bg-indigo-500/15 p-2.5 rounded-xl border border-indigo-500/20">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-400/70 uppercase tracking-wider">Saved</p>
                <p className="text-xl font-black text-indigo-400">{savingsRate}%</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Month label */}
        <div className="flex items-center gap-2 mb-4 text-gray-400">
          <div className="h-px flex-1 bg-gray-800" />
          <span className="text-xs font-bold uppercase tracking-widest px-3">{monthName} · All Charts</span>
          <div className="h-px flex-1 bg-gray-800" />
        </div>

        {/* Spending Heatmap */}
        {!loading && <SpendingHeatmap txs={allTxs} />}

        {/* Charts */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-800/60 rounded-2xl p-5 h-64" />
            ))}
          </div>
        ) : (
          <Charts
            inflow={inflow}
            expense={expense}
            dailyBarData={dailyBarData}
            monthlyBarData={monthlyBarData}
            monthlySavingsData={monthlySavingsData}
            categoryWiseMonthlyData={categoryWiseMonthlyData}
            categoryWiseYearlyData={yearlyCategoryExpenseData}
            cashAmount={cashStats.expense}
            upiAmount={upiStats.expense}
            transactions={allTxs}
          />
        )}
      </div>

      <FloatingTransactionButton />
      <Footer />
      <BottomNav />
    </main>
  );
};

export default ChartsPage;
