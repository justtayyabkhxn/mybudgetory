"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  MessageSquare,
  CreditCard,
  Banknote,
  Check,
  ChevronDown,
  Loader2,
  WifiOff,
} from "lucide-react";
import { CATEGORY_COLORS, CATEGORIES } from "@/lib/categoryConfig";
import { toast } from "@/lib/toast";
import { getQueue, enqueue } from "@/lib/offlineQueue";

export function AddTransactionForm({ onAdd }: { onAdd: () => void }) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
    }
    if (categoryOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [categoryOpen]);

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
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    setPendingCount(getQueue().length);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const handleQueueChange = () => setPendingCount(getQueue().length);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("offlinequeue:change", handleQueueChange);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offlinequeue:change", handleQueueChange);
    };
  }, []);

  useEffect(() => {
    setCategoryOpen(false);
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

    // If offline, queue locally
    if (!navigator.onLine) {
      enqueue(form);
      setPendingCount(getQueue().length);
      toast("You're offline — transaction saved locally", "success");
      setSuccess("Saved offline!");
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
      setLoading(false);
      return;
    }

    // Online — submit directly
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
      className="relative rounded-3xl bg-canvas/80 h-full outline-none overflow-hidden"
    >
      {/* Colored accent strip at top based on type */}
      <div
        className={`h-1 w-full rounded-t-2xl transition-all duration-500 ${
          isExpense
            ? "bg-negative"
            : "bg-positive"
        }`}
      />

      <div className="p-4 sm:p-6">
        {/* Offline / pending badge */}
        <AnimatePresence>
          {(isOffline || pendingCount > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-yellow-500/10 text-warning-deep text-xs font-semibold"
            >
              <WifiOff size={13} />
              {isOffline
                ? pendingCount > 0
                  ? `Offline — ${pendingCount} transaction${pendingCount > 1 ? "s" :""} queued`
                  : "You're offline — transactions will be saved locally"
                : `${pendingCount} offline transaction${pendingCount > 1 ? "s" :""} pending sync`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Type + Payment toggles */}
        <div className="flex flex-nowrap items-center justify-between gap-2 mb-6">
          {/* Type toggle */}
          <div className="flex bg-canvas-soft/80 rounded-3xl p-1 shrink-0">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, type: "expense" }))}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                isExpense
                  ? "bg-red-500/20 text-red-400 shadow-lg"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <ArrowUpCircle size={14} />
              <span className="hidden sm:inline">Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, type: "income" }))}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer ${
                !isExpense
                  ? "bg-green-500/20 text-green-400 shadow-lg"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <ArrowDownCircle size={14} />
              <span className="hidden sm:inline">Income</span>
            </button>
          </div>

          {/* Payment mode toggle */}
          <div className="flex bg-canvas-soft/80 rounded-3xl p-1 shrink-0">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, paymentMode: "UPI" }))}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer ${
                form.paymentMode === "UPI"
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <CreditCard size={13} />
              <span className="hidden sm:inline">UPI</span>
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, paymentMode: "Cash" }))}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer ${
                form.paymentMode === "Cash"
                  ? "bg-yellow-500/20 text-warning-deep"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Banknote size={13} />
              <span className="hidden sm:inline">Cash</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount + Title — one row */}
          <div className="flex gap-3">
            <div className="relative w-[42%] sm:w-2/5 shrink-0">
              <div className="flex items-center gap-1.5 bg-canvas-soft/80 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-primary transition-all duration-200">
                <span
                  className={`text-lg font-black ${
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
                  className="flex-1 min-w-0 bg-transparent text-xl font-black text-ink placeholder-mute outline-none w-full"
                />
              </div>
            </div>

            <input
              type="text"
              name="title"
              placeholder="What was this for?"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              className="flex-1 min-w-0 bg-canvas-soft/80 rounded-xl px-4 py-3 text-ink placeholder-mute focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 font-medium"
            />
          </div>

          {/* Category + Date + Note — stacked on mobile, one row from sm up */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            {/* Category dropdown — only for expense */}
            <AnimatePresence>
              {isExpense && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full sm:flex-1 sm:min-w-0 overflow-visible"
                >
                <div className="relative" ref={categoryRef}>
                  {(() => {
                    const active =
                      CATEGORIES.find((c) => c.name === form.category) || CATEGORIES[0];
                    const colors =
                      CATEGORY_COLORS[active.name] || CATEGORY_COLORS["Others"];
                    const ActiveIcon = active.icon;
                    return (
                      <button
                        type="button"
                        onClick={() => setCategoryOpen((v) => !v)}
                        className={`w-full flex items-center justify-between gap-1.5 px-3 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${colors.bg} ${colors.text}`}
                      >
                        <span className="flex items-center gap-2">
                          <ActiveIcon size={16} />
                          {active.name}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${categoryOpen ? "rotate-180" :""}`}
                        />
                      </button>
                    );
                  })()}

                  <AnimatePresence>
                    {categoryOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-20 mt-2 w-full bg-canvas/80 rounded-xl shadow-lg p-2 grid grid-cols-2 gap-1.5"
                      >
                        {CATEGORIES.map(({ name, icon: Icon }) => {
                          const colors =
                            CATEGORY_COLORS[name] || CATEGORY_COLORS["Others"];
                          const isActive = form.category === name;
                          return (
                            <button
                              key={name}
                              type="button"
                              onClick={() => {
                                setForm((p) => ({ ...p, category: name }));
                                setCategoryOpen(false);
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors duration-150 cursor-pointer ${
                                isActive
                                  ? `${colors.bg} ${colors.text}`
                                  : "text-gray-400 hover:bg-canvas-soft/80 hover:text-gray-200"
                              }`}
                            >
                              <Icon size={14} />
                              {name}
                              {isActive && <Check size={12} className="ml-auto" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Date + Note */}
            <div className="flex gap-2">
              <div className="flex-1 min-w-0 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  required
                  className="w-full bg-canvas-soft/80 rounded-xl pl-9 pr-2 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 text-sm"
                />
              </div>

              {/* Comment toggle */}
              <button
                type="button"
                onClick={() => setShowComment((v) => !v)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  showComment
                    ? "bg-purple-500/15 text-purple-400"
                    : "bg-canvas-soft/80 text-body hover:bg-primary-pale"
                }`}
              >
                <MessageSquare size={14} />
                <span className="hidden sm:inline">Note</span>
              </button>
            </div>
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
                  className="w-full bg-canvas-soft/80 rounded-xl px-4 py-3 text-ink placeholder-mute focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 text-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3.5 rounded-3xl font-semibold text-base transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              loading
                ? "bg-canvas-soft/80 text-mute cursor-not-allowed"
                : "bg-primary hover:bg-primary-active text-on-primary"
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
            className="text-red-400 text-sm mt-3 bg-red-500/10 rounded-lg px-3 py-2"
          >
            {error}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
