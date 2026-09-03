"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, RefreshCw } from "lucide-react";
import { apiFetch } from "@/utils/apiFetch";

/* ─── Types ─────────────────────────────────────────────── */
type Transaction = {
  _id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
};

interface Props {
  txs: Transaction[];
  loading: boolean;
}

type AdviceType = "weekly" | "monthly";

/* ─── Helpers ────────────────────────────────────────────── */
function isMonday() {
  return new Date().getDay() === 1;
}

function isFirst3DaysOfMonth() {
  return new Date().getDate() <= 3;
}

/** Cache key for weekly advice — keyed to the Monday date */
function weeklyCacheKey() {
  const d = new Date();
  return `ai_weekly_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Cache key for monthly advice — keyed to previous month */
function monthlyCacheKey() {
  const d = new Date();
  const prevMonth = d.getMonth() === 0 ? 11 : d.getMonth() - 1;
  const prevYear = d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear();
  return `ai_monthly_${prevYear}-${prevMonth + 1}`;
}

function buildWeeklyPayload(txs: Transaction[]) {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - 7);
  cutoff.setHours(0, 0, 0, 0);

  const week = txs.filter((tx) => {
    const d = new Date(tx.date);
    return d >= cutoff && d <= now;
  });

  const weekExpenses = week
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const weekIncome = week
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const catMap: Record<string, number> = {};
  week
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
  const categories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({ category, amount }));

  const dayMap: Record<string, number> = {};
  week
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const key = new Date(t.date).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      dayMap[key] = (dayMap[key] || 0) + t.amount;
    });
  const days = Object.entries(dayMap);
  const bestDay = days.length
    ? days.reduce((a, b) => (a[1] < b[1] ? a : b))
    : null;
  const worstDay = days.length
    ? days.reduce((a, b) => (a[1] > b[1] ? a : b))
    : null;

  return {
    type: "weekly" as const,
    weekExpenses,
    weekIncome,
    categories,
    bestDay: bestDay ? { day: bestDay[0], amount: bestDay[1] } : null,
    worstDay: worstDay ? { day: worstDay[0], amount: worstDay[1] } : null,
  };
}

function buildMonthlyPayload(txs: Transaction[]) {
  const now = new Date();
  const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const lastYear =
    now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const prevMonth = lastMonth === 0 ? 11 : lastMonth - 1;
  const prevYear = lastMonth === 0 ? lastYear - 1 : lastYear;

  const lastTxs = txs.filter((tx) => {
    const d = new Date(tx.date);
    return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
  });
  const prevTxs = txs.filter((tx) => {
    const d = new Date(tx.date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });

  const totalExpenses = lastTxs
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const totalIncome = lastTxs
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const prevExpenses = prevTxs
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const savings = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;
  const expenseDelta =
    prevExpenses > 0
      ? Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100)
      : 0;

  const catMap: Record<string, number> = {};
  lastTxs
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
  const categories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({ category, amount }));

  const monthName = new Date(lastYear, lastMonth, 1).toLocaleString(
    "default",
    { month: "long" }
  );

  return {
    type: "monthly" as const,
    monthName,
    totalExpenses,
    totalIncome,
    savings,
    savingsRate,
    expenseDelta,
    categories,
  };
}

/* ─── Single Advice Card ─────────────────────────────────── */
function AdviceCard({
  adviceType,
  cacheKey,
  dismissKey,
  label,
  sublabel,
  accentColor,
  payload,
}: {
  adviceType: AdviceType;
  cacheKey: string;
  dismissKey: string;
  label: string;
  sublabel: string;
  accentColor: string; // tailwind color class prefix e.g. "violet"
  payload: object;
}) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setAdvice(cached);
      return;
    }
    fetchAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  function fetchAdvice() {
    setFetching(true);
    setError(false);
    apiFetch("/api/ai/advice", {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.advice) {
          setAdvice(json.advice);
          localStorage.setItem(cacheKey, json.advice);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setFetching(false));
  }

  function dismiss() {
    setVisible(false);
  }

  const colors = {
    violet: {
      border: "border-violet-500/25",
      bg: "",
      iconBg: "bg-violet-500/15 border-violet-500/25",
      iconText: "text-violet-400",
      badge: "bg-violet-500/15 text-violet-300 border-violet-500/25",
      dot: "bg-violet-500",
    },
    emerald: {
      border: "border-emerald-500/25",
      bg: "",
      iconBg: "bg-emerald-500/15 border-emerald-500/25",
      iconText: "text-emerald-400",
      badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
      dot: "bg-emerald-500",
    },
  }[accentColor] ?? {
    border: "border-violet-500/25",
    bg: "",
    iconBg: "bg-violet-500/15 border-violet-500/25",
    iconText: "text-violet-400",
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/25",
    dot: "bg-violet-500",
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.38 }}
        className={`relative rounded-2xl bg-primary-pale p-5 shadow-xl`}
      >
        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-300 transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className={`p-1.5 rounded-lg ${colors.iconBg}`}
          >
            <Bot size={14} className={colors.iconText} />
          </div>
          <div>
            <p className={`text-xs font-black uppercase tracking-widest ${colors.iconText}`}>
              {label}
            </p>
            <p className="text-[10px] text-gray-600">{sublabel}</p>
          </div>
          <span
            className={`ml-auto mr-6 text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}
          >
            AI
          </span>
        </div>

        {/* Body */}
        {fetching ? (
          <div className="flex items-center gap-2 text-gray-500">
            <RefreshCw size={13} className="animate-spin" />
            <span className="text-xs">Generating advice…</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-between">
            <p className="text-xs text-red-400">
              Could not load advice. Try again later.
            </p>
            <button
              onClick={fetchAdvice}
              className="text-[11px] text-gray-500 hover:text-gray-300 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={11} /> Retry
            </button>
          </div>
        ) : advice ? (
          <p className="text-sm text-gray-300 leading-relaxed">{advice}</p>
        ) : null}

        {/* Footer pulse dot */}
        {!fetching && !error && advice && (
          <div className="flex items-center gap-1.5 mt-3">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`}
            />
            <span className="text-[10px] text-gray-600">
              {adviceType === "weekly"
                ? "Refreshes next Monday"
                : "Visible for first 3 days of the month"}
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Main Export ────────────────────────────────────────── */
export default function AIAdviceBanner({ txs, loading }: Props) {
  if (loading) return null;

  const showMonthly = isFirst3DaysOfMonth();
  const showWeekly = isMonday();

  if (!showMonthly && !showWeekly) return null;

  const monthlyPayload = showMonthly ? buildMonthlyPayload(txs) : null;
  const weeklyPayload = showWeekly ? buildWeeklyPayload(txs) : null;

  // Don't render if there's no transaction data to base advice on
  const hasData = txs.length > 0;
  if (!hasData) return null;

  const mKey = monthlyCacheKey();
  const wKey = weeklyCacheKey();

  return (
    <div className="space-y-4 mb-6">
      {showMonthly && monthlyPayload && (
        <AdviceCard
          adviceType="monthly"
          cacheKey={`ai_advice_${mKey}`}
          dismissKey={`ai_dismiss_${mKey}`}
          label="Monthly AI Advice"
          sublabel={`Review of ${monthlyPayload.monthName} · Navigate this month`}
          accentColor="emerald"
          payload={monthlyPayload}
        />
      )}
      {showWeekly && weeklyPayload && (
        <AdviceCard
          adviceType="weekly"
          cacheKey={`ai_advice_${wKey}`}
          dismissKey={`ai_dismiss_${wKey}`}
          label="Weekly AI Advice"
          sublabel="Last week's review · Tips for this week"
          accentColor="violet"
          payload={weeklyPayload}
        />
      )}
    </div>
  );
}
