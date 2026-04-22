"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { AddTransactionForm } from "../../components/AddTransactionForm";
import { TxnCard } from "../../components/TxnCard";
import Link from "next/link";
import Menu from "@/components/Menu";
import {
  BanknoteArrowUp,
  FileDigit,
  RefreshCcwDot,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  RefreshCw,
  HandMetal,
  Pencil,
  Trash2,
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import axios from "axios";
import CountUp from "@/components/CountUp";
import { SkeletonCard, SkeletonTransactionRow } from "@/components/SkeletonLoader";
import MonthlyReport from "@/components/MonthlyReport";
import BottomNav from "@/components/BottomNav";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryConfig";
import DashboardInsights from "@/components/DashboardInsights";
import MonthEndReview from "@/components/MonthEndReview";
import { useAuthGuard } from "@/hooks/useAuthGuard";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-8 pb-24">
      <div className={menuOpen ? "overflow-hidden h-screen" : ""}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <Header />

          {/* Dashboard Title Row */}
          <div className="mb-5 mt-4 flex items-center justify-between">
            <div className="mt-0">
              <div className="flex items-center gap-2">
                <FileDigit color="#00d138" />
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
              </div>
              <p className="text-gray-400 mt-1 flex items-center font-bold gap-x-1">
                Welcome back <HandMetal color="#ff9900" />,{" "}
                <span className="text-green-300">{user?.name || "User"}</span>
              </p>
            </div>

            <div className="mb-12">
              <Menu />
            </div>

            {menuOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setMenuOpen(false)}
              />
            )}
          </div>

          {/* Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-gray-900/90 via-indigo-950/40 to-gray-900/90 border border-indigo-500/20 rounded-2xl p-6 mb-6 shadow-xl"
          >
            {/* Top row: month + savings badge */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-bold text-gray-400">
                {monthName} {now.getFullYear()}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                  savingsRate >= 0
                    ? "bg-green-500/15 text-green-300 border-green-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                }`}
              >
                {savingsRate}% saved
              </span>
            </div>

            {/* Income & Expenses columns */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <Link href="/inflow">
                  <p className="text-xs font-semibold text-green-300 uppercase tracking-wider mb-1">
                    Income
                  </p>
                  {loading ? (
                    <div className="h-10 w-32 bg-gray-700/50 rounded-lg animate-pulse" />
                  ) : (
                    <CountUp
                      end={inflow}
                      prefix="₹"
                      className="text-4xl font-black text-green-300"
                    />
                  )}
                </Link>
              </div>
              <div>
                <Link href="/expenses">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
                    Expenses
                  </p>
                  {loading ? (
                    <div className="h-10 w-32 bg-gray-700/50 rounded-lg animate-pulse" />
                  ) : (
                    <CountUp
                      end={expense}
                      prefix="₹"
                      className="text-4xl font-black text-red-400"
                    />
                  )}
                </Link>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700/50 mb-4" />

            {/* Net Savings row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Net Savings</p>
                {loading ? (
                  <div className="h-7 w-24 bg-gray-700/50 rounded-lg animate-pulse" />
                ) : (
                  <CountUp
                    end={Math.abs(net)}
                    prefix={net >= 0 ? "₹" : "-₹"}
                    className={`text-2xl font-black ${
                      net >= 0 ? "text-green-300" : "text-red-400"
                    }`}
                  />
                )}
              </div>
              {!loading && (
                <div className="text-right">
                  <span className="text-xs text-gray-500">Today&apos;s Spend</span>
                  <p className="text-sm font-bold text-orange-400">
                    ₹{today.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Month-end review — visible days 1-3 of new month */}
          {!loading && (
            <MonthEndReview transactions={txs} userName={user?.name} />
          )}

          {/* Legacy TxnCards (hidden on mobile, compact grid) */}
          <div className="hidden sm:grid grid-cols-3 gap-3 mb-6">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <Link href="/inflow">
                  <TxnCard
                    title={`Total Inflow (${monthName})`}
                    amount={`₹${inflow.toLocaleString()}`}
                    color="text-green-300"
                    icon={<ArrowDownCircle className="w-5 h-5 text-green-300" />}
                  />
                </Link>
                <Link href="/expenses">
                  <TxnCard
                    title={`Total Expenses (${monthName})`}
                    amount={`₹${expense.toLocaleString()}`}
                    color="text-red-500"
                    icon={<ArrowUpCircle className="w-5 h-5 text-red-500" />}
                  />
                </Link>
                <TxnCard
                  title={`Savings (${monthName})`}
                  amount={`₹${net.toLocaleString()}`}
                  color="text-gray-300"
                  icon={<Wallet className="w-5 h-5 text-gray-300" />}
                />
              </>
            )}
          </div>

          {/* Add Transaction Form */}
          <AddTransactionForm onAdd={fetchTransactions} />

          {/* Recent Transactions */}
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-xl p-6 shadow-lg mt-6">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCcwDot color="#ec4899" />
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
            </div>

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
                      <li className="group flex justify-between items-center p-4 bg-white/2 hover:bg-white/10 backdrop-blur-md border border-gray-800 rounded-xl transition-all duration-300 cursor-pointer shadow-md">
                        <div className="flex items-center gap-3">
                          <div
                            className={`${colors.bg} border ${colors.border} p-2 rounded-full`}
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
                            {tx.type === "income" ? "+ " : "- "}₹ {tx.amount}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setEditingTx(tx);
                            }}
                            className="p-2 rounded-lg text-gray-700 hover:text-indigo-400 hover:bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
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
                            className="p-2 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
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

            {!loading && (
              <div className="font-bold text-blue-400 mt-3 text-right">
                <Link href="/transactions">See All Transactions</Link>
              </div>
            )}
          </div>

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
