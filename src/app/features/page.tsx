"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard,
  ArrowRight,
  Receipt,
  CalendarDays,
  Target,
  RefreshCcw,
  WalletMinimal,
  PiggyBank,
  BarChart3,
  TrendingUp,
  TrendingDown,
  UserRound,
  ShieldCheck,
  Download,
  Sparkles,
  Zap,
  Lock,
  CheckCircle2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryConfig";

const features = [
  {
    icon: LayoutDashboard,
    name: "Dashboard",
    href: "/dashboard",
    color: "indigo",
    tagline: "Your financial command center",
    description:
      "See your monthly income, expenses, savings rate, and today's spend at a glance. Recent transactions, smart insights, and a monthly report — all in one place.",
    bullets: ["Monthly income & expense totals", "Savings rate badge", "Today's spend tracker", "Recent 5 transactions with edit/delete"],
  },
  {
    icon: Receipt,
    name: "Transactions",
    href: "/transactions",
    color: "purple",
    tagline: "Every rupee, accounted for",
    description:
      "Full transaction history with search, filter by month, edit in place, and delete with confirmation. Color-coded categories make scanning fast.",
    bullets: ["Search & filter by month", "Edit any transaction inline", "Category icons & colors", "Sorted newest-first"],
  },
  {
    icon: CalendarDays,
    name: "Calendar View",
    href: "/calendar",
    color: "pink",
    tagline: "See your spending in time",
    description:
      "Heat-map calendar shows heavy vs light spending days at a glance. Navigate months, view per-day breakdowns, and click any transaction to open its detail.",
    bullets: ["4-tier heat map coloring", "Month stats bar (income/expense/net)", "Income dot per day", "Click-through to transaction detail"],
  },
  {
    icon: Target,
    name: "Budget Goals",
    href: "/budget-goals",
    color: "orange",
    tagline: "Spend with intent",
    description:
      "Set monthly spending limits per category. Speedometer gauges show utilization in real time — green when on track, orange at 80%, red when over.",
    bullets: ["Per-category limits", "Speedometer utilization gauge", "Over-budget & warning badges", "Remaining amount calculation"],
  },
  {
    icon: RefreshCcw,
    name: "Recurring Transactions",
    href: "/recurring",
    color: "violet",
    tagline: "Never miss a subscription",
    description:
      "Track subscriptions, rent, salary, and any repeating payment. Log instantly, pause without deleting, and see your total monthly recurring outflow.",
    bullets: ["Daily / weekly / monthly frequency", "Log Now — posts instantly", "Pause & resume without deleting", "Monthly outflow summary"],
  },
  {
    icon: WalletMinimal,
    name: "Debt & Lent",
    href: "/debt-lent",
    color: "amber",
    tagline: "Know who owes what",
    description:
      "Track money you've lent to friends and money you owe. Set due dates, mark as cleared, and see overdue alerts. Pending and cleared entries kept separate.",
    bullets: ["Lent vs debt split view", "Due date & overdue badge", "Mark as cleared", "Total owed / owed-to summary"],
  },
  {
    icon: PiggyBank,
    name: "Net Worth",
    href: "/net-worth",
    color: "yellow",
    tagline: "Your financial snapshot",
    description:
      "Track your bank balance and total net worth. Update your balance inline with a single tap — no separate page or form needed.",
    bullets: ["Bank balance tracking", "Inline edit with Enter/Escape", "Total net worth calculation", "Assets section (coming soon)"],
  },
  {
    icon: BarChart3,
    name: "Charts & Analytics",
    href: "/charts",
    color: "cyan",
    tagline: "Visualize your money",
    description:
      "Category pie charts, monthly trend lines, income vs expense bars, and weekly rhythm sparklines. Understand where your money actually goes.",
    bullets: ["Category breakdown pie chart", "Monthly income vs expense bars", "Trend line over time", "Weekly rhythm sparklines"],
  },
  {
    icon: TrendingDown,
    name: "Expense Tracker",
    href: "/expenses",
    color: "red",
    tagline: "Your outflows, filtered",
    description:
      "A dedicated view of only your expenses — searchable, filterable by month, with a running total for the selected period.",
    bullets: ["Expense-only view", "Monthly total at a glance", "Edit & delete inline", "Empty state with quick-add CTA"],
  },
  {
    icon: TrendingUp,
    name: "Income Tracker",
    href: "/inflow",
    color: "emerald",
    tagline: "Your inflows, at a glance",
    description:
      "A clean view of all income transactions. Know exactly what came in and when, with category and payment mode at a glance.",
    bullets: ["Income-only view", "Monthly inflow total", "Category & payment mode tags", "Sortable by date"],
  },
  {
    icon: UserRound,
    name: "Profile & Data",
    href: "/profile",
    color: "sky",
    tagline: "Own your data",
    description:
      "Export all your transactions as JSON, import from a backup, change your password, or wipe everything. Full control, no lock-in.",
    bullets: ["Export transactions to JSON", "Import from backup file", "Change password securely", "Delete all data (with confirmation)"],
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; glow: string; badge: string }> = {
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/25", text: "text-indigo-400", glow: "from-indigo-500/20", badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/25", text: "text-purple-400", glow: "from-purple-500/20", badge: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  pink:   { bg: "bg-pink-500/10",   border: "border-pink-500/25",   text: "text-pink-400",   glow: "from-pink-500/20",   badge: "bg-pink-500/15 text-pink-300 border-pink-500/30" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/25", text: "text-orange-400", glow: "from-orange-500/20", badge: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/25", text: "text-violet-400", glow: "from-violet-500/20", badge: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  amber:  { bg: "bg-amber-500/10",  border: "border-amber-500/25",  text: "text-amber-400",  glow: "from-amber-500/20",  badge: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/25", text: "text-yellow-400", glow: "from-yellow-500/20", badge: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
  cyan:   { bg: "bg-cyan-500/10",   border: "border-cyan-500/25",   text: "text-cyan-400",   glow: "from-cyan-500/20",   badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  red:    { bg: "bg-red-500/10",    border: "border-red-500/25",    text: "text-red-400",    glow: "from-red-500/20",    badge: "bg-red-500/15 text-red-300 border-red-500/30" },
  emerald:{ bg: "bg-emerald-500/10",border: "border-emerald-500/25",text: "text-emerald-400",glow: "from-emerald-500/20",badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  sky:    { bg: "bg-sky-500/10",    border: "border-sky-500/25",    text: "text-sky-400",    glow: "from-sky-500/20",    badge: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
};

const whyItems = [
  { icon: Zap,          title: "No fluff",       desc: "Every feature solves a real budgeting problem. No filler." },
  { icon: Lock,         title: "JWT secured",     desc: "Auth-protected routes, encrypted tokens, no data leaks." },
  { icon: Download,     title: "Your data",       desc: "Export everything as JSON anytime. No lock-in, ever." },
  { icon: ShieldCheck,  title: "Private",         desc: "Your transactions are never shared or sold. Period." },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] bg-indigo-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] bg-violet-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-6 pb-24">
        <Header />

        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto mt-16 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Sparkles size={13} />
            Everything MyBudgetory can do
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-5xl md:text-6xl font-black tracking-tight leading-none mb-5"
          >
            Built for people who{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              actually track money
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-gray-400 text-lg leading-relaxed mb-8"
          >
            11 powerful tools — from daily spending to debt tracking — all in one app. Free, private, and built to last.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-900/30 transition-all"
            >
              Go to Dashboard
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-7 py-3.5 rounded-2xl font-bold text-sm transition-all"
            >
              Sign In
            </Link>
          </motion.div>
        </section>

        {/* Feature grid */}
        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {features.map((feature, idx) => {
              const c = COLOR_MAP[feature.color];
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: (idx % 3) * 0.07 }}
                  className={`group relative bg-gray-900/70 border ${c.border} rounded-2xl p-6 hover:bg-gray-800/70 transition-all duration-300 overflow-hidden flex flex-col`}
                >
                  {/* Subtle top glow */}
                  <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${c.glow} to-transparent`} />

                  {/* Icon + name */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${c.bg} border ${c.border} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${c.text}`} />
                    </div>
                    <Link
                      href={feature.href}
                      className={`flex items-center gap-1 text-xs font-bold ${c.text} opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      Open <ArrowRight size={12} />
                    </Link>
                  </div>

                  <h2 className="text-lg font-black text-white mb-0.5">{feature.name}</h2>
                  <p className={`text-xs font-bold mb-3 ${c.text}`}>{feature.tagline}</p>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">{feature.description}</p>

                  {/* Bullets */}
                  <ul className="space-y-1.5">
                    {feature.bullets.map(b => (
                      <li key={b} className="flex items-start gap-2 text-xs text-gray-500">
                        <CheckCircle2 size={12} className={`${c.text} flex-shrink-0 mt-0.5`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Category showcase */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-black tracking-tight mb-2">10 spending categories</h2>
            <p className="text-gray-500 text-sm">Every transaction is tagged, color-coded, and icon-labeled.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {Object.entries(CATEGORY_ICONS).map(([name, Icon], idx) => {
              const colors = CATEGORY_COLORS[name] || CATEGORY_COLORS["Others"];
              return (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${colors.bg} border ${colors.border}`}
                >
                  <Icon className={`w-4 h-4 ${colors.text}`} />
                  <span className={`text-xs font-bold ${colors.text}`}>{name}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* Why section */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-black tracking-tight mb-2">Why MyBudgetory?</h2>
            <p className="text-gray-500 text-sm">No ads. No upsells. No nonsense.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {whyItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.07 }}
                  className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 text-center"
                >
                  <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon size={18} className="text-indigo-400" />
                  </div>
                  <p className="font-black text-sm text-white mb-1">{item.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center bg-gradient-to-br from-indigo-950/60 via-gray-900 to-violet-950/60 border border-indigo-500/20 rounded-3xl p-12"
        >
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            Ready to take control?
          </h2>
          <p className="text-gray-400 mb-8 text-base">Free. Always. No credit card.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-indigo-900/30 transition-all"
            >
              Open Dashboard
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-4 rounded-2xl font-bold text-base transition-all"
            >
              Create Account
            </Link>
          </div>
        </motion.section>
      </div>

      <Footer />
    </div>
  );
}
