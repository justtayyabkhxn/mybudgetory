"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Edit3,
  Save,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuButton from "@/components/Menu";
import BottomNav from "@/components/BottomNav";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryConfig";

interface Transaction {
  _id: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
}

interface BudgetGoal {
  _id: string;
  category: string;
  limitAmount: number;
  month: number;
  year: number;
}

const ALL_CATEGORIES = [
  "Food",
  "Outing",
  "Clothes",
  "Travel",
  "Medical",
  "Entertainment",
  "Bills",
  "SMM",
  "Others",
];

export default function BudgetGoalsPage() {
  const router = useRouter();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<BudgetGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState<string>("");
  const [savingCategory, setSavingCategory] = useState<string | null>(null);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

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
    fetchData(token);
  }, []);

  const fetchData = async (token: string) => {
    setLoading(true);
    try {
      const [txRes, goalRes] = await Promise.all([
        fetch("/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `/api/budget-goals?month=${currentMonth}&year=${currentYear}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      const txData = await txRes.json();
      const goalData = await goalRes.json();

      if (txData.transactions) setTxs(txData.transactions);
      if (goalData.goals) setGoals(goalData.goals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSpentForCategory = (category: string) => {
    return txs
      .filter(
        (tx) =>
          tx.type === "expense" &&
          tx.category === category &&
          new Date(tx.date).getMonth() === currentMonth &&
          new Date(tx.date).getFullYear() === currentYear
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const getGoalForCategory = (category: string) =>
    goals.find((g) => g.category === category);

  const totalSpent = txs
    .filter(
      (tx) =>
        tx.type === "expense" &&
        new Date(tx.date).getMonth() === currentMonth &&
        new Date(tx.date).getFullYear() === currentYear
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalLimit = goals.reduce((sum, g) => sum + g.limitAmount, 0);

  const handleSaveLimit = async (category: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const amount = parseFloat(limitInput);
    if (isNaN(amount) || amount <= 0) return;

    setSavingCategory(category);
    try {
      const res = await fetch("/api/budget-goals", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          limitAmount: amount,
          month: currentMonth,
          year: currentYear,
        }),
      });

      const data = await res.json();
      if (data.goal) {
        setGoals((prev) => {
          const exists = prev.find((g) => g.category === category);
          if (exists) {
            return prev.map((g) =>
              g.category === category ? data.goal : g
            );
          }
          return [...prev, data.goal];
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCategory(null);
      setEditingCategory(null);
      setLimitInput("");
    }
  };

  const handleDeleteGoal = async (category: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch("/api/budget-goals", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          month: currentMonth,
          year: currentYear,
        }),
      });

      setGoals((prev) => prev.filter((g) => g.category !== category));
    } catch (err) {
      console.error(err);
    }
  };

  const getProgressColor = (spent: number, limit: number) => {
    if (!limit) return "bg-gray-600";
    const pct = (spent / limit) * 100;
    if (pct > 100) return "bg-red-500";
    if (pct >= 80) return "bg-orange-500";
    if (pct >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getBadge = (spent: number, limit: number) => {
    if (!limit) return null;
    const pct = (spent / limit) * 100;
    if (pct > 100)
      return (
        <span className="text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertTriangle size={10} /> Over Budget!
        </span>
      );
    if (pct >= 80)
      return (
        <span className="text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertTriangle size={10} /> Warning
        </span>
      );
    if (pct >= 1)
      return (
        <span className="text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle size={10} /> On Track
        </span>
      );
    return null;
  };

  const monthName = now.toLocaleString("default", { month: "long" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        <Header />

        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="flex items-center gap-2">
            <Target className="text-orange-400" size={28} />
            <h1 className="text-3xl font-extrabold tracking-tight">
              Budget Goals
            </h1>
          </div>
          <MenuButton />
        </div>

        {/* Total Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 border border-indigo-500/20 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="text-indigo-400" size={20} />
            <span className="text-lg font-bold text-gray-200">
              {monthName} {currentYear} — Total Budget Overview
            </span>
          </div>
          <div className="flex items-end gap-6 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 mb-1">Total Spent</p>
              <p className="text-3xl font-black text-red-400">
                ₹{totalSpent.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Total Limit</p>
              <p className="text-3xl font-black text-indigo-400">
                {totalLimit > 0 ? `₹${totalLimit.toLocaleString()}` : "—"}
              </p>
            </div>
            {totalLimit > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Utilization</p>
                <p
                  className={`text-3xl font-black ${
                    totalSpent > totalLimit
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {Math.round((totalSpent / totalLimit) * 100)}%
                </p>
              </div>
            )}
          </div>
          {totalLimit > 0 && (
            <div className="mt-4 h-3 bg-gray-700/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getProgressColor(
                  totalSpent,
                  totalLimit
                )}`}
                style={{
                  width: `${Math.min(
                    (totalSpent / totalLimit) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          )}
        </motion.div>

        {/* Category Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-800/60 rounded-2xl p-5 h-36"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ALL_CATEGORIES.map((category, idx) => {
              const colors =
                CATEGORY_COLORS[category] || CATEGORY_COLORS["Others"];
              const Icon = CATEGORY_ICONS[category] || CATEGORY_ICONS["Others"];
              const spent = getSpentForCategory(category);
              const goal = getGoalForCategory(category);
              const limit = goal?.limitAmount || 0;
              const pct = limit ? Math.min((spent / limit) * 100, 100) : 0;
              const isEditing = editingCategory === category;

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`bg-gray-900/80 border ${colors.border} rounded-2xl p-5 hover:bg-gray-800/80 transition-colors duration-200`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`${colors.bg} p-2.5 rounded-xl border ${colors.border}`}
                      >
                        <Icon className={`${colors.text} w-5 h-5`} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-100">{category}</p>
                        <p className="text-xs text-gray-400">
                          Spent:{" "}
                          <span className="text-red-400 font-semibold">
                            ₹{spent.toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {getBadge(spent, limit)}
                    </div>
                  </div>

                  {/* Limit display */}
                  {limit > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>₹{spent.toLocaleString()} spent</span>
                        <span>₹{limit.toLocaleString()} limit</span>
                      </div>
                      <div className="h-2 bg-gray-700/60 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${getProgressColor(
                            spent,
                            limit
                          )}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.05 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Edit inline */}
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-3">
                      <input
                        type="number"
                        value={limitInput}
                        onChange={(e) => setLimitInput(e.target.value)}
                        placeholder="Enter limit ₹"
                        className="flex-1 bg-gray-700/60 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveLimit(category)}
                        disabled={savingCategory === category}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Save size={14} />
                        <span>

                        {savingCategory === category ? "..." : "Save"}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory(null);
                          setLimitInput("");
                        }}
                        className="text-gray-400 hover:text-white p-2 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setLimitInput(limit ? limit.toString() : "");
                        }}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border ${colors.border} ${colors.text} ${colors.bg} hover:opacity-80 transition-opacity cursor-pointer`}
                      >
                        <Edit3 size={12} />
                        <span>

                        {limit > 0 ? "Edit Limit" : "Set Limit"}
                        </span>
                      </button>
                      {limit > 0 && (
                        <button
                          onClick={() => handleDeleteGoal(category)}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>

                          Remove
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}
