"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import MenuButton from "@/components/Menu";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingTransactionButton from "@/components/FloatingTransactionButton";
import BottomNav from "@/components/BottomNav";
import { SkeletonTransactionRow } from "@/components/SkeletonLoader";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryConfig";
import {
  Search, Receipt, ChevronLeft, ChevronRight,
  Download, Trash2, ArrowDownCircle, ArrowUpCircle,
  X, TrendingUp, TrendingDown, Wallet, ExternalLink,
} from "lucide-react";

const PAGE_SIZE = 20;

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

export default function Transactions() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "income" | "expense">("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    try { JSON.parse(atob(token.split(".")[1])); }
    catch { localStorage.removeItem("token"); router.push("/login"); }
  }, []);

  const fetchTransactions = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    fetch("/api/transactions", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.transactions) setTxs(data.transactions); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, []);
  useEffect(() => { setPage(1); }, [searchQuery, typeFilter]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this transaction?")) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setTxs(prev => prev.filter(tx => tx._id !== id));
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); }
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Summary stats for filtered view
  const filteredIncome  = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const filteredExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const filteredNet     = filteredIncome - filteredExpense;

  // Group paginated txs by date
  const grouped = paginated.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const key = new Date(tx.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-8 pb-28">
      <div className="max-w-5xl mx-auto">
        <Header />

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
            <div className="bg-green-900/20 border border-green-500/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-green-500/15 p-2 rounded-xl border border-green-500/20 hidden sm:flex">
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-green-400/70 uppercase tracking-wider">Income</p>
                <p className="text-lg font-black text-green-400">₹{filteredIncome.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-red-900/20 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-red-500/15 p-2 rounded-xl border border-red-500/20 hidden sm:flex">
                <TrendingDown size={16} className="text-red-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-red-400/70 uppercase tracking-wider">Expenses</p>
                <p className="text-lg font-black text-red-400">₹{filteredExpense.toLocaleString()}</p>
              </div>
            </div>
            <div className={`${filteredNet >= 0 ? "bg-emerald-900/20 border-emerald-500/20" : "bg-orange-900/20 border-orange-500/20"} border rounded-2xl p-4 flex items-center gap-3`}>
              <div className={`${filteredNet >= 0 ? "bg-emerald-500/15 border-emerald-500/20" : "bg-orange-500/15 border-orange-500/20"} p-2 rounded-xl border hidden sm:flex`}>
                <Wallet size={16} className={filteredNet >= 0 ? "text-emerald-400" : "text-orange-400"} />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${filteredNet >= 0 ? "text-emerald-400/70" : "text-orange-400/70"}`}>Net</p>
                <p className={`text-lg font-black ${filteredNet >= 0 ? "text-emerald-400" : "text-orange-400"}`}>
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
              className="w-full bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 rounded-xl pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Type filter pills */}
          <div className="flex bg-gray-900/80 border border-gray-700 rounded-xl p-1 gap-1 flex-shrink-0">
            {(["", "income", "expense"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  typeFilter === t
                    ? t === "income" ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : t === "expense" ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
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
            <Link href="/advanced-search">
              <button className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-gray-700 text-gray-300 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                <ExternalLink size={13} />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </Link>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 space-y-3">
            {[...Array(6)].map((_, i) => <SkeletonTransactionRow key={i} />)}
          </div>
        ) : txs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center bg-gray-900/40 border border-gray-800 rounded-2xl"
          >
            <Receipt size={56} className="text-gray-700 mb-4" />
            <p className="text-xl font-bold text-gray-400 mb-2">No transactions yet</p>
            <p className="text-sm text-gray-600 mb-5">Add your first transaction from the dashboard</p>
            <Link href="/dashboard" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-colors">
              Go to Dashboard
            </Link>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center bg-gray-900/40 border border-gray-800 rounded-2xl"
          >
            <Search size={48} className="text-gray-700 mb-3" />
            <p className="text-lg font-bold text-gray-400 mb-1">No matches found</p>
            <p className="text-sm text-gray-600">Try different search terms or clear filters</p>
            <button onClick={() => { setSearchQuery(""); setTypeFilter(""); }} className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 rounded-xl text-sm font-bold transition-colors cursor-pointer">
            
            <span>

              Clear Filters
            </span>
            </button>
          </motion.div>
        ) : (
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
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
                          <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/4 transition-colors duration-150">
                            {/* Category icon */}
                            <div className={`${colors.bg} border ${colors.border} p-2.5 rounded-xl flex-shrink-0`}>
                              <Icon className={`w-4 h-4 ${colors.text}`} />
                            </div>

                            {/* Main info — clickable */}
                            <Link href={`/transactions/${tx._id}`} className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-100 text-sm truncate leading-tight">{tx.title}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
                                      {tx.category}
                                    </span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                      tx.paymentMode === "UPI"
                                        ? "bg-indigo-500/15 text-indigo-400"
                                        : "bg-yellow-500/15 text-yellow-400"
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
                                  <p className={`font-black text-base leading-tight ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                                    {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </Link>

                            {/* Delete button — visible on hover */}
                            <button
                              onClick={() => handleDelete(tx._id)}
                              disabled={deletingId === tx._id}
                              className="flex-shrink-0 p-2 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer disabled:opacity-50"
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
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-gray-700 rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <span>

                  <ChevronLeft size={15} /> Prev
                  </span>
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
                          page === p ? "bg-indigo-600 text-white" : "bg-white/5 hover:bg-white/10 text-gray-400"
                        }`}
                      >
                        <span>

                        {p}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-gray-700 rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <span>

                  Next <ChevronRight size={15} />
                  </span>
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
      <FloatingTransactionButton />
      <BottomNav />
    </div>
  );
}
