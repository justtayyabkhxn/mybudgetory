"use client";

import { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Header from "@/components/Header";
import { BarChartBig } from "lucide-react";
import Menu from "@/components/Menu";
import FloatingTransactionButton from "@/components/FloatingTransactionButton";
import Footer from "@/components/Footer";

type Transaction = {
  _id: string;
  userId: string;
  amount: number;
  date: string;
  category: string;
  type: "income" | "expense";
  paymentMode: "Cash" | "UPI";
};

const AdvancedChartsPage = () => {
  const [inflow, setInflow] = useState(0);
  const [expense, setExpense] = useState(0);
  const [cashStats, setCashStats] = useState({ inflow: 0, expense: 0 });
  const [upiStats, setUpiStats] = useState({ inflow: 0, expense: 0 });

  const [monthlyBarData, setMonthlyBarData] = useState<{
    categories: string[];
    inflow: number[];
    expense: number[];
  }>({ categories: [], inflow: [], expense: [] });

  const [monthlySavingsData, setMonthlySavingsData] = useState<{
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

        // --- Monthly filtering ---
        const monthlyTxs = allTxs.filter((tx) => {
          const txDate = new Date(tx.date);
          return (
            txDate.getMonth() === currentMonth &&
            txDate.getFullYear() === currentYear
          );
        });

        // --- Payment mode stats ---
        let cashInflow = 0,
          cashExpense = 0;
        let upiInflow = 0,
          upiExpense = 0;

        monthlyTxs.forEach((tx) => {
          if (tx.paymentMode === "Cash") {
            if (tx.type === "income") cashInflow += tx.amount;
            else cashExpense += tx.amount;
          } else if (tx.paymentMode === "UPI") {
            if (tx.type === "income") upiInflow += tx.amount;
            else upiExpense += tx.amount;
          }
        });

        setCashStats({ inflow: cashInflow, expense: cashExpense });
        setUpiStats({ inflow: upiInflow, expense: upiExpense });

        // --- Total inflow/expense ---
        const inflowAmt = monthlyTxs
          .filter((tx) => tx.type === "income")
          .reduce((sum, tx) => sum + tx.amount, 0);

        const expenseAmt = monthlyTxs
          .filter((tx) => tx.type === "expense")
          .reduce((sum, tx) => sum + tx.amount, 0);

        setInflow(inflowAmt);
        setExpense(expenseAmt);

        // --- Daily Bar Data ---

        // --- Monthly Bar Data & Savings ---
        const months = Array.from({ length: 12 }, (_, i) =>
          new Date(0, i).toLocaleString("default", { month: "short" }),
        );
        const inflowPerMonth = Array(12).fill(0);
        const expensePerMonth = Array(12).fill(0);
        const savingsPerMonth = Array(12).fill(0);

        allTxs.forEach((tx) => {
          const txDate = new Date(tx.date);
          const m = txDate.getMonth();
          if (tx.type === "income") inflowPerMonth[m] += tx.amount;
          else expensePerMonth[m] += tx.amount;
        });

        for (let i = 0; i < 12; i++) {
          savingsPerMonth[i] = inflowPerMonth[i] - expensePerMonth[i];
        }

        setMonthlyBarData({
          categories: months,
          inflow: inflowPerMonth,
          expense: expensePerMonth,
        });

        setMonthlySavingsData({ categories: months, data: savingsPerMonth });

        // --- Yearly Category Expense ---
        const yearlyCategoryData: { [category: string]: number } = {};
        allTxs.forEach((tx) => {
          const year = new Date(tx.date).getFullYear();
          if (tx.type === "expense" && year === currentYear) {
            yearlyCategoryData[tx.category] =
              (yearlyCategoryData[tx.category] || 0) + tx.amount;
          }
        });

        setYearlyCategoryExpenseData({
          categories: Object.keys(yearlyCategoryData),
          data: Object.values(yearlyCategoryData),
        });
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-5">
      <div className="max-w-5xl mx-auto">
        <Header />

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <BarChartBig className="w-7 h-7 text-indigo-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Advanced Charts
            </h1>
          </div>
          <Menu />
        </div>
        {/* <h2 className="text-xl font-bold mb-4 text-indigo-400">
          Daily Inflow vs Expense
        </h2>
        <HighchartsReact
          highcharts={Highcharts}
          options={{
            chart: { type: "column", backgroundColor: "transparent" },
            title: { text: "" },
            xAxis: {
              categories: dailyBarData.categories,
              labels: { style: { color: "#fff" } },
            },
            yAxis: {
              title: { text: "Amount", style: { color: "#fff" } },
              labels: { style: { color: "#fff" } },
            },
            legend: { itemStyle: { color: "#fff" } },
            series: [
              { name: "Inflow", data: dailyBarData.inflow, color: "#4ade80" },
              { name: "Expense", data: dailyBarData.expense, color: "#f87171" },
            ],
          }}
        />
      </div> */}
      </div>
      {/* Monthly Bar Chart */}
      <div className=" max-w-5xl mt-20 mx-auto p-6 rounded-xl shadow-xl ">
        <h2 className="text-xl font-bold mb-4 text-indigo-400">
          Monthly Inflow vs Expense
        </h2>
        <HighchartsReact
          highcharts={Highcharts}
          options={{
            chart: { type: "column", backgroundColor: "transparent" },
            title: { text: "" },
            xAxis: {
              categories: monthlyBarData.categories,
              labels: { style: { color: "#fff" } },
            },
            yAxis: {
              title: { text: "Amount", style: { color: "#fff" } },
              labels: { style: { color: "#fff" } },
            },
            legend: { itemStyle: { color: "#fff" } },
            series: [
              { name: "Inflow", data: monthlyBarData.inflow, color: "#4ade80" },
              {
                name: "Expense",
                data: monthlyBarData.expense,
                color: "#f87171",
              },
            ],
          }}
        />
      </div>

      {/* Monthly Savings Line */}
      <div className="max-w-5xl mt-20 mx-auto p-6 rounded-xl shadow-xl ">
        <h2 className="text-xl font-bold mb-4 text-indigo-400">
          Monthly Savings
        </h2>
        <HighchartsReact
          highcharts={Highcharts}
          options={{
            chart: { type: "line", backgroundColor: "transparent" },
            title: { text: "" },
            xAxis: {
              categories: monthlySavingsData.categories,
              labels: { style: { color: "#fff" } },
            },
            yAxis: {
              title: { text: "Savings", style: { color: "#fff" } },
              labels: { style: { color: "#fff" } },
            },
            legend: { itemStyle: { color: "#fff" } },
            series: [
              {
                name: "Savings",
                data: monthlySavingsData.data,
                color: "#60a5fa",
              },
            ],
          }}
        />
      </div>

      {/* Yearly Category Expense Pie */}
      <div className="max-w-5xl mt-20 mx-auto p-6 rounded-xl shadow-xl ">
        <h2 className="text-xl font-bold mb-4 text-indigo-400">
          Yearly Category Expenses
        </h2>
        <HighchartsReact
          highcharts={Highcharts}
          options={{
            chart: { type: "pie", backgroundColor: "transparent" },
            title: { text: "" },
            legend: { itemStyle: { color: "#fff" } },
            series: [
              {
                name: "Expense",
                colorByPoint: true,
                data: yearlyCategoryExpenseData.categories.map((c, i) => ({
                  name: c,
                  y: yearlyCategoryExpenseData.data[i],
                })),
              },
            ],
          }}
        />
      </div>
      <FloatingTransactionButton />
      <Footer />
    </main>
  );
};

export default AdvancedChartsPage;
