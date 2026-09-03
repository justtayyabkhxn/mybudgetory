"use client";

import { useEffect, useState } from "react";
import Charts from "@/components/Charts";
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FloatingTransactionButton from "@/components/FloatingTransactionButton";
import BottomNav from "@/components/BottomNav";
import CountUp from "@/components/CountUp";
import { TrendingUp, TrendingDown, BarChartBig, Wallet, Sparkles, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

// ─── Spending Heatmap ─────────────────────────────────────────────────────────
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS   = ["S", "M", "T", "W", "T", "F", "S"];

// Sequential ramp built from the Wise palette: pale brand green through the
// warning family into negative red. Empty days stay on the sage canvas.
function getHeatColor(amount: number): string {
  if (amount === 0)   return "bg-canvas-soft/80";
  if (amount < 150)   return "bg-primary-pale";
  if (amount < 400)   return "bg-primary";
  if (amount < 800)   return "bg-warning";
  if (amount < 1500)  return "bg-warning-deep";
  return                     "bg-negative";
}

function SpendingHeatmap({ txs }: { txs: Transaction[] }) {
  const year = new Date().getFullYear();

  // Build date → expense map
  const expMap: Record<string, number> = {};
  txs.forEach((tx) => {
    if (tx.type !== "expense") return;
    const d = new Date(tx.date);
    if (d.getFullYear() !== year) return;
    const key = `${year}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2,"0")}`;
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
    const key = `${year}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2,"0")}`;
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
      className="bg-canvas/80 rounded-2xl p-5 mb-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/10">
            <Flame size={15} className="text-warning-deep" />
          </div>
          <div>
            <p className="text-sm font-black text-ink tracking-tight">Spending Heatmap</p>
            <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest">{year} · every day</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="text-center">
            <p className="font-black text-warning-deep">₹{totalSpent >= 1000 ? `${(totalSpent/1000).toFixed(1)}k` : totalSpent}</p>
            <p className="text-gray-600 text-[10px] uppercase tracking-wider">total</p>
          </div>
          <div className="text-center">
            <p className="font-black text-warning-deep">{activeDays}</p>
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
                        ${cell && cell.amount > 0 ? "hover:ring-1 hover:ring-primary hover:scale-125" : ""}
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
        {["bg-canvas-soft/80", "bg-primary-pale", "bg-primary", "bg-warning", "bg-warning-deep", "bg-negative"].map((c, i) => (
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

  // Month selector
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const viewDate = new Date(viewYear, viewMonth, 1);

  const goToPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goToNext = () => {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear  = viewMonth === 11 ? viewYear + 1 : viewYear;
    // Don't go beyond current month
    if (nextYear > today.getFullYear() || (nextYear === today.getFullYear() && nextMonth > today.getMonth())) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear();

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

  // Fetch all transactions once
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAllTxs(data.transactions || []);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Recompute derived data whenever transactions or selected month changes
  useEffect(() => {
    if (allTxs.length === 0 && !loading) return;
    const txs = allTxs;
    const currentMonth = viewMonth;
    const currentYear  = viewYear;
    const daysInMonth  = new Date(currentYear, currentMonth + 1, 0).getDate();

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

    const inflowAmt  = monthlyTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenseAmt = monthlyTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    setInflow(inflowAmt);
    setExpense(expenseAmt);

    // Daily bar
    const inflowPerDay  = Array(daysInMonth).fill(0);
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

    // Monthly bar & savings (full year of viewYear)
    const months = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("default", { month: "short" })
    );
    const inflowPerMonth  = Array(12).fill(0);
    const expensePerMonth = Array(12).fill(0);
    txs.filter(tx => new Date(tx.date).getFullYear() === currentYear).forEach((tx) => {
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

    // Category for selected month
    const catMap: Record<string, number> = {};
    monthlyTxs.forEach((tx) => {
      if (tx.type === "expense") {
        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
      }
    });
    setCategoryWiseMonthlyData({ categories: Object.keys(catMap), data: Object.values(catMap) });
  }, [allTxs, viewMonth, viewYear, loading]);

  const savings = inflow - expense;
  const savingsRate = inflow > 0 ? Math.round((savings / inflow) * 100) : 0;
  const monthName = viewDate.toLocaleString("default", { month: "long" });

  return (
    <main className="min-h-screen md:pt-20 text-ink p-4 sm:p-5 pb-28">
      <div className="max-w-5xl mx-auto">
        <div className="md:hidden">
          <Header />
        </div>

        <div className="flex justify-between items-center mt-4 mb-6">
          <div className="flex items-center gap-3">
            <BarChartBig className="w-7 h-7 text-indigo-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Charts</h1>
          </div>
          <Menu />
        </div>

        {/* Hero stats row */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-800/60 rounded-2xl p-5 h-24" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8"
          >
            <div className="bg-primary-pale rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-green-500/15 p-2.5 rounded-xl">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-green-400/70 uppercase tracking-wider">Income</p>
                <CountUp end={inflow} prefix="₹" className="text-xl font-black text-green-400" />
              </div>
            </div>
            <div className="bg-red-50 rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-red-500/15 p-2.5 rounded-xl">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-400/70 uppercase tracking-wider">Expenses</p>
                <CountUp end={expense} prefix="₹" className="text-xl font-black text-red-400" />
              </div>
            </div>
            {/* Month selector chip — sits between the two pairs of stat chips */}
            <div className="col-span-2 sm:col-span-1 bg-canvas/80 rounded-2xl p-2 flex items-center justify-between gap-1">
              <button
                onClick={goToPrev}
                className="p-1.5 rounded-lg hover:bg-canvas-soft/80 text-gray-400 hover:text-ink transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-center">
                <p className="text-sm font-black text-ink tracking-tight whitespace-nowrap">
                  {monthName.slice(0, 3)} {viewYear}
                </p>
                {!isCurrentMonth && (
                  <button
                    onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }}
                    className="text-[10px] leading-tight text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    Back to current
                  </button>
                )}
              </div>
              <button
                onClick={goToNext}
                disabled={isCurrentMonth}
                className="p-1.5 rounded-lg hover:bg-canvas-soft/80 text-gray-400 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className={`${savings >= 0 ? "bg-primary-pale" : "bg-orange-100"} rounded-2xl p-4 flex items-center gap-3`}>
              <div className={`${savings >= 0 ? "bg-emerald-500/15" : "bg-orange-500/15"} p-2.5 rounded-xl`}>
                <Wallet className={`w-5 h-5 ${savings >= 0 ? "text-emerald-400" : "text-warning-deep"}`} />
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${savings >= 0 ? "text-emerald-400/70" : "text-warning-deep/70"}`}>Savings</p>
                <CountUp end={Math.abs(savings)} prefix={savings >= 0 ? "₹" : "-₹"} className={`text-xl font-black ${savings >= 0 ? "text-emerald-400" : "text-warning-deep"}`} />
              </div>
            </div>
            <div className={`${savingsRate >= 20 ? "bg-primary-pale" : "bg-canvas-soft/80"} rounded-2xl p-4 flex items-center gap-3`}>
              <div className="bg-indigo-500/15 p-2.5 rounded-xl">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-400/70 uppercase tracking-wider">Saved</p>
                <p className="text-xl font-black text-indigo-400">{savingsRate}%</p>
              </div>
            </div>
          </motion.div>
        )}

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
            viewDate={viewDate}
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
