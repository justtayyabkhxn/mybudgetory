"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { motion } from "framer-motion";
import MenuButton from "@/components/Menu";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingTransactionButton from "@/components/FloatingTransactionButton";
import BottomNav from "@/components/BottomNav";
import { SkeletonTransactionRow } from "@/components/SkeletonLoader";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryConfig";
import ConfirmDialog from "@/components/ConfirmDialog";
import EditTransactionModal from "@/components/EditTransactionModal";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiFetch } from "@/utils/apiFetch";
import { toast } from "@/lib/toast";
import {
  Search, Receipt, ChevronLeft, ChevronRight,
  Download, Trash2, ArrowDownCircle, ArrowUpCircle,
  X, TrendingUp, TrendingDown, Wallet, ExternalLink, Pencil,
  ArrowUpDown,
} from "lucide-react";

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

const PAGE_SIZE = 20;

interface Transaction {
  _id: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
  comment?: string;
  paymentMode: "Cash" | "UPI";
}

export default function Transactions() {
  useAuthGuard();

  const [txs, setTxs] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "income" | "expense">("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  const fetchTransactions = () => {
    setLoading(true);
    apiFetch("/api/transactions")
      .then(r => r.json())
      .then(data => { if (data.transactions) setTxs(data.transactions); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, []);
  useEffect(() => { setPage(1); }, [searchQuery, typeFilter, sortBy]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/transactions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTxs(prev => prev.filter(tx => tx._id !== id));
        toast("Transaction deleted", "success");
      } else {
        toast(data.error || "Failed to delete", "error");
      }
    } catch (e) {
      console.error(e);
      toast("Failed to delete transaction", "error");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(txs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering
  const filtered = txs.filter(tx => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.comment || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter ? tx.type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === "date-asc")  return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === "amount-desc") return b.amount - a.amount;
    return a.amount - b.amount;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Summary stats for filtered view
  const filteredIncome  = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const filteredExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const filteredNet     = filteredIncome - filteredExpense;

  const SORT_LABELS: Record<SortOption, string> = {
    "date-desc": "Newest",
    "date-asc": "Oldest",
    "amount-desc": "Highest",
    "amount-asc": "Lowest",
  };

  // Group paginated txs by date
  const grouped = paginated.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const key = new Date(tx.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  return (
    <div className="min-h-screen md:pt-20 text-ink p-4 sm:p-8 pb-28">
      <div className="max-w-5xl mx-auto">
        <div className="md:hidden">
          <Header />
        </div>

        {/* Page title row */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="flex items-center gap-2">
            <Receipt className="text-green-400" size={26} />
            <h1 className="text-3xl font-extrabold tracking-tight">Transactions</h1>
          </div>
          <MenuButton />
        </div>

        {/* Summary bar */}
        {!loading && txs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-3 gap-3 mb-5"
          >
            <div className="bg-green-900/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-green-500/15 p-2 rounded-xl hidden sm:flex">
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-green-400/70 uppercase tracking-wider">Income</p>
                <p className="text-lg font-black text-green-400">₹{filteredIncome.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-red-900/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-red-500/15 p-2 rounded-xl hidden sm:flex">
                <TrendingDown size={16} className="text-red-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-red-400/70 uppercase tracking-wider">Expenses</p>
                <p className="text-lg font-black text-red-400">₹{filteredExpense.toLocaleString()}</p>
              </div>
            </div>
            <div className={`${filteredNet >= 0 ? "bg-emerald-900/20" : "bg-orange-900/20"} rounded-2xl p-4 flex items-center gap-3`}>
              <div className={`${filteredNet >= 0 ? "bg-emerald-500/15" : "bg-orange-500/15"} p-2 rounded-xl hidden sm:flex`}>
                <Wallet size={16} className={filteredNet >= 0 ? "text-emerald-400" : "text-warning-deep"} />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${filteredNet >= 0 ? "text-emerald-400/70" : "text-warning-deep/70"}`}>Net</p>
                <p className={`text-lg font-black ${filteredNet >= 0 ? "text-emerald-400" : "text-warning-deep"}`}>
                  {filteredNet >= 0 ? "+" : ""}₹{Math.abs(filteredNet).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-canvas/80 text-ink placeholder-gray-500 rounded-xl pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-ink cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Type filter pills */}
          <div className="flex bg-gray-900/80 rounded-xl p-1 gap-1 flex-shrink-0">
            {(["", "income", "expense"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  typeFilter === t
                    ? t === "income" ? "bg-green-500/20 text-green-400"
                    : t === "expense" ? "bg-red-500/20 text-red-400"
                    : "bg-indigo-500/20 text-indigo-400"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {t === "income" && <ArrowDownCircle size={11} />}
                {t === "expense" && <ArrowUpCircle size={11} />}
                {t === "" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-shrink-0">
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="appearance-none flex items-center gap-1.5 pl-8 pr-3 py-2.5 bg-canvas/80 hover:bg-primary-pale text-body rounded-xl text-xs font-bold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="date-desc">Newest</option>
                <option value="date-asc">Oldest</option>
                <option value="amount-desc">Highest</option>
                <option value="amount-asc">Lowest</option>
              </select>
              <ArrowUpDown size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <Link href="/advanced-search">
              <button className="flex items-center gap-1.5 px-3 py-2.5 bg-canvas/80 hover:bg-canvas-soft/80 text-gray-300 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                <ExternalLink size={13} />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </Link>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-on-primary rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-gray-900/60 rounded-2xl p-4 space-y-3">
            {[...Array(6)].map((_, i) => <SkeletonTransactionRow key={i} />)}
          </div>
        ) : txs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center bg-gray-900/40 rounded-2xl"
          >
            <Receipt size={56} className="text-ink mb-4" />
            <p className="text-xl font-bold text-gray-400 mb-2">No transactions yet</p>
            <p className="text-sm text-gray-600 mb-5">Add your first transaction from the dashboard</p>
            <Link href="/dashboard" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-on-primary rounded-xl text-sm font-bold transition-colors">
              Go to Dashboard
            </Link>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center bg-gray-900/40 rounded-2xl"
          >
            <Search size={48} className="text-ink mb-3" />
            <p className="text-lg font-bold text-gray-400 mb-1">No matches found</p>
            <p className="text-sm text-gray-600">Try different search terms or clear filters</p>
            <button onClick={() => { setSearchQuery(""); setTypeFilter(""); }} className="mt-4 px-4 py-2 bg-canvas/80 hover:bg-canvas-soft/80 text-gray-400 rounded-xl text-sm font-bold transition-colors cursor-pointer">
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="bg-gray-900/60 rounded-2xl overflow-hidden">
            {/* Date-grouped transaction list */}
            {Object.entries(grouped).map(([dateLabel, dayTxs]) => {
              const dayTotal = dayTxs.reduce((s, t) => t.type === "expense" ? s - t.amount : s + t.amount, 0);
              return (
                <div key={dateLabel}>
                  {/* Date separator */}
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-900/60 border-b border-gray-800/60">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{dateLabel}</span>
                    <span className={`text-xs font-bold ${dayTotal >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {dayTotal >= 0 ? "+" : ""}₹{Math.abs(dayTotal).toLocaleString()}
                    </span>
                  </div>

                  {/* Rows for this day */}
                  <ul className="divide-y divide-gray-800/50">
                    {dayTxs.map((tx, idx) => {
                      const colors = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS["Others"];
                      const Icon   = CATEGORY_ICONS[tx.category]  || CATEGORY_ICONS["Others"];
                      return (
                        <motion.li
                          key={tx._id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.18, delay: idx * 0.025 }}
                          className="group"
                        >
                          <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-canvas-soft/80 transition-colors duration-150">
                            {/* Category icon */}
                            <div className={`${colors.bg} p-2.5 rounded-xl flex-shrink-0`}>
                              <Icon className={`w-4 h-4 ${colors.text}`} />
                            </div>

                            {/* Main info — clickable */}
                            <Link href={`/transactions/${tx._id}`} className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-100 text-sm truncate leading-none">{tx.title}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
                                      {tx.category}
                                    </span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                      tx.paymentMode === "UPI"
                                        ? "bg-indigo-500/15 text-indigo-400"
                                        : "bg-yellow-500/15 text-warning-deep"
                                    }`}>
                                      {tx.paymentMode}
                                    </span>
                                    {tx.comment && (
                                      <span className="text-[10px] text-gray-500 italic truncate max-w-[140px]">{tx.comment}</span>
                                    )}
                                  </div>
                                </div>

                                {/* Amount */}
                                <div className="text-right flex-shrink-0">
                                  <p className={`font-black text-base leading-none ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                                    {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </Link>

                            {/* Edit button — always visible on mobile, hover on desktop */}
                            <button
                              onClick={() => setEditingTx(tx)}
                              className="flex-shrink-0 p-2 rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                              aria-label="Edit transaction"
                            >
                              <Pencil size={14} />
                            </button>

                            {/* Delete button — always visible on mobile, hover on desktop */}
                            <button
                              onClick={() => setConfirmId(tx._id)}
                              disabled={deletingId === tx._id}
                              className="flex-shrink-0 p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-gray-800 bg-gray-900/40">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-4 py-2 bg-canvas/80 hover:bg-canvas-soft/80 rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft size={15} /> Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                    const isDotStart = !show && p === 2 && page > 3;
                    const isDotEnd   = !show && p === totalPages - 1 && page < totalPages - 2;
                    if (isDotStart || isDotEnd) return <span key={p} className="text-gray-600 text-sm px-1">…</span>;
                    if (!show) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                          page === p ? "bg-indigo-600 text-on-primary" : "bg-canvas/80 hover:bg-canvas-soft/80 text-gray-400"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 bg-canvas/80 hover:bg-canvas-soft/80 rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            )}

            {/* Count */}
            <p className="text-center text-xs text-gray-600 py-2 border-t border-gray-800/40">
              Showing {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} transactions
            </p>
          </div>
        )}
      </div>

      <Footer />
      <FloatingTransactionButton onAdd={fetchTransactions} />
      <BottomNav />

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete Transaction"
        message="This will permanently remove this transaction."
        confirmLabel="Delete"
        danger
        onConfirm={() => { if (confirmId) handleDelete(confirmId); }}
        onCancel={() => setConfirmId(null)}
      />
      <EditTransactionModal
        tx={editingTx}
        onClose={() => setEditingTx(null)}
        onSave={updated => {
          setTxs(prev => prev.map(t => t._id === updated._id ? updated : t));
          toast("Transaction updated!", "success");
        }}
      />

    </div>
  );
}
