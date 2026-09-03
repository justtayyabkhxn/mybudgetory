"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  CalendarDays,
  Tag,
  CreditCard,
  Banknote,
  MessageSquare,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Header from "@/components/Header";
import Menu from "@/components/Menu";
import ConfirmDialog from "@/components/ConfirmDialog";
import EditTransactionModal from "@/components/EditTransactionModal";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiFetch } from "@/utils/apiFetch";
import { toast } from "@/lib/toast";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryConfig";

type Transaction = {
  _id: string;
  title: string;
  date: string;
  category: string;
  paymentMode: "Cash" | "UPI";
  type: "income" | "expense";
  amount: number;
  comment?: string;
};

function SkeletonDetail() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-48 bg-gray-800 rounded-xl mx-auto" />
      <div className="h-6 w-32 bg-gray-800/60 rounded-lg mx-auto" />
      <div className="mt-8 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-gray-900/60 rounded-2xl">
            <div className="w-9 h-9 bg-gray-800 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-20 bg-gray-800 rounded" />
              <div className="h-4 w-32 bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TransactionDetail() {
  useAuthGuard();

  const { id } = useParams();
  const router = useRouter();

  const [tx, setTx] = useState<Transaction | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/transactions/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.transaction) {
          setTx(data.transaction);
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [id]);

  const handleDelete = async () => {
    if (!tx) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/transactions/${tx._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast("Transaction deleted", "success");
        router.push("/transactions");
      } else {
        toast(data.error || "Failed to delete", "error");
      }
    } catch {
      toast("Failed to delete transaction", "error");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const isExpense = tx?.type === "expense";
  const colors = tx ? (CATEGORY_COLORS[tx.category] || CATEGORY_COLORS["Others"]) : null;
  const CatIcon = tx ? (CATEGORY_ICONS[tx.category] || CATEGORY_ICONS["Others"]) : null;

  return (
    <div className="min-h-screen md:pt-20 text-ink p-4 sm:p-8 pb-16">
      <div className="fixed top-0 inset-x-0 h-px bg-primary pointer-events-none z-50" />
      <div className="max-w-lg mx-auto">
        <div className="md:hidden">
          <Header />
        </div>

        {/* Nav row */}
        <div className="flex items-center justify-between mt-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-ink transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <Menu />
        </div>

        {/* Content */}
        {status === "loading" && <SkeletonDetail />}

        {status === "error" && (
          <div className="text-center py-20">
            <p className="text-red-400 font-bold text-lg mb-2">Transaction not found</p>
            <p className="text-gray-500 text-sm">It may have been deleted or you don&apos;t have access.</p>
            <button
              onClick={() => router.push("/transactions")}
              className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-on-primary rounded-xl text-sm font-bold transition-colors cursor-pointer"
            >
              Back to Transactions
            </button>
          </div>
        )}

        {status === "success" && tx && colors && CatIcon && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Hero amount card */}
            <div className={`relative overflow-hidden rounded-3xl p-8 mb-6 text-center ${
 isExpense
 ? "bg-canvas/80"
 : "bg-canvas/80"
 }`}>
              {/* Background glow */}
              <div className={`absolute inset-0 opacity-10 ${isExpense ? "bg-red-500" : "bg-emerald-500"}`}
                style={{ filter: "blur(60px)", transform: "translate(-50%,-50%) scale(2)", top: "50%", left: "50%" }}
              />

              {/* Category icon */}
              <div className={`${colors.bg} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <CatIcon className={`w-8 h-8 ${colors.text}`} />
              </div>

              {/* Title */}
              <h1 className="text-2xl font-black text-ink mb-1 tracking-tight">{tx.title}</h1>
              <p className="text-sm text-gray-400 mb-5">{tx.category}</p>

              {/* Amount */}
              <div className={`text-5xl font-black tracking-tight ${isExpense ? "text-red-400" : "text-emerald-400"}`}>
                {isExpense ? "−" : "+"}₹{tx.amount.toLocaleString()}
              </div>

              {/* Type badge */}
              <div className={`inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-xs font-bold ${
 isExpense
 ? "bg-red-500/15 text-red-300"
 : "bg-emerald-500/15 text-emerald-300"
 }`}>
                {isExpense ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                {isExpense ? "Expense" : "Income"}
              </div>
            </div>

            {/* Detail rows */}
            <div className="space-y-2 mb-6">
              <DetailRow
                icon={<CalendarDays size={15} className="text-indigo-400" />}
                label="Date"
                value={new Date(tx.date).toLocaleDateString("en-IN", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              />
              <DetailRow
                icon={<Tag size={15} className="text-purple-400" />}
                label="Category"
                value={tx.category}
                badge={{ text: tx.category, className: `${colors.bg} ${colors.text}` }}
              />
              <DetailRow
                icon={
                  tx.paymentMode === "UPI"
                    ? <CreditCard size={15} className="text-blue-400" />
                    : <Banknote size={15} className="text-warning-deep" />
                }
                label="Payment Mode"
                value={tx.paymentMode}
                badge={{
                  text: tx.paymentMode,
                  className: tx.paymentMode === "UPI"
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "bg-yellow-500/15 text-warning-deep",
                }}
              />
              {tx.comment && (
                <DetailRow
                  icon={<MessageSquare size={15} className="text-gray-400" />}
                  label="Note"
                  value={tx.comment}
                />
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-ink-deep transition-all duration-200 cursor-pointer"
              >
                <Pencil size={15} />
                Edit Transaction
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-red-600/15 hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Transaction"
        message="This will permanently remove this transaction. This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <EditTransactionModal
        tx={editing ? tx : null}
        onClose={() => setEditing(false)}
        onSave={updated => {
          setTx(updated);
          setEditing(false);
        }}
      />
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: { text: string; className: string };
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-900/60 rounded-2xl">
      <div className="w-8 h-8 rounded-xl bg-canvas/80 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
        {badge ? (
          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-lg ${badge.className}`}>
            {badge.text}
          </span>
        ) : (
          <p className="text-sm font-semibold text-gray-200 truncate">{value}</p>
        )}
      </div>
    </div>
  );
}
