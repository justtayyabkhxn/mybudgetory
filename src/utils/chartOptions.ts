// src/utils/chartOptions.ts — Chart.js v4 config builders
import type { ChartData, ChartOptions } from "chart.js";
import { alpha as alphaOf, chartChrome, cssVar } from "./themeColors";

const FONT = "var(--font-bricolage), 'Bricolage Grotesque', sans-serif";

// ─── Colors ───────────────────────────────────────────────────────────────────
// Category marks resolve from the --color-cat-* tokens so the scale flips with
// the theme. Chart.js paints to a canvas and cannot read CSS variables itself,
// so the value is resolved when the config is built.
const CAT_TOKEN: Record<string, string> = {
  Food: "food", Outing: "outing", Clothes: "clothes",
  Medical: "medical", Bills: "bills", Entertainment: "entertainment",
  Travel: "travel", SMM: "smm", Vacation: "vacation",
  Others: "other", Other: "other",
};
const PALETTE_TOKENS = [
  "clothes", "outing", "food", "travel", "bills",
  "medical", "vacation", "smm", "entertainment", "other",
];

export function getCatColor(cat: string, idx: number) {
  const token = CAT_TOKEN[cat] ?? PALETTE_TOKENS[idx % PALETTE_TOKENS.length];
  return cssVar(`--color-cat-${token}`, cssVar("--color-mute"));
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
// Built per call rather than held as constants: the neutrals come from the
// active theme, which can change without a reload.
const TT = () => {
  const c = chartChrome();
  return {
    backgroundColor: c.tooltipBg,
    borderColor: c.tooltipBorder,
    borderWidth: 1,
    titleColor: c.tooltipText,
    bodyColor: c.tooltipText,
    cornerRadius: 12,
    padding: 12,
    titleFont: { family: FONT, size: 13, weight: "bold" as const },
    bodyFont: { family: FONT, size: 12 },
    usePointStyle: true,
    pointStyle: "circle" as const,
    boxWidth: 8,
    boxHeight: 8,
  };
};

const LEG_LABELS = () => ({
  color: chartChrome().label,
  font: { family: FONT, size: 11 },
  usePointStyle: true,
  pointStyle: "circle" as const,
  boxWidth: 6,
  boxHeight: 6,
  padding: 12,
});

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
        backgroundColor: [cssVar("--color-positive"), cssVar("--color-negative")],
        hoverBackgroundColor: [cssVar("--color-primary-neutral"), cssVar("--color-negative-deep")],
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
        legend: { display: true, position: "bottom", labels: LEG_LABELS() },
        tooltip: {
          ...TT(),
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
        backgroundColor: [cssVar("--color-warning"), cssVar("--color-primary")],
        hoverBackgroundColor: [cssVar("--color-warning"), cssVar("--color-primary-pale")],
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
        legend: { display: true, position: "bottom", labels: LEG_LABELS() },
        tooltip: {
          ...TT(),
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
          backgroundColor: vGrad(cssVar("--color-positive"), cssVar("--color-positive-deep")),
          hoverBackgroundColor: cssVar("--color-positive"),
          borderRadius: 5,
          borderSkipped: false,
        },
        {
          label: "Expenses",
          data: d.expense,
          backgroundColor: vGrad(cssVar("--color-negative"), cssVar("--color-negative-deep")),
          hoverBackgroundColor: cssVar("--color-negative"),
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
        legend: { display: true, labels: LEG_LABELS() },
        tooltip: {
          ...TT(),
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 10, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: chartChrome().grid },
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
          borderColor: cssVar("--color-warning-deep"),
          backgroundColor: areaGrad(cssVar("--color-warning-deep"), 0.3),
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: cssVar("--color-warning-deep"),
          borderWidth: 2.5,
          spanGaps: false,
        },
        {
          label: "Daily",
          data: d.daily,
          borderColor: cssVar("--color-ink-deep"),
          backgroundColor: areaGrad(cssVar("--color-primary"), 0.2),
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: cssVar("--color-ink-deep"),
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
        legend: { display: true, labels: LEG_LABELS() },
        tooltip: {
          ...TT(),
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 10, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: chartChrome().grid },
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
          backgroundColor: vGrad(cssVar("--color-positive"), cssVar("--color-positive-deep")),
          hoverBackgroundColor: cssVar("--color-positive"),
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: "Expenses",
          data: d.expense,
          backgroundColor: vGrad(cssVar("--color-negative"), cssVar("--color-negative-deep")),
          hoverBackgroundColor: cssVar("--color-negative"),
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
        legend: { display: true, labels: LEG_LABELS() },
        tooltip: {
          ...TT(),
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: chartChrome().grid },
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
          const [top, bot] = v >= 0
            ? [cssVar("--color-positive"), cssVar("--color-positive-deep")]
            : [cssVar("--color-negative"), cssVar("--color-negative-deep")];
          if (!chartArea) return top;
          const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, top);
          g.addColorStop(1, bot);
          return g;
        },
        hoverBackgroundColor: d.data.map((v) => (v >= 0 ? cssVar("--color-positive") : cssVar("--color-negative"))),
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
          ...TT(),
          callbacks: {
            label: (ctx) => `  Savings: ${fmtK(ctx.raw as number)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: chartChrome().grid },
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
  const GREEN = cssVar("--color-positive");
  const RED = cssVar("--color-negative");
  const pointColors = d.rates.map((r) =>
    r === null ? "transparent" : r >= 0 ? GREEN : RED
  );
  return {
    data: {
      labels: d.categories,
      datasets: [{
        label: "Savings Rate",
        data: d.rates,
        borderColor: GREEN,
        // Each segment takes the colour of the side of zero it ends on
        segment: {
          borderColor: (ctx) =>
            (ctx.p1.parsed.y ?? 0) < 0 || (ctx.p0.parsed.y ?? 0) < 0 ? RED : GREEN,
        },
        // Fill to the zero line, not the axis floor: green where saving, red where overspending
        fill: {
          target: { value: 0 },
          above: "rgba(74,222,128,0.22)",
          below: "rgba(251,113,133,0.22)",
        },
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
          ...TT(),
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
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          // No min — a month that spends more than it earns is a real negative
          // rate and has to be visible below the zero line.
          grace: "10%",
          ticks: { color: chartChrome().tick,
            font: { family: FONT, size: 11 },
            callback: (v) => `${v}%`,
          },
          grid: {
            // Pick out the break-even line from the ordinary gridlines
            color: (ctx) =>
              ctx.tick?.value === 0 ? chartChrome().gridStrong : chartChrome().grid,
            lineWidth: (ctx) => (ctx.tick?.value === 0 ? 1.5 : 1),
          },
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
          backgroundColor: vGrad(cssVar("--color-positive"), cssVar("--color-positive-deep")),
          hoverBackgroundColor: cssVar("--color-positive"),
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: "Expenses",
          data: d.expense,
          backgroundColor: vGrad(cssVar("--color-negative"), cssVar("--color-negative-deep")),
          hoverBackgroundColor: cssVar("--color-negative"),
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
        legend: { display: true, labels: LEG_LABELS() },
        tooltip: {
          ...TT(),
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 12, weight: 700 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: chartChrome().grid },
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
          ...TT(),
          callbacks: { label: (ctx) => `  ${ctx.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: chartChrome().grid },
          border: { display: false },
        },
        y: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 12, weight: 600 } },
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
          ...TT(),
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
          ...TT(),
          callbacks: { label: (ctx) => `  ${ctx.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: chartChrome().grid },
          border: { display: false },
        },
        y: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 12, weight: 600 } },
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
          ...TT(),
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: chartChrome().grid },
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
          backgroundColor: vGrad(cssVar("--color-ink-deep"), cssVar("--color-ink-deep")),
          hoverBackgroundColor: cssVar("--color-ink-deep"),
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: d.lastMonthLabel,
          data: d.lastMonth,
          backgroundColor: alphaOf(cssVar("--color-mute"), 0.4),
          hoverBackgroundColor: alphaOf(cssVar("--color-mute"), 0.65),
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
        legend: { display: true, labels: LEG_LABELS() },
        tooltip: {
          ...TT(),
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: chartChrome().grid },
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
          ...TT(),
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          stacked: true,
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: chartChrome().grid },
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
          backgroundColor: vGrad(cssVar("--color-warning"), cssVar("--color-warning-deep")),
          hoverBackgroundColor: cssVar("--color-warning"),
          borderRadius: 4,
          borderSkipped: false,
          stack: "payment",
        },
        {
          label: "UPI",
          data: d.upi,
          backgroundColor: vGrad(cssVar("--color-ink-deep"), cssVar("--color-ink-deep")),
          hoverBackgroundColor: cssVar("--color-ink-deep"),
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
        legend: { display: true, labels: LEG_LABELS() },
        tooltip: {
          ...TT(),
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          stacked: true,
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: chartChrome().grid },
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
  const WEEK_TOPS = [cssVar("--color-ink-deep"),cssVar("--color-accent-cyan"),cssVar("--color-warning-deep"),cssVar("--color-primary-active")];
  const WEEK_BOTS = [cssVar("--color-ink-deep"),cssVar("--color-cat-outing"),cssVar("--color-warning-content"),cssVar("--color-ink-deep")];
  const WEEK_HOVER = [cssVar("--color-primary-pale"),cssVar("--color-accent-cyan"),cssVar("--color-accent-orange"),cssVar("--color-primary-pale")];
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
          ...TT(),
          callbacks: { label: (ctx) => `  Spent: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 12, weight: 700 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: chartChrome().grid },
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
        borderColor: cssVar("--color-negative"),
        backgroundColor: areaGrad(cssVar("--color-negative"), 0.3),
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: cssVar("--color-negative"),
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
          ...TT(),
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  Spent: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: chartChrome().tick,
            font: { family: FONT, size: 10, weight: 600 },
            maxTicksLimit: 8,
          },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: chartChrome().grid },
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
          borderColor: cssVar("--color-positive"),
          backgroundColor: areaGrad(cssVar("--color-positive"), 0.25),
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
          borderColor: cssVar("--color-negative"),
          backgroundColor: areaGrad(cssVar("--color-negative"), 0.2),
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
          borderColor: cssVar("--color-ink-deep"),
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
        legend: { display: true, labels: LEG_LABELS() },
        tooltip: {
          ...TT(),
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
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: chartChrome().grid },
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
          borderColor: cssVar("--color-negative"),
          backgroundColor: areaGrad(cssVar("--color-negative"), 0.2),
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointBackgroundColor: cssVar("--color-negative"),
          pointBorderColor: "transparent",
          borderWidth: 2.5,
        },
        {
          label: "Avg Income",
          data: d.avgIncome,
          borderColor: cssVar("--color-positive"),
          backgroundColor: areaGrad(cssVar("--color-positive"), 0.2),
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointBackgroundColor: cssVar("--color-positive"),
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
        legend: { display: true, labels: LEG_LABELS() },
        tooltip: {
          ...TT(),
          mode: "index",
          intersect: false,
          callbacks: { label: (ctx) => `  ${ctx.dataset.label}: ${fmtK(ctx.raw as number)}` },
        },
      },
      scales: {
        x: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11, weight: 600 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: chartChrome().tick, font: { family: FONT, size: 11 }, callback: fmtK },
          grid: { color: chartChrome().grid },
          border: { display: false },
        },
      },
    },
  };
}
