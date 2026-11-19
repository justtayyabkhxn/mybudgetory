"use client";

import MobileHeader from "@/components/MobileHeader";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  PiggyBank,
  RefreshCw,
  Pencil,
  Check,
  X,
  Landmark,
  TrendingUp,
  Brain,
  Sparkles,
  Target,
  Bot,
  Trophy,
  Zap,
  Activity,
  ArrowUpRight,
  Table2,
  LineChart,
  RotateCcw,
  Maximize2,
  Minimize2,
  Gem,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  BarElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import Footer from "@/components/Footer";
import FloatingTransactionButton from "@/components/FloatingTransactionButton";
import BottomNav from "@/components/BottomNav";
import { usePrivacyMode, MASKED } from "@/hooks/usePrivacyMode";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiFetch } from "@/utils/apiFetch";
import { toast } from "@/lib/toast";
import { alpha, chartChrome, cssVar } from "@/utils/themeColors";
import { useTheme } from "@/hooks/useTheme";

ChartJS.register(LineElement, PointElement, BarElement, LinearScale, CategoryScale, Filler, Tooltip);

/* ── chart theme ─────────────────────────────────────────── */

// Resolved from the live theme tokens on every read — Chart.js paints to a
// canvas, so the colours have to be concrete at draw time and cannot be CSS
// variables. Property getters keep every call site unchanged while letting the
// values follow a theme switch.
const CHART = {
  get up() { return cssVar("--color-positive"); },
  get upDim() { return alpha(cssVar("--color-positive"), 0.8); },
  get down() { return cssVar("--color-negative"); },
  get downDim() { return alpha(cssVar("--color-negative"), 0.8); },
  get proj() { return alpha(cssVar("--color-mute"), 0.55); },
  get grid() { return chartChrome().grid; },
  get gridZero() { return chartChrome().gridStrong; },
  get tick() { return chartChrome().tick; },
  get surface() { return cssVar("--color-canvas"); },
  get tooltipBg() { return chartChrome().tooltipBg; },
  get tooltipText() { return chartChrome().tooltipText; },
  // Breakdown lines reuse the hues of their summary cards above the chart
  // (amber bank balance, blue assets) so identity carries across the page.
  get cash() { return cssVar("--color-warning-deep"); },
  get assets() { return cssVar("--color-cat-outing"); },
};

// Net worth (cash + assets) is the headline series and is always drawn as
// dataset 0 — the glow, peak and end-value plugins key off that index. Cash and
// Assets are optional breakdown overlays toggled from the legend row.
type BreakdownKey = "cash" | "assets";
const BREAKDOWN: { key: BreakdownKey; label: string; color: () => string }[] = [
  { key: "cash", label: "Cash", color: () => CHART.cash },
  { key: "assets", label: "Assets", color: () => CHART.assets },
];
const BREAKDOWN_STORE = "nw_chart_breakdown";

type HistPoint = { date: string; balance: number; assets?: number; estimated?: boolean };
/** Net worth on a history day: bank balance + asset value at that day's close. */
const nwOf = (h: HistPoint) => h.balance + (h.assets ?? 0);

// Soft coloured glow under the net-worth stroke (dataset 0 only)
const lineGlowPlugin = {
  id: "nwGlow",
  beforeDatasetDraw(chart: ChartJS, args: { index: number }) {
    if (args.index !== 0) return;
    const ds = chart.data.datasets[0] as { borderColor?: unknown };
    chart.ctx.save();
    chart.ctx.shadowColor = typeof ds.borderColor === "string" ? alpha(ds.borderColor, 0.35) : "transparent";
    chart.ctx.shadowBlur = 10;
    chart.ctx.shadowOffsetY = 6;
  },
  afterDatasetDraw(chart: ChartJS, args: { index: number }) {
    if (args.index !== 0) return;
    chart.ctx.restore();
  },
};

/** Rounded rect path — ctx.roundRect is missing on older Android WebViews. */
function pillPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Selective direct labels on the net-worth line: the peak in view, and a value
// tag on the latest real point so the current figure reads without hovering.
const nwMarksPlugin = {
  id: "nwMarks",
  afterDatasetsDraw(chart: ChartJS, _args: unknown, opts: { masked?: boolean; lastIdx?: number }) {
    if (!chart.isDatasetVisible(0)) return;
    const data = chart.data.datasets[0]?.data as (number | null)[] | undefined;
    if (!data) return;
    const meta = chart.getDatasetMeta(0);
    const { ctx, chartArea } = chart;
    const font = ChartJS.defaults.font.family;
    const lineColor = (chart.data.datasets[0] as { borderColor?: unknown }).borderColor;
    const accent = typeof lineColor === "string" ? lineColor : cssVar("--color-positive");

    const lastIdx = opts?.lastIdx ?? data.length - 1;
    const lastPt = meta.data[lastIdx];
    const inView = (x: number) => x >= chartArea.left - 1 && x <= chartArea.right + 1;

    // Peak — skipped when the latest point is the peak (the value tag covers it)
    let maxIdx = -1;
    let maxVal = -Infinity;
    data.forEach((v, i) => { if (v !== null && v > maxVal) { maxVal = v; maxIdx = i; } });
    const peakPt = meta.data[maxIdx];
    if (peakPt && maxIdx !== lastIdx && data.filter(v => v !== null).length >= 3 && inView(peakPt.x)) {
      const label = opts?.masked ? "peak" : `peak ${formatAmount(maxVal)}`;
      ctx.save();
      ctx.font = `600 10px ${font}`;
      const w = ctx.measureText(label).width;
      const x = Math.max(chartArea.left + 4, Math.min(peakPt.x - w / 2, chartArea.right - w - 4));
      const y = Math.max(chartArea.top + 10, peakPt.y - 12);
      ctx.fillStyle = alpha(cssVar("--color-mute"), 0.95);
      ctx.fillText(label, x, y);
      ctx.beginPath();
      ctx.arc(peakPt.x, peakPt.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = cssVar("--color-mute");
      ctx.fill();
      ctx.strokeStyle = CHART.surface;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Current-value tag, with a faint guide line back to the y-axis
    const lastVal = data[lastIdx];
    if (lastPt && lastVal !== null && lastVal !== undefined && inView(lastPt.x)) {
      ctx.save();
      ctx.strokeStyle = alpha(accent, 0.35);
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartArea.left, lastPt.y);
      ctx.lineTo(lastPt.x, lastPt.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const label = opts?.masked ? "•••" : formatAmount(lastVal);
      ctx.font = `700 11px ${font}`;
      const w = ctx.measureText(label).width + 12;
      const h = 20;
      let x = lastPt.x + 10;
      if (x + w > chartArea.right) x = lastPt.x - w - 10;
      const y = Math.min(Math.max(lastPt.y - h / 2, chartArea.top), chartArea.bottom - h);
      pillPath(ctx, x, y, w, h, 6);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.fillStyle = CHART.surface;
      ctx.textBaseline = "middle";
      ctx.fillText(label, x + 6, y + h / 2 + 0.5);
      ctx.restore();
    }
  },
};

// Vertical hairline that tracks the hovered X — passed per-chart, not registered globally
const crosshairPlugin = {
  id: "nwCrosshair",
  afterDatasetsDraw(chart: ChartJS) {
    const active = chart.tooltip?.getActiveElements();
    if (!active?.length) return;
    const { top, bottom } = chart.chartArea;
    const ctx = chart.ctx;
    ctx.save();
    ctx.strokeStyle = alpha(cssVar("--color-mute"), 0.45);
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(active[0].element.x, top);
    ctx.lineTo(active[0].element.x, bottom);
    ctx.stroke();
    ctx.restore();
  },
};

const baseTooltip = {
  get backgroundColor() { return CHART.tooltipBg; },
  get borderColor() { return alpha(cssVar("--color-mute"), 0.2); },
  borderWidth: 1,
  cornerRadius: 10,
  padding: 12,
  get titleColor() { return alpha(CHART.tooltipText, 0.7); },
  titleFont: { size: 11, weight: "bold" as const },
  get bodyColor() { return CHART.tooltipText; },
  bodyFont: { size: 13, weight: "bold" as const },
  get footerColor() { return alpha(CHART.tooltipText, 0.7); },
  footerFont: { size: 11, weight: "normal" as const },
  footerMarginTop: 8,
  displayColors: false,
  // Glide between points instead of teleporting
  animation: { duration: 160, easing: "easeOutQuart" as const },
  caretPadding: 8,
};

/* ── helpers ─────────────────────────────────────────────── */

const MILESTONES = [
  25000, 50000, 75000, 100000,125000, 150000, 200000, 250000, 300000,
  400000, 500000, 750000, 1000000, 1500000, 2000000, 2500000,
  5000000, 7500000, 10000000, 20000000, 50000000, 100000000,
];

const RANGES = [
  { key: "3m", label: "3M", months: 3, ytd: false, projSteps: [1, 2, 3] },
  { key: "6m", label: "6M", months: 6, ytd: false, projSteps: [2, 4, 6] },
  { key: "ytd", label: "YTD", months: null, ytd: true, projSteps: [3, 6, 12] },
  { key: "1y", label: "1Y", months: 12, ytd: false, projSteps: [3, 6, 12] },
  { key: "all", label: "All", months: null, ytd: false, projSteps: [3, 6, 12] },
] as const;
type RangeKey = (typeof RANGES)[number]["key"];

function nwCacheKey() {
  const d = new Date();
  const diff = d.getDay() === 0 ? -6 : 1 - d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return `ai_networth_${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;
}

function getMonthlyData(history: { date: string; balance: number }[], bankBalance: number) {
  const byMonth: Record<string, number> = {};
  history.forEach(h => {
    const d = new Date(h.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = h.balance;
  });
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  byMonth[currentKey] = bankBalance;
  const sorted = Object.keys(byMonth).sort();
  return sorted.map((key, i) => {
    const bal = byMonth[key];
    const prev = i > 0 ? byMonth[sorted[i - 1]] : null;
    const delta = prev !== null ? bal - prev : null;
    const [yr, mo] = key.split("-");
    const month = new Date(Number(yr), Number(mo) - 1, 1)
      .toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    return { month, balance: bal, delta };
  });
}

function getAvgMonthlyDelta(monthlyData: ReturnType<typeof getMonthlyData>) {
  const deltas = monthlyData.filter(m => m.delta !== null).map(m => m.delta!);
  if (!deltas.length) return 0;
  return Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length);
}

function fmtINR(n: number) {
  return n.toLocaleString("en-IN");
}

function formatAmount(amount: number) {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(abs % 10000000 === 0 ? 0 : 1)}Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(abs % 100000 === 0 ? 0 : 1)}L`;
  if (abs >= 1000) return `${sign}₹${Math.round(abs / 1000)}K`;
  return `${sign}₹${fmtINR(abs)}`;
}

function healthColor(score: number) {
  if (score >= 80) return { text: "text-emerald-400", bg: "bg-emerald-500/15", ring: "var(--color-positive)" };
  if (score >= 60) return { text: "text-blue-400", bg: "bg-blue-500/15", ring: "var(--color-cat-outing)" };
  if (score >= 40) return { text: "text-warning-deep", bg: "bg-yellow-500/15", ring: "var(--color-warning)" };
  if (score >= 20) return { text: "text-warning-deep", bg: "bg-orange-500/15", ring: "var(--color-warning-deep)" };
  return { text: "text-red-400", bg: "bg-red-500/15", ring: "var(--color-negative)" };
}

function SkeletonBar({ className = "h-24" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-800/60 rounded-2xl ${className}`} />;
}

const cardMotion = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/* ── page ─────────────────────────────────────────────────── */

export default function NetWorthPage() {
  useAuthGuard();

  // Chart.js bakes theme tokens into concrete colours at config-build time, so
  // the canvases have to remount when the theme flips.
  const { resolved: theme } = useTheme();
  const { hidden } = usePrivacyMode();
  /** Privacy mode: swap a formatted amount for the mask. */
  const money = (s: string) => (hidden ? MASKED : s);

  const [bankBalance, setBankBalance] = useState<number>(0);
  const [history, setHistory] = useState<HistPoint[]>([]);
  const [assetsTotal, setAssetsTotal] = useState<number>(0);
  // Breakdown overlays start off: drawn on the same axis they pull the scale
  // toward zero and flatten the net-worth line, which is the one that matters.
  const [seriesOn, setSeriesOn] = useState<Record<BreakdownKey, boolean>>({ cash: false, assets: false });
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(BREAKDOWN_STORE) || "null");
      if (saved && typeof saved === "object") setSeriesOn({ cash: !!saved.cash, assets: !!saved.assets });
    } catch { /* storage unavailable — keep defaults */ }
  }, []);
  const toggleSeries = (key: BreakdownKey) =>
    setSeriesOn(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(BREAKDOWN_STORE, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const [saving, setSaving] = useState(false);

  const [range, setRange] = useState<RangeKey>("all");
  const [showProjection, setShowProjection] = useState(true);
  const [tableView, setTableView] = useState(false);

  // Drag-to-zoom on the balance chart. Deliberately no "is zoomed" state — a
  // re-render mid-zoom rebuilds the chart options and reverts the zoom that just
  // happened, so the reset control is always shown instead.
  const chartRef = useRef<ChartJS<"line", (number | null)[], string> | null>(null);
  const [zoomReady, setZoomReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [chartUpdating, setChartUpdating] = useState(false);

  // chartjs-plugin-zoom touches `window` on import, so it can't be pulled in at
  // module scope — client components are still rendered on the server.
  useEffect(() => {
    let active = true;
    import("chartjs-plugin-zoom").then(mod => {
      if (!active) return;
      ChartJS.register(mod.default);
      setZoomReady(true);
    });
    return () => { active = false; };
  }, []);

  const resetZoom = () => chartRef.current?.resetZoom();

  // A new range (or switching view) redraws different data — drop any zoom
  useEffect(() => {
    chartRef.current?.resetZoom();
  }, [range, tableView, fullscreen]);

  // Fullscreen: lock page scroll behind the overlay and allow Escape to exit
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [healthReason, setHealthReason] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  // Charts inherit the site font (Bricolage Grotesque) instead of Chart.js's Helvetica default
  useEffect(() => {
    ChartJS.defaults.font.family = getComputedStyle(document.body).fontFamily;
  }, []);

  // Load cached AI insights on mount
  useEffect(() => {
    const cached = localStorage.getItem(nwCacheKey());
    if (cached) {
      try {
        const p = JSON.parse(cached);
        setAiAdvice(p.advice ?? null);
        setHealthScore(p.healthScore ?? null);
        setHealthReason(p.healthReason ?? null);
      } catch { /* ignore */ }
    }
  }, []);

  const fetchNetWorth = async () => {
    const res = await apiFetch("/api/networth");
    if (!res.ok) throw new Error();
    const data = await res.json();
    setBankBalance(data.bankBalance || 0);
    setHistory(data.history || []);
    setAssetsTotal(data.assetsTotal || 0);
  };

  // Read-only. The balance itself already moves with every transaction; the
  // history is only ever written by an explicit "Update chart".
  const refreshAll = async () => {
    setLoading(true);
    try {
      await fetchNetWorth();
    } catch {
      toast("Failed to load net worth", "error");
    } finally {
      setLoading(false);
    }
  };

  // Records today's balance and fills any missing days. Explicit, because it
  // writes interpolated points — it shouldn't happen just by visiting the page.
  const updateChart = async () => {
    if (chartUpdating) return;
    setChartUpdating(true);
    try {
      const res = await apiFetch("/api/networth/snapshot", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      await fetchNetWorth();
      const filled = data.filled ?? 0;
      toast(
        filled > 0 ? `Chart updated · ${filled} day${filled === 1 ? "" : "s"} added` : "Chart already up to date",
        "success",
      );
    } catch {
      toast("Could not update chart", "error");
    } finally {
      setChartUpdating(false);
    }
  };

  useEffect(() => { refreshAll(); }, []);

  const handleUpdateBalance = async () => {
    const parsed = parseFloat(newBalance);
    if (isNaN(parsed) || parsed < 0) {
      toast("Enter a valid amount", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch("/api/networth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newBalance: parsed }),
      });
      const data = await res.json();
      if (res.ok) {
        setBankBalance(data.bankBalance);
        setEditMode(false);
        setNewBalance("");
        toast("Balance updated", "success");
        refreshAll();
      } else {
        toast(data.error || "Failed to update", "error");
      }
    } catch {
      toast("Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setNewBalance("");
  };

  const fetchAIAdvice = async (currentBalance: number, currentHistory: { date: string; balance: number }[]) => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError(false);
    try {
      const monthlyData = getMonthlyData(currentHistory, currentBalance);
      const res = await apiFetch("/api/ai/networth-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankBalance: currentBalance, monthlyData }),
      });
      const data = await res.json();
      if (data.advice) {
        setAiAdvice(data.advice);
        setHealthScore(data.healthScore ?? null);
        setHealthReason(data.healthReason ?? null);
        localStorage.setItem(nwCacheKey(), JSON.stringify(data));
      } else {
        setAiError(true);
      }
    } catch {
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  };

  /* ── derived data ─────────────────────────────────────── */

  // With no holdings net worth is simply the cash balance; the breakdown
  // controls are hidden since they would only repeat the main line and zero.
  const hasAssets = assetsTotal > 0 || history.some(h => (h.assets ?? 0) > 0);
  const netWorthTotal = bankBalance + assetsTotal;

  // Every trend figure on the page (stats, milestones, projection, monthly
  // change) tracks net worth, not just the bank balance.
  const monthlyData = useMemo(
    () => getMonthlyData(history.map(h => ({ date: h.date, balance: nwOf(h) })), netWorthTotal),
    [history, netWorthTotal],
  );
  const avgDelta = useMemo(() => getAvgMonthlyDelta(monthlyData), [monthlyData]);

  const rangeDef = RANGES.find(r => r.key === range)!;
  const visibleHistory = useMemo(() => {
    const now = new Date();
    let cutoff: Date;
    if (rangeDef.ytd) {
      cutoff = new Date(now.getFullYear(), 0, 1);
    } else if (rangeDef.months === null) {
      return history;
    } else {
      cutoff = new Date(now.getFullYear(), now.getMonth() - rangeDef.months, now.getDate());
    }
    const filtered = history.filter(h => new Date(h.date) >= cutoff);
    return filtered.length >= 2 ? filtered : history;
  }, [history, rangeDef.months, rangeDef.ytd]);

  const allTimeHigh = useMemo(
    () => Math.max(netWorthTotal, ...history.map(nwOf)),
    [history, netWorthTotal]
  );
  const totalGrowth = history.length > 0 ? netWorthTotal - nwOf(history[0]) : 0;
  const bestMonth = useMemo(() => {
    const withDelta = monthlyData.filter(m => m.delta !== null);
    if (!withDelta.length) return null;
    return withDelta.reduce((best, m) => (m.delta! > best.delta! ? m : best));
  }, [monthlyData]);
  const lastMonthly = monthlyData.length > 1 ? monthlyData[monthlyData.length - 1] : null;
  const lastMonthlyPct = lastMonthly?.delta != null && monthlyData[monthlyData.length - 2].balance !== 0
    ? (lastMonthly.delta / Math.abs(monthlyData[monthlyData.length - 2].balance)) * 100
    : null;

  const milestonesReached = MILESTONES.filter(m => m <= netWorthTotal).length;
  const nextMilestone = MILESTONES.find(m => m > netWorthTotal) ?? null;
  const cashShare = netWorthTotal > 0 ? Math.max(0, Math.min(100, (bankBalance / netWorthTotal) * 100)) : 100;

  return (
    <>
    <MobileHeader icon={PiggyBank} title="Net Worth" />
    <div key={theme} className="min-h-screen md:pt-20 text-ink p-4 sm:p-8 pb-28">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-end mb-3">
          <button
            onClick={refreshAll}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold text-gray-500 hover:text-ink transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <div className="space-y-4">
          {/* Top row — 3 cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bank Balance card */}
            {loading ? (
              <SkeletonBar />
            ) : (
              <motion.div
                {...cardMotion(0.04)}
                className="bg-canvas/80 rounded-2xl p-5 sm:p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <PiggyBank size={14} className="text-warning-deep" />
                      </div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bank Balance</p>
                    </div>
                    {editMode ? (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="number"
                          autoFocus
                          value={newBalance}
                          onChange={e => setNewBalance(e.target.value)}
                          placeholder={bankBalance.toString()}
                          className="bg-canvas/80 text-ink rounded-xl px-3 py-2 text-lg font-black w-full min-w-0 max-w-40 focus:outline-none focus:ring-2 focus:ring-warning"
                          onKeyDown={e => { if (e.key === "Enter") handleUpdateBalance(); if (e.key ==="Escape") handleCancelEdit(); }}
                        />
                        <button
                          onClick={handleUpdateBalance}
                          disabled={saving}
                          className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-ink transition-all cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xl sm:text-2xl font-black text-amber-300 mt-2 tabular-nums truncate">
                          {money(`₹${fmtINR(bankBalance)}`)}
                        </p>
                        {hasAssets && (
                          <p className="text-[11px] text-gray-600 mt-1">{Math.round(cashShare)}% of net worth</p>
                        )}
                      </>
                    )}
                  </div>
                  {!editMode && (
                    <button
                      onClick={() => { setEditMode(true); setNewBalance(bankBalance.toString()); }}
                      className="p-2 rounded-xl bg-gray-800/60 text-gray-500 hover:text-warning-deep transition-all cursor-pointer"
                      title="Edit balance"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Assets — links through to the holdings page */}
            {loading ? (
              <SkeletonBar />
            ) : (
              <motion.div {...cardMotion(0.08)}>
                <Link
                  href="/assets"
                  className="group block h-full bg-gray-900/60 rounded-2xl p-5 sm:p-6 hover:bg-gray-900/80 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Gem size={14} className="text-blue-400" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assets</p>
                    <ChevronRight size={14} className="ml-auto text-gray-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-blue-300 mt-2 tabular-nums truncate">{money(`₹${fmtINR(Math.round(assetsTotal))}`)}</p>
                  <p className="text-[11px] text-gray-600 mt-1">
                    {hasAssets ? `${Math.round(100 - cashShare)}% of net worth · manage` : "Add stocks, crypto or metals →"}
                  </p>
                </Link>
              </motion.div>
            )}

            {/* Total Net Worth — the hero, first in reading order */}
            {loading ? (
              <SkeletonBar className="h-36 order-first col-span-2" />
            ) : (
              <motion.div
                {...cardMotion(0)}
                className="order-first col-span-2 bg-canvas/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Landmark size={14} className="text-emerald-400" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Net Worth</p>
                    <span className="ml-auto text-[10px] text-gray-600">cash + assets</span>
                  </div>
                  <div className="flex items-baseline gap-3 flex-wrap mt-2">
                    <p className="text-4xl font-black text-emerald-300 tabular-nums tracking-tight">
                      {money(`₹${fmtINR(Math.round(netWorthTotal))}`)}
                    </p>
                    {lastMonthly?.delta != null && lastMonthlyPct !== null && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${lastMonthly.delta >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                        {lastMonthly.delta >= 0 ? "▲" : "▼"} {Math.abs(lastMonthlyPct).toFixed(1)}%
                        <span className="font-semibold opacity-70 ml-1">this month</span>
                      </span>
                    )}
                  </div>
                </div>
                {hasAssets && (
                  <div>
                    {/* Composition — how today's net worth splits between cash and holdings */}
                    <div className="flex h-2 rounded-full overflow-hidden gap-0.5" aria-hidden>
                      <div className="h-full rounded-full" style={{ width: `${cashShare}%`, background: CHART.cash }} />
                      <div className="h-full rounded-full flex-1" style={{ background: CHART.assets }} />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <span className="w-2 h-2 rounded-full" style={{ background: CHART.cash }} />
                        Cash <span className="font-bold text-ink tabular-nums">{money(`₹${fmtINR(bankBalance)}`)}</span>
                      </span>
                      <Link href="/assets" className="flex items-center gap-1.5 text-gray-500 hover:text-blue-400 transition-colors">
                        <span className="w-2 h-2 rounded-full" style={{ background: CHART.assets }} />
                        Assets <span className="font-bold text-ink tabular-nums">{money(`₹${fmtINR(Math.round(assetsTotal))}`)}</span>
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Quick stats strip */}
          {loading ? (
            <SkeletonBar className="h-20" />
          ) : history.length > 0 && (
            <motion.div
              {...cardMotion(0.2)}
              className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-800 rounded-2xl overflow-hidden"
            >
              {[
                {
                  icon: <Trophy size={13} className="text-warning-deep" />,
                  label: "All-time high",
                  value: money(formatAmount(allTimeHigh)),
                  sub: allTimeHigh <= netWorthTotal ? "Right now 🎉" : `${money(formatAmount(allTimeHigh - netWorthTotal))} above today`,
                },
                {
                  icon: <ArrowUpRight size={13} className={totalGrowth >= 0 ? "text-emerald-400" : "text-red-400"} />,
                  label: "Total growth",
                  value: money(`${totalGrowth >= 0 ? "+" :""}${formatAmount(totalGrowth)}`),
                  sub: "since first snapshot",
                },
                {
                  icon: <Zap size={13} className="text-violet-400" />,
                  label: "Best month",
                  value: bestMonth?.delta != null ? money(`+${formatAmount(Math.max(0, bestMonth.delta))}`) : "—",
                  sub: bestMonth?.delta != null ? bestMonth.month : "needs 2+ months",
                },
                {
                  icon: <Activity size={13} className="text-blue-400" />,
                  label: "Avg / month",
                  value: money(`${avgDelta >= 0 ? "+" :""}${formatAmount(avgDelta)}`),
                  sub: "monthly pace",
                },
              ].map((s, i) => (
                <div key={i} className="bg-gray-900/95 px-4 py-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    {s.icon}
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{s.label}</p>
                  </div>
                  <p className="text-lg font-black text-ink leading-tight">{s.value}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Health Score + Milestone row */}
          {!loading && (() => {
            const remaining = nextMilestone !== null ? nextMilestone - netWorthTotal : 0;
            const monthsToMilestone = avgDelta > 0 && nextMilestone !== null
              ? Math.ceil(remaining / avgDelta)
              : null;
            const colors = healthScore !== null ? healthColor(healthScore) : null;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Health Score */}
                <motion.div
                  {...cardMotion(0.24)}
                  className="bg-gray-900/60 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-violet-500/20 rounded-lg flex items-center justify-center">
                      <Brain size={14} className="text-violet-400" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net Worth Health</p>
                  </div>
                  {healthScore !== null && colors ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" className="text-hairline" strokeWidth="4" />
                          <circle
                            cx="32" cy="32" r="28" fill="none"
                            stroke={colors.ring} strokeWidth="4" strokeLinecap="round"
                            strokeDasharray={`${(healthScore / 100) * 2 * Math.PI * 28} ${2 * Math.PI * 28}`}
                          />
                        </svg>
                        <span className={`absolute inset-0 flex items-center justify-center text-xl font-black ${colors.text}`}>
                          {healthScore}
                        </span>
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${colors.text}`}>
                          {healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : healthScore >= 40 ? "Fair" : healthScore >= 20 ? "Weak" : "Poor"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{healthReason}</p>
                        <p className="text-[10px] text-ink mt-1">Score out of 100 · AI assessed</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600">Generate AI insights below to see your score.</p>
                  )}
                </motion.div>

                {/* Next Milestone */}
                <motion.div
                  {...cardMotion(0.28)}
                  className="bg-gray-900/60 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Target size={14} className="text-warning-deep" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Next Milestone</p>
                    {milestonesReached > 0 && (
                      <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-warning-deep">
                        {milestonesReached} reached
                      </span>
                    )}
                  </div>
                  {nextMilestone !== null ? (
                    <>
                      <p className="text-2xl font-black text-amber-300">{money(formatAmount(nextMilestone))}</p>
                      <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-warning transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, Math.round((netWorthTotal / nextMilestone) * 100)))}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1.5">
                        {money(`₹${fmtINR(Math.round(remaining))}`)} away
                        {monthsToMilestone !== null && (
                          <span className="text-warning-deep font-semibold ml-1">
                            · ~{monthsToMilestone} month{monthsToMilestone !== 1 ? "s" : ""} at current pace
                          </span>
                        )}
                        {avgDelta <= 0 && (
                          <span className="text-gray-600 ml-1">· grow your net worth to see ETA</span>
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500">You&apos;ve passed all preset milestones!</p>
                  )}
                </motion.div>
              </div>
            );
          })()}

          {/* Chart controls + Balance History */}
          {loading ? (
            <SkeletonBar className="h-72" />
          ) : history.length > 0 && (() => {
            const first = nwOf(visibleHistory[0]);
            const last = nwOf(visibleHistory[visibleHistory.length - 1]);
            const rangeChange = last - first;
            const rangeChangePct = first !== 0 ? ((rangeChange / Math.abs(first)) * 100).toFixed(1) : null;
            const isUp = rangeChange >= 0;
            const trendColor = isUp ? CHART.up : CHART.down;

            const now = new Date();
            const projLabel = (addMonths: number) => {
              const d = new Date(now.getFullYear(), now.getMonth() + addMonths, 1);
              return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
            };
            const projActive = showProjection && avgDelta !== 0 && history.length > 1;
            // Projection continues the net-worth line from its latest point at the
            // average monthly net-worth change
            const projPoints = projActive
              ? rangeDef.projSteps.map(s => ({ label: projLabel(s), value: last + avgDelta * s, months: s }))
              : [];

            // Short ranges show day+month; long ranges show month+year
            const useDayLabels = rangeDef.ytd || (rangeDef.months !== null && rangeDef.months <= 6);
            const historyLabels = visibleHistory.map(h =>
              new Date(h.date).toLocaleDateString(
                "en-IN",
                useDayLabels
                  ? { day: "numeric", month: "short" }
                  : { month: "short", year: "2-digit" }
              )
            );
            const allLabels = [...historyLabels, ...projPoints.map(p => p.label)];
            const lastRealIdx = visibleHistory.length - 1;
            const padProj = (vals: number[]): (number | null)[] => [...vals, ...projPoints.map(() => null)];
            const nwData = padProj(visibleHistory.map(nwOf));
            const projData: (number | null)[] = [
              ...Array(lastRealIdx).fill(null),
              last,
              ...projPoints.map(p => p.value),
            ];
            const cashData = padProj(visibleHistory.map(h => h.balance));
            const assetsData = padProj(visibleHistory.map(h => h.assets ?? 0));
            const startLabel = historyLabels[0];

            // Breakdown overlays: thinner, quieter strokes so the net-worth area
            // stays the figure and these read as ground.
            const overlayLine = (key: BreakdownKey, data: (number | null)[]) => {
              const s = BREAKDOWN.find(x => x.key === key)!;
              return {
                label: s.label,
                data,
                hidden: !seriesOn[key],
                borderColor: alpha(s.color(), 0.9),
                backgroundColor: "transparent",
                fill: false,
                cubicInterpolationMode: "monotone" as const,
                borderWidth: 1.5,
                borderJoinStyle: "round" as const,
                borderCapStyle: "round" as const,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: s.color(),
                pointHoverBorderColor: CHART.surface,
                pointHoverBorderWidth: 2,
                pointHitRadius: 8,
                spanGaps: false,
              };
            };

            return (
              <motion.div {...cardMotion(0.32)} className="space-y-4">
                {/* Filter row — scopes the charts below */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex gap-0.5 bg-gray-900/80 rounded-xl p-1">
                    {RANGES.map(r => (
                      <button
                        key={r.key}
                        onClick={() => setRange(r.key)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          range === r.key
                            ? "bg-gray-700 text-ink shadow-sm"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={updateChart}
                      disabled={chartUpdating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-40"
                      title="Record today's balance and fill any missing days"
                    >
                      <RefreshCw size={12} className={chartUpdating ? "animate-spin" : ""} />
                      {chartUpdating ? "Updating…" : "Update chart"}
                    </button>
                    <button
                      onClick={() => setShowProjection(v => !v)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                        showProjection
                          ? "bg-gray-800/80 text-gray-300"
                          : "bg-transparent text-gray-600 hover:text-gray-400"
                      }`}
                    >
                      <span className="w-3.5 border-t-2 border-dashed border-slate-500" />
                      Projection
                    </button>
                    <button
                      onClick={() => setTableView(v => !v)}
                      className="p-1.5 rounded-xl bg-gray-900/80 text-gray-500 hover:text-gray-300 transition-all cursor-pointer"
                      title={tableView ? "Show chart" : "Show table"}
                    >
                      {tableView ? <LineChart size={14} /> : <Table2 size={14} />}
                    </button>
                    {!tableView && (
                      <button
                        onClick={() => setFullscreen(v => !v)}
                        className="p-1.5 rounded-xl bg-gray-900/80 text-gray-500 hover:text-gray-300 transition-all cursor-pointer"
                        title={fullscreen ? "Exit full screen" : "Full screen"}
                      >
                        {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Balance History card — becomes a full-viewport overlay in fullscreen */}
                <div
                  className={
                    fullscreen
                      ? "fixed inset-0 z-50 bg-canvas/80 border-0 rounded-none overflow-y-auto flex flex-col"
                      : "bg-gray-900/60 rounded-2xl overflow-hidden"
                  }
                >
                  <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net Worth History</p>
                      </div>
                      <p className="text-3xl font-black text-ink tabular-nums tracking-tight">{money(`₹${fmtINR(Math.round(netWorthTotal))}`)}</p>
                      {hasAssets && (
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          cash {money(formatAmount(bankBalance))} + assets {money(formatAmount(assetsTotal))}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {rangeChangePct !== null && visibleHistory.length > 1 && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isUp ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                          {isUp ? "▲" : "▼"} {Math.abs(Number(rangeChangePct))}%
                          <span className="font-semibold opacity-70 ml-1">
                            ({money(`${isUp ? "+" : "-"}₹${fmtINR(Math.round(Math.abs(rangeChange)))}`)})
                          </span>
                        </span>
                      )}
                      <span className="text-[10px] text-gray-600 text-right">
                        {rangeDef.ytd ? "year to date" : rangeDef.months === null ? "all time" : `last ${rangeDef.label.toLowerCase()}`}
                        {avgDelta !== 0 && <> · avg {money(`${avgDelta >= 0 ? "+" : ""}₹${fmtINR(avgDelta)}`)}/mo</>}
                      </span>
                      {/* The toolbar toggle sits outside this card, so fullscreen needs its own exit */}
                      {fullscreen && (
                        <button
                          onClick={() => setFullscreen(false)}
                          className="mt-1 flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-900/80 text-[10px] font-bold text-gray-400 hover:text-gray-200 transition-all cursor-pointer"
                          title="Exit full screen (Esc)"
                        >
                          <Minimize2 size={11} /> Exit
                        </button>
                      )}
                    </div>
                  </div>

                  {tableView ? (
                    <div className="px-6 pb-5 max-h-[280px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-canvas-soft/80">
                          <tr className="text-left text-[10px] text-gray-500 uppercase tracking-wider">
                            <th className="py-2 font-bold">Date</th>
                            <th className="py-2 font-bold text-right">Net worth</th>
                            <th className="py-2 font-bold text-right">Change</th>
                            {hasAssets && (
                              <>
                                <th className="py-2 font-bold text-right">Cash</th>
                                <th className="py-2 font-bold text-right">Assets</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="tabular-nums">
                          {visibleHistory.map((h, i) => {
                            const d = i > 0 ? nwOf(h) - nwOf(visibleHistory[i - 1]) : null;
                            return { h, d };
                          }).reverse().map(({ h, d }, i) => (
                            <tr key={i} className="border-t border-gray-800/60">
                              <td className="py-2 text-gray-400 text-xs">
                                {new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                {h.estimated && (
                                  <span className="ml-1.5 text-[10px] text-gray-600" title="Interpolated between recorded balances">~est</span>
                                )}
                              </td>
                              <td className="py-2 text-right font-semibold text-ink">{money(`₹${fmtINR(Math.round(nwOf(h)))}`)}</td>
                              <td className={`py-2 text-right text-xs font-bold ${d === null || Math.round(d) === 0 ? "text-gray-500" : d > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {d === null ? "—" : Math.round(d) === 0 ? "0" : `${d > 0 ? "▲ +" : "▼ -"}${money(`₹${fmtINR(Math.round(Math.abs(d)))}`)}`}
                              </td>
                              {hasAssets && (
                                <>
                                  <td className="py-2 text-right text-gray-400">{money(`₹${fmtINR(h.balance)}`)}</td>
                                  <td className="py-2 text-right text-gray-400">{money(`₹${fmtINR(Math.round(h.assets ?? 0))}`)}</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <>
                    <div className="px-6 pb-2 flex items-center gap-1.5 flex-wrap min-h-7">
                      {/* Net worth is always drawn — a static key, not a toggle */}
                      <span className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-ink">
                        <span className="w-3.5 h-[3px] rounded-full" style={{ background: trendColor }} />
                        Net worth
                      </span>
                      {hasAssets && (
                        <div className="flex items-center gap-1.5" role="group" aria-label="Breakdown lines">
                          <span className="text-[10px] text-gray-600 ml-1">compare</span>
                          {BREAKDOWN.map(s => {
                            const on = seriesOn[s.key];
                            return (
                              <button
                                key={s.key}
                                onClick={() => toggleSeries(s.key)}
                                aria-pressed={on}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                                  on ? "bg-gray-800/80 text-gray-200 border-transparent" : "text-gray-500 hover:text-gray-300 border-gray-800 border-dashed"
                                }`}
                              >
                                <span className="w-3.5 h-[2px] rounded-full" style={{ background: s.color(), opacity: on ? 1 : 0.5 }} />
                                {s.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {zoomReady && (
                        <div className="ml-auto flex items-center gap-3">
                          <span className="hidden sm:inline text-[10px] text-gray-600">drag to zoom · shift+drag to pan</span>
                          <button
                            onClick={resetZoom}
                            className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-emerald-400 transition-all cursor-pointer"
                          >
                            <RotateCcw size={11} /> Reset
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={fullscreen ? "flex-1 min-h-0 px-3 pb-6" : "h-[320px] px-3 pb-4"}>
                      <Line
                        ref={chartRef}
                        plugins={[lineGlowPlugin, nwMarksPlugin, crosshairPlugin]}
                        data={{
                          labels: allLabels,
                          datasets: [
                            {
                              label: "Net worth",
                              data: nwData,
                              borderColor: trendColor,
                              // One soft wash in the overall trend colour, fading out
                              // toward the floor
                              backgroundColor: (ctx) => {
                                const { ctx: c, chartArea } = ctx.chart;
                                if (!chartArea) return "transparent";
                                const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                                grad.addColorStop(0, alpha(trendColor, 0.28));
                                grad.addColorStop(0.55, alpha(trendColor, 0.08));
                                grad.addColorStop(1, alpha(trendColor, 0));
                                return grad;
                              },
                              fill: "start",
                              cubicInterpolationMode: "monotone" as const,
                              borderWidth: 2.5,
                              borderJoinStyle: "round" as const,
                              borderCapStyle: "round" as const,
                              pointRadius: (ctx) => (ctx.dataIndex === lastRealIdx ? 4.5 : 0),
                              pointHoverRadius: 6,
                              pointBackgroundColor: trendColor,
                              pointHoverBackgroundColor: trendColor,
                              pointBorderColor: CHART.surface,
                              pointHoverBorderColor: CHART.surface,
                              pointBorderWidth: 2.5,
                              pointHoverBorderWidth: 3,
                              pointHitRadius: 10,
                              spanGaps: false,
                            },
                            ...(projActive ? [{
                              label: "Projected",
                              data: projData,
                              borderColor: alpha(trendColor, 0.55),
                              backgroundColor: "transparent",
                              fill: false,
                              cubicInterpolationMode: "monotone" as const,
                              borderDash: [5, 5],
                              borderWidth: 2,
                              pointRadius: (ctx: { dataIndex: number }) => (ctx.dataIndex <= lastRealIdx ? 0 : 3.5),
                              pointHoverRadius: 5,
                              pointBackgroundColor: CHART.surface,
                              pointBorderColor: alpha(trendColor, 0.7),
                              pointBorderWidth: 2,
                              pointHitRadius: 8,
                              spanGaps: false,
                            }] : []),
                            ...(hasAssets
                              ? [overlayLine("cash", cashData), overlayLine("assets", assetsData)]
                              : []),
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          // Data changes stay instant, but the hover/active state eases in
                          // — with daily points, snapping the marker and crosshair between
                          // adjacent days reads as jitter.
                          animation: false,
                          transitions: {
                            active: { animation: { duration: 180, easing: "easeOutQuart" } },
                            resize: { animation: { duration: 0 } },
                          },
                          interaction: { mode: "index", intersect: false, axis: "x" },
                          hover: { mode: "index", intersect: false, axis: "x" },
                          plugins: {
                            legend: { display: false },
                            // Read by nwMarksPlugin (not a registered plugin, so untyped)
                            ...({ nwMarks: { masked: hidden, lastIdx: lastRealIdx } } as object),
                            tooltip: {
                              ...baseTooltip,
                              displayColors: true,
                              usePointStyle: true,
                              boxWidth: 8,
                              boxHeight: 8,
                              boxPadding: 4,
                              // The projection's first point is the real last point —
                              // don't list it twice
                              filter: (item) =>
                                item.raw !== null && !(item.dataset.label === "Projected" && item.dataIndex <= lastRealIdx),
                              itemSort: (a, b) => a.datasetIndex - b.datasetIndex,
                              callbacks: {
                                label: (item) => ` ${item.dataset.label}  ${money(`₹${fmtINR(Math.round(Number(item.raw)))}`)}`,
                                labelColor: (item) => {
                                  const c = item.datasetIndex === 0 ? trendColor
                                    : item.dataset.label === "Projected" ? alpha(trendColor, 0.6)
                                    : BREAKDOWN.find(b => b.label === item.dataset.label)?.color() ?? trendColor;
                                  return { borderColor: c, backgroundColor: c, borderWidth: 0, borderRadius: 4 };
                                },
                                labelPointStyle: () => ({ pointStyle: "circle" as const, rotation: 0 }),
                                // Change since the start of the visible range, for the hovered day
                                footer: (items) => {
                                  const nwItem = items.find(i => i.datasetIndex === 0);
                                  if (!nwItem || nwItem.dataIndex === 0 || hidden) return "";
                                  const diff = Number(nwItem.raw) - first;
                                  const pct = first !== 0 ? ` (${diff >= 0 ? "+" : ""}${((diff / Math.abs(first)) * 100).toFixed(1)}%)` : "";
                                  return `${diff >= 0 ? "▲ +" : "▼ -"}₹${fmtINR(Math.round(Math.abs(diff)))}${pct} since ${startLabel}`;
                                },
                              },
                            },
                            zoom: {
                              // Drag a region to zoom into it. Wheel zoom stays off so
                              // scrolling the page over the chart still scrolls the page.
                              zoom: {
                                drag: {
                                  enabled: zoomReady,
                                  backgroundColor: alpha(cssVar("--color-positive"), 0.12),
                                  borderColor: alpha(cssVar("--color-positive"), 0.55),
                                  borderWidth: 1,
                                },
                                wheel: { enabled: false },
                                mode: "x",
                              },
                              pan: { enabled: zoomReady, mode: "x", modifierKey: "shift" },
                              limits: { x: { minRange: 3 } },
                            },
                          },
                          scales: {
                            x: {
                              ticks: { color: CHART.tick, font: { size: 11 }, maxRotation: 0, autoSkip: true, autoSkipPadding: 16, maxTicksLimit: 8, padding: 8 },
                              grid: { display: false },
                              border: { display: false },
                            },
                            y: {
                              position: "left",
                              grace: "10%",
                              ticks: { color: CHART.tick, font: { size: 11 }, maxTicksLimit: 5, padding: 8, callback: (v) => (hidden ? "•••" : formatAmount(Number(v))) },
                              // Dashed, recessive gridlines — the area fill carries the shape
                              grid: { color: CHART.grid, drawTicks: false },
                              border: { display: false, dash: [3, 4] },
                            },
                          },
                        }}
                      />
                    </div>
                    </>
                  )}

                  {/* Projection footer */}
                  {!tableView && projActive && (
                    <div className="px-6 pb-4 flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-px border-t-2 border-dashed border-gray-500" />
                        <span className="text-[10px] text-gray-600">Net worth projected at {money(`${avgDelta >= 0 ? "+" : ""}₹${fmtINR(avgDelta)}`)}/mo</span>
                      </div>
                      <div className="flex items-center gap-3 ml-auto text-[10px] text-gray-600">
                        {projPoints.map(p => (
                          <span key={p.months}>
                            +{p.months}mo: <span className="text-gray-400 font-semibold">{money(`₹${fmtINR(Math.max(0, Math.round(p.value)))}`)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Monthly Change card */}
                {(() => {
                  const bars = monthlyData.filter(m => m.delta !== null).slice(-12);
                  if (bars.length < 2) return null;
                  const recent = monthlyData.slice(-3);
                  return (
                    <div className="bg-gray-900/60 rounded-2xl overflow-hidden">
                      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity size={14} className="text-blue-400" />
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Net Worth Change</p>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-600">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-[2px] bg-emerald-400/80" /> grew
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-[2px] bg-red-400/80" /> fell
                          </span>
                        </div>
                      </div>
                      <div className="h-[170px] px-3">
                        <Bar
                          data={{
                            labels: bars.map(b => b.month),
                            datasets: [{
                              label: "Change",
                              data: bars.map(b => b.delta),
                              backgroundColor: bars.map(b => (b.delta! >= 0 ? CHART.upDim : CHART.downDim)),
                              hoverBackgroundColor: bars.map(b => (b.delta! >= 0 ? CHART.up : CHART.down)),
                              borderRadius: 4,
                              borderSkipped: "start" as const,
                              maxBarThickness: 20,
                            }],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: false,
                            interaction: { mode: "index", intersect: false },
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                ...baseTooltip,
                                callbacks: {
                                  label: (item) => {
                                    const v = Number(item.raw);
                                    return ` ${money(`${v >= 0 ? "+" :"-"}₹${fmtINR(Math.abs(v))}`)}`;
                                  },
                                },
                              },
                            },
                            scales: {
                              x: {
                                ticks: { color: CHART.tick, font: { size: 11 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 },
                                grid: { display: false },
                                border: { display: false },
                              },
                              y: {
                                grace: "10%",
                                ticks: { color: CHART.tick, font: { size: 11 }, maxTicksLimit: 4, padding: 6, callback: (v) => (hidden ? "•••" : formatAmount(Number(v))) },
                                grid: { color: (ctx) => (ctx.tick.value === 0 ? CHART.gridZero : CHART.grid) },
                                border: { display: false },
                              },
                            },
                          }}
                        />
                      </div>
                      {/* Last 3 months summary */}
                      <div className="px-6 py-4 mt-1 border-t border-gray-800/60 grid grid-cols-3 gap-3">
                        {recent.map((row, i) => {
                          const rowUp = row.delta === null || row.delta >= 0;
                          const prevBalance = monthlyData[monthlyData.length - recent.length + i - 1]?.balance;
                          const pct = row.delta !== null && prevBalance
                            ? ((row.delta / Math.abs(prevBalance)) * 100).toFixed(1)
                            : null;
                          return (
                            <div key={i} className="flex flex-col gap-0.5">
                              <p className="text-[11px] text-gray-500 font-semibold">{row.month}</p>
                              <p className="text-sm font-black text-ink tabular-nums">{money(`₹${fmtINR(Math.round(row.balance))}`)}</p>
                              {row.delta !== null ? (
                                <span className={`text-[11px] font-bold ${rowUp ? "text-emerald-400" : "text-red-400"}`}>
                                  {rowUp ? "▲" : "▼"} {pct !== null ? `${Math.abs(Number(pct))}%` : ""}
                                  <span className="font-normal text-gray-600 ml-1">
                                    ({money(`${rowUp ? "+" : "-"}₹${fmtINR(Math.round(Math.abs(row.delta)))}`)})
                                  </span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-ink">— first entry</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            );
          })()}

          {/* Empty state when no history yet */}
          {!loading && history.length === 0 && (
            <motion.div
              {...cardMotion(0.32)}
              className="bg-gray-900/60 border-dashed rounded-2xl p-10 text-center"
            >
              <TrendingUp size={28} className="text-ink mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">No history yet</p>
              <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                Set your bank balance above, then record it — your growth chart appears
                once there are a couple of data points.
              </p>
              <button
                onClick={updateChart}
                disabled={chartUpdating}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-40"
              >
                <RefreshCw size={12} className={chartUpdating ? "animate-spin" : ""} />
                {chartUpdating ? "Updating…" : "Record today's balance"}
              </button>
            </motion.div>
          )}

          {/* AI Net Worth Advisor */}
          {!loading && (
            <motion.div
              {...cardMotion(0.36)}
              className="rounded-2xl bg-canvas/80 p-5"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 rounded-lg bg-violet-500/15">
                  <Bot size={14} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-violet-400">AI Net Worth Advisor</p>
                  <p className="text-[10px] text-gray-600">Powered by Llama 3.3 · refreshes weekly</p>
                </div>
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300">
                  AI
                </span>
              </div>

              {aiAdvice ? (
                <>
                  <p className="text-sm text-gray-300 leading-relaxed">{aiAdvice}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                      <span className="text-[10px] text-gray-600">Cached · refreshes next Monday</span>
                    </div>
                    <button
                      onClick={() => fetchAIAdvice(bankBalance, history)}
                      disabled={aiLoading}
                      className="text-[11px] text-gray-600 hover:text-violet-400 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <RefreshCw size={10} className={aiLoading ? "animate-spin" : ""} />
                      Refresh
                    </button>
                  </div>
                </>
              ) : aiLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <RefreshCw size={13} className="animate-spin" />
                  <span className="text-xs">Analyzing your net worth…</span>
                </div>
              ) : aiError ? (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-red-400">Could not load insights. Try again.</p>
                  <button
                    onClick={() => fetchAIAdvice(bankBalance, history)}
                    className="text-[11px] text-gray-500 hover:text-gray-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} /> Retry
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-xs text-gray-500">
                    Get a personalised analysis of your net worth trajectory, health score, and actionable tips.
                  </p>
                  <button
                    onClick={() => fetchAIAdvice(bankBalance, history)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 text-violet-300 text-xs font-semibold hover:bg-violet-500/25 transition-all cursor-pointer"
                  >
                    <Sparkles size={13} />
                    Generate AI Insights
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
      <FloatingTransactionButton />
      <BottomNav />
    </div>
    </>
  );
}
