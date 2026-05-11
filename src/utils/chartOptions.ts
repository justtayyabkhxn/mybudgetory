// src/utils/chartOptions.ts — Chart.js v4 config builders
import type { ChartData, ChartOptions } from "chart.js";

const FONT = "var(--font-bricolage), 'Bricolage Grotesque', sans-serif";

// ─── Colors ───────────────────────────────────────────────────────────────────
const CAT_HEX: Record<string, string> = {
  Food: "#f97316", Outing: "#3b82f6", Clothes: "#a855f7",
  Medical: "#ef4444", Bills: "#eab308", Entertainment: "#ec4899",
  Travel: "#06b6d4", SMM: "#10b981", Vacation: "#84cc16",
  Others: "#6b7280", Other: "#6b7280",
};
const PALETTE = ["#6366f1","#ec4899","#f97316","#10b981","#f59e0b","#06b6d4","#a855f7","#ef4444"];

export function getCatColor(cat: string, idx: number) {
  return CAT_HEX[cat] ?? PALETTE[idx % PALETTE.length];
}

export function fmtK(v: number | string): string {
  const n = Number(v);
  if (Math.abs(n) >= 1000) return "₹" + (n / 1000).toFixed(1) + "k";
  return "₹" + n;
}

// ─── Canvas gradient helpers ──────────────────────────────────────────────────
// Vertical top→bottom gradient for bar backgrounds
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function vGrad(top: string, bot: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (ctx: any) => {
    const chart = ctx.chart;
    const { ctx: c, chartArea } = chart;
    if (!chartArea) return top;
    const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    g.addColorStop(0, top);
    g.addColorStop(1, bot);
    return g;
  };
}

// Vertical gradient fill for line/area charts (color → transparent)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function areaGrad(color: string, opacity = 0.35): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (ctx: any) => {
    const chart = ctx.chart;
    const { ctx: c, chartArea } = chart;
    if (!chartArea) return `${color}55`;
    const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    g.addColorStop(0, hexAlpha(color, opacity));
    g.addColorStop(1, hexAlpha(color, 0));
    return g;
  };
}

function hexAlpha(hex: string, alpha: number): string {
  // Convert hex to rgba
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Shared style primitives ──────────────────────────────────────────────────
const TT = {
  backgroundColor: "rgba(15,23,42,0.95)",
  borderColor: "#334155",
  borderWidth: 1,
  titleColor: "#e2e8f0",
  bodyColor: "#94a3b8",
  cornerRadius: 12,
  padding: 12,
  titleFont: { family: FONT, size: 13, weight: "bold" as const },
  bodyFont:  { family: FONT, size: 12 },
  usePointStyle: true,
  pointStyle: "circle" as const,
  boxWidth: 8,
  boxHeight: 8,
};

const LEG_LABELS = {
  color: "#94a3b8",
  font: { family: FONT, size: 11 },
  usePointStyle: true,
  pointStyle: "circle" as const,
  boxWidth: 6,
  boxHeight: 6,
  padding: 12,
};

// ─── 1. Income vs Expenses Donut ──────────────────────────────────────────────
export function getDonutConfig(inflow: number, expense: number): {
  data: ChartData<"doughnut">;
  options: ChartOptions<"doughnut">;
} {
  return {
    data: {
      labels: ["Income", "Expenses"],
      datasets: [{
        data: [inflow, expense],
        backgroundColor: ["#34d399", "#f87171"],
        hoverBackgroundColor: ["#6ee7b7", "#fca5a5"],
        borderWidth: 0,
        hoverOffset: 10,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      animation: { duration: 900 },
      plugins: {
        legend: { display: true, position: "bottom", labels: LEG_LABELS },
        tooltip: {
          ...TT,
          callbacks: {
            label: (ctx) => {
              const arr = ctx.chart.data.datasets[0].data as number[];
              const total = arr.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((ctx.raw as number) / total * 100).toFixed(1) : "0";
              return `  ${ctx.label}: ${fmtK(ctx.raw as number)} (${pct}%)`;
            },
          },
        },
      },
    },
  };
}

// ─── 2. Cash vs UPI Payment Mode Donut ───────────────────────────────────────
export function getPaymentModeConfig(cash: number, upi: number): {
  data: ChartData<"doughnut">;
  options: ChartOptions<"doughnut">;
} {
  return {
    data: {
      labels: ["Cash", "UPI"],
      datasets: [{
        data: [cash, upi],
        backgroundColor: ["#fbbf24", "#818cf8"],
        hoverBackgroundColor: ["#fde68a", "#c7d2fe"],
        borderWidth: 0,
        hoverOffset: 10,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      animation: { duration: 900 },
      plugins: {
        legend: { display: true, position: "bottom", labels: LEG_LABELS },
        tooltip: {
          ...TT,
          callbacks: {
            label: (ctx) => {
              const arr = ctx.chart.data.datasets[0].data as number[];
              const total = arr.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((ctx.raw as number) / total * 100).toFixed(1) : "0";
              return `  ${ctx.label}: ${fmtK(ctx.raw as number)} (${pct}%)`;
            },
          },
        },
      },
    },
  };
}

// ─── 3. Daily Bar Chart ───────────────────────────────────────────────────────
export function getDailyBarConfig(d: {
  categories: string[];
  inflow: number[];
  expense: number[];
}): { data: ChartData<"bar">; options: ChartOptions<"bar"> } {
  return {
    data: {
      labels: d.categories,
      datasets: [
        {
          label: "Income",
          data: d.inflow,
          backgroundColor: vGrad("#4ade80", "#16a34a"),
          hoverBackgroundColor: "#4ade80",
          borderRadius: 5,
          borderSkipped: false,
        },
        {
          label: "Expenses",
          data: d.expense,
          backgroundColor: vGrad("#fb7185", "#e11d48"),
          hoverBackgroundColor: "#fb7185",
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: true, labels: LEG_LABELS },
        tooltip: {
          ...TT,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 10, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
      },
    },
  };
}

// ─── 4. Cumulative Spending Line ──────────────────────────────────────────────
export function getCumulativeConfig(d: {
  categories: string[];
  cumulative: (number | null)[];
  daily: (number | null)[];
}): { data: ChartData<"line">; options: ChartOptions<"line"> } {
  return {
    data: {
      labels: d.categories,
      datasets: [
        {
          label: "Cumulative",
          data: d.cumulative,
          borderColor: "#fb923c",
          backgroundColor: areaGrad("#fb923c", 0.3),
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: "#fb923c",
          borderWidth: 2.5,
          spanGaps: false,
        },
        {
          label: "Daily",
          data: d.daily,
          borderColor: "#a5b4fc",
          backgroundColor: areaGrad("#818cf8", 0.2),
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: "#a5b4fc",
          borderWidth: 2,
          spanGaps: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: true, labels: LEG_LABELS },
        tooltip: {
          ...TT,
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 10, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
      },
    },
  };
}

// ─── 5. Monthly Overview Bar ──────────────────────────────────────────────────
export function getMonthlyBarConfig(d: {
  categories: string[];
  inflow: number[];
  expense: number[];
}): { data: ChartData<"bar">; options: ChartOptions<"bar"> } {
  return {
    data: {
      labels: d.categories,
      datasets: [
        {
          label: "Income",
          data: d.inflow,
          backgroundColor: vGrad("#4ade80", "#16a34a"),
          hoverBackgroundColor: "#4ade80",
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: "Expenses",
          data: d.expense,
          backgroundColor: vGrad("#fb7185", "#e11d48"),
          hoverBackgroundColor: "#fb7185",
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: true, labels: LEG_LABELS },
        tooltip: {
          ...TT,
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
      },
    },
  };
}

// ─── 6. Monthly Net Savings Bar ───────────────────────────────────────────────
export function getMonthlySavingsConfig(d: {
  categories: string[];
  data: number[];
}): { data: ChartData<"bar">; options: ChartOptions<"bar"> } {
  return {
    data: {
      labels: d.categories,
      datasets: [{
        label: "Savings",
        data: d.data,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        backgroundColor: (ctx: any) => {
          const { chart, dataIndex } = ctx;
          const { ctx: c, chartArea } = chart;
          const v = d.data[dataIndex];
          const [top, bot] = v >= 0 ? ["#4ade80", "#16a34a"] : ["#fb7185", "#e11d48"];
          if (!chartArea) return top;
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, top);
          g.addColorStop(1, bot);
          return g;
        },
        hoverBackgroundColor: d.data.map((v) => (v >= 0 ? "#4ade80" : "#fb7185")),
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TT,
          callbacks: {
            label: (ctx) => `  Savings: ${fmtK(ctx.raw as number)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
      },
    },
  };
}

// ─── 7. Savings Rate Line ─────────────────────────────────────────────────────
export function getSavingsRateConfig(d: {
  categories: string[];
  rates: (number | null)[];
}): { data: ChartData<"line">; options: ChartOptions<"line"> } {
  const pointColors = d.rates.map((r) =>
    r === null ? "transparent" : r >= 20 ? "#4ade80" : r >= 0 ? "#fbbf24" : "#fb7185"
  );
  return {
    data: {
      labels: d.categories,
      datasets: [{
        label: "Savings Rate",
        data: d.rates,
        borderColor: "#a5b4fc",
        backgroundColor: areaGrad("#818cf8", 0.25),
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: pointColors,
        pointBorderColor: "transparent",
        borderWidth: 2.5,
        spanGaps: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TT,
          callbacks: {
            label: (ctx) => {
              const v = ctx.raw as number;
              const flag = v >= 20 ? "✓ " : v < 0 ? "↓ " : "";
              return `  ${flag}Savings Rate: ${v.toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          min: 0,
          ticks: {
            color: "#94a3b8",
            font: { family: FONT, size: 11 },
            callback: (v) => `${v}%`,
          },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
      },
    },
  };
}

// ─── 8. Day-of-Week Spending Bar ──────────────────────────────────────────────
export function getDayOfWeekConfig(d: {
  labels: string[];
  income: number[];
  expense: number[];
}): { data: ChartData<"bar">; options: ChartOptions<"bar"> } {
  return {
    data: {
      labels: d.labels,
      datasets: [
        {
          label: "Income",
          data: d.income,
          backgroundColor: vGrad("#4ade80", "#16a34a"),
          hoverBackgroundColor: "#4ade80",
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: "Expenses",
          data: d.expense,
          backgroundColor: vGrad("#fb7185", "#e11d48"),
          hoverBackgroundColor: "#fb7185",
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: true, labels: LEG_LABELS },
        tooltip: {
          ...TT,
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 12, weight: 700 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
      },
    },
  };
}

// ─── 9. Category Breakdown Bar (horizontal) ───────────────────────────────────
export function getCategoryMonthlyBarConfig(d: {
  categories: string[];
  data: number[];
}): { data: ChartData<"bar">; options: ChartOptions<"bar"> } {
  return {
    data: {
      labels: d.categories,
      datasets: [{
        label: "Spent",
        data: d.data,
        backgroundColor: d.categories.map((c, i) => getCatColor(c, i)),
        hoverBackgroundColor: d.categories.map((c, i) => getCatColor(c, i) + "cc"),
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TT,
          callbacks: { label: (ctx) => `  ${ctx.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
        y: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 12, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
      },
    },
  };
}

// ─── 10. Category Breakdown Donut ─────────────────────────────────────────────
export function getCategoryMonthlyDonutConfig(d: {
  categories: string[];
  data: number[];
}): { data: ChartData<"doughnut">; options: ChartOptions<"doughnut"> } {
  const colors = d.categories.map((c, i) => getCatColor(c, i));
  return {
    data: {
      labels: d.categories,
      datasets: [{
        data: d.data,
        backgroundColor: colors,
        hoverBackgroundColor: colors.map((c) => c + "cc"),
        borderWidth: 0,
        hoverOffset: 10,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      animation: { duration: 900 },
      plugins: {
        legend: { display: true, position: "bottom", labels: { ...LEG_LABELS, padding: 10 } },
        tooltip: {
          ...TT,
          callbacks: {
            label: (ctx) => {
              const arr = ctx.chart.data.datasets[0].data as number[];
              const total = arr.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((ctx.raw as number) / total * 100).toFixed(1) : "0";
              return `  ${ctx.label}: ${fmtK(ctx.raw as number)} (${pct}%)`;
            },
          },
        },
      },
    },
  };
}

// ─── 11. Yearly Category Spending Bar (horizontal) ───────────────────────────
export function getCategoryYearlyBarConfig(d: {
  categories: string[];
  data: number[];
}): { data: ChartData<"bar">; options: ChartOptions<"bar"> } {
  return {
    data: {
      labels: d.categories,
      datasets: [{
        label: "Spent",
        data: d.data,
        backgroundColor: d.categories.map((c, i) => getCatColor(c, i)),
        hoverBackgroundColor: d.categories.map((c, i) => getCatColor(c, i) + "cc"),
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TT,
          callbacks: { label: (ctx) => `  ${ctx.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
        y: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 12, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
      },
    },
  };
}

// ─── 12. Category Spending Trends (multi-line) ───────────────────────────────
export function getCategoryTrendConfig(d: {
  months: string[];
  series: { name: string; color: string; data: number[] }[];
}): { data: ChartData<"line">; options: ChartOptions<"line"> } {
  return {
    data: {
      labels: d.months,
      datasets: d.series.map((s) => ({
        label: s.name,
        data: s.data,
        borderColor: s.color,
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 7,
        pointBackgroundColor: s.color,
        pointBorderColor: "transparent",
        borderWidth: 2.5,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: true, labels: { ...LEG_LABELS, padding: 12 } },
        tooltip: {
          ...TT,
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
      },
    },
  };
}

// ─── 13. Month-over-Month Comparison Bar ──────────────────────────────────────
export function getMonthOverMonthConfig(d: {
  categories: string[];
  thisMonth: number[];
  lastMonth: number[];
  thisMonthLabel: string;
  lastMonthLabel: string;
}): { data: ChartData<"bar">; options: ChartOptions<"bar"> } {
  return {
    data: {
      labels: d.categories,
      datasets: [
        {
          label: d.thisMonthLabel,
          data: d.thisMonth,
          backgroundColor: vGrad("#a5b4fc", "#4338ca"),
          hoverBackgroundColor: "#a5b4fc",
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: d.lastMonthLabel,
          data: d.lastMonth,
          backgroundColor: "rgba(100,116,139,0.4)",
          hoverBackgroundColor: "rgba(100,116,139,0.65)",
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: true, labels: LEG_LABELS },
        tooltip: {
          ...TT,
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
      },
    },
  };
}

// ─── 14. Income Sources Stacked Bar ──────────────────────────────────────────
export function getIncomeSourcesConfig(d: {
  months: string[];
  series: { name: string; color: string; data: number[] }[];
}): { data: ChartData<"bar">; options: ChartOptions<"bar"> } {
  return {
    data: {
      labels: d.months,
      datasets: d.series.map((s) => ({
        label: s.name,
        data: s.data,
        backgroundColor: s.color,
        hoverBackgroundColor: s.color + "cc",
        borderRadius: 4,
        borderSkipped: false,
        stack: "income",
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: true, labels: { ...LEG_LABELS, padding: 12 } },
        tooltip: {
          ...TT,
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          stacked: true,
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
      },
    },
  };
}

// ─── 15. Cash vs UPI Monthly Trend Stacked Bar ───────────────────────────────
export function getCashUpiTrendConfig(d: {
  months: string[];
  cash: number[];
  upi: number[];
}): { data: ChartData<"bar">; options: ChartOptions<"bar"> } {
  return {
    data: {
      labels: d.months,
      datasets: [
        {
          label: "Cash",
          data: d.cash,
          backgroundColor: vGrad("#fde68a", "#d97706"),
          hoverBackgroundColor: "#fde68a",
          borderRadius: 4,
          borderSkipped: false,
          stack: "payment",
        },
        {
          label: "UPI",
          data: d.upi,
          backgroundColor: vGrad("#a5b4fc", "#4338ca"),
          hoverBackgroundColor: "#a5b4fc",
          borderRadius: 4,
          borderSkipped: false,
          stack: "payment",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: true, labels: LEG_LABELS },
        tooltip: {
          ...TT,
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          stacked: true,
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
      },
    },
  };
}

// ─── 16. Week-of-Month Spending Bar ──────────────────────────────────────────
export function getWeekOfMonthConfig(d: {
  weeks: string[];
  data: number[];
}): { data: ChartData<"bar">; options: ChartOptions<"bar"> } {
  const WEEK_TOPS = ["#a5b4fc","#67e8f9","#fb923c","#d8b4fe"];
  const WEEK_BOTS = ["#4338ca","#0e7490","#c2410c","#7e22ce"];
  const WEEK_HOVER = ["#c7d2fe","#a5f3fc","#fdba74","#e9d5ff"];
  return {
    data: {
      labels: d.weeks,
      datasets: [{
        label: "Spent",
        data: d.data,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        backgroundColor: (ctx: any) => {
          const { chart, dataIndex } = ctx;
          const { ctx: c, chartArea } = chart;
          const i = dataIndex % 4;
          if (!chartArea) return WEEK_TOPS[i];
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, WEEK_TOPS[i]);
          g.addColorStop(1, WEEK_BOTS[i]);
          return g;
        },
        hoverBackgroundColor: d.data.map((_, i) => WEEK_HOVER[i % 4]),
        borderRadius: 8,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TT,
          callbacks: { label: (ctx) => `  Spent: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 12, weight: 700 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
      },
    },
  };
}

// ─── 17. Rolling 30-Day Expense Line ─────────────────────────────────────────
export function getRolling30DayConfig(d: {
  labels: string[];
  values: number[];
}): { data: ChartData<"line">; options: ChartOptions<"line"> } {
  return {
    data: {
      labels: d.labels,
      datasets: [{
        label: "Daily Expense",
        data: d.values,
        borderColor: "#fb7185",
        backgroundColor: areaGrad("#f43f5e", 0.3),
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#fb7185",
        borderWidth: 2.5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TT,
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  Spent: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#94a3b8",
            font: { family: FONT, size: 10, weight: 600 },
            maxTicksLimit: 8,
          },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
      },
    },
  };
}

// ─── 19. Income vs Expense Line (full year) ──────────────────────────────────
export function getIncomeExpenseLineConfig(d: {
  categories: string[];
  inflow: (number | null)[];
  expense: (number | null)[];
}): { data: ChartData<"line">; options: ChartOptions<"line"> } {
  return {
    data: {
      labels: d.categories,
      datasets: [
        {
          label: "Income",
          data: d.inflow,
          borderColor: "#4ade80",
          backgroundColor: areaGrad("#22c55e", 0.25),
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 2.5,
          spanGaps: false,
        },
        {
          label: "Expenses",
          data: d.expense,
          borderColor: "#fb7185",
          backgroundColor: areaGrad("#f43f5e", 0.2),
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 2.5,
          spanGaps: false,
        },
        {
          label: "Savings",
          data: d.inflow.map((v, i) =>
            v === null || d.expense[i] === null ? null : v - (d.expense[i] as number)
          ),
          borderColor: "#a5b4fc",
          backgroundColor: "transparent",
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 2,
          borderDash: [5, 4],
          spanGaps: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: true, labels: LEG_LABELS },
        tooltip: {
          ...TT,
          mode: "index",
          intersect: false,
          callbacks: {
            label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}`,
            afterBody: (items) => {
              const inc = items.find((i) => i.dataset.label === "Income")?.raw as number ?? 0;
              const exp = items.find((i) => i.dataset.label === "Expenses")?.raw as number ?? 0;
              const net = inc - exp;
              return [`  Net: ${net >= 0 ? "+" : ""}${fmtK(net)}`];
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
      },
    },
  };
}

// ─── 18. Average Transaction Size Line ───────────────────────────────────────
export function getAvgTxnSizeConfig(d: {
  months: string[];
  avgExpense: number[];
  avgIncome: number[];
}): { data: ChartData<"line">; options: ChartOptions<"line"> } {
  return {
    data: {
      labels: d.months,
      datasets: [
        {
          label: "Avg Expense",
          data: d.avgExpense,
          borderColor: "#fb7185",
          backgroundColor: areaGrad("#f43f5e", 0.2),
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointBackgroundColor: "#fb7185",
          pointBorderColor: "transparent",
          borderWidth: 2.5,
        },
        {
          label: "Avg Income",
          data: d.avgIncome,
          borderColor: "#4ade80",
          backgroundColor: areaGrad("#22c55e", 0.2),
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointBackgroundColor: "#4ade80",
          pointBorderColor: "transparent",
          borderWidth: 2.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800 },
      plugins: {
        legend: { display: true, labels: LEG_LABELS },
        tooltip: {
          ...TT,
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: "#94a3b8", font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: "rgba(30,41,59,0.8)" },
          border: { display: false },
        },
      },
    },
  };
}
