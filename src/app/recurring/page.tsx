"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw,
  Plus,
  Trash2,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuButton from "@/components/Menu";
import BottomNav from "@/components/BottomNav";
import FloatingTransactionButton from "@/components/FloatingTransactionButton";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryConfig";

interface RecurringTransaction {
  _id: string;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  paymentMode: "Cash" | "UPI";
  frequency: "daily" | "weekly" | "monthly";
  nextDate: string;
  isActive: boolean;
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

type Toast = { id: number; message: string; success: boolean };

export default function RecurringPage() {
  const router = useRouter();
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    type: "expense" as "income" | "expense",
    paymentMode: "UPI" as "Cash" | "UPI",
    frequency: "monthly" as "daily" | "weekly" | "monthly",
    nextDate: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const addToast = (message: string, success: boolean) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, success }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

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
    fetchRecurring(token);
  }, []);

  const fetchRecurring = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/recurring", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.recurring) setItems(data.recurring);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogNow = async (item: RecurringTransaction) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: item.title,
          amount: item.amount,
          category: item.category,
          type: item.type,
          paymentMode: item.paymentMode,
          date: new Date().toISOString(),
          comment: `Recurring (${item.frequency})`,
        }),
      });

      if (res.ok) {
        addToast(`"${item.title}" logged successfully!`, true);
      } else {
        addToast("Failed to log transaction.", false);
      }
    } catch (err) {
      console.error(err);
      addToast("Error logging transaction.", false);
    }
  };

  const handleToggle = async (item: RecurringTransaction) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/recurring", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: item._id, isActive: !item.isActive }),
      });
      const data = await res.json();
      if (data.recurring) {
        setItems((prev) =>
          prev.map((i) =>
            i._id === item._id ? { ...i, isActive: !item.isActive } : i
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!window.confirm("Delete this recurring transaction?")) return;

    try {
      await fetch(`/api/recurring?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("Recurring transaction added!", true);
        setShowForm(false);
        setForm({
          title: "",
          amount: "",
          category: "Food",
          type: "expense",
          paymentMode: "UPI",
          frequency: "monthly",
          nextDate: new Date().toISOString().split("T")[0],
        });
        fetchRecurring(token);
      } else {
        addToast(data.error || "Failed to add.", false);
      }
    } catch (err) {
      console.error(err);
      addToast("Error adding recurring transaction.", false);
    } finally {
      setSubmitting(false);
    }
  };

  const frequencyLabel = (f: string) => {
    if (f === "daily") return "Daily";
    if (f === "weekly") return "Weekly";
    return "Monthly";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-8 pb-28">
      <div className="max-w-5xl mx-auto">
        <Header />

        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-[100] space-y-2">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${
                  t.success
                    ? "bg-green-500/20 border border-green-500/30 text-green-300"
                    : "bg-red-500/20 border border-red-500/30 text-red-300"
                }`}
              >
                {t.success ? <CheckCircle size={16} /> : <X size={16} />}
                {t.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="flex items-center gap-2">
            <RefreshCcw className="text-violet-400" size={28} />
            <h1 className="text-3xl font-extrabold tracking-tight">
              Recurring Transactions
            </h1>
          </div>
          <MenuButton />
        </div>

        {/* Add New Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            {showForm ? <ChevronUp size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "Add New Recurring"}
          </button>
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <form
                onSubmit={handleAddRecurring}
                className="bg-gray-900/80 border border-gray-700 rounded-2xl p-6 space-y-4"
              >
                <h2 className="text-lg font-bold text-gray-100">
                  New Recurring Transaction
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      placeholder="e.g. Netflix, Rent..."
                      className="w-full bg-gray-700/60 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.amount}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, amount: e.target.value }))
                      }
                      placeholder="e.g. 500"
                      className="w-full bg-gray-700/60 border border-gray-600 text-white placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                      className="w-full bg-gray-700/60 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {ALL_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Type
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          type: e.target.value as "income" | "expense",
                        }))
                      }
                      className="w-full bg-gray-700/60 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Payment Mode
                    </label>
                    <select
                      value={form.paymentMode}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          paymentMode: e.target.value as "Cash" | "UPI",
                        }))
                      }
                      className="w-full bg-gray-700/60 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Frequency
                    </label>
                    <select
                      value={form.frequency}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          frequency: e.target.value as
                            | "daily"
                            | "weekly"
                            | "monthly",
                        }))
                      }
                      className="w-full bg-gray-700/60 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">
                      Next Date
                    </label>
                    <input
                      type="date"
                      required
                      value={form.nextDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, nextDate: e.target.value }))
                      }
                      className="w-full bg-gray-700/60 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer disabled:opacity-60"
                >
                  {submitting ? "Adding..." : "Add Recurring Transaction"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-800/60 rounded-2xl p-5 h-24"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <RefreshCcw size={56} className="text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-400 mb-2">
              No recurring transactions
            </h2>
            <p className="text-gray-500 text-sm">
              Add one above to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => {
              const colors =
                CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Others"];
              const Icon =
                CATEGORY_ICONS[item.category] || CATEGORY_ICONS["Others"];

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`bg-gray-900/80 border ${
                    item.isActive
                      ? colors.border
                      : "border-gray-700"
                  } rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                    !item.isActive ? "opacity-60" : ""
                  }`}
                >
                  {/* Left: info */}
                  <div className="flex items-center gap-4">
                    {/* Color indicator */}
                    <div
                      className={`w-1 h-12 rounded-full ${
                        item.type === "income" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <div
                      className={`${colors.bg} border ${colors.border} p-2.5 rounded-xl`}
                    >
                      <Icon className={`${colors.text} w-5 h-5`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-100">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.category} &bull; {item.paymentMode} &bull;{" "}
                        {frequencyLabel(item.frequency)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Calendar size={11} />
                        Next:{" "}
                        {new Date(item.nextDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: amount + actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`text-xl font-black ${
                        item.type === "income"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {item.type === "income" ? "+" : "-"}₹
                      {item.amount.toLocaleString()}
                    </span>

                    <button
                      onClick={() => handleLogNow(item)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 transition-colors cursor-pointer"
                    >
                      <CheckCircle size={13} />
                      Log Now
                    </button>

                    <button
                      onClick={() => handleToggle(item)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                        item.isActive
                          ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                          : "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                      }`}
                    >
                      {item.isActive ? (
                        <>
                          <PauseCircle size={13} /> Pause
                        </>
                      ) : (
                        <>
                          <PlayCircle size={13} /> Resume
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
      <FloatingTransactionButton />
      <BottomNav />
    </div>
  );
}
