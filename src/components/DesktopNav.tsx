"use client";

import {
  BadgeIndianRupee,
  BanknoteArrowDown,
  CalendarDays,
  ChartCandlestick,
  ChartNoAxesCombined,
  ChartPie,
  ChevronDown,
  CircleUserRound,
  Coins,
  Divide,
  FileDigit,
  LogOut,
  MonitorUp,
  PiggyBank,
  RefreshCcw,
  Target,
  TextSearch,
  Wallet,
  WalletMinimal,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";

type Item = { href: string; label: string; icon: React.ReactNode; desc: string };
type Group = { label: string; icon: React.ReactNode; items: Item[] };

// Every destination is reachable from the bar: one direct link plus three
// topical groups. No catch-all bucket.
const MONEY: Group = {
  label: "Money",
  icon: <Coins size={15} />,
  items: [
    { href: "/transactions", label: "Transactions", icon: <BadgeIndianRupee size={16} />, desc: "Full history & search" },
    { href: "/expenses", label: "Expenses", icon: <BanknoteArrowDown size={16} />, desc: "Outflows, filtered" },
    { href: "/inflow", label: "Income", icon: <Wallet size={16} />, desc: "Inflows at a glance" },
    { href: "/net-worth", label: "Net Worth", icon: <PiggyBank size={16} />, desc: "Your financial snapshot" },
    { href: "/debt-lent", label: "Debt & Lent", icon: <WalletMinimal size={16} />, desc: "Who owes what" },
  ],
};

const INSIGHTS: Group = {
  label: "Insights",
  icon: <ChartPie size={15} />,
  items: [
    { href: "/charts", label: "Charts", icon: <ChartCandlestick size={16} />, desc: "Trends, visualised" },
    { href: "/stats", label: "Stats", icon: <ChartNoAxesCombined size={16} />, desc: "Spending statistics" },
    { href: "/calendar", label: "Calendar", icon: <CalendarDays size={16} />, desc: "Heat-map by day" },
    { href: "/advanced-search", label: "Advanced Search", icon: <TextSearch size={16} />, desc: "Filter every field" },
  ],
};

const TOOLS: Group = {
  label: "Tools",
  icon: <Wrench size={15} />,
  items: [
    { href: "/budget-goals", label: "Budget Goals", icon: <Target size={16} />, desc: "Per-category limits" },
    { href: "/recurring", label: "Recurring", icon: <RefreshCcw size={16} />, desc: "Subscription tracker" },
    { href: "/split", label: "Split Bills", icon: <Divide size={16} />, desc: "Divide with friends" },
    // { href: "/screen-share", label: "Screen Share", icon: <MonitorUp size={16} />, desc: "Share your screen" },
  ],
};

const PILL_BASE =
  "flex items-center px-2.5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-150";

/**
 * The label half of a pill. Collapsing animates max-width rather than
 * unmounting the text, so the word stays in the accessibility tree and the
 * pill shrinks to its icon smoothly instead of popping.
 */
function PillLabel({
  children,
  collapsed,
}: {
  children: React.ReactNode;
  collapsed: boolean;
}) {
  return (
    <span
      className={`overflow-hidden transition-all duration-300 ease-out ${
        collapsed ? "ml-0 max-w-0 opacity-0" : "ml-1.5 max-w-[9rem] opacity-100"
      }`}
    >
      {children}
    </span>
  );
}
// The bar wears the footer's polarity: a dark ink-surface band whatever the
// theme, so the lime primary is the only accent that has to carry weight.
const PILL_ON = "bg-primary text-on-primary";
const PILL_OFF =
  "text-on-ink-surface/70 hover:bg-on-ink-surface/10 hover:text-on-ink-surface";

function NavDropdown({
  group,
  align,
  openId,
  setOpenId,
  collapsed,
}: {
  group: Group;
  align: "left" | "right";
  openId: string | null;
  setOpenId: React.Dispatch<React.SetStateAction<string | null>>;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = openId === group.label;
  const active = group.items.some((i) => i.href === pathname);

  // Hover opens it; leaving closes after a short grace period so a pointer
  // that clips a corner doesn't snap the menu shut.
  //
  // The timer must only ever close THIS group. `openId` is shared, so a naive
  // `setOpenId(null)` from the pill you just left lands ~200ms later and shuts
  // the menu you have since moved onto — which is what made sliding along the
  // bar feel broken. The functional update makes the close a no-op unless this
  // group is still the open one.
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(
      () => setOpenId((cur) => (cur === group.label ? null : cur)),
      200,
    );
  };
  useEffect(() => cancelClose, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open, setOpenId]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpenId(group.label);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={() => setOpenId(open ? null : group.label)}
        aria-expanded={open}
        aria-haspopup="menu"
        title={collapsed ? group.label : undefined}
        className={`${PILL_BASE} cursor-pointer ${active || open ? PILL_ON : PILL_OFF}`}
      >
        {group.icon}
        <PillLabel collapsed={collapsed}>{group.label}</PillLabel>
        {/* The chevron is label furniture — it goes with the word. */}
        <ChevronDown
          size={14}
          className={`shrink-0 overflow-hidden transition-all duration-300 ease-out ${
            collapsed ? "ml-0 max-w-0 opacity-0" : "ml-1 max-w-[1rem] opacity-100"
          } ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        /* The offset below the pill is PADDING on a wrapper, not a margin on
           the panel: padding is part of the element, so the strip between
           trigger and menu is still hoverable and the pointer never leaves
           the subtree on its way down. A margin would leave a dead 16px gap
           that fires mouseleave mid-travel. */
        <div
          className={`absolute top-full ${align === "right" ? "right-0" : "left-0"} pt-4`}
        >
          <div
            role="menu"
            className="w-72 rounded-3xl border border-on-ink-surface/10 bg-ink-surface/95 backdrop-blur-xl p-2 shadow-xl shadow-black/25"
          >
            {group.items.map((item) => {
              const on = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpenId(null)}
                  className={`flex items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors duration-150 ${
                    on ? "bg-primary/15" : "hover:bg-on-ink-surface/10"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      on ? "bg-primary text-on-primary" : "bg-on-ink-surface/10 text-primary"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-semibold ${on ? "text-primary" : "text-on-ink-surface"}`}
                    >
                      {item.label}
                    </span>
                    <span className="block text-xs text-on-ink-surface/60">
                      {item.desc}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DesktopNav() {
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => setOpenId(null), [pathname]);

  // Scrolling down shrinks every pill to its icon; scrolling up — or
  // returning to the top — restores the labels. The 6px threshold keeps
  // momentum jitter from flipping it, and an open menu pins it expanded so
  // the trigger doesn't resize under the pointer.
  useEffect(() => {
    if (openId) return;
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setCollapsed(y > last && y > 72);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [openId]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const onDashboard = pathname === "/dashboard";

  return (
    /* A floating island, not a full-width band: the header is only a
       positioning shell (transparent, click-through), and the pill itself
       is content-width and centred.

       Colour follows Footer — --color-ink-surface, so the bar reads as the
       same dark band that closes the page and does NOT invert with the
       theme; in dark mode it only lifts enough to separate from the ground. */
    <header className="hidden md:flex fixed top-3 inset-x-0 z-50 justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex h-14 items-center gap-1 rounded-full bg-ink-surface/90 text-on-ink-surface backdrop-blur-xl pl-5 pr-3 shadow-lg shadow-black/20">
        {/* Wordmark opens the pill */}
        <Link
          href="/dashboard"
          className="shrink-0 pr-1 text-lg font-extrabold tracking-tight text-on-ink-surface transition-opacity hover:opacity-80"
        >
          MyBudgetory<span className="text-primary">.</span>
        </Link>

        <span className="mx-2 h-6 w-px bg-on-ink-surface/15" aria-hidden="true" />

        {/* Destinations */}
        <Link
          href="/dashboard"
          aria-current={onDashboard ? "page" : undefined}
          title={collapsed ? "Dashboard" : undefined}
          className={`${PILL_BASE} ${onDashboard ? PILL_ON : PILL_OFF}`}
        >
          <FileDigit size={15} className={onDashboard ? "text-on-primary" : "text-on-ink-surface/60"} />
          <PillLabel collapsed={collapsed}>Dashboard</PillLabel>
        </Link>
        <NavDropdown group={MONEY} align="left" openId={openId} setOpenId={setOpenId} collapsed={collapsed} />
        <NavDropdown group={INSIGHTS} align="left" openId={openId} setOpenId={setOpenId} collapsed={collapsed} />
        <NavDropdown group={TOOLS} align="right" openId={openId} setOpenId={setOpenId} collapsed={collapsed} />

        <span className="mx-2 h-6 w-px bg-on-ink-surface/15" aria-hidden="true" />

        {/* Account actions */}
        <Link
          href="/profile"
          aria-label="Profile"
          title="Profile"
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 ${
            pathname === "/profile"
              ? "bg-primary text-on-primary"
              : "bg-on-ink-surface/10 text-on-ink-surface hover:bg-on-ink-surface/20"
          }`}
        >
          <CircleUserRound size={17} />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sign out"
          title="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-on-ink-surface/10 text-negative-on-ink cursor-pointer transition-colors duration-150 hover:bg-red-500/25"
        >
          <LogOut size={16} />
        </button>

        <ThemeToggle
          variant="inline"
          size={16}
          className="h-9 w-9 bg-on-ink-surface/10 text-on-ink-surface hover:bg-on-ink-surface/20"
        />
      </nav>
    </header>
  );
}
