"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw,
  Plus,
  Trash2,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  ChevronUp,
  Calendar,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuButton from "@/components/Menu";
import BottomNav from "@/components/BottomNav";
import FloatingTransactionButton from "@/components/FloatingTransactionButton";
import ConfirmDialog from "@/components/ConfirmDialog";
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORIES } from "@/lib/categoryConfig";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiFetch } from "@/utils/apiFetch";
import { toast } from "@/lib/toast";

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

const FREQUENCIES: { value: "daily" | "weekly" | "monthly"; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-gray-900/60 border border-gray-800 rounded-2xl p-5 flex gap-4">
      <div className="w-1 h-12 bg-gray-700 rounded-full" />
      <div className="w-11 h-11 bg-gray-800 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-gray-700 rounded" />
        <div className="h-3 w-48 bg-gray-800 rounded" />
        <div className="h-3 w-24 bg-gray-800 rounded" />
      </div>
    </div>
  );
}

export default function RecurringPage() {
  useAuthGuard();

  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const fetchRecurring = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/recurring");
      const data = await res.json();
      if (data.recurring) setItems(data.recurring);
    } catch {
      toast("Failed to load recurring transactions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecurring(); }, []);

  const handleLogNow = async (item: RecurringTransaction) => {
    try {
      const res = await apiFetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        toast(`"${item.title}" logged successfully!`, "success");
      } else {
        toast("Failed to log transaction", "error");
      }
    } catch {
      toast("Error logging transaction", "error");
    }
  };

  const handleToggle = async (item: RecurringTransaction) => {
    try {
      const res = await apiFetch("/api/recurring", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item._id, isActive: !item.isActive }),
      });
      const data = await res.json();
      if (data.recurring) {
        setItems(prev => prev.map(i => i._id === item._id ? { ...i, isActive: !item.isActive } : i));
        toast(item.isActive ? "Paused" : "Resumed", "success");
      }
    } catch {
      toast("Failed to update", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiFetch(`/api/recurring?id=${deleteId}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i._id !== deleteId));
      toast("Deleted", "success");
    } catch {
      toast("Failed to delete", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const handleAddRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast("Recurring transaction added!", "success");
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
        fetchRecurring();
      } else {
        toast(data.error || "Failed to add", "error");
      }
    } catch {
      toast("Error adding recurring transaction", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = items.filter(i => i.isActive).length;
  const monthlyTotal = items
    .filter(i => i.isActive && i.type === "expense" && i.frequency === "monthly")
    .reduce((s, i) => s + i.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-8 pb-28">
      <div className="max-w-3xl mx-auto">
        <Header />

        {/* Page Header */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="flex items-center gap-2">
            <RefreshCcw className="text-violet-400" size={26} />
            <h1 className="text-3xl font-extrabold tracking-tight">Recurring</h1>
          </div>
          <MenuButton />
        </div>

        {/* Summary chips */}
        {!loading && items.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl text-sm font-bold text-violet-300">
              <RefreshCcw size={13} />
              {activeCount} active
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-bold text-red-300">
              Monthly outflow: ₹{monthlyTotal.toLocaleString()}
            </div>
          </div>
        )}

        {/* Add New Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
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
                className="bg-gray-900/80 border border-gray-700/60 rounded-2xl p-6 space-y-5"
              >
                <h2 className="text-base font-bold text-gray-100">New Recurring Transaction</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Title</label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. Netflix, Rent..."
                      className="w-full bg-gray-800/60 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="e.g. 500"
                      className="w-full bg-gray-800/60 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                    />
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Type</label>
                  <div className="flex gap-2">
                    {(["expense", "income"] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer capitalize ${
                          form.type === t
                            ? t === "expense"
                              ? "bg-red-500/20 border-red-500/40 text-red-300"
                              : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                            : "bg-gray-800/40 border-gray-700 text-gray-500 hover:border-gray-600"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment mode */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Payment Mode</label>
                  <div className="flex gap-2">
                    {(["UPI", "Cash"] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, paymentMode: m }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                          form.paymentMode === m
                            ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                            : "bg-gray-800/40 border-gray-700 text-gray-500 hover:border-gray-600"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Frequency</label>
                  <div className="flex gap-2">
                    {FREQUENCIES.map(f => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, frequency: f.value }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                          form.frequency === f.value
                            ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                            : "bg-gray-800/40 border-gray-700 text-gray-500 hover:border-gray-600"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(({ name, icon: Icon }) => {
                      const c = CATEGORY_COLORS[name] || CATEGORY_COLORS["Others"];
                      const selected = form.category === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, category: name }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selected
                              ? `${c.bg} ${c.border} ${c.text}`
                              : "bg-gray-800/40 border-gray-700 text-gray-500 hover:border-gray-600"
                          }`}
                        >
                          <Icon size={12} />
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Next date */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Next Date</label>
                  <input
                    type="date"
                    required
                    value={form.nextDate}
                    onChange={e => setForm(f => ({ ...f, nextDate: e.target.value }))}
                    className="w-full bg-gray-800/60 border border-gray-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer disabled:opacity-60"
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
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RefreshCcw size={28} className="text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-300 mb-2">No recurring transactions</h2>
            <p className="text-gray-500 text-sm">Add one above to track subscriptions, rent, salary, etc.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => {
              const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Others"];
              const Icon = CATEGORY_ICONS[item.category] || CATEGORY_ICONS["Others"];

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`bg-gray-900/70 border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-opacity ${
                    item.isActive ? colors.border : "border-gray-800 opacity-55"
                  }`}
                >
                  {/* Left */}
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-12 rounded-full flex-shrink-0 ${item.type === "income" ? "bg-emerald-500" : "bg-red-500"}`} />
                    <div className={`${colors.bg} border ${colors.border} p-2.5 rounded-xl flex-shrink-0`}>
                      <Icon className={`${colors.text} w-5 h-5`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-100">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.category} &bull; {item.paymentMode} &bull; {item.frequency}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Calendar size={11} />
                        Next: {new Date(item.nextDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span className={`text-lg font-black ${item.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                      {item.type === "income" ? "+" : "-"}₹{item.amount.toLocaleString()}
                    </span>

                    <button
                      onClick={() => handleLogNow(item)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 transition-colors cursor-pointer"
                    >
                      <CheckCircle size={13} />
                      Log Now
                    </button>

                    <button
                      onClick={() => handleToggle(item)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer transition-colors ${
                        item.isActive
                          ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {item.isActive ? <><PauseCircle size={13} /> Pause</> : <><PlayCircle size={13} /> Resume</>}
                    </button>

                    <button
                      onClick={() => setDeleteId(item._id)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
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

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Recurring"
        message="This recurring transaction will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
