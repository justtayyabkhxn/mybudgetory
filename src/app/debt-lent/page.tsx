"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WalletMinimal,
  Plus,
  ChevronUp,
  Trash2,
  CheckCircle2,
  UserRound,
  Banknote,
  CalendarDays,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  Clock,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuButton from "@/components/Menu";
import BottomNav from "@/components/BottomNav";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiFetch } from "@/utils/apiFetch";
import { toast } from "@/lib/toast";

interface Entry {
  _id: string;
  person: string;
  amount: number;
  reason?: string;
  type: "debt" | "lent";
  dateAdded: string;
  dueDate?: string;
  status: "pending" | "cleared";
}

function SkeletonEntry() {
  return (
    <div className="animate-pulse flex items-center gap-4 p-4 bg-gray-900/60 border border-gray-800 rounded-2xl">
      <div className="w-10 h-10 bg-gray-800 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-gray-700 rounded" />
        <div className="h-3 w-48 bg-gray-800 rounded" />
      </div>
      <div className="h-6 w-20 bg-gray-800 rounded" />
    </div>
  );
}

export default function DebtLentPage() {
  useAuthGuard();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [clearId, setClearId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    person: "",
    amount: "",
    type: "lent" as "lent" | "debt",
    dueDate: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/debt-lent");
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      toast("Failed to load entries", "error");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleClear = async () => {
    if (!clearId) return;
    try {
      const res = await apiFetch("/api/debt-lent/clear", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: clearId }),
      });
      const data = await res.json();
      if (data._id) {
        setEntries(prev => prev.map(e => e._id === clearId ? { ...e, status: "cleared" } : e));
        toast("Marked as cleared", "success");
      } else {
        toast("Failed to update status", "error");
      }
    } catch {
      toast("Failed to update", "error");
    } finally {
      setClearId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await apiFetch("/api/debt-lent", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });
      const data = await res.json();
      if (data._id) {
        setEntries(prev => prev.filter(e => e._id !== deleteId));
        toast("Entry deleted", "success");
      } else {
        toast("Failed to delete", "error");
      }
    } catch {
      toast("Failed to delete", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/debt-lent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast("Entry added!", "success");
        setShowForm(false);
        setForm({ person: "", amount: "", type: "lent", dueDate: "", reason: "" });
        fetchEntries();
      } else {
        toast(data.error || "Failed to add entry", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const { totalLent, totalDebt, pendingCount } = useMemo(() => {
    const pending = entries.filter(e => e.status === "pending");
    return {
      totalLent: pending.filter(e => e.type === "lent").reduce((s, e) => s + e.amount, 0),
      totalDebt: pending.filter(e => e.type === "debt").reduce((s, e) => s + e.amount, 0),
      pendingCount: pending.length,
    };
  }, [entries]);

  const pendingEntries = entries.filter(e => e.status === "pending");
  const clearedEntries = entries.filter(e => e.status === "cleared");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-8 pb-28">
      <div className="max-w-3xl mx-auto">
        <Header />

        {/* Page Header */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="flex items-center gap-2">
            <WalletMinimal className="text-amber-400" size={26} />
            <h1 className="text-3xl font-extrabold tracking-tight">Debt & Lent</h1>
          </div>
          <MenuButton />
        </div>

        {/* Summary cards */}
        {!loading && entries.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                <TrendingUp size={12} /> You are owed
              </div>
              <p className="text-2xl font-black text-emerald-300">₹{totalLent.toLocaleString()}</p>
            </div>
            <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 mb-1">
                <TrendingDown size={12} /> You owe
              </div>
              <p className="text-2xl font-black text-red-300">₹{totalDebt.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Add New */}
        <div className="mb-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            {showForm ? <ChevronUp size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "Add Entry"}
          </button>
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <form
                onSubmit={handleAdd}
                className="bg-gray-900/80 border border-gray-700/60 rounded-2xl p-6 space-y-5"
              >
                <h2 className="text-base font-bold text-gray-100">New Debt / Lent Entry</h2>

                {/* Type toggle */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: "lent" }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                        form.type === "lent"
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : "bg-gray-800/40 border-gray-700 text-gray-500 hover:border-gray-600"
                      }`}
                    >
                      I Lent Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: "debt" }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                        form.type === "debt"
                          ? "bg-red-500/20 border-red-500/40 text-red-300"
                          : "bg-gray-800/40 border-gray-700 text-gray-500 hover:border-gray-600"
                      }`}
                    >
                      I Owe Money
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                      {form.type === "lent" ? "Lent to" : "Borrowed from"}
                    </label>
                    <div className="relative">
                      <UserRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={form.person}
                        onChange={e => setForm(f => ({ ...f, person: e.target.value }))}
                        placeholder="Person's name"
                        className="w-full bg-gray-800/60 border border-gray-700 text-white placeholder-gray-600 rounded-xl pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Amount (₹)</label>
                    <div className="relative">
                      <Banknote size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="number"
                        required
                        min="1"
                        value={form.amount}
                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                        placeholder="e.g. 500"
                        className="w-full bg-gray-800/60 border border-gray-700 text-white placeholder-gray-600 rounded-xl pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Due Date (optional)</label>
                    <div className="relative">
                      <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="date"
                        value={form.dueDate}
                        onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                        className="w-full bg-gray-800/60 border border-gray-700 text-white rounded-xl pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Reason (optional)</label>
                    <div className="relative">
                      <MessageSquare size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={form.reason}
                        onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                        placeholder="e.g. dinner, travel..."
                        className="w-full bg-gray-800/60 border border-gray-700 text-white placeholder-gray-600 rounded-xl pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer disabled:opacity-60"
                >
                  {submitting ? "Adding..." : "Add Entry"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entries */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonEntry key={i} />)}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <WalletMinimal size={28} className="text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-300 mb-2">No entries yet</h2>
            <p className="text-gray-500 text-sm">Track money you&apos;ve lent or borrowed.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending */}
            {pendingEntries.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Clock size={12} /> Pending ({pendingCount})
                </p>
                <div className="space-y-2">
                  {pendingEntries.map((entry, idx) => (
                    <EntryCard
                      key={entry._id}
                      entry={entry}
                      idx={idx}
                      onClear={() => setClearId(entry._id)}
                      onDelete={() => setDeleteId(entry._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Cleared */}
            {clearedEntries.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Cleared ({clearedEntries.length})
                </p>
                <div className="space-y-2 opacity-60">
                  {clearedEntries.map((entry, idx) => (
                    <EntryCard
                      key={entry._id}
                      entry={entry}
                      idx={idx}
                      onDelete={() => setDeleteId(entry._id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
      <BottomNav />

      <ConfirmDialog
        open={clearId !== null}
        title="Mark as Cleared"
        message="This will mark the entry as settled. This cannot be undone."
        confirmLabel="Clear"
        onConfirm={handleClear}
        onCancel={() => setClearId(null)}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Entry"
        message="This entry will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function EntryCard({
  entry,
  idx,
  onClear,
  onDelete,
}: {
  entry: Entry;
  idx: number;
  onClear?: () => void;
  onDelete: () => void;
}) {
  const isLent = entry.type === "lent";
  const isOverdue = entry.dueDate && entry.status === "pending" && new Date(entry.dueDate) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: idx * 0.04 }}
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
        isLent
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-red-500/5 border-red-500/20"
      }`}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${
        isLent ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
      }`}>
        {entry.person.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-gray-100 text-sm">
            {isLent ? "You lent" : "You owe"}{" "}
            <span className={isLent ? "text-emerald-300" : "text-red-300"}>{entry.person}</span>
          </p>
          {entry.status === "cleared" && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded-md">Cleared</span>
          )}
          {isOverdue && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-md">Overdue</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {new Date(entry.dateAdded).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          {entry.dueDate && ` • Due: ${new Date(entry.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
        </p>
        {entry.reason && <p className="text-xs text-gray-500 mt-0.5 truncate">{entry.reason}</p>}
      </div>

      {/* Amount + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`font-black text-base ${isLent ? "text-emerald-400" : "text-red-400"}`}>
          ₹{entry.amount.toLocaleString()}
        </span>
        {entry.status === "pending" && onClear && (
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-gray-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
            title="Mark as cleared"
          >
            <CheckCircle2 size={15} />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
}
