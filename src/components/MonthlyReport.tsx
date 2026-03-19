"use client";

import { useRef } from "react";
import { toPng } from "html-to-image";
import { Download, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/categoryConfig";

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

interface MonthlyReportProps {
  transactions: Transaction[];
  userName: string;
}

export default function MonthlyReport({
  transactions,
  userName,
}: MonthlyReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthName = now.toLocaleString("default", { month: "long" });

  const monthTxs = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = monthTxs
    .filter((tx) => tx.type === "income")
    .reduce((s, tx) => s + tx.amount, 0);

  const totalExpenses = monthTxs
    .filter((tx) => tx.type === "expense")
    .reduce((s, tx) => s + tx.amount, 0);

  const savings = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

  // Top 3 spending categories
  const categorySpend: Record<string, number> = {};
  monthTxs
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      categorySpend[tx.category] =
        (categorySpend[tx.category] || 0) + tx.amount;
    });

  const topCategories = Object.entries(categorySpend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Biggest single transaction
  const biggestTx = monthTxs
    .filter((tx) => tx.type === "expense")
    .sort((a, b) => b.amount - a.amount)[0];

  const handleExport = async () => {
    if (!reportRef.current) return;
    try {
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0f0f1a",
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `monthly-report-${monthName}-${currentYear}.png`;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  if (monthTxs.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
          <Wallet size={20} className="text-indigo-400" />
          Monthly Report
        </h2>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors cursor-pointer"
        >
          <Download size={15} />
          <span>

          Export as Image
          </span>
        </button>
      </div>

      {/* Report Card */}
      <div
        ref={reportRef}
        id="monthly-report-card"
        className="bg-gradient-to-br from-[#0f0f1a] via-[#12122a] to-[#0f1a2a] border border-indigo-500/20 rounded-2xl p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
              Monthly Financial Report
            </p>
            <h3 className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {monthName} {currentYear}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Prepared for</p>
            <p className="text-sm font-bold text-gray-300">{userName || "User"}</p>
            <p className="text-xs text-gray-500 mt-1">MyBudgetory</p>
          </div>
        </div>

        {/* Big numbers */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={14} className="text-green-400" />
              <p className="text-xs font-bold text-green-400 uppercase tracking-wider">
                Total Income
              </p>
            </div>
            <p className="text-3xl font-black text-green-400">
              ₹{totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown size={14} className="text-red-400" />
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Total Expenses
              </p>
            </div>
            <p className="text-3xl font-black text-red-400">
              ₹{totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700/50 my-4" />

        {/* Savings row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">Net Savings</p>
            <p
              className={`text-2xl font-black ${
                savings >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {savings >= 0 ? "+" : "-"}₹
              {Math.abs(savings).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Savings Rate</p>
            <p
              className={`text-2xl font-black ${
                savingsRate >= 20 ? "text-green-400" : savingsRate > 0 ? "text-yellow-400" : "text-red-400"
              }`}
            >
              {savingsRate}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Transactions</p>
            <p className="text-2xl font-black text-indigo-400">
              {monthTxs.length}
            </p>
          </div>
        </div>

        {/* Top categories */}
        {topCategories.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Top Spending Categories
            </p>
            <div className="space-y-2">
              {topCategories.map(([cat, amount], i) => {
                const colors =
                  CATEGORY_COLORS[cat] || CATEGORY_COLORS["Others"];
                return (
                  <div key={cat} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-4 font-bold">
                        #{i + 1}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}
                      >
                        {cat}
                      </span>
                    </div>
                    <span className="text-sm font-black text-gray-200">
                      ₹{amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Biggest transaction */}
        {biggestTx && (
          <div className="bg-white/3 border border-gray-700/40 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Biggest Single Expense
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-200">{biggestTx.title}</p>
                <p className="text-xs text-gray-400">
                  {biggestTx.category} &bull;{" "}
                  {new Date(biggestTx.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
              <p className="text-xl font-black text-red-400">
                ₹{biggestTx.amount.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-5">
          Generated by MyBudgetory &bull; {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
