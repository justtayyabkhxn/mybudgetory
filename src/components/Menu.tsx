"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeIndianRupee,
  BanknoteArrowDown,
  CalendarDays,
  ChartCandlestick,
  ChartNoAxesCombined,
  CircleUserRound,
  Divide,
  FileDigit,
  LogOut,
  Menu,
  PiggyBank,
  RefreshCcw,
  Target,
  TextSearch,
  Wallet,
  WalletMinimal,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

type Section = {
  title: string;
  items: NavItem[];
};

const sections: Section[] = [
  {
    title: "Finance",
    items: [
      { href: "/dashboard", icon: <FileDigit size={15} />, label: "Dashboard" },
      {
        href: "/transactions",
        icon: <BadgeIndianRupee size={15} />,
        label: "Transactions",
      },
      {
        href: "/expenses",
        icon: <BanknoteArrowDown size={15} />,
        label: "Expenses",
      },
      { href: "/inflow", icon: <Wallet size={15} />, label: "Income" },
      { href: "/net-worth", icon: <PiggyBank size={15} />, label: "Net Worth" },
      {
        href: "/debt-lent",
        icon: <WalletMinimal size={15} />,
        label: "Debt Tracker",
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        href: "/charts",
        icon: <ChartCandlestick size={15} />,
        label: "Charts",
      },
      {
        href: "/stats",
        icon: <ChartNoAxesCombined size={15} />,
        label: "Stats",
      },
      {
        href: "/calendar",
        icon: <CalendarDays size={15} />,
        label: "Calendar",
      },
      {
        href: "/advanced-search",
        icon: <TextSearch size={15} />,
        label: "Advanced Search",
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        href: "/budget-goals",
        icon: <Target size={15} />,
        label: "Budget Goals",
      },
      {
        href: "/recurring",
        icon: <RefreshCcw size={15} />,
        label: "Recurring",
      },
      { href: "/split", icon: <Divide size={15} />, label: "Split Bills" },
    ],
  },
  {
    title: "Account",
    items: [
      {
        href: "/profile",
        icon: <CircleUserRound size={15} />,
        label: "Profile",
      },
    ],
  },
];

// ─── Per-section accent colours ───────────────────────────────────────────────
const sectionColors: Record<string, { text: string; dot: string; bg: string }> =
  {
    Finance: {
      text: "text-indigo-400",
      dot: "bg-indigo-500",
      bg: "bg-indigo-500/10",
    },
    Analytics: {
      text: "text-purple-400",
      dot: "bg-purple-500",
      bg: "bg-purple-500/10",
    },
    Tools: {
      text: "text-orange-400",
      dot: "bg-orange-500",
      bg: "bg-orange-500/10",
    },
    Account: { text: "text-sky-400", dot: "bg-sky-500", bg: "bg-sky-500/10" },
  };

// ─── Hover colours by icon accent ────────────────────────────────────────────
const itemHoverColors: Record<string, string> = {
  Finance: "hover:bg-indigo-500/10 hover:text-indigo-300",
  Analytics: "hover:bg-purple-500/10 hover:text-purple-300",
  Tools: "hover:bg-orange-500/10 hover:text-orange-300",
  Account: "hover:bg-sky-500/10    hover:text-sky-300",
};

export default function MenuButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <div className="relative z-50">
      {/* ── Trigger button ──────────────────────────────────────────────────── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.04 }}
        className="flex items-center justify-center w-10 h-10 rounded-full text-white cursor-pointer
                   bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500
                   hover:from-violet-500 hover:via-indigo-400 hover:to-cyan-400
                   shadow-[0_4px_20px_rgba(139,92,246,0.5)]
                   hover:shadow-[0_4px_28px_rgba(139,92,246,0.7)]
                    border-white/20 transition-all duration-200"
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </motion.span>
      </motion.button>

      {/* ── Backdrop ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Drawer ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="drawer"
            initial={{ x: "100%", opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="fixed top-0 right-0 h-full w-72 z-50 flex flex-col overflow-hidden
                       bg-[#0b0b14]/95 backdrop-blur-xl border-l border-white/8 shadow-2xl"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/6">
              <div>
                <p className="text-base font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                  MyBudgetory
                </p>
                <p className="text-[11px] text-gray-600 font-semibold mt-0.5">
                  Your Budget. Your Story.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Nav sections — scrollable */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {sections.map((section, si) => {
                const sc = sectionColors[section.title];
                return (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + si * 0.06 }}
                  >
                    {/* Section header */}
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      <span
                        className={`text-[10px] font-black uppercase tracking-[0.12em] ${sc.text}`}
                      >
                        {section.title}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-0.5">
                      {section.items.map((item, ii) => {
                        const isActive = pathname === item.href;
                        const hover = itemHoverColors[section.title];
                        return (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: 14 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + si * 0.06 + ii * 0.04 }}
                            whileHover={{ x: 2 }}
                          >
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                                isActive
                                  ? `${sc.bg} ${sc.text} border border-current/20`
                                  : `text-gray-400 ${hover}`
                              }`}
                            >
                              <span
                                className={isActive ? sc.text : "text-gray-500"}
                              >
                                {item.icon}
                              </span>
                              {item.label}
                              {isActive && (
                                <span
                                  className={`ml-auto w-1.5 h-1.5 rounded-full ${sc.dot}`}
                                />
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </nav>

            {/* Footer / Logout */}
            <div className="px-4 pt-4 pb-20 md:pb-4 border-t border-white/6">
              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-150 cursor-pointer border border-transparent hover:border-red-500/20"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
