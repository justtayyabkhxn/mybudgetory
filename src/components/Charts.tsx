"use client";

import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { motion } from "framer-motion";
import {
  getDonutOptions,
  getBarChartOptions,
  getMonthlyBarChartOptions,
  getCategoryWiseMonthlyOptions,
  getCategoryWiseMonthlyOptionsDonut,
  getCategoryWiseYearlyOptions,
  getPaymentModeOptions,
  getMonthlySavingsBarChartOptions,
  getCumulativeSpendingOptions,
  getDayOfWeekOptions,
  getSavingsRateOptions,
} from "@/utils/chartOptions";
import SlideUp from "./SlideUp";

type Transaction = {
  _id: string;
  userId: string;
  amount: number;
  date: string;
  category: string;
  type: "income" | "expense";
  paymentMode: "Cash" | "UPI";
};

interface Props {
  inflow: number;
  expense: number;
  dailyBarData: { categories: string[]; inflow: number[]; expense: number[] };
  monthlyBarData: { categories: string[]; inflow: number[]; expense: number[] };
  monthlySavingsData: { categories: string[]; data: number[] };
  categoryWiseMonthlyData: { categories: string[]; data: number[] };
  categoryWiseYearlyData: { categories: string[]; data: number[] };
  cashAmount: number;
  upiAmount: number;
  transactions?: Transaction[];
}

// ─── Chart Card Wrapper ───────────────────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  badge,
  children,
  delay = 0,
  accent = "indigo",
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  delay?: number;
  accent?: "indigo" | "green" | "red" | "orange" | "purple" | "cyan" | "yellow";
}) {
  const accentMap: Record<string, string> = {
    indigo: "from-indigo-500/10 border-indigo-500/20",
    green: "from-green-500/10 border-green-500/20",
    red: "from-red-500/10 border-red-500/20",
    orange: "from-orange-500/10 border-orange-500/20",
    purple: "from-purple-500/10 border-purple-500/20",
    cyan: "from-cyan-500/10 border-cyan-500/20",
    yellow: "from-yellow-500/10 border-yellow-500/20",
  };

  const badgeMap: Record<string, string> = {
    indigo: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    green: "bg-green-500/15 text-green-400 border-green-500/30",
    red: "bg-red-500/15 text-red-400 border-red-500/30",
    orange: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  };

  return (
    <SlideUp>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={`rounded-2xl border bg-gradient-to-br ${accentMap[accent]} via-gray-900/60 to-gray-900/80 backdrop-blur-sm p-5 shadow-xl hover:shadow-2xl transition-shadow duration-300`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-gray-100 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {badge && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeMap[accent]}`}>
              {badge}
            </span>
          )}
        </div>
        {children}
      </motion.div>
    </SlideUp>
  );
}

// ─── Main Charts Component ────────────────────────────────────────────────────
const Charts: React.FC<Props> = ({
  inflow,
  expense,
  dailyBarData,
  monthlyBarData,
  monthlySavingsData,
  categoryWiseMonthlyData,
  categoryWiseYearlyData,
  cashAmount,
  upiAmount,
  transactions = [],
}) => {
  // ── Compute new chart data ──────────────────────────────────────────────────
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthlyTxs = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Cumulative daily spending
  const dailyExpense = Array(daysInMonth).fill(0);
  const dailyIncome = Array(daysInMonth).fill(0);
  monthlyTxs.forEach((tx) => {
    const day = new Date(tx.date).getDate() - 1;
    if (tx.type === "expense") dailyExpense[day] += tx.amount;
    else dailyIncome[day] += tx.amount;
  });
  const cumulativeExpense = dailyExpense.reduce<number[]>((acc, v, i) => {
    acc.push((acc[i - 1] ?? 0) + v);
    return acc;
  }, []);
  const dayLabels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

  // Day of week spending (0=Sun … 6=Sat)
  const dowLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dowExpense = Array(7).fill(0);
  const dowIncome = Array(7).fill(0);
  transactions.forEach((tx) => {
    const dow = new Date(tx.date).getDay();
    if (tx.type === "expense") dowExpense[dow] += tx.amount;
    else dowIncome[dow] += tx.amount;
  });

  // Monthly savings rate
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "short" })
  );
  const savingsRates = monthlyBarData.categories.map((_, i) => {
    const inc = monthlyBarData.inflow[i];
    const exp = monthlyBarData.expense[i];
    if (inc === 0) return 0;
    return Math.round(((inc - exp) / inc) * 100);
  });

  const donutOptions = getDonutOptions(inflow, expense);
  const barChartOptions = getBarChartOptions(dailyBarData);
  const monthlyBarChartOptions = getMonthlyBarChartOptions(monthlyBarData);
  const monthlySavingsBarOptions = getMonthlySavingsBarChartOptions(monthlySavingsData);
  const categoryWiseOptions = getCategoryWiseMonthlyOptions(categoryWiseMonthlyData);
  const categoryWiseDonutOptions = getCategoryWiseMonthlyOptionsDonut(categoryWiseMonthlyData);
  const categoryWiseYearlyOptions = getCategoryWiseYearlyOptions(categoryWiseYearlyData);
  const paymentModeOptions = getPaymentModeOptions(cashAmount, upiAmount);
  const cumulativeOptions = getCumulativeSpendingOptions({
    categories: dayLabels,
    cumulative: cumulativeExpense,
    daily: dailyExpense,
  });
  const dowOptions = getDayOfWeekOptions({
    labels: dowLabels,
    income: dowIncome,
    expense: dowExpense,
  });
  const savingsRateOptions = getSavingsRateOptions({
    categories: months,
    rates: savingsRates,
  });

  return (
    <div className="grid grid-cols-1 gap-6 mt-2">

      {/* Row 1: Donut + Payment Mode side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ChartCard title="Income vs Expenses" subtitle="This month's fund split" badge="Donut" accent="indigo" delay={0}>
          <HighchartsReact highcharts={Highcharts} options={donutOptions} />
        </ChartCard>
        <ChartCard title="Cash vs UPI" subtitle="Payment mode breakdown" badge="Donut" accent="yellow" delay={0.05}>
          <HighchartsReact highcharts={Highcharts} options={paymentModeOptions} />
        </ChartCard>
      </div>

      {/* Daily Bar */}
      <ChartCard title="Daily Inflow & Expenses" subtitle="Day-by-day breakdown for this month" badge="Bar" accent="green" delay={0.1}>
        <HighchartsReact highcharts={Highcharts} options={barChartOptions} />
      </ChartCard>

      {/* Cumulative Spending NEW */}
      <ChartCard title="Cumulative Spending" subtitle="Running total of expenses this month" badge="New ✦" accent="orange" delay={0.15}>
        <HighchartsReact highcharts={Highcharts} options={cumulativeOptions} />
      </ChartCard>

      {/* Monthly Bar */}
      <ChartCard title="Monthly Overview" subtitle="Income & expenses per month this year" badge="Column" accent="indigo" delay={0.2}>
        <HighchartsReact highcharts={Highcharts} options={monthlyBarChartOptions} />
      </ChartCard>

      {/* Monthly Savings */}
      <ChartCard title="Net Monthly Savings" subtitle="Inflow minus expenses per month" badge="Column" accent="green" delay={0.25}>
        <HighchartsReact highcharts={Highcharts} options={monthlySavingsBarOptions} />
      </ChartCard>

      {/* Savings Rate NEW */}
      <ChartCard title="Savings Rate %" subtitle="What % of income you saved each month" badge="New ✦" accent="purple" delay={0.3}>
        <HighchartsReact highcharts={Highcharts} options={savingsRateOptions} />
      </ChartCard>

      {/* Day of Week NEW */}
      <ChartCard title="Day-of-Week Spending" subtitle="Which days do you spend & earn the most?" badge="New ✦" accent="cyan" delay={0.35}>
        <HighchartsReact highcharts={Highcharts} options={dowOptions} />
      </ChartCard>

      {/* Category Monthly Bar + Donut */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ChartCard title="Category Breakdown" subtitle="Expenses by category this month" badge="Bar" accent="red" delay={0.4}>
          <HighchartsReact highcharts={Highcharts} options={categoryWiseOptions} />
        </ChartCard>
        <ChartCard title="Category Share" subtitle="Proportional view of spending" badge="Donut" accent="orange" delay={0.45}>
          <HighchartsReact highcharts={Highcharts} options={categoryWiseDonutOptions} />
        </ChartCard>
      </div>

      {/* Yearly category */}
      <ChartCard title="Yearly Category Spending" subtitle="Total per category for this year" badge="Year" accent="yellow" delay={0.5}>
        <HighchartsReact highcharts={Highcharts} options={categoryWiseYearlyOptions} />
      </ChartCard>
    </div>
  );
};

export default Charts;
