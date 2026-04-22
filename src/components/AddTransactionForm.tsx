"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  MessageSquare,
  CreditCard,
  Banknote,
  Check,
  Loader2,
} from "lucide-react";
import { CATEGORY_COLORS, CATEGORIES } from "@/lib/categoryConfig";
import { toast } from "@/lib/toast";

export function AddTransactionForm({ onAdd }: { onAdd: () => void }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    type: "expense" as "income" | "expense",
    date: new Date().toISOString().split("T")[0],
    comment: "",
    paymentMode: "UPI" as "Cash" | "UPI",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showComment, setShowComment] = useState(false);

  useEffect(() => {
    if (form.type === "income") {
      setForm((prev) => ({ ...prev, category: "Others" }));
    } else {
      setForm((prev) => ({ ...prev, category: "Food" }));
    }
  }, [form.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const amountNum = parseFloat(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0");
      setLoading(false);
      return;
    }
    if (amountNum > 10_000_000) {
      setError("Amount cannot exceed ₹1 crore");
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      toast("You must be logged in", "error");
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add transaction");
      }

      const balanceFetch = await fetch("/api/networth", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const balanceData = await balanceFetch.json();
      const currentBalance = balanceData.bankBalance || 0;
      const amount = parseFloat(form.amount);
      const adjustment = form.type === "income" ? amount : -amount;
      const newBalance = currentBalance + adjustment;

      await fetch("/api/networth/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newBalance, paymentMode: form.paymentMode }),
      });

      setSuccess("Added!");
      toast("Transaction added!", "success");
      setTimeout(() => setSuccess(""), 2500);
      setForm({
        title: "",
        amount: "",
        category: form.type === "income" ? "Others" : "Food",
        type: form.type,
        date: new Date().toISOString().split("T")[0],
        comment: "",
        paymentMode: form.paymentMode,
      });
      setShowComment(false);
      onAdd();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isExpense = form.type === "expense";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6 relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 via-gray-900 to-black shadow-2xl"
    >
      {/* Colored accent strip at top based on type */}
      <div
        className={`h-1 w-full transition-all duration-500 ${
          isExpense
            ? "bg-gradient-to-r from-red-500 via-pink-500 to-rose-500"
            : "bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400"
        }`}
      />

      <div className="p-4 sm:p-6">
        {/* Type + Payment toggles */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {/* Type toggle */}
          <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, type: "expense" }))}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer ${
                isExpense
                  ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/10"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <ArrowUpCircle size={14} />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, type: "income" }))}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer ${
                !isExpense
                  ? "bg-green-500/20 text-green-400 border border-green-500/40 shadow-lg shadow-green-500/10"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <ArrowDownCircle size={14} />
              <span>Income</span>
            </button>
          </div>

          {/* Payment mode toggle */}
          <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 ml-auto">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, paymentMode: "UPI" }))}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                form.paymentMode === "UPI"
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <CreditCard size={13} />
              <span>UPI</span>
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, paymentMode: "Cash" }))}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                form.paymentMode === "Cash"
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Banknote size={13} />
              <span>Cash</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount – hero field */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-200">
              <span
                className={`text-2xl font-black ${
                  isExpense ? "text-red-400" : "text-green-400"
                }`}
              >
                ₹
              </span>
              <input
                type="number"
                name="amount"
                placeholder="0"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                required
                className="flex-1 bg-transparent text-3xl font-black text-white placeholder-gray-700 outline-none w-full"
              />
              {form.paymentMode === "UPI" ? (
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-1 rounded-lg">
                  UPI
                </span>
              ) : (
                <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-2 py-1 rounded-lg">
                  Cash
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <input
            type="text"
            name="title"
            placeholder="What was this for?"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200 font-medium"
          />

          {/* Category pills — only for expense */}
          <AnimatePresence>
            {isExpense && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(({ name, icon: Icon }) => {
                    const colors =
                      CATEGORY_COLORS[name] || CATEGORY_COLORS["Others"];
                    const isActive = form.category === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() =>
                          setForm((p) => ({ ...p, category: name }))
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                          isActive
                            ? `${colors.bg} ${colors.text} ${colors.border} shadow-lg`
                            : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10 hover:text-gray-300"
                        }`}
                      >
                        <Icon size={12} />
                        <span>{name}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Date row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200 text-sm"
              />
            </div>

            {/* Comment toggle */}
            <button
              type="button"
              onClick={() => setShowComment((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                showComment
                  ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                  : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10"
              }`}
            >
              <MessageSquare size={14} />
              <span>Note</span>
            </button>
          </div>

          {/* Comment field */}
          <AnimatePresence>
            {showComment && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <input
                  name="comment"
                  placeholder="Add a note (optional)..."
                  value={form.comment}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, comment: e.target.value }))
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10 transition-all duration-200 text-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3.5 rounded-xl font-black text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              loading
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : isExpense
                  ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-900/40"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-900/40"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Adding...
              </>
            ) : success ? (
              <>
                <Check size={18} />
                Added!
              </>
            ) : (
              <>
                {isExpense ? (
                  <ArrowUpCircle size={18} />
                ) : (
                  <ArrowDownCircle size={18} />
                )}
                Add {isExpense ? "Expense" : "Income"}
              </>
            )}
          </motion.button>
        </form>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
          >
            {error}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
