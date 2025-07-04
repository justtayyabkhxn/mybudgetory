// ChartsPage.tsx

"use client";

import { useEffect, useState } from "react";
import Charts from "@/components/Charts";
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FloatingTransactionButton from "@/components/FloatingTransactionButton";

import { TrendingUp, TrendingDown, BarChartBig } from "lucide-react";
import SlideUp from "@/components/SlideUp";

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
  const [cashStats, setCashStats] = useState({ inflow: 0, expense: 0 });
  const [upiStats, setUpiStats] = useState({ inflow: 0, expense: 0 });

  const [dailyBarData, setDailyBarData] = useState<{
    categories: string[];
    inflow: number[];
    expense: number[];
  }>({
    categories: [],
    inflow: [],
    expense: [],
  });

  const [monthlyBarData, setMonthlyBarData] = useState<{
    categories: string[];
    inflow: number[];
    expense: number[];
  }>({
    categories: [],
    inflow: [],
    expense: [],
  });

  const [monthlySavingsData, setMonthlySavingsData] = useState<{
    categories: string[];
    data: number[];
  }>({
    categories: [],
    data: [],
  });

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
        const allTxs: Transaction[] = data.transactions;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const daysInMonth = new Date(
          currentYear,
          currentMonth + 1,
          0
        ).getDate();

        const monthlyTxs = allTxs.filter((tx) => {
          const txDate = new Date(tx.date);
          return (
            txDate.getMonth() === currentMonth &&
            txDate.getFullYear() === currentYear
          );
        });

        let cashInflow = 0,
          cashExpense = 0;
        let upiInflow = 0,
          upiExpense = 0;

        monthlyTxs.forEach((tx) => {
          if (tx.paymentMode === "Cash") {
            if (tx.type === "income") cashInflow += tx.amount;
            else if (tx.type === "expense") cashExpense += tx.amount;
          } else if (tx.paymentMode === "UPI") {
            if (tx.type === "income") upiInflow += tx.amount;
            else if (tx.type === "expense") upiExpense += tx.amount;
          }
        });

        setCashStats({ inflow: cashInflow, expense: cashExpense });
        setUpiStats({ inflow: upiInflow, expense: upiExpense });

        const inflowAmt = monthlyTxs
          .filter((tx) => tx.type === "income")
          .reduce((sum, tx) => sum + Number(tx.amount), 0);

        const expenseAmt = monthlyTxs
          .filter((tx) => tx.type === "expense")
          .reduce((sum, tx) => sum + Number(tx.amount), 0);

        setInflow(inflowAmt);
        setExpense(expenseAmt);

        // ✅ Daily Bar Data
        const dailyCategories = Array.from({ length: daysInMonth }, (_, i) =>
          (i + 1).toString()
        );
        const inflowPerDay = Array(daysInMonth).fill(0);
        const expensePerDay = Array(daysInMonth).fill(0);

        monthlyTxs.forEach((tx) => {
          const txDate = new Date(tx.date);
          const day = txDate.getDate() - 1;
          if (tx.type === "income") inflowPerDay[day] += tx.amount;
          else if (tx.type === "expense") expensePerDay[day] += tx.amount;
        });
        setDailyBarData({
          categories: dailyCategories,
          inflow: inflowPerDay,
          expense: expensePerDay,
        });

        // ✅ Monthly Bar Data & Monthly Savings Data
        const months = Array.from({ length: 12 }, (_, i) =>
          new Date(0, i).toLocaleString("default", { month: "short" })
        );
        const inflowPerMonth = Array(12).fill(0);
        const expensePerMonth = Array(12).fill(0);
        const savingsPerMonth = Array(12).fill(0);

        allTxs.forEach((tx) => {
          const txDate = new Date(tx.date);
          const month = txDate.getMonth();
          if (tx.type === "income") inflowPerMonth[month] += tx.amount;
          else if (tx.type === "expense") expensePerMonth[month] += tx.amount;
        });

        for (let i = 0; i < 12; i++) {
          savingsPerMonth[i] = inflowPerMonth[i] - expensePerMonth[i];
        }

        setMonthlyBarData({
          categories: months,
          inflow: inflowPerMonth,
          expense: expensePerMonth,
        });

        setMonthlySavingsData({
          categories: months,
          data: savingsPerMonth,
        });

        // ✅ Yearly Category Expense Data
        const yearlyCategoryData: { [category: string]: number } = {};

        allTxs.forEach((tx) => {
          const txDate = new Date(tx.date);
          const year = txDate.getFullYear();

          if (
            tx.type === "expense" &&
            year === currentYear &&
            tx.category !== "Other"
          ) {
            if (!yearlyCategoryData[tx.category]) {
              yearlyCategoryData[tx.category] = 0;
            }
            yearlyCategoryData[tx.category] += tx.amount;
          }
        });

        setYearlyCategoryExpenseData({
          categories: Object.keys(yearlyCategoryData),
          data: Object.values(yearlyCategoryData),
        });

        // ✅ Category-wise Monthly Data
        const categoryData: {
          [month: string]: { [category: string]: number };
        } = {};

        allTxs.forEach((tx) => {
          if (tx.category === "Other") return;

          const txDate = new Date(tx.date);
          const month = txDate.toLocaleString("default", { month: "short" });

          if (!categoryData[month]) categoryData[month] = {};
          if (!categoryData[month][tx.category])
            categoryData[month][tx.category] = 0;

          categoryData[month][tx.category] += tx.amount;
        });

        const currentMonthName = new Date().toLocaleString("default", {
          month: "short",
        });
        const selectedMonthCategoryData = categoryData[currentMonthName] || {};

        setCategoryWiseMonthlyData({
          categories: Object.keys(selectedMonthCategoryData),
          data: Object.values(selectedMonthCategoryData),
        });

        // 🆕 Heatmap Data Processing
        const dailyCategoryExpenses: {
          [category: string]: { [day: number]: number };
        } = {};
        const allExpenseCategories = new Set<string>();

        monthlyTxs.forEach((tx) => {
          if (tx.type === "expense" && tx.category !== "Other") {
            const txDate = new Date(tx.date);
            const day = txDate.getDate(); // Get day as number (1-31)
            const category = tx.category;

            allExpenseCategories.add(category);

            if (!dailyCategoryExpenses[category]) {
              dailyCategoryExpenses[category] = {};
            }
            dailyCategoryExpenses[category][day] =
              (dailyCategoryExpenses[category][day] || 0) + tx.amount;
          }
        });

        const sortedExpenseCategories = Array.from(allExpenseCategories).sort();
        const heatmapSeriesData: [number, number, number][] = [];

        sortedExpenseCategories.forEach((category, categoryIndex) => {
          for (let day = 1; day <= daysInMonth; day++) {
            const amount = dailyCategoryExpenses[category]?.[day] || 0; // Use optional chaining
            heatmapSeriesData.push([categoryIndex, day - 1, amount]); // day-1 for 0-indexed Highcharts Y-axis
          }
        });
      } catch (err) {
        console.error("❌ Failed to fetch transactions", err);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-5">
      <div className="max-w-5xl mx-auto">
        <Header />
        <SlideUp>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <BarChartBig className="w-7 h-7 text-indigo-400" />
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Charts
              </h1>
            </div>
            <Menu />
          </div>
        </SlideUp>
        {/* Inflow/Expense Overview */}
        <SlideUp>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-900 p-5 rounded-xl shadow flex items-center gap-4">
            <div className="bg-green-800/80 p-3 rounded-full">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <div>
              <p className="text-md font-bold text-gray-300">Total Inflow</p>
              <p className="text-lg font-bold text-green-300">₹{inflow}</p>
            </div>
          </div>
          
          
          <div className="bg-gray-900  p-5 rounded-xl shadow flex items-center gap-4">
            <div className="bg-red-800/80 p-3 rounded-full">
              <TrendingDown className="text-white w-6 h-6" />
            </div>
            <div>
              <p className="text-md font-bold text-gray-300">Total Expense</p>
              <p className="text-lg font-bold text-red-300">₹{expense}</p>
            </div>
          </div>
        </div>
        </SlideUp>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-xl shadow-xl p-6 space-y-6">
            <h2 className="text-2xl tracking-tight font-bold text-white flex items-center gap-2">
              <BarChartBig className="w-8 h-8 text-indigo-400" />
              Visual Summary
            </h2>
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
            />
          </div>
        </div>
      </div>

      <FloatingTransactionButton />
      <Footer />
    </main>
  );
};

export default ChartsPage;
