"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeIndianRupee,
  BanknoteArrowDown,
  ChartCandlestick,
  ChartNoAxesCombined,
  CircleUserRound,
  Divide,
  FileDigit,
  LogIn,
  Menu,
  PiggyBank,
  TextSearch,
  Wallet,
  WalletMinimal,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function MenuButton() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const linkClasses = (path: string) =>
    `text-center cursor-pointer transition-all duration-200 ${
      pathname === path ? "bg-white/10 font-semibold rounded-2xl p-2" : ""
    }`;

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
        localStorage.removeItem("token");
        setMenuOpen(false);
        window.location.href = "/login";
      } else {
        console.error("Logout failed:", await res.text());
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const navItems = [
    { href: "/dashboard", icon: <FileDigit color="#818cf8" />, label: "Dashboard" },
    { href: "/net-worth", icon: <PiggyBank color="#fcba03" />, label: "Net Worth" },
    { href: "/debt-lent", icon: <WalletMinimal color="#a78bfa" />, label: "Debt Tracker" },
    { href: "/split-wise", icon: <Divide color="#cbe200" />, label: "Split Bills" },
    { href: "/transactions", icon: <BadgeIndianRupee color="#4ade80" />, label: "Transactions" },
    { href: "/expenses", icon: <BanknoteArrowDown color="#f87171" />, label: "Expenses" },
    { href: "/inflow", icon: <Wallet color="#34d399" />, label: "Income" },
    { href: "/charts", icon: <ChartCandlestick color="#38bdf8" />, label: "Charts" },
    { href: "/stats", icon: <ChartNoAxesCombined color="#fbbf24" />, label: "Stats" },
    { href: "/advanced-search", icon: <TextSearch color="#d946ef" />, label: "Advanced Search" },
    { href: "/profile", icon: <CircleUserRound color="#60a5fa" />, label: "Profile" },
  ];

  return (
    <div className="relative z-50">
      {/* Toggle Button */}
      <button
        onClick={toggleMenu}
        className="group relative inline-flex items-center cursor-pointer justify-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <motion.span
          initial={{ rotate: 0, scale: 1 }}
          animate={{ rotate: menuOpen ? 90 : 0, scale: menuOpen ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </motion.span>
        <span className="tracking-wide">Menu</span>
        <span className="absolute inset-0 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition duration-300" />
      </button>

      {/* Dimmed Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>

      {/* Side Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="side-menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed top-0 right-0 h-full w-64 backdrop-blur-sm bg-white/10 dark:bg-black/20 border-l border-white/20 dark:border-white/10 text-gray-100 dark:text-white shadow-2xl z-50 rounded-l-3xl"
          >
            <div className="flex flex-col h-full px-6 py-8 space-y-6">
              <div className="flex justify-start">
                <button onClick={toggleMenu} className="text-md text-white font-bold">
                  <Menu />
                </button>
              </div>

              <motion.nav
                className="space-y-8 mt-4"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
                  },
                }}
              >
                {navItems.map((item) => (
                  <motion.div
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      show: { opacity: 1, x: 0 },
                    }}
                    whileHover={{ scale: 1.05, x: 2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link href={item.href} className={`${linkClasses(item.href)} flex items-center gap-2`}>
                      {item.icon} {item.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>

              <div className="mt-auto">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-white/5 p-3 rounded-3xl hover:underline font-semibold cursor-pointer"
                >
                  <LogIn color="#ef4444" /> Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
