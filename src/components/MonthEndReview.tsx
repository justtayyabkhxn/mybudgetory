"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Flame,
  Sparkles,
  Target,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
} from "lucide-react";

type Transaction = {
  _id: string;
  amount: number;
  date: string;
  category: string;
  type: "income" | "expense";
  title?: string;
};

interface Props {
  transactions: Transaction[];
  userName?: string;
}

function getLastMonthRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // current month index
  const lastMonth = m === 0 ? 11 : m - 1;
  const lastYear = m === 0 ? y - 1 : y;
  const prevMonth = lastMonth === 0 ? 11 : lastMonth - 1;
  const prevYear = lastMonth === 0 ? lastYear - 1 : lastYear;
  return { lastMonth, lastYear, prevMonth, prevYear };
}

function isWithinFirst3Days() {
  return new Date().getDate() <= 3;
}

function monthName(m: number) {
  return new Date(2000, m, 1).toLocaleString("default", { month: "long" });
}

export default function MonthEndReview({ transactions, userName }: Props) {
  const [showReview, setShowReview] = useState(true);
  const [showAutopsy, setShowAutopsy] = useState(true);
  const [cardIndex, setCardIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const visible = isWithinFirst3Days();
  const { lastMonth, lastYear, prevMonth, prevYear } = getLastMonthRange();

  const { lastTxs, prevTxs } = useMemo(() => {
    const lastTxs = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    });
    const prevTxs = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });
    return { lastTxs, prevTxs };
  }, [transactions, lastMonth, lastYear, prevMonth, prevYear]);

  const stats = useMemo(() => {
    const lastExpense = lastTxs.filter((t) => t.type === "expense");
    const prevExpense = prevTxs.filter((t) => t.type === "expense");

    const totalExpense = lastExpense.reduce((s, t) => s + t.amount, 0);
    const prevTotalExpense = prevExpense.reduce((s, t) => s + t.amount, 0);
    const totalIncome = lastTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);

    // Zero-spend days
    const daysInLastMonth = new Date(lastYear, lastMonth + 1, 0).getDate();
    const spendDaySet = new Set(lastExpense.map((t) => new Date(t.date).getDate()));
    const zeroSpendDays = daysInLastMonth - spendDaySet.size;

    // Top 3 biggest transactions
    const top3 = [...lastExpense].sort((a, b) => b.amount - a.amount).slice(0, 3);

    // Category totals
    const catTotals: Record<string, number> = {};
    lastExpense.forEach((t) => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });

    const prevCatTotals: Record<string, number> = {};
    prevExpense.forEach((t) => { prevCatTotals[t.category] = (prevCatTotals[t.category] || 0) + t.amount; });

    const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

    // Surprise category: biggest absolute increase vs prev month
    const surpriseCat = Object.entries(catTotals)
      .map(([cat, amt]) => ({ cat, diff: amt - (prevCatTotals[cat] || 0) }))
      .sort((a, b) => b.diff - a.diff)[0];

    // Expense change %
    const expenseDelta = prevTotalExpense > 0
      ? Math.round(((totalExpense - prevTotalExpense) / prevTotalExpense) * 100)
      : 0;

    // Streak: consecutive days from end of month where spend < daily avg
    const dailyAvg = totalExpense / daysInLastMonth;
    let streak = 0;
    for (let d = daysInLastMonth; d >= 1; d--) {
      const daySpend = lastExpense.filter((t) => new Date(t.date).getDate() === d).reduce((s, t) => s + t.amount, 0);
      if (daySpend <= dailyAvg) streak++;
      else break;
    }

    // Best day (lowest nonzero spend)
    const daySpends = Array.from(spendDaySet).map((d) => ({
      day: d,
      amt: lastExpense.filter((t) => new Date(t.date).getDate() === d).reduce((s, t) => s + t.amount, 0),
    }));
    const bestDay = daySpends.sort((a, b) => a.amt - b.amt)[0];

    // Next month focus: highest category
    const focusCat = topCategory ? topCategory[0] : null;

    return {
      totalExpense, prevTotalExpense, totalIncome, zeroSpendDays,
      top3, topCategory, surpriseCat, expenseDelta, streak, bestDay,
      focusCat, daysInLastMonth,
    };
  }, [lastTxs, prevTxs, lastMonth, lastYear]);

  if (!visible || lastTxs.length === 0) return null;

  const lmName = monthName(lastMonth);

  // ── Autopsy paragraph ──────────────────────────────────────────────────────
  const autopsyLines: string[] = [];
  if (stats.expenseDelta !== 0) {
    autopsyLines.push(
      stats.expenseDelta > 0
        ? `You spent ${stats.expenseDelta}% more than ${monthName(prevMonth)} — ₹${stats.totalExpense.toLocaleString()} went out the door.`
        : `Good news: you spent ${Math.abs(stats.expenseDelta)}% less than ${monthName(prevMonth)}, keeping it at ₹${stats.totalExpense.toLocaleString()}.`
    );
  } else {
    autopsyLines.push(`You spent ₹${stats.totalExpense.toLocaleString()} in ${lmName}.`);
  }
  if (stats.top3.length > 0) {
    const names = stats.top3.map((t) => `${t.title || t.category} (₹${t.amount.toLocaleString()})`).join(", ");
    autopsyLines.push(`Your 3 biggest hits were: ${names}.`);
  }
  if (stats.zeroSpendDays > 0) {
    autopsyLines.push(`You had ${stats.zeroSpendDays} zero-spend day${stats.zeroSpendDays > 1 ? "s" : ""} — ${stats.zeroSpendDays >= 10 ? "impressive discipline." : "every one counts."}`);
  }
  if (stats.totalIncome > 0) {
    const saved = stats.totalIncome - stats.totalExpense;
    const rate = Math.round((saved / stats.totalIncome) * 100);
    autopsyLines.push(
      saved >= 0
        ? `You saved ₹${saved.toLocaleString()} (${rate}% of income). ${rate >= 20 ? "Solid." : "Room to grow."}`
        : `You spent ₹${Math.abs(saved).toLocaleString()} more than you earned. Worth a look.`
    );
  }

  // ── Review cards ──────────────────────────────────────────────────────────
  const cards = [
    {
      icon: Trophy,
      color: "text-yellow-400",
      bg: "from-yellow-500/10 border-yellow-500/20",
      label: "Biggest Win",
      headline:
        stats.zeroSpendDays >= 5
          ? `${stats.zeroSpendDays} zero-spend days`
          : stats.expenseDelta < 0
          ? `${Math.abs(stats.expenseDelta)}% less than last month`
          : stats.streak > 3
          ? `${stats.streak}-day low-spend streak`
          : `₹${stats.totalIncome.toLocaleString()} earned`,
      detail:
        stats.zeroSpendDays >= 5
          ? `That's ${stats.zeroSpendDays} days you chose not to spend. Keep that habit.`
          : stats.expenseDelta < 0
          ? `You kept more money than ${monthName(prevMonth)}. That's the direction.`
          : `You ended the month on a controlled note.`,
    },
    {
      icon: Flame,
      color: "text-red-400",
      bg: "from-red-500/10 border-red-500/20",
      label: "Biggest Fail",
      headline:
        stats.topCategory
          ? `₹${stats.topCategory[1].toLocaleString()} on ${stats.topCategory[0]}`
          : "Check your top category",
      detail:
        stats.topCategory
          ? `${stats.topCategory[0]} was your heaviest category in ${lmName}. Is that intentional?`
          : `Review where most of your money went.`,
    },
    {
      icon: Sparkles,
      color: "text-purple-400",
      bg: "from-purple-500/10 border-purple-500/20",
      label: "Surprise",
      headline:
        stats.surpriseCat && stats.surpriseCat.diff > 0
          ? `${stats.surpriseCat.cat} jumped ₹${stats.surpriseCat.diff.toLocaleString()}`
          : "Spending stayed consistent",
      detail:
        stats.surpriseCat && stats.surpriseCat.diff > 0
          ? `${stats.surpriseCat.cat} grew the most vs ${monthName(prevMonth)}. Was something different this month?`
          : `No category spiked dramatically. Predictable month.`,
    },
    {
      icon: TrendingDown,
      color: "text-cyan-400",
      bg: "from-cyan-500/10 border-cyan-500/20",
      label: "Streak",
      headline:
        stats.streak > 0
          ? `${stats.streak}-day end-of-month streak`
          : "No closing streak",
      detail:
        stats.streak > 0
          ? `You finished ${lmName} with ${stats.streak} consecutive days at or below your daily average. Momentum.`
          : `The last few days of ${lmName} were heavy. Watch the month-end splurge.`,
    },
    {
      icon: Target,
      color: "text-green-400",
      bg: "from-green-500/10 border-green-500/20",
      label: "Next Month Focus",
      headline: stats.focusCat ? `Cut back on ${stats.focusCat}` : "Keep the discipline",
      detail:
        stats.focusCat
          ? `${stats.focusCat} was your biggest drain in ${lmName}. Set a limit before the month starts.`
          : `You're in control. Set a stretch savings goal for next month.`,
    },
  ];

  const prev = () => {
    setDirection(-1);
    setCardIndex((i) => (i - 1 + cards.length) % cards.length);
  };
  const next = () => {
    setDirection(1);
    setCardIndex((i) => (i + 1) % cards.length);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* ── Spending Autopsy ── */}
      <AnimatePresence>
        {showAutopsy && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.35 }}
            className="relative rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-gray-900/60 to-gray-900/80 p-5 shadow-xl"
          >
            <button
              onClick={() => setShowAutopsy(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-300 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25">
                <FileText size={14} className="text-indigo-400" />
              </div>
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">
                {lmName} Autopsy
              </p>
              <span className="ml-auto text-[10px] text-gray-600 font-semibold">
                {userName ? `For ${userName}` : ""}
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed space-y-1">
              {autopsyLines.map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Monthly Review carousel ── */}
      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.35 }}
            className="relative rounded-2xl border border-white/10 bg-gray-900/80 p-5 shadow-xl overflow-hidden"
          >
            <button
              onClick={() => setShowReview(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-300 transition-colors cursor-pointer z-10"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                {lmName} Review
              </p>
              <div className="flex gap-1 ml-auto mr-6">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > cardIndex ? 1 : -1); setCardIndex(i); }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === cardIndex ? "w-5 bg-white/60" : "w-1.5 bg-white/15"}`}
                  />
                ))}
              </div>
            </div>

            <div className="relative min-h-[110px]">
              <AnimatePresence mode="wait" custom={direction}>
                {(() => {
                  const card = cards[cardIndex];
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={cardIndex}
                      custom={direction}
                      variants={{
                        enter: (d: number) => ({ x: d * 60, opacity: 0 }),
                        center: { x: 0, opacity: 1 },
                        exit: (d: number) => ({ x: d * -60, opacity: 0 }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      className={`rounded-xl border bg-gradient-to-br ${card.bg} via-transparent to-transparent p-4`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={15} className={card.color} />
                        <span className={`text-xs font-black uppercase tracking-widest ${card.color}`}>
                          {card.label}
                        </span>
                      </div>
                      <p className="text-lg font-black text-white leading-tight mb-1">
                        {card.headline}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {card.detail}
                      </p>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={prev}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-xs text-gray-600">{cardIndex + 1} / {cards.length}</span>
              <button
                onClick={next}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
