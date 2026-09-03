"use client";

import { useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import Menu from "@/components/Menu";
import FloatingTransactionButton from "@/components/FloatingTransactionButton";
import { SkeletonTransactionRow } from "@/components/SkeletonLoader";
import ConfirmDialog from "@/components/ConfirmDialog";
import EditTransactionModal from "@/components/EditTransactionModal";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiFetch } from "@/utils/apiFetch";
import { toast } from "@/lib/toast";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryConfig";
import {
  BanknoteArrowDown,
  Wallet,
  Pencil,
  Trash2,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";

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

interface Props {
  type: "income" | "expense";
}

export default function FilteredTransactionsPage({ type }: Props) {
  useAuthGuard();

  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const fetchTransactions = () => {
    setLoading(true);
    apiFetch("/api/transactions")
      .then(r => r.json())
      .then(data => { if (data.transactions) setTxs(data.transactions); })
      .catch(() => toast("Failed to load transactions", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTransactions(); }, []);

  const now = new Date();
  const filtered = useMemo(
    () =>
      txs.filter(tx => {
        const d = new Date(tx.date);
        return (
          tx.type === type &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }),
    [txs, type]
  );

  const total = useMemo(() => filtered.reduce((s, t) => s + t.amount, 0), [filtered]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/transactions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTxs(prev => prev.filter(t => t._id !== id));
        toast("Transaction deleted", "success");
      } else {
        toast(data.error || "Failed to delete", "error");
      }
    } catch {
      toast("Failed to delete transaction", "error");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const isExpense = type === "expense";
  const Icon = isExpense ? BanknoteArrowDown : Wallet;
  const title = isExpense ? "Expenses" : "Inflow";
  const monthName = now.toLocaleString("default", { month: "long" });

  return (
    <div className="min-h-screen text-ink p-4 sm:p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        <Header />

        <div className="flex justify-between items-center mt-4 mb-5">
          <div className="flex items-center gap-2">
            <Icon size={22} className={isExpense ? "text-red-400" : "text-green-400"} />
            <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
          </div>
          <Menu />
        </div>

        {/* Summary bar */}
        {!loading && (
          <div className={`mb-5 rounded-2xl px-5 py-4 flex items-center justify-between ${isExpense ? "bg-red-900/10" : "bg-green-900/10"}`}>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isExpense ? "text-red-400/70" : "text-green-400/70"}`}>
                {monthName} Total
              </p>
              <p className={`text-3xl font-black ${isExpense ? "text-red-400" : "text-green-400"}`}>
                ₹{total.toLocaleString()}
              </p>
            </div>
            <p className="text-sm text-gray-500">{filtered.length} transactions</p>
          </div>
        )}

        <div className="bg-gray-900/60 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h2 className="text-base font-bold text-gray-300">This Month</h2>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => <SkeletonTransactionRow key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Icon size={44} className="text-ink mb-3" />
              <p className="text-base font-bold text-gray-500 mb-1">No {title.toLowerCase()} this month</p>
              <Link href="/dashboard" className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-on-primary rounded-xl text-sm font-bold transition-colors">
                <PlusCircle size={14} /> Add Transaction
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-800/50">
              {filtered.map(tx => {
                const colors = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS["Others"];
                const CatIcon = CATEGORY_ICONS[tx.category] || CATEGORY_ICONS["Others"];
                return (
                  <li key={tx._id} className="group flex items-center gap-3 px-4 py-3.5 hover:bg-canvas-soft/80 transition-colors duration-150">
                    <div className={`${colors.bg} p-2.5 rounded-xl flex-shrink-0`}>
                      <CatIcon className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-100 text-sm truncate">{tx.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>{tx.category}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${tx.paymentMode === "UPI" ? "bg-indigo-500/15 text-indigo-400" : "bg-yellow-500/15 text-warning-deep"}`}>{tx.paymentMode}</span>
                        <span className="text-[10px] text-gray-500">{new Date(tx.date).toLocaleDateString()}</span>
                        {tx.comment && <span className="text-[10px] text-gray-500 italic truncate max-w-[120px]">{tx.comment}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <p className={`font-black text-base ${isExpense ? "text-red-400" : "text-green-400"}`}>
                        {isExpense ? "-" : "+"}₹{tx.amount.toLocaleString()}
                      </p>
                      <button
                        onClick={() => setEditingTx(tx)}
                        className="p-2 rounded-lg text-on-primary hover:text-indigo-400 hover:bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                        aria-label="Edit transaction"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setConfirmId(tx._id)}
                        disabled={deletingId === tx._id}
                        className="p-2 rounded-lg text-on-solid hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer disabled:opacity-50"
                        aria-label="Delete transaction"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <FloatingTransactionButton onAdd={fetchTransactions} />

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete Transaction"
        message="This will permanently remove this transaction. This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => confirmId && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />

      <EditTransactionModal
        tx={editingTx}
        onClose={() => setEditingTx(null)}
        onSave={updated => setTxs(prev => prev.map(t => t._id === updated._id ? updated : t))}
      />
    </div>
  );
}
