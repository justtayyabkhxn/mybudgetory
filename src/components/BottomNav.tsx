"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  Receipt,
  ChartCandlestick,
  User,
} from "lucide-react";

const tabs = [
  { href: "/dashboard",    icon: LayoutDashboard,  label: "Home" },
  { href: "/calendar",     icon: CalendarDays,      label: "Calendar" },
  { href: "/transactions", icon: Receipt,           label: "Txns" },
  { href: "/charts",       icon: ChartCandlestick,  label: "Charts" },
  { href: "/profile",      icon: User,              label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="block md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe">
      <div className="mx-auto mb-2 max-w-md rounded-3xl bg-canvas/95 backdrop-blur-xl">
        <div className="flex justify-around items-center py-1.5 px-1">
          {tabs.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl"
              >
                {isActive && (
                  <motion.span
                    layoutId="bottomnav-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-2xl bg-primary"
                  />
                )}
                <motion.span
                  animate={{ scale: isActive ? 1.08 : 1, y: isActive ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                  className="relative"
                >
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.4 : 2}
                    className={`transition-colors duration-200 ${
                      isActive
                        ? "text-on-primary"
                        : "text-mute"
                    }`}
                  />
                </motion.span>
                <span
                  className={`relative text-[10px] font-semibold transition-colors duration-200 ${
                    isActive ? "text-on-primary" : "text-mute"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
