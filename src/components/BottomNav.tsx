"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <nav className="block md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-white/10">
      <div className="flex justify-around items-center py-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors duration-200 ${
                isActive
                  ? "text-indigo-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon
                size={22}
                className={isActive ? "text-indigo-400" : "text-gray-500"}
              />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
