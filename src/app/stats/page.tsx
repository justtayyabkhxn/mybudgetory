"use client";
import MenuButton from "@/components/Menu";
import { useEffect, useState } from "react";
import {
  TrendingDown,
  TrendingUp,
  BarChart3,
  Wallet,
  Banknote,
  PieChart,
  Hash,
  ListOrdered,
  BadgePercent,
  Calendar,
  ChartNoAxesCombined,
  CreditCard,
  Equal,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FloatingTransactionButton from "@/components/FloatingTransactionButton";

type Txn = {
  _id: string;
  title: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
};

export default function StatsPage() {
  const [txs, setTxs] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netBalance, setNetBalance] = useState(0);
  const [largestExpense, setLargestExpense] = useState(0);
  const [largestExpenseName, setLargestExpenseName] = useState<string>("");
  const [largestIncomeName, setLargestIncomeName] = useState<string>("");
  const [largestIncome, setLargestIncome] = useState(0);
  const [mostFrequentCategory, setMostFrequentCategory] = useState<string>("N/A");
  const [top3Days, setTop3Days] = useState<string[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/transactions", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.transactions) setTxs(data.transactions);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatMonth = (dateStr: string) =>
    new Date(dateStr).toLocaleString("default", { month: "long", year: "numeric" });

  const isCurrentMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const getMostBy = (data: Txn[], filter: "income" | "expense", groupBy: "date" | "month" | "category") => {
    const grouped: Record<string, number> = {};
    data
      .filter((tx) => tx.type === filter)
      .forEach((tx) => {
        const key =
          groupBy === "date" ? new Date(tx.date).toLocaleDateString()
          : groupBy === "month" ? formatMonth(tx.date)
          : tx.category;
        grouped[key] = (grouped[key] || 0) + tx.amount;
      });
    const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    return sorted[0] || ["N/A", 0];
  };

  const avgMonthlySpending = () => {
    const monthly: Record<string, number> = {};
    txs.forEach((tx) => {
      if (tx.type === "expense" && isCurrentMonth(tx.date)) {
        const key = formatMonth(tx.date);
        monthly[key] = (monthly[key] || 0) + tx.amount;
      }
    });
    const values = Object.values(monthly);
    return values.length > 0
      ? `₹ ${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)}`
      : "N/A";
  };

  const getTopAndLeastCategoryForCurrentMonth = () => {
    const categoryData: Record<string, number> = {};
    txs.forEach((tx) => {
      if (tx.type === "expense" && isCurrentMonth(tx.date)) {
        categoryData[tx.category] = (categoryData[tx.category] || 0) + tx.amount;
      }
    });
    const sortedCategories = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0] || ["N/A", 0];
    const leastCategory = sortedCategories[sortedCategories.length - 1] || ["N/A", 0];
    return [topCategory, leastCategory];
  };

  const calculateStats = () => {
    const totalIncome = txs
      .filter((tx) => tx.type === "income" && isCurrentMonth(tx.date))
      .reduce((acc, tx) => acc + tx.amount, 0);
    const totalExpenses = txs
      .filter((tx) => tx.type === "expense" && isCurrentMonth(tx.date))
      .reduce((acc, tx) => acc + tx.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    const largestExpense = Math.max(
      ...txs.filter((tx) => tx.type === "expense" && isCurrentMonth(tx.date)).map((tx) => tx.amount)
    );
    const largestExpenseTxn = txs
      .filter((tx) => tx.type === "expense" && isCurrentMonth(tx.date))
      .reduce((max, tx) => (tx.amount > max.amount ? tx : max), txs[0]);
    const largestExpenseNameVar = largestExpense ? largestExpenseTxn.title : "N/A";

    const largestIncome = Math.max(
      ...txs.filter((tx) => tx.type === "income" && isCurrentMonth(tx.date)).map((tx) => tx.amount)
    );
    const largestIncomeTxn = txs
      .filter((tx) => tx.type === "income" && isCurrentMonth(tx.date))
      .reduce((max, tx) => (tx.amount > max.amount ? tx : max), txs[0]);
    const largestIncomeNameVar = largestIncome ? largestIncomeTxn.title : "N/A";

    const categoryFrequency = txs
      .filter((tx) => isCurrentMonth(tx.date))
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    const mostFrequentCategory = Object.entries(categoryFrequency).sort((a, b) => b[1] - a[1]).shift() || ["N/A", 0];

    const daysSpending = txs
      .filter((tx) => tx.type === "expense" && isCurrentMonth(tx.date))
      .reduce((acc, tx) => {
        const day = new Date(tx.date).toLocaleDateString();
        acc[day] = (acc[day] || 0) + tx.amount;
        return acc;
      }, {} as Record<string, number>);
    const top3Days = Object.entries(daysSpending).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([day, amt]) => `${day} – ₹ ${amt}`) || [];

    const totalTransactions = txs.filter((tx) => isCurrentMonth(tx.date)).length;

    setLargestIncomeName(largestIncomeNameVar);
    setLargestExpenseName(largestExpenseNameVar);
    setTotalIncome(totalIncome);
    setTotalExpenses(totalExpenses);
    setNetBalance(netBalance);
    setLargestExpense(largestExpense);
    setLargestIncome(largestIncome);
    setMostFrequentCategory(mostFrequentCategory[0]);
    setTop3Days(top3Days);
    setTotalTransactions(totalTransactions);
  };

  useEffect(() => {
    if (!loading) calculateStats();
  }, [txs, loading]);

  const [
    [mostSpentDay, mostSpentAmt],
    [mostInflowDay, mostInflowAmt],
    [maxSpentMonth, maxSpentMonthAmt],
    [maxInflowMonth, maxInflowMonthAmt],
    topCategory,
    leastCategory,
  ] = loading
    ? [["", 0], ["", 0], ["", 0], ["", 0], ["", 0], ["", 0]]
    : [
        getMostBy(txs, "expense", "date"),
        getMostBy(txs, "income", "date"),
        getMostBy(txs, "expense", "month"),
        getMostBy(txs, "income", "month"),
        getTopAndLeastCategoryForCurrentMonth()[0],
        getTopAndLeastCategoryForCurrentMonth()[1],
      ];

  const isPositive = netBalance >= 0;

  return (
    <div className="min-h-screen bg-[#060608] text-white">

      {/* ── Background glow blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[160px]" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 py-6">
        <Header />

        {/* ── Page header ── */}
        <div className="flex justify-between items-start mb-8 mt-2">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <ChartNoAxesCombined size={16} className="text-indigo-400" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Statistics</h1>
            </div>
            <p className="text-sm text-gray-500 ml-10">
              {new Date().toLocaleString("default", { month: "long", year: "numeric" })} overview
            </p>
          </div>
          <MenuButton />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
            <p className="text-sm text-gray-500">Loading your stats…</p>
          </div>
        ) : (
          <>
            {/* ── Hero summary row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <HeroCard
                label="Total Income"
                value={`₹ ${totalIncome.toLocaleString()}`}
                icon={<ArrowUpRight size={16} className="text-emerald-400" />}
                iconBg="bg-emerald-500/10"
                valueColor="text-emerald-400"
                glow="shadow-[0_0_30px_rgba(16,185,129,0.08)]"
              />
              <HeroCard
                label="Total Expenses"
                value={`₹ ${totalExpenses.toLocaleString()}`}
                icon={<ArrowDownRight size={16} className="text-rose-400" />}
                iconBg="bg-rose-500/10"
                valueColor="text-rose-400"
                glow="shadow-[0_0_30px_rgba(244,63,94,0.08)]"
              />
              <HeroCard
                label="Net Balance"
                value={`₹ ${netBalance.toLocaleString()}`}
                icon={<Equal size={16} className={isPositive ? "text-cyan-400" : "text-orange-400"} />}
                iconBg={isPositive ? "bg-cyan-500/10" : "bg-orange-500/10"}
                valueColor={isPositive ? "text-cyan-300" : "text-orange-300"}
                glow={isPositive ? "shadow-[0_0_30px_rgba(34,211,238,0.08)]" : "shadow-[0_0_30px_rgba(251,146,60,0.08)]"}
              />
            </div>

            {/* ── Section label ── */}
            <SectionLabel label="Spending Insights" />

            {/* ── Stats grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <StatCard
                icon={<TrendingDown className="w-4 h-4 text-pink-400" />}
                iconBg="bg-pink-500/10"
                title="Most Spending Day"
                value={`${mostSpentDay}`}
                sub={mostSpentAmt ? `₹ ${mostSpentAmt}` : undefined}
              />
              <StatCard
                icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
                iconBg="bg-emerald-500/10"
                title="Most Inflow Day"
                value={`${mostInflowDay}`}
                sub={mostInflowAmt ? `₹ ${mostInflowAmt}` : undefined}
              />
              <StatCard
                icon={<BarChart3 className="w-4 h-4 text-blue-300" />}
                iconBg="bg-blue-500/10"
                title="Avg Monthly Spending"
                value={avgMonthlySpending()}
              />
              <StatCard
                icon={<Calendar className="w-4 h-4 text-yellow-400" />}
                iconBg="bg-yellow-500/10"
                title="Max Expense Month"
                value={`${maxSpentMonth}`}
                sub={maxSpentMonthAmt ? `₹ ${maxSpentMonthAmt}` : undefined}
              />
              <StatCard
                icon={<Calendar className="w-4 h-4 text-emerald-400" />}
                iconBg="bg-emerald-500/10"
                title="Max Inflow Month"
                value={`${maxInflowMonth}`}
                sub={maxInflowMonthAmt ? `₹ ${maxInflowMonthAmt}` : undefined}
              />
              <StatCard
                icon={<Hash className="w-4 h-4 text-blue-400" />}
                iconBg="bg-blue-500/10"
                title="Total Transactions"
                value={totalTransactions.toString()}
                sub="this month"
              />
            </div>

            {/* ── Section label ── */}
            <SectionLabel label="Category Breakdown" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <StatCard
                icon={<Wallet className="w-4 h-4 text-purple-400" />}
                iconBg="bg-purple-500/10"
                title="Top Spending Category"
                value={`${topCategory[0]}`}
                sub={topCategory[1] ? `₹ ${topCategory[1]}` : undefined}
              />
              <StatCard
                icon={<BadgePercent className="w-4 h-4 text-pink-300" />}
                iconBg="bg-pink-500/10"
                title="Least Spent Category"
                value={`${leastCategory[0]}`}
                sub={leastCategory[1] ? `₹ ${leastCategory[1]}` : undefined}
              />
              <StatCard
                icon={<PieChart className="w-4 h-4 text-indigo-400" />}
                iconBg="bg-indigo-500/10"
                title="Most Frequent Category"
                value={mostFrequentCategory}
              />
            </div>

            {/* ── Section label ── */}
            <SectionLabel label="Notable Transactions" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <StatCard
                icon={<ShoppingCart className="w-4 h-4 text-red-400" />}
                iconBg="bg-red-500/10"
                title="Largest Expense"
                value={largestExpenseName || "N/A"}
                sub={largestExpense ? `₹ ${largestExpense}` : undefined}
              />
              <StatCard
                icon={<Banknote className="w-4 h-4 text-green-400" />}
                iconBg="bg-green-500/10"
                title="Largest Income"
                value={largestIncomeName || "N/A"}
                sub={largestIncome ? `₹ ${largestIncome}` : undefined}
              />
              <StatCard
                icon={<ListOrdered className="w-4 h-4 text-orange-300" />}
                iconBg="bg-orange-500/10"
                title="Top 3 Most Spent Days"
                value={
                  top3Days.length > 0 ? (
                    <div className="space-y-1 mt-1">
                      {top3Days.map((day, index) => (
                        <p key={index} className="text-sm font-medium text-gray-300">{day}</p>
                      ))}
                    </div>
                  ) : "N/A"
                }
              />
            </div>
          </>
        )}

        <Footer />
      </div>
      <FloatingTransactionButton />
    </div>
  );
}

/* ── Sub-components ── */

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

function HeroCard({
  label, value, icon, iconBg, valueColor, glow,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor: string;
  glow: string;
}) {
  return (
    <div className={`relative rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-5 ${glow} transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]`}>
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>{icon}</div>
      </div>
      <p className={`text-2xl font-extrabold ${valueColor}`}>{value}</p>
    </div>
  );
}

function StatCard({
  icon, iconBg, title, value, sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>{icon}</div>
        <span className="text-xs font-medium text-gray-500">{title}</span>
      </div>
      {typeof value === "string" ? (
        <p className="text-base font-bold text-white leading-snug">{value}</p>
      ) : (
        value
      )}
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
