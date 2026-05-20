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
  PieChart,
  Activity,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORY_ICONS } from "@/lib/categoryConfig";

/* ─── Design tokens ──────────────────────────────────────────── */
const iconColors = [
  { bg: "bg-violet-500/10 border-violet-500/20", icon: "text-violet-400" },
  { bg: "bg-indigo-500/10 border-indigo-500/20", icon: "text-indigo-400" },
  { bg: "bg-emerald-500/10 border-emerald-500/20", icon: "text-emerald-400" },
  { bg: "bg-amber-500/10 border-amber-500/20", icon: "text-amber-400" },
  { bg: "bg-sky-500/10 border-sky-500/20", icon: "text-sky-400" },
  { bg: "bg-rose-500/10 border-rose-500/20", icon: "text-rose-400" },
  { bg: "bg-purple-500/10 border-purple-500/20", icon: "text-purple-400" },
  { bg: "bg-teal-500/10 border-teal-500/20", icon: "text-teal-400" },
  { bg: "bg-orange-500/10 border-orange-500/20", icon: "text-orange-400" },
  { bg: "bg-cyan-500/10 border-cyan-500/20", icon: "text-cyan-400" },
  { bg: "bg-fuchsia-500/10 border-fuchsia-500/20", icon: "text-fuchsia-400" },
];

const topAccents = [
  "via-violet-500/40",
  "via-indigo-500/40",
  "via-emerald-500/40",
  "via-amber-500/40",
  "via-sky-500/40",
  "via-rose-500/40",
  "via-purple-500/40",
  "via-teal-500/40",
  "via-orange-500/40",
  "via-cyan-500/40",
  "via-fuchsia-500/40",
];

/* ─── Data ───────────────────────────────────────────────────── */
const features = [
  {
    icon: LayoutDashboard,
    name: "Dashboard",
    href: "/dashboard",
    tagline: "Your financial command center",
    description:
      "See your monthly income, expenses, savings rate, and today's spend at a glance. Recent transactions, smart insights, and a monthly report — all in one place.",
    bullets: [
      "Monthly income & expense totals",
      "Savings rate badge",
      "Today's spend tracker",
      "Recent 5 transactions with edit/delete",
    ],
  },
  {
    icon: Receipt,
    name: "Transactions",
    href: "/transactions",
    tagline: "Every rupee, accounted for",
    description:
      "Full transaction history with search, filter by month, edit in place, and delete with confirmation. Color-coded categories make scanning fast.",
    bullets: [
      "Search & filter by month",
      "Edit any transaction inline",
      "Category icons & colors",
      "Sorted newest-first",
    ],
  },
  {
    icon: CalendarDays,
    name: "Calendar View",
    href: "/calendar",
    tagline: "See your spending in time",
    description:
      "Heat-map calendar shows heavy vs light spending days at a glance. Navigate months, view per-day breakdowns, and click any transaction to open its detail.",
    bullets: [
      "4-tier heat map coloring",
      "Month stats bar (income/expense/net)",
      "Income dot per day",
      "Click-through to transaction detail",
    ],
  },
  {
    icon: Target,
    name: "Budget Goals",
    href: "/budget-goals",
    tagline: "Spend with intent",
    description:
      "Set monthly spending limits per category. Speedometer gauges show utilization in real time — green when on track, orange at 80%, red when over.",
    bullets: [
      "Per-category limits",
      "Speedometer utilization gauge",
      "Over-budget & warning badges",
      "Remaining amount calculation",
    ],
  },
  {
    icon: RefreshCcw,
    name: "Recurring Transactions",
    href: "/recurring",
    tagline: "Never miss a subscription",
    description:
      "Track subscriptions, rent, salary, and any repeating payment. Log instantly, pause without deleting, and see your total monthly recurring outflow.",
    bullets: [
      "Daily / weekly / monthly frequency",
      "Log Now — posts instantly",
      "Pause & resume without deleting",
      "Monthly outflow summary",
    ],
  },
  {
    icon: WalletMinimal,
    name: "Debt & Lent",
    href: "/debt-lent",
    tagline: "Know who owes what",
    description:
      "Track money you've lent to friends and money you owe. Set due dates, mark as cleared, and see overdue alerts. Pending and cleared entries kept separate.",
    bullets: [
      "Lent vs debt split view",
      "Due date & overdue badge",
      "Mark as cleared",
      "Total owed / owed-to summary",
    ],
  },
  {
    icon: PiggyBank,
    name: "Net Worth",
    href: "/net-worth",
    tagline: "Your financial snapshot",
    description:
      "Track your bank balance and total net worth. Update your balance inline with a single tap — no separate page or form needed.",
    bullets: [
      "Bank balance tracking",
      "Inline edit with Enter/Escape",
      "Total net worth calculation",
      "Assets section (coming soon)",
    ],
  },
  {
    icon: BarChart3,
    name: "Charts & Analytics",
    href: "/charts",
    tagline: "Visualize your money",
    description:
      "Five powerful chart views that turn raw numbers into clear financial stories. Understand patterns, spot trends, and see exactly where your money goes.",
    bullets: [
      "Category breakdown pie chart",
      "Monthly income vs expense bars",
      "Spending trend line over time",
      "Weekly rhythm sparklines",
      "Calendar heatmap (daily intensity)",
    ],
  },
  {
    icon: TrendingDown,
    name: "Expense Tracker",
    href: "/expenses",
    tagline: "Your outflows, filtered",
    description:
      "A dedicated view of only your expenses — searchable, filterable by month, with a running total for the selected period.",
    bullets: [
      "Expense-only view",
      "Monthly total at a glance",
      "Edit & delete inline",
      "Empty state with quick-add CTA",
    ],
  },
  {
    icon: TrendingUp,
    name: "Income Tracker",
    href: "/inflow",
    tagline: "Your inflows, at a glance",
    description:
      "A clean view of all income transactions. Know exactly what came in and when, with category and payment mode at a glance.",
    bullets: [
      "Income-only view",
      "Monthly inflow total",
      "Category & payment mode tags",
      "Sortable by date",
    ],
  },
  {
    icon: UserRound,
    name: "Profile & Data",
    href: "/profile",
    tagline: "Own your data",
    description:
      "Export all your transactions as JSON, import from a backup, change your password, or wipe everything. Full control, no lock-in.",
    bullets: [
      "Export transactions to JSON",
      "Import from backup file",
      "Change password securely",
      "Delete all data (with confirmation)",
    ],
  },
];

const chartFeatures = [
  {
    icon: PieChart,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    title: "Category Breakdown",
    desc: "Pie chart showing which spending categories eat up the most budget each month.",
  },
  {
    icon: BarChart3,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    title: "Income vs Expenses",
    desc: "Grouped monthly bars — instantly compare what came in vs what went out.",
  },
  {
    icon: TrendingDown,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    title: "Spending Trend Line",
    desc: "Rolling line chart that reveals if your spending is climbing or falling over time.",
  },
  {
    icon: Activity,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "Weekly Rhythm Sparklines",
    desc: "Day-of-week sparklines expose habitual spending patterns — weekends, paydays, and more.",
  },
  {
    icon: CalendarDays,
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
    title: "Calendar Heatmap",
    desc: "Full-month grid where color intensity shows heavy vs light spending days at a glance.",
  },
];

const whyItems = [
  { icon: Zap,         color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20",   title: "No fluff",    desc: "Every feature solves a real budgeting problem. No filler." },
  { icon: Lock,        color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", title: "JWT secured", desc: "Auth-protected routes, encrypted tokens, no data leaks." },
  { icon: Download,    color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20",title: "Your data",  desc: "Export everything as JSON anytime. No lock-in, ever." },
  { icon: ShieldCheck, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", title: "Private",     desc: "Your transactions are never shared or sold. Period." },
];

/* ─── Image components ───────────────────────────────────────── */
interface ImgPlaceholderProps {
  label: string;
  src: string;
  aspect?: string;
}

const ImgPlaceholder = ({ label, src, aspect = "aspect-video" }: ImgPlaceholderProps) => (
  <div className={`relative ${aspect} overflow-hidden`}>
    <img src={src} alt={label} className="w-full h-full object-cover" />
  </div>
);

const AppFrame = ({ label, src, aspect = "aspect-video" }: ImgPlaceholderProps) => (
  <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#0d0d14]">
    {/* Browser chrome */}
    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06] bg-[#111118]">
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
      </div>
      <div className="flex-1 h-4 rounded-md bg-white/[0.05] border border-white/[0.06] mx-2" />
    </div>
    <ImgPlaceholder label={label} src={src} aspect={aspect} />
  </div>
);

const SectionDivider = () => (
  <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent my-12" />
);

/* ─── Page ───────────────────────────────────────────────────── */
export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Dot grid */}
      <div className="fixed inset-0 pointer-events-none auth-dot-grid opacity-[0.14]" />
      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-6 pb-24">
        <Header />

        {/* ── Hero ── */}
        <section className="text-center max-w-3xl mx-auto mt-16 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-violet-500/[0.08] border border-violet-500/20 text-violet-400 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6"
          >
            <Sparkles size={11} />
            Everything MyBudgetory can do
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-5xl md:text-6xl font-black tracking-tight leading-none mb-5"
          >
            Built for people who{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              actually track money
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-gray-500 text-base leading-relaxed mb-8"
          >
            11 powerful tools — from daily spending to debt tracking — all in
            one app. Free, private, and built to last.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="flex items-center justify-center gap-3 flex-wrap mb-12"
          >
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white active:scale-95 transition-all duration-150"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              Go to Dashboard
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 border border-white/[0.12] hover:border-violet-500/40 text-gray-400 hover:text-white px-7 py-3 rounded-xl font-bold text-sm transition-all duration-200"
            >
              Sign In
            </Link>
          </motion.div>

        </section>

        <SectionDivider />

        {/* ── Feature grid ── */}
        <section className="mb-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-400 mb-2">
              All 11 Features
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              One app. Every tool you need.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const c = iconColors[idx % iconColors.length];
              const accent = topAccents[idx % topAccents.length];
              return (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: (idx % 3) * 0.07 }}
                  className="group relative bg-[#111118] border border-white/[0.07] rounded-2xl p-6 hover:bg-[#16161f] hover:border-white/[0.13] transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Top edge accent */}
                  <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${accent} to-transparent`} />

                  {/* Icon + Open link */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${c.bg} border w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${c.icon}`} />
                    </div>
                    <Link
                      href={feature.href}
                      className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-violet-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      Open <ArrowRight size={11} />
                    </Link>
                  </div>

                  <h2 className="text-base font-black text-white mb-0.5">
                    {feature.name}
                  </h2>
                  <p className={`text-[11px] font-semibold mb-3 ${c.icon}`}>
                    {feature.tagline}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
                    {feature.description}
                  </p>

                  {/* Bullets */}
                  <ul className="space-y-1.5">
                    {feature.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 text-xs text-gray-500"
                      >
                        <CheckCircle2
                          size={11}
                          className={`${c.icon} flex-shrink-0 mt-0.5`}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </section>

        <SectionDivider />

        {/* ── Charts & Analytics deep-dive ── */}
        <section className="mb-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-400 mb-2">
              Charts & Analytics
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
              Five views. Total financial clarity.
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Numbers alone don&apos;t tell the story. These charts turn your raw transaction data into patterns you can actually act on.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Left: screenshots */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3 flex flex-col gap-4"
            >
              <AppFrame label="Charts — pie & bar" src="/screenshots/charts.png" aspect="aspect-[4/3]" />
            </motion.div>

            {/* Right: chart feature list */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 flex flex-col gap-3"
            >
              {chartFeatures.map((cf, idx) => {
                const Icon = cf.icon;
                return (
                  <motion.div
                    key={cf.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.06 }}
                    className="flex gap-3 bg-[#111118] border border-white/[0.07] rounded-xl p-4 hover:border-white/[0.13] transition-colors duration-200"
                  >
                    <div className={`${cf.bg} border w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon size={15} className={cf.color} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5">{cf.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{cf.desc}</p>
                    </div>
                  </motion.div>
                );
              })}

              <Link
                href="/charts"
                className="group flex items-center justify-center gap-2 mt-2 border border-violet-500/30 hover:border-violet-500/60 bg-violet-500/[0.06] hover:bg-violet-500/[0.12] text-violet-400 hover:text-violet-300 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200"
              >
                Open Charts
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>

        <SectionDivider />

        {/* ── Category showcase ── */}
        <section className="mb-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-400 mb-2">
              Categories
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">
              10 spending categories
            </h2>
            <p className="text-gray-600 text-sm">
              Every transaction is tagged, color-coded, and icon-labeled.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2.5"
          >
            {Object.entries(CATEGORY_ICONS).map(([name, Icon], idx) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111118] border border-white/[0.07] hover:border-violet-500/30 hover:bg-violet-500/[0.05] transition-all duration-200"
              >
                <Icon className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-semibold text-gray-400">
                  {name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <SectionDivider />

        {/* ── Why section ── */}
        <section className="mb-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-400 mb-2">
              Our Promise
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">
              Why MyBudgetory?
            </h2>
            <p className="text-gray-600 text-sm">
              No ads. No upsells. No nonsense.
            </p>
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
                  className="bg-[#111118] border border-white/[0.07] rounded-2xl p-5 text-center hover:border-white/[0.13] transition-colors duration-200"
                >
                  <div className={`w-9 h-9 ${item.bg} border rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon size={16} className={item.color} />
                  </div>
                  <p className="font-black text-sm text-white mb-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <SectionDivider />

        {/* ── CTA ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center bg-[#111118] border border-white/[0.07] rounded-3xl p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
          <div className="w-10 h-10 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 size={18} className="text-violet-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
            Ready to take control?
          </h2>
          <p className="text-gray-600 mb-8 text-sm">
            Free. Always. No credit card.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white active:scale-95 transition-all duration-150"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              Open Dashboard
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 border border-white/[0.12] hover:border-violet-500/40 text-gray-400 hover:text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-200"
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
