"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Menu from "@/components/Menu";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryConfig";
import {
  Search, TextSearch, RefreshCw, X, SlidersHorizontal,
  ArrowUpCircle, ArrowDownCircle, Download, Trash2,
  ArrowUp, CalendarDays, Tag, ArrowUpDown, Receipt,
} from "lucide-react";

interface Transaction {
  _id: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
  comment: string;
  paymentMode?: "Cash" | "UPI";
}

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "amount-desc", label: "Amount ↓" },
  { value: "amount-asc", label: "Amount ↑" },
];

const ALL_CATEGORIES = ["Food","Outing","Clothes","Travel","Medical","Entertainment","Bills","SMM","Others"];

export default function AdvancedSearchPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTxs, setFilteredTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state
  const [searchText, setSearchText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState<"" | "income" | "expense">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  const activeFilterCount = [searchText, selectedMonth, selectedCategory, selectedType, fromDate, toDate]
    .filter(Boolean).length;

  // ── Auth + fetch ───────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    try { JSON.parse(atob(token.split(".")[1])); }
    catch { localStorage.removeItem("token"); router.push("/login"); return; }
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    fetch("/api/transactions", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.transactions) setTransactions(data.transactions); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // ── Filtering + sorting ────────────────────────────────────────────────────
  useEffect(() => {
    let txs = [...transactions];

    if (selectedMonth) {
      txs = txs.filter(tx => {
        const d = new Date(tx.date);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}` === selectedMonth;
      });
    }
    if (fromDate) txs = txs.filter(tx => new Date(tx.date) >= new Date(fromDate));
    if (toDate)   txs = txs.filter(tx => new Date(tx.date) <= new Date(toDate));
    if (selectedCategory) txs = txs.filter(tx => tx.category === selectedCategory);
    if (selectedType)     txs = txs.filter(tx => tx.type === selectedType);
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      txs = txs.filter(tx => tx.title.toLowerCase().includes(q) || tx.comment?.toLowerCase().includes(q));
    }

    switch (sortBy) {
      case "amount-asc":  txs.sort((a,b) => a.amount - b.amount); break;
      case "amount-desc": txs.sort((a,b) => b.amount - a.amount); break;
      case "date-asc":    txs.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()); break;
      default:            txs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    setFilteredTxs(txs);
  }, [selectedMonth, selectedCategory, selectedType, searchText, fromDate, toDate, sortBy, transactions]);

  const clearFilters = () => {
    setSearchText(""); setSelectedMonth(""); setSelectedCategory("");
    setSelectedType(""); setFromDate(""); setToDate(""); setSortBy("date-desc");
  };

  const exportToCSV = () => {
    if (!filteredTxs.length) return;
    const headers = ["Title","Comment","Amount","Date","Category","Type"];
    const rows = filteredTxs.map(tx => [
      `"${tx.title}"`, `"${tx.comment||""}"`, tx.amount,
      new Date(tx.date).toLocaleDateString(), tx.category, tx.type,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "mybudgetory_filtered.csv";
    a.click();
  };

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalIncome  = filteredTxs.filter(t => t.type === "income").reduce((s,t) => s+t.amount, 0);
  const totalExpense = filteredTxs.filter(t => t.type === "expense").reduce((s,t) => s+t.amount, 0);
  const netBalance   = totalIncome - totalExpense;

  const inputClass = "w-full bg-gray-900/80 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white pb-28">
      <div className="max-w-5xl mx-auto p-4 sm:p-8">
        <Header />

        {/* Page header */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="flex items-center gap-2">
            <TextSearch className="text-fuchsia-400" size={26} />
            <h1 className="text-3xl font-extrabold tracking-tight">Advanced Search</h1>
            <button
              onClick={fetchTransactions}
              className="ml-1 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-green-400 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <Menu />
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title or comment..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="w-full bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-fuchsia-500/60 focus:ring-2 focus:ring-fuchsia-500/10 transition-all duration-200"
          />
          {searchText && (
            <button onClick={() => setSearchText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter toggle row */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200 cursor-pointer ${
              filtersOpen || activeFilterCount > 0
                ? "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30"
                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-fuchsia-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Type quick-filter pills */}
          <div className="flex gap-2">
            {(["","income","expense"] as const).map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                  selectedType === t
                    ? t === "income"
                      ? "bg-green-500/20 text-green-400 border-green-500/40"
                      : t === "expense"
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                    : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10 hover:text-gray-300"
                }`}
              >
                {t === "income" && <ArrowDownCircle size={12} />}
                {t === "expense" && <ArrowUpCircle size={12} />}
                {t === "" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-gray-900/80 border border-gray-700 text-gray-300 text-xs font-bold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-indigo-500/70 cursor-pointer transition-colors"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ArrowUpDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Expandable filter panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-gray-900/80 border border-gray-700/60 rounded-2xl p-5 space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Filter by</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Month */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-1.5">
                      <CalendarDays size={12} /> Month
                    </label>
                    <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className={inputClass} />
                  </div>

                  {/* From date */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-1.5">
                      <CalendarDays size={12} /> From Date
                    </label>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={inputClass} />
                  </div>

                  {/* To date */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-1.5">
                      <CalendarDays size={12} /> To Date
                    </label>
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className={inputClass} />
                  </div>

                  {/* Category */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-2">
                      <Tag size={12} /> Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory("")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedCategory === ""
                            ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                            : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <span>

                        All
                        </span>
                      </button>
                      {ALL_CATEGORIES.map(cat => {
                        const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS["Others"];
                        const Icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS["Others"];
                        const active = selectedCategory === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(active ? "" : cat)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              active
                                ? `${colors.bg} ${colors.text} ${colors.border}`
                                : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10 hover:text-gray-300"
                            }`}
                          >
                            <Icon size={11} />
                            <span>

                            {cat}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Filter actions */}
                <div className="flex justify-end gap-2 pt-1 border-t border-gray-800">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} /> <span>
                         Clear All </span>
                    </button>
                  )}
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>

                    Done
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchText && (
              <Chip label={`"${searchText}"`} onRemove={() => setSearchText("")} />
            )}
            {selectedMonth && (
              <Chip label={selectedMonth} onRemove={() => setSelectedMonth("")} />
            )}
            {selectedCategory && (
              <Chip label={selectedCategory} onRemove={() => setSelectedCategory("")} color={CATEGORY_COLORS[selectedCategory]?.text} />
            )}
            {selectedType && (
              <Chip label={selectedType} onRemove={() => setSelectedType("")} color={selectedType === "income" ? "text-green-400" : "text-red-400"} />
            )}
            {fromDate && <Chip label={`From: ${fromDate}`} onRemove={() => setFromDate("")} />}
            {toDate   && <Chip label={`To: ${toDate}`}   onRemove={() => setToDate("")} />}
          </div>
        )}

        {/* Summary stats bar */}
        {filteredTxs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5"
          >
            <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Results</p>
              <p className="text-xl font-black text-white">{filteredTxs.length}</p>
            </div>
            <div className="bg-green-900/20 border border-green-500/20 rounded-xl p-3 text-center">
              <p className="text-xs text-green-400/70 font-bold uppercase tracking-wider">Income</p>
              <p className="text-xl font-black text-green-400">₹{totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-3 text-center">
              <p className="text-xs text-red-400/70 font-bold uppercase tracking-wider">Expenses</p>
              <p className="text-xl font-black text-red-400">₹{totalExpense.toLocaleString()}</p>
            </div>
            <div className={`${netBalance >= 0 ? "bg-emerald-900/20 border-emerald-500/20" : "bg-orange-900/20 border-orange-500/20"} border rounded-xl p-3 text-center`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${netBalance >= 0 ? "text-emerald-400/70" : "text-orange-400/70"}`}>Net</p>
              <p className={`text-xl font-black ${netBalance >= 0 ? "text-emerald-400" : "text-orange-400"}`}>
                {netBalance >= 0 ? "+" : ""}₹{Math.abs(netBalance).toLocaleString()}
              </p>
            </div>
          </motion.div>
        )}

        {/* Export button */}
        {filteredTxs.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>

               Export CSV
              </span>
            </button>
          </div>
        )}

        {/* Results */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="space-y-0 divide-y divide-gray-800">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-800 rounded w-32" />
                    <div className="h-2.5 bg-gray-800 rounded w-24" />
                  </div>
                  <div className="h-4 bg-gray-800 rounded w-16" />
                </div>
              ))}
            </div>
          ) : filteredTxs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <Receipt size={52} className="text-gray-700 mb-4" />
              <p className="text-lg font-bold text-gray-400">No matching transactions</p>
              <p className="text-sm text-gray-600 mt-1">Try adjusting your filters or search terms</p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-sm font-bold border border-white/10 cursor-pointer transition-colors">
                  <span>

                  Clear Filters
                  </span>
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-800/60">
              {filteredTxs.map((tx, idx) => {
                const colors = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS["Others"];
                const Icon = CATEGORY_ICONS[tx.category] || CATEGORY_ICONS["Others"];
                return (
                  <motion.li
                    key={tx._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                  >
                    <Link href={`/transactions/${tx._id}`} className="flex items-center gap-4 p-4 hover:bg-white/4 transition-colors duration-150 cursor-pointer group">
                      {/* Category icon */}
                      <div className={`${colors.bg} border ${colors.border} p-2.5 rounded-xl flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${colors.text}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-100 truncate group-hover:text-white transition-colors">{tx.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-500">
                            {new Date(tx.date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
                            {tx.category}
                          </span>
                          {tx.paymentMode && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              tx.paymentMode === "UPI"
                                ? "bg-indigo-500/15 text-indigo-400"
                                : "bg-yellow-500/15 text-yellow-400"
                            }`}>
                              {tx.paymentMode}
                            </span>
                          )}
                          {tx.comment && (
                            <span className="text-xs text-gray-500 italic truncate max-w-[200px]">{tx.comment}</span>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className={`font-black text-base ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                          {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-600 capitalize">{tx.type}</p>
                      </div>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-20 right-5 z-50 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full shadow-lg backdrop-blur-sm border border-white/10 transition-all cursor-pointer"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      <Footer />
      <BottomNav />
    </div>
  );
}

// ─── Chip component ───────────────────────────────────────────────────────────
function Chip({ label, onRemove, color }: { label: string; onRemove: () => void; color?: string }) {
  return (
    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white/8 border border-white/15 ${color || "text-gray-300"}`}>
      {label}
      <button onClick={onRemove} className="hover:text-white cursor-pointer transition-colors">
        <X size={11} />
      </button>
    </span>
  );
}
