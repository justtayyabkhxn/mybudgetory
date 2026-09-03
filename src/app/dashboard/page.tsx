"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { AddTransactionForm } from "../../components/AddTransactionForm";
import Link from "next/link";
import Menu from "@/components/Menu";
import {
  BanknoteArrowUp,
  FileDigit,
  RefreshCcwDot,
  RefreshCw,
  HandMetal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import axios from "axios";
import CountUp from "@/components/CountUp";
import { SkeletonTransactionRow } from "@/components/SkeletonLoader";
import MonthlyReport from "@/components/MonthlyReport";
import BottomNav from "@/components/BottomNav";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryConfig";
import DashboardInsights, { SpendingPaceCard } from "@/components/DashboardInsights";
import AIAdviceBanner from "@/components/AIAdviceBanner";
import MonthEndReview from "@/components/MonthEndReview";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { usePrivacyMode } from "@/hooks/usePrivacyMode";
import { apiFetch } from "@/utils/apiFetch";
import { toast } from "@/lib/toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import EditTransactionModal from "@/components/EditTransactionModal";

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

type User = {
  name: string;
  email: string;
  phone: string;
};

export default function Dashboard() {
  useAuthGuard();
  const { hidden, toggle } = usePrivacyMode();

  const [user, setUser] = useState<User | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const { inflow, expense, net, today } = useMemo(() => {
    const now = new Date();
    const cm = now.getMonth(), cy = now.getFullYear();
    const inflowSum  = txs.filter(tx => tx.type === "income"  && new Date(tx.date).getMonth() === cm && new Date(tx.date).getFullYear() === cy).reduce((s, tx) => s + tx.amount, 0);
    const expenseSum = txs.filter(tx => tx.type === "expense" && new Date(tx.date).getMonth() === cm && new Date(tx.date).getFullYear() === cy).reduce((s, tx) => s + tx.amount, 0);
    const todaySum   = txs.filter(tx => { const d = new Date(tx.date); return tx.type === "expense" && d.getDate() === now.getDate() && d.getMonth() === cm && d.getFullYear() === cy; }).reduce((s, tx) => s + tx.amount, 0);
    return { inflow: inflowSum, expense: expenseSum, net: inflowSum - expenseSum, today: todaySum };
  }, [txs]);

  useEffect(() => {
    function preventTouchMove(e: TouchEvent) {
      e.preventDefault();
    }
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("touchmove", preventTouchMove, {
        passive: false,
      });
    } else {
      document.body.style.overflow = "auto";
      document.removeEventListener("touchmove", preventTouchMove);
    }
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("touchmove", preventTouchMove);
    };
  }, [menuOpen]);

  // Fetch profile via auth token (no email exposure)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios.get("/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(({ data }) => setUser(data)).catch(console.error);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/transactions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTxs((prev) => prev.filter((tx) => tx._id !== id));
      } else {
        toast("Failed to delete transaction", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast("Failed to delete transaction", "error");
    }
  };

  const fetchTransactions = useCallback(() => {
    setLoading(true);
    apiFetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => { if (data.transactions) setTxs(data.transactions); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long" });
  const savingsRate =
    inflow > 0 ? Math.round(((inflow - expense) / inflow) * 100) : 0;

  return (
    <div className="min-h-screen md:pt-20 text-ink p-4 sm:p-8 pb-24">
      <div className={menuOpen ? "overflow-hidden h-screen" : ""}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="md:hidden">
            <Header />
          </div>

          {/* Dashboard Title Row */}
          <div className="mb-5 mt-4 flex items-start justify-between">
            <div className="mt-0">
              <div className="flex items-center gap-2">
                <FileDigit color="var(--color-positive)" />
                <h1 className="text-4xl font-extrabold tracking-tight">
                  Dashboard
                </h1>
                <button
                  onClick={() => fetchTransactions()}
                  className="ml-2 mt-1 p-1 rounded cursor-pointer"
                  title="Refresh Data"
                >
                  <RefreshCw
                    className={`w-6 h-6 text-green-300 ${
                      loading ? "animate-spin" : ""
                    }`}
                  />
                </button>
                <button
                  onClick={toggle}
                  className="mt-1 p-1 rounded cursor-pointer text-gray-500 hover:text-gray-300"
                  title={hidden ? "Show amounts" : "Hide amounts"}
                >
                  {hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-gray-400 mt-1 flex items-center font-bold gap-x-1">
                Welcome back <HandMetal color="var(--color-warning-deep)" />,{" "}
                <span className="text-green-300">{user?.name || "User"}</span>
              </p>
            </div>

            {/* Top-aligned so the 40px button lines up with the title row —
                the same header pattern the other pages use. */}
            <Menu />

            {menuOpen && (
              <div
                className="fixed inset-0 bg-scrim/50 z-40"
                onClick={() => setMenuOpen(false)}
              />
            )}
          </div>

          {/* Hero stats + Add Transaction form: stacked on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-start">
          {/* Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="order-1 lg:order-1 h-full bg-canvas/80 rounded-2xl p-6 shadow-xl"
          >
            {/* Top row: month + savings badge */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-bold text-gray-400">
                {monthName} {now.getFullYear()}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  savingsRate >= 0
                    ? "bg-green-500/15 text-green-300"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {savingsRate}% saved
              </span>
            </div>

            {/* Stat tiles: Income / Expenses / Net Savings */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-5">
              <Link
                href="/inflow"
                className="bg-canvas-soft/80 hover:bg-primary-pale rounded-xl p-3 sm:p-4 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <ArrowDownCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <p className="text-[10px] sm:text-xs font-semibold text-green-300 uppercase tracking-wider truncate">
                    Income
                  </p>
                </div>
                {loading ? (
                  <div className="h-7 sm:h-8 w-full bg-gray-700/50 rounded-lg animate-pulse" />
                ) : hidden ? (
                  <p className="text-lg sm:text-2xl font-black text-green-300">₹ ******</p>
                ) : (
                  <CountUp
                    end={inflow}
                    prefix="₹"
                    className="text-lg sm:text-2xl font-black text-green-300"
                  />
                )}
              </Link>

              <Link
                href="/expenses"
                className="bg-canvas-soft/80 hover:bg-primary-pale rounded-xl p-3 sm:p-4 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <ArrowUpCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <p className="text-[10px] sm:text-xs font-semibold text-red-400 uppercase tracking-wider truncate">
                    Expenses
                  </p>
                </div>
                {loading ? (
                  <div className="h-7 sm:h-8 w-full bg-gray-700/50 rounded-lg animate-pulse" />
                ) : hidden ? (
                  <p className="text-lg sm:text-2xl font-black text-red-400">₹ ******</p>
                ) : (
                  <CountUp
                    end={expense}
                    prefix="₹"
                    className="text-lg sm:text-2xl font-black text-red-400"
                  />
                )}
                {!loading && (
                  <p className="text-[10px] text-gray-500 font-medium mt-1">
                    {hidden ? "today ₹ ******" : `today ₹${today.toLocaleString()}`}
                  </p>
                )}
              </Link>

              <div className="bg-canvas-soft/80 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <PiggyBank className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                  <p className="text-[10px] sm:text-xs font-semibold text-indigo-300 uppercase tracking-wider truncate">
                    Savings
                  </p>
                </div>
                {loading ? (
                  <div className="h-7 sm:h-8 w-full bg-gray-700/50 rounded-lg animate-pulse" />
                ) : hidden ? (
                  <p className={`text-lg sm:text-2xl font-black ${net >= 0 ? "text-green-300" : "text-red-400"}`}>
                    ₹ ******
                  </p>
                ) : (
                  <CountUp
                    end={Math.abs(net)}
                    prefix={net >= 0 ? "₹" : "-₹"}
                    className={`text-lg sm:text-2xl font-black ${
                      net >= 0 ? "text-green-300" : "text-red-400"
                    }`}
                  />
                )}
              </div>
            </div>

            {/* Spend vs income bar */}
            {!loading && inflow > 0 && (
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-gray-500 font-semibold">
                  {Math.min(100, Math.round((expense / inflow) * 100))}% of this month&apos;s income spent
                </p>
                <div className="w-16 sm:w-20 h-1.5 rounded-full bg-canvas/80 overflow-hidden shrink-0">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.round((expense / inflow) * 100))}%` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                    className={`h-full rounded-full ${
                      expense / inflow > 0.9
                        ? "bg-negative"
                        : expense / inflow > 0.65
                        ? "bg-warning"
                        : "bg-positive"
                    }`}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Add Transaction Form */}
          <div className="order-3 lg:order-2">
            <AddTransactionForm onAdd={fetchTransactions} />
          </div>

          {/* Month-end review — visible days 1-3 of new month */}
          {!loading && (
            <div className="order-2 lg:order-3 lg:col-span-2">
              <MonthEndReview transactions={txs} userName={user?.name} />
            </div>
          )}
          </div>

          {/* Recent Transactions + Spending Pace — side by side on desktop, matched height */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 lg:items-stretch">
          <div className="bg-canvas/80 rounded-xl p-6 flex flex-col lg:h-full lg:min-h-0">
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <RefreshCcwDot className="text-ink-deep" />
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
            </div>

            <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
            {loading ? (
              <div className="space-y-3">
                <SkeletonTransactionRow />
                <SkeletonTransactionRow />
                <SkeletonTransactionRow />
              </div>
            ) : txs.length === 0 ? (
              <p className="text-gray-400">No transactions yet.</p>
            ) : (
              <ul className="space-y-3 border-gray-900">
                {[...txs].slice(0, 5).map((tx) => {
                  const Icon = CATEGORY_ICONS[tx.category] || BanknoteArrowUp;
                  const colors =
                    CATEGORY_COLORS[tx.category] || CATEGORY_COLORS["Others"];

                  return (
                    <Link
                      href={`/transactions/${tx._id}`}
                      key={tx._id}
                      className="block"
                    >
                      <li className="group flex justify-between items-center p-4 bg-canvas-soft/80 hover:bg-primary-pale backdrop-blur-md rounded-xl transition-all duration-300 cursor-pointer shadow-md">
                        <div className="flex items-center gap-3">
                          <div
                            className={`${colors.bg} p-2 rounded-full`}
                          >
                            <Icon className={`w-5 h-5 ${colors.text}`} />
                          </div>
                          <div>
                            <p className="font-bold">{tx.title}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(tx.date).toLocaleDateString()} &bull;{" "}
                              {tx.category} &bull; {tx.paymentMode}
                            </p>
                            <p className="text-sm text-gray-400">{tx.comment}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-1">
                          <p
                            className={`font-bold ${
                              tx.type === "income"
                                ? "text-green-300"
                                : "text-red-400"
                            }`}
                          >
                            {hidden ? "₹ ******" : `${tx.type ==="income" ?"+ " :"- "}₹ ${tx.amount}`}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setEditingTx(tx);
                            }}
                            className="p-2 rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                            aria-label="Edit transaction"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setConfirmDeleteId(tx._id);
                            }}
                            className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                            aria-label="Delete transaction"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </li>
                    </Link>
                  );
                })}
              </ul>
            )}
            </div>

            {!loading && (
              <div className="font-bold text-blue-400 mt-3 text-right shrink-0">
                <Link href="/transactions">See All Transactions</Link>
              </div>
            )}
          </div>

          <SpendingPaceCard txs={txs} inflow={inflow} expense={expense} loading={loading} />
          </div>

          {/* ── AI Advice: Monday (weekly) + days 1-3 of month (monthly) ── */}
          <AIAdviceBanner txs={txs} loading={loading} />

          {/* ── Insights: Velocity, Race, Health, Streak, Digest, What If ── */}
          <DashboardInsights txs={txs} inflow={inflow} expense={expense} loading={loading} />

          {/* Monthly Report */}
          <MonthlyReport transactions={txs} userName={user?.name || "User"} />
        </div>
      </div>

      <Footer />
      <BottomNav />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete Transaction"
        message="This will permanently remove this transaction."
        confirmLabel="Delete"
        danger
        onConfirm={() => { if (confirmDeleteId) { handleDelete(confirmDeleteId); setConfirmDeleteId(null); } }}
        onCancel={() => setConfirmDeleteId(null)}
      />
      <EditTransactionModal
        tx={editingTx}
        onClose={() => setEditingTx(null)}
        onSave={updated => setTxs(prev => prev.map(t => t._id === updated._id ? { ...t, ...updated } : t))}
      />
    </div>
  );
}
