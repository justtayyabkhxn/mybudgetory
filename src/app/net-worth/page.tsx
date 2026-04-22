"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PiggyBank,
  RefreshCw,
  Pencil,
  Check,
  X,
  Landmark,
  TrendingUp,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingTransactionButton from "@/components/FloatingTransactionButton";
import MenuButton from "@/components/Menu";
import BottomNav from "@/components/BottomNav";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiFetch } from "@/utils/apiFetch";
import { toast } from "@/lib/toast";

function SkeletonBar() {
  return <div className="animate-pulse h-24 bg-gray-800/60 rounded-2xl" />;
}

export default function NetWorthPage() {
  useAuthGuard();

  const [bankBalance, setBankBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchNetWorth = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/networth");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBankBalance(data.bankBalance || 0);
    } catch {
      toast("Failed to load net worth", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNetWorth(); }, []);

  const handleUpdateBalance = async () => {
    const parsed = parseFloat(newBalance);
    if (isNaN(parsed) || parsed < 0) {
      toast("Enter a valid amount", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch("/api/networth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newBalance: parsed }),
      });
      const data = await res.json();
      if (res.ok) {
        setBankBalance(data.bankBalance);
        setEditMode(false);
        setNewBalance("");
        toast("Balance updated", "success");
      } else {
        toast(data.error || "Failed to update", "error");
      }
    } catch {
      toast("Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setNewBalance("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 sm:p-8 pb-28">
      <div className="max-w-lg mx-auto">
        <Header />

        {/* Page header */}
        <div className="flex items-center justify-between mt-4 mb-8">
          <div className="flex items-center gap-2">
            <PiggyBank className="text-amber-400" size={26} />
            <h1 className="text-3xl font-extrabold tracking-tight">Net Worth</h1>
            <button
              onClick={fetchNetWorth}
              className="ml-1 p-1.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-green-400 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <MenuButton />
        </div>

        <div className="space-y-4">
          {/* Bank Balance card */}
          {loading ? (
            <SkeletonBar />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-gradient-to-br from-amber-950/40 via-gray-900 to-gray-900 border border-amber-500/20 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <PiggyBank size={14} className="text-amber-400" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bank Balance</p>
                  </div>
                  {editMode ? (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="number"
                        autoFocus
                        value={newBalance}
                        onChange={e => setNewBalance(e.target.value)}
                        placeholder={bankBalance.toString()}
                        className="bg-gray-800/80 border border-amber-500/30 text-white rounded-xl px-3.5 py-2 text-xl font-black w-44 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        onKeyDown={e => { if (e.key === "Enter") handleUpdateBalance(); if (e.key === "Escape") handleCancelEdit(); }}
                      />
                      <button
                        onClick={handleUpdateBalance}
                        disabled={saving}
                        className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-all cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-4xl font-black text-amber-300 mt-2">
                      ₹{bankBalance.toLocaleString()}
                    </p>
                  )}
                </div>
                {!editMode && (
                  <button
                    onClick={() => { setEditMode(true); setNewBalance(bankBalance.toString()); }}
                    className="p-2 rounded-xl bg-gray-800/60 border border-gray-700 text-gray-500 hover:text-amber-400 hover:border-amber-500/30 transition-all cursor-pointer"
                    title="Edit balance"
                  >
                    <Pencil size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Assets placeholder */}
          {loading ? (
            <SkeletonBar />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp size={14} className="text-blue-400" />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assets</p>
              </div>
              <p className="text-4xl font-black text-blue-300 mt-2">₹0</p>
              <p className="text-xs text-gray-600 mt-1">Coming soon — investments, property, etc.</p>
            </motion.div>
          )}

          {/* Total Net Worth */}
          {loading ? (
            <SkeletonBar />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="bg-gradient-to-br from-emerald-950/40 via-gray-900 to-gray-900 border border-emerald-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Landmark size={14} className="text-emerald-400" />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Net Worth</p>
              </div>
              <p className="text-4xl font-black text-emerald-300 mt-2">
                ₹{bankBalance.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">Bank balance + assets</p>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
      <FloatingTransactionButton />
      <BottomNav />
    </div>
  );
}
