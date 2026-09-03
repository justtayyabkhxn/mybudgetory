"use client";

import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import Piggy from "../../public/piggy.png";
import {
  Wallet,
  Plane,
  TrendingUp,
  CalendarCheck,
  ShieldCheck,
  Github,
  Play,
  Sparkles,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  LayoutDashboard,
  Receipt,
  CalendarDays,
  Target,
  RefreshCcw,
  WalletMinimal,
  PiggyBank,
  TrendingDown,
  UserRound,
  Zap,
  UserPlus,
  Lock,
  Download,
  Monitor,
  PieChart,
  Activity,
} from "lucide-react";
import Footer from "@/components/Footer";
import SlideUp from "@/components/SlideUp";
import { motion } from "framer-motion";

const coreFeatures = [
  {
    icon: TrendingUp,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    accentLine: "from-emerald-500/40",
    title: "Real-time analytics",
    desc: "Category pie charts, monthly trend lines, income vs expense bars. Know exactly where every rupee goes.",
  },
  {
    icon: Target,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
    accentLine: "from-violet-500/40",
    title: "Smart budgeting",
    desc: "Set per-category limits. Speedometer gauges track utilization live and warn before you overspend.",
  },
  {
    icon: ShieldCheck,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    accentLine: "from-blue-500/40",
    title: "Private by design",
    desc: "JWT-secured routes, encrypted tokens. Your transactions are never shared, sold, or used for ads.",
  },
];

const chartFeatures = [
  {
    icon: PieChart,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    title: "Category Breakdown",
    desc: "Pie chart showing how your spending splits across categories — food, transport, rent, and more.",
  },
  {
    icon: BarChart3,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    title: "Monthly Income vs Expenses",
    desc: "Side-by-side bars comparing what came in and went out each month at a glance.",
  },
  {
    icon: TrendingDown,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    title: "Spending Trend Line",
    desc: "Line chart tracking your cumulative expenses over time to spot patterns early.",
  },
  {
    icon: Activity,
    color: "text-ink-deep",
    bg: "bg-primary/10",
    title: "Weekly Rhythm Sparklines",
    desc: "Mini sparklines reveal which days of the week you tend to spend the most.",
  },
];

const steps = [
  {
    num: "01",
    icon: UserPlus,
    title: "Create your account",
    desc: "Sign up free in 30 seconds. No credit card, no trial — just your account, ready to go.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    num: "02",
    icon: Receipt,
    title: "Log your transactions",
    desc: "Add expenses and income manually, or import from a JSON backup file in seconds.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    num: "03",
    icon: BarChart3,
    title: "Watch insights appear",
    desc: "Charts, budget health, calendar heatmaps, and net worth — all update in real time.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

const allFeatures = [
  { icon: LayoutDashboard, name: "Dashboard",      tagline: "Financial command center",  href: "/dashboard",    color: "text-indigo-400",  bg: "bg-indigo-500/10"  },
  { icon: Receipt,         name: "Transactions",   tagline: "Full history & search",     href: "/transactions", color: "text-purple-400",  bg: "bg-purple-500/10"  },
  { icon: CalendarDays,    name: "Calendar",        tagline: "Heat-map spending days",    href: "/calendar",     color: "text-pink-400",    bg: "bg-pink-500/10"    },
  { icon: Target,          name: "Budget Goals",    tagline: "Per-category limits",       href: "/budget-goals", color: "text-warning-deep",  bg: "bg-orange-500/10"  },
  { icon: RefreshCcw,      name: "Recurring",       tagline: "Subscription tracker",      href: "/recurring",    color: "text-violet-400",  bg: "bg-violet-500/10"  },
  { icon: WalletMinimal,   name: "Debt & Lent",     tagline: "Who owes what",             href: "/debt-lent",    color: "text-warning-deep",   bg: "bg-amber-500/10"   },
  { icon: PiggyBank,       name: "Net Worth",       tagline: "Your financial snapshot",   href: "/net-worth",    color: "text-warning-deep",  bg: "bg-yellow-500/10"  },
  { icon: BarChart3,       name: "Charts",          tagline: "Trend visualisation",       href: "/charts",       color: "text-ink-deep",    bg: "bg-primary/10"    },
  { icon: TrendingDown,    name: "Expenses",        tagline: "Outflows filtered",         href: "/expenses",     color: "text-rose-400",    bg: "bg-rose-500/10"    },
  { icon: TrendingUp,      name: "Income",          tagline: "Inflows at a glance",       href: "/inflow",       color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: UserRound,       name: "Profile & Data",  tagline: "Export, import, own it",    href: "/profile",      color: "text-ink-deep",     bg: "bg-primary/10"     },
];

const budgetModes = [
  {
    href: "/daily-tracker",
    title: "Daily Expense Tracker",
    icon: Wallet,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    accentLine: "from-emerald-500/40",
    hoverBorder: "hover:border-emerald-500/30",
    ctaColor: "text-emerald-400 hover:text-emerald-300",
    bullets: ["Daily spending log", "Category breakdown & goals", "Calendar heatmap", "Budget limit alerts"],
    desc: "Monitor your daily spending, visualize trends, and stay in control every single day.",
  },
  {
    href: "/event-budget",
    title: "Event / Travel Budget",
    icon: Plane,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
    accentLine: "from-indigo-500/40",
    hoverBorder: "hover:border-indigo-500/30",
    ctaColor: "text-indigo-400 hover:text-indigo-300",
    bullets: ["Dedicated event budget", "Participant expense split", "Per-event tracking", "Shareable summary link"],
    desc: "Plan and track budgets for trips, weddings, or any group event with clarity.",
  },
];

const testimonials = [
  { text: "Helped me cut down my monthly food costs by 30%.",       author: "Anika M.",  role: "Student"           },
  { text: "I planned my entire Goa trip under budget with this.",   author: "Rahul S.",  role: "Software Engineer" },
  { text: "Perfect for tracking part-time income and rent.",        author: "Arsh K.",   role: "Freelancer"        },
];

const whyItems = [
  { icon: Zap,      title: "No fluff",    desc: "Every feature solves a real problem. No filler, no bloat."       },
  { icon: Lock,     title: "JWT secured", desc: "Auth-protected routes. Encrypted tokens. No data leaks."          },
  { icon: Download, title: "Your data",   desc: "Export everything as JSON anytime. No lock-in, ever."             },
  { icon: Github,   title: "Open source", desc: "Fully open source. Read the code, contribute, or self-host."     },
];

/* ─── Layout helpers ─── */

const SectionDivider = () => (
  <div className="h-px bg-hairline my-12" />
);

type SectionHeaderProps = { tag?: string; tagIcon?: React.ReactNode; title: string; subtitle?: string; center?: boolean };
const SectionHeader = ({ tag, tagIcon, title, subtitle, center = true }: SectionHeaderProps) => (
  <div className={`mb-8 ${center ? "text-center" :""}`}>
    {tag && (
      <div className={`inline-flex items-center gap-1.5 bg-violet-500/10 text-violet-400 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4`}>
        {tagIcon}
        {tag}
      </div>
    )}
    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-ink mb-3">{title}</h2>
    {subtitle && (
      <p className={`text-gray-500 text-base leading-relaxed ${center ? "max-w-xl mx-auto" : "max-w-xl"}`}>
        {subtitle}
      </p>
    )}
  </div>
);

/* ═══════════════════════════════════════
   PAGE
═══════════════════════════════════════ */
export default function LandingPage() {
  return (
    <main className="min-h-screen text-ink">

      <div className="relative max-w-6xl mx-auto px-6 py-5">
        <Header />

        {/* ══════════════════════════
            HERO
        ══════════════════════════ */}
        <section className="pt-14 pb-4">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">

            {/* Left — text */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-2 flex-wrap mb-7"
              >
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Free Forever
                </span>
                <span className="inline-flex items-center gap-1.5 bg-violet-500/10 text-violet-400 px-3 py-1 rounded-full text-[11px] font-semibold">
                  <Github className="h-3 w-3" />
                  Open Source
                </span>
                <span className="inline-flex items-center gap-1.5 bg-canvas/80 text-gray-500 px-3 py-1 rounded-full text-[11px] font-semibold">
                  No Credit Card
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
                className="text-5xl md:text-6xl font-black tracking-tight leading-[1.04] mb-5"
              >
                <span className="text-ink">Track. Budget.</span>
                <br />
                <span className="text-ink-deep">
                  Save.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.26 }}
                className="text-gray-400 text-base leading-relaxed mb-7 max-w-md"
              >
                MyBudgetory is a free personal finance app with 11 built-in tools —
                daily expense tracking, event budgets, debt management, charts, and more.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.34 }}
                className="flex gap-3 mb-5"
              >
                <Link href="/features">
                  <button className="group bg-primary hover:bg-primary-active text-on-primary px-7 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all duration-200 active:scale-95">
                    <Sparkles size={15} />
                    Features
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </Link>
                <Link href="/dashboard">
                  <button className="bg-canvas-soft/80 hover:bg-primary-pale text-ink px-7 py-3 rounded-3xl font-semibold text-sm flex items-center gap-2 transition-all duration-200">
                    <TrendingUp size={15} />
                  Dashboard
                  </button>
                </Link>

              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.44 }}
                className="flex items-center gap-5 flex-wrap text-xs text-gray-600"
              >
                {["No credit card needed", "Import` & export data", "Private by default"].map((t, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 size={11} className="text-emerald-600" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right — app preview */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="w-full lg:w-[50%] flex-shrink-0"
            >
              <img
                alt="Tracking a monthly budget in MyBudgetory"
                src="/hero.svg"
                width={799}
                height={618}
                className="themed-illustration w-full h-auto"
              />
            </motion.div>

          </div>
        </section>

        <SectionDivider />

        <SectionDivider />

        {/* ══════════════════════════
            WHY — core value props
        ══════════════════════════ */}
        <SlideUp>
          <section>
            <SectionHeader
              tag="Why MyBudgetory"
              tagIcon={<Sparkles size={10} />}
              title="Built for real financial clarity."
              subtitle="Whether you're tracking daily coffee runs or planning a vacation, MyBudgetory gives you the right tool for the job."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {coreFeatures.map(({ icon: Icon, iconColor, iconBg, accentLine, title, desc }) => (
                <div key={title} className="relative bg-canvas/80 rounded-2xl p-7 overflow-hidden transition-colors duration-300">
                  <div className={`absolute top-0 left-0 right-0 h-px bg-hairline`} />
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-5`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <h3 className="text-base font-bold text-ink mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-primary hover:bg-primary-active text-on-primary px-7 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all duration-200 active:scale-95"
              >
                <Play size={15} />
                Get Started Free
              </button>
              <Link href="/features">
                <button className="bg-canvas-soft/80 hover:bg-primary-pale text-ink px-7 py-3 rounded-3xl font-semibold text-sm flex items-center gap-2 transition-all duration-200">
                  <Sparkles size={15} />
                  See all features
                  <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </section>
        </SlideUp>

        <SectionDivider />

        {/* ══════════════════════════
            HOW IT WORKS
        ══════════════════════════ */}
        <SlideUp>
          <section>
            <SectionHeader
              tag="Simple by design"
              tagIcon={<CheckCircle2 size={10} />}
              title="Up and running in minutes."
              subtitle="No complex setup. No onboarding maze. Just sign up and start tracking."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <div className="hidden md:block absolute top-10 left-[calc(33.33%-24px)] right-[calc(33.33%-24px)] h-px border-t border-hairline border-dashed" />
              {steps.map(({ num, icon: Icon, title, desc, color, bg }) => (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative mb-5">
                    <div className={`w-20 h-20 rounded-2xl ${bg} flex items-center justify-center`}>
                      <Icon size={28} className={color} />
                    </div>
                    <span className={`absolute -top-2 -right-2 text-[10px] font-black ${color} bg-canvas-soft/80 rounded-full w-6 h-6 flex items-center justify-center`}>
                      {num.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-ink mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{desc}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </SlideUp>

        <SectionDivider />

        {/* ══════════════════════════
            CHARTS & ANALYTICS
        ══════════════════════════ */}
        <SlideUp>
          <section>
            <SectionHeader
              tag="Charts & Analytics"
              tagIcon={<BarChart3 size={10} />}
              title="Your finances, visualized."
              subtitle="5 powerful chart views that transform raw transactions into clear, actionable insights."
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
              {/* Left: large screenshot */}
              <div className="lg:col-span-3">
                <img
                  alt="Reviewing spending on the MyBudgetory app"
                  src="/hero2.svg"
                  width={960}
                  height={804}
                  className="themed-illustration w-full h-auto"
                />

              </div>

              {/* Right: chart feature list */}
              <div className="lg:col-span-2 space-y-8">
                {chartFeatures.map(({ icon: Icon, color, bg, title, desc }) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35 }}
                    className="flex gap-3 p-4 rounded-xl bg-canvas/80 transition-colors duration-200"
                  >
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">{title}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                ))}

                <div className="pt-2">
                  <Link
                    href="/charts"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Open Charts page
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </SlideUp>

        <SectionDivider />

        {/* ══════════════════════════
            ALL FEATURES GRID
        ══════════════════════════ */}
        <SlideUp>
          <section>
            <SectionHeader
              tag="Full feature set"
              tagIcon={<Zap size={10} />}
              title="Everything you need."
              subtitle="11 purpose-built tools — every one of them free, every one of them useful."
            />

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
              {allFeatures.map(({ icon: Icon, name, tagline, href, color, bg }, idx) => (
                <Link key={name} href={href}>
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: (idx % 4) * 0.06 }}
                    whileHover={{ y: -3 }}
                    className="group bg-canvas/80 rounded-xl p-4 transition-all duration-200 cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <p className="text-sm font-bold text-ink">{name}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-tight">{tagline}</p>
                  </motion.div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/features"
                className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 font-semibold transition-colors"
              >
                View detailed feature docs
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        </SlideUp>

        <SectionDivider />

        {/* ══════════════════════════
            CHOOSE YOUR MODE
        ══════════════════════════ */}
        <SlideUp>
          <section>
            <SectionHeader
              tag="Two modes"
              tagIcon={<Wallet size={10} />}
              title="Choose how you budget."
              subtitle="Pick the right mode for your goal. Switch between them anytime."
            />

            <img
              alt="Choosing a budgeting mode"
              src="/hero3.svg"
              width={960}
              height={660}
              className="themed-illustration mx-auto mb-10 w-full max-w-lg h-auto"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {budgetModes.map(({ href, title, icon: Icon, iconColor, iconBg, accentLine, hoverBorder, ctaColor, bullets, desc }) => (
                <motion.div
                  key={title}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className={`relative bg-canvas/80 ${hoverBorder} rounded-2xl overflow-hidden transition-all duration-300`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-px bg-hairline`} />

                  <div className="p-7">
                    <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-ink mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 mb-5 leading-relaxed">{desc}</p>
                    <ul className="space-y-2 mb-5">
                      {bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-sm text-gray-400">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link href={href} className={`inline-flex items-center gap-1.5 text-sm font-bold ${ctaColor} transition-colors`}>
                      Get started <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </SlideUp>

        <SectionDivider />

        {/* ══════════════════════════
            OUR PROMISE
        ══════════════════════════ */}
        <SlideUp>
          <section>
            <SectionHeader
              tag="Our promise"
              tagIcon={<ShieldCheck size={10} />}
              title="No ads. No upsells. No nonsense."
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {whyItems.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-canvas/80 rounded-xl p-5 text-center">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                    <Icon size={16} className="text-violet-400" />
                  </div>
                  <p className="text-sm font-bold text-ink mb-1">{title}</p>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>
        </SlideUp>

        <SectionDivider />

        {/* ══════════════════════════
            TESTIMONIALS
        ══════════════════════════ */}
        <SlideUp>
          <section>
            <SectionHeader
              tag="User stories"
              tagIcon={<Sparkles size={10} />}
              title="Loved by users."
              subtitle="Join thousands managing their finances smarter every day."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testimonials.map(({ text, author, role }) => (
                <motion.blockquote
                  key={author}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-canvas/80 rounded-2xl p-6 transition-colors duration-200"
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-warning-deep text-xs">★</span>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">&ldquo;{text}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold text-ink">— {author}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{role}</p>
                  </div>
                </motion.blockquote>
              ))}
            </div>
          </section>
        </SlideUp>

        <SectionDivider />

        {/* ══════════════════════════
            OPEN SOURCE
        ══════════════════════════ */}
        <SlideUp>
          <section>
            <div className="bg-canvas/80 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-canvas/80 flex items-center justify-center flex-shrink-0">
                  <Github size={22} className="text-ink" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-ink mb-1">Built in the open.</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    MyBudgetory is fully open source. Read the code, submit issues, fork it, or contribute — GitHub is always open.
                  </p>
                </div>
                <a href="https://github.com/justtayyabkhxn/mybudgetory" target="_blank" rel="noopener noreferrer">
                  <button className="bg-canvas-soft/80 hover:bg-primary-pale text-ink px-6 py-3 rounded-3xl font-semibold text-sm flex items-center gap-2 transition-all duration-200 whitespace-nowrap">
                    <Github size={15} />
                    Star on GitHub
                  </button>
                </a>
              </div>
            </div>
          </section>
        </SlideUp>

        <SectionDivider />

        {/* ══════════════════════════
            FINAL CTA
        ══════════════════════════ */}
        <SlideUp>
          <section id="cta">
            <div className="relative bg-ink-surface text-on-ink-surface rounded-3xl p-14 text-center overflow-hidden">
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-5 w-5 text-on-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-primary mb-3">
                Start managing your money today.
              </h2>
              <p className="text-on-ink-surface/70 text-base mb-8">
                Free forever. No credit card. Takes 30 seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/signup"
                  className="group bg-primary hover:bg-primary-active text-on-primary px-8 py-3.5 rounded-3xl font-semibold text-base flex items-center justify-center gap-2 transition-colors duration-200"
                >
                  Create Free Account
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/daily-tracker"
                  className="text-on-ink-surface hover:bg-on-ink-surface/10 px-8 py-3.5 rounded-3xl font-semibold text-base flex items-center justify-center gap-2 transition-colors duration-200"
                >
                  Start Daily Tracking
                </Link>
                <Link
                  href="/event-budget"
                  className="text-on-ink-surface hover:bg-on-ink-surface/10 px-8 py-3.5 rounded-3xl font-semibold text-base flex items-center justify-center gap-2 transition-colors duration-200"
                >
                  Plan an Event
                </Link>
              </div>
            </div>
          </section>
        </SlideUp>

        <Footer />
      </div>
    </main>
  );
}
