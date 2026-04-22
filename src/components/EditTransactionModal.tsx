"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ArrowUpCircle, ArrowDownCircle, CreditCard, Banknote,
  Calendar, MessageSquare, Loader2, Check,
} from "lucide-react";
import { CATEGORY_COLORS, CATEGORIES } from "@/lib/categoryConfig";
import { apiFetch } from "@/utils/apiFetch";
import { toast } from "@/lib/toast";

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

interface Props {
  tx: Transaction | null;
  onClose: () => void;
  onSave: (updated: Transaction) => void;
}

export default function EditTransactionModal({ tx, onClose, onSave }: Props) {
  const open = tx !== null;
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    type: "expense" as "income" | "expense",
    date: new Date().toISOString().split("T")[0],
    comment: "",
    paymentMode: "UPI" as "Cash" | "UPI",
  });
  const [loading, setLoading] = useState(false);
  const [showComment, setShowComment] = useState(false);

  useEffect(() => {
    if (tx) {
      setForm({
        title: tx.title,
        amount: tx.amount.toString(),
        category: tx.category,
        type: tx.type,
        date: tx.date ? tx.date.split("T")[0] : new Date().toISOString().split("T")[0],
        comment: tx.comment || "",
        paymentMode: tx.paymentMode || "UPI",
      });
      setShowComment(!!tx.comment);
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [tx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tx) return;
    const amountNum = parseFloat(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast("Enter a valid amount greater than 0", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch(`/api/transactions/${tx._id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...form, amount: amountNum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      toast("Transaction updated!", "success");
      onSave(data.transaction);
      onClose();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const isExpense = form.type === "expense";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[130] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative w-full max-w-md bg-[#0e0e1c] border border-white/10 rounded-2xl shadow-2xl overflow-y-auto max-h-[90dvh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Accent strip */}
              <div className={`h-1 w-full ${isExpense ? "bg-gradient-to-r from-red-500 via-pink-500 to-rose-500" : "bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400"}`} />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black text-white">Edit Transaction</h2>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full bg-white/8 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Type + Payment toggles */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
                    <button type="button" onClick={() => setForm(p => ({ ...p, type: "expense" }))}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${isExpense ? "bg-red-500/20 text-red-400 border border-red-500/40" : "text-gray-500 hover:text-gray-300"}`}>
                      <ArrowUpCircle size={14} /> Expense
                    </button>
                    <button type="button" onClick={() => setForm(p => ({ ...p, type: "income" }))}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${!isExpense ? "bg-green-500/20 text-green-400 border border-green-500/40" : "text-gray-500 hover:text-gray-300"}`}>
                      <ArrowDownCircle size={14} /> Income
                    </button>
                  </div>
                  <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 ml-auto">
                    <button type="button" onClick={() => setForm(p => ({ ...p, paymentMode: "UPI" }))}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${form.paymentMode === "UPI" ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40" : "text-gray-500 hover:text-gray-300"}`}>
                      <CreditCard size={13} /> UPI
                    </button>
                    <button type="button" onClick={() => setForm(p => ({ ...p, paymentMode: "Cash" }))}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${form.paymentMode === "Cash" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40" : "text-gray-500 hover:text-gray-300"}`}>
                      <Banknote size={13} /> Cash
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Amount */}
                  <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-200">
                    <span className={`text-2xl font-black ${isExpense ? "text-red-400" : "text-green-400"}`}>₹</span>
                    <input
                      ref={firstInputRef}
                      type="number"
                      value={form.amount}
                      onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                      required
                      className="flex-1 bg-transparent text-3xl font-black text-white placeholder-gray-700 outline-none w-full"
                      placeholder="0"
                    />
                  </div>

                  {/* Title */}
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    required
                    placeholder="What was this for?"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200 font-medium"
                  />

                  {/* Category pills — only for expense */}
                  {isExpense && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</p>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(({ name, icon: Icon }) => {
                          const colors = CATEGORY_COLORS[name] || CATEGORY_COLORS["Others"];
                          const isActive = form.category === name;
                          return (
                            <button
                              key={name}
                              type="button"
                              onClick={() => setForm(p => ({ ...p, category: name }))}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${isActive ? `${colors.bg} ${colors.text} ${colors.border} shadow-lg` : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10 hover:text-gray-300"}`}
                            >
                              <Icon size={12} />
                              {name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Date + Note toggle */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      <input
                        type="date"
                        value={form.date}
                        onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowComment(v => !v)}
                      className={`flex items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${showComment ? "bg-purple-500/15 text-purple-400 border-purple-500/30" : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10"}`}
                    >
                      <MessageSquare size={14} /> Note
                    </button>
                  </div>

                  {showComment && (
                    <input
                      placeholder="Add a note (optional)..."
                      value={form.comment}
                      onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10 transition-all duration-200 text-sm"
                    />
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 rounded-xl font-black text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                      loading
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : isExpense
                          ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white"
                          : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                    }`}
                  >
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <><Check size={18} /> Save Changes</>}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
