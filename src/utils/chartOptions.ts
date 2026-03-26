import Highcharts from "highcharts";

// ─── Shared dark theme base ───────────────────────────────────────────────────
const darkTheme: Highcharts.Options = {
  chart: {
    backgroundColor: "transparent",
    style: { fontFamily: "'GeistSans', 'Inter', sans-serif" },
    animation: { duration: 800, easing: "easeOutCubic" },
  },
  title: { text: "", style: { color: "#e2e8f0", fontSize: "15px", fontWeight: "700" } },
  subtitle: { style: { color: "#64748b" } },
  xAxis: {
    labels: { style: { color: "#94a3b8", fontSize: "11px", fontWeight: "600" } },
    lineColor: "#1e293b",
    tickColor: "#1e293b",
    gridLineColor: "transparent",
  },
  yAxis: {
    title: { style: { color: "#64748b", fontSize: "11px" } },
    labels: {
      style: { color: "#94a3b8", fontSize: "11px" },
      formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
        const v = Number(this.value);
        if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
        return "₹" + v;
      },
    },
    gridLineColor: "#1e293b",
    gridLineDashStyle: "Dot",
  },
  legend: {
    itemStyle: { color: "#94a3b8", fontWeight: "600", fontSize: "12px" },
    itemHoverStyle: { color: "#e2e8f0" },
    borderRadius: 8,
  },
  tooltip: {
    backgroundColor: "rgba(15,23,42,0.95)",
    borderColor: "#334155",
    borderRadius: 12,
    borderWidth: 1,
    shadow: { color: "rgba(0,0,0,0.4)", width: 10, opacity: 0.3 },
    style: { color: "#e2e8f0", fontSize: "13px" },
    useHTML: true,
  },
  plotOptions: {
    series: {
      animation: { duration: 800 },
    },
  },
  credits: { enabled: false },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function merge(...opts: Highcharts.Options[]): Highcharts.Options {
  return opts.reduce((acc, o) => Highcharts.merge(acc, o), {});
}

// Category hex colors (consistent with CATEGORY_COLORS)
const CAT_HEX: Record<string, string> = {
  Food: "#f97316",
  Outing: "#3b82f6",
  Clothes: "#a855f7",
  Medical: "#ef4444",
  Bills: "#eab308",
  Entertainment: "#ec4899",
  Travel: "#06b6d4",
  SMM: "#10b981",
  Vacation: "#84cc16",
  Others: "#6b7280",
  Other: "#6b7280",
};

function getCatColor(cat: string, idx: number): string {
  return CAT_HEX[cat] || [
    "#6366f1","#ec4899","#f97316","#10b981","#f59e0b","#06b6d4","#a855f7","#ef4444",
  ][idx % 8];
}

// ─── 1. Monthly Fund Distribution Donut ──────────────────────────────────────
export const getDonutOptions = (inflow: number, expense: number): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "pie", height: 320 },
    title: { text: "Income vs Expenses", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    plotOptions: {
      pie: {
        innerSize: "65%",
        borderWidth: 0,
        borderRadius: 6,
        dataLabels: {
          enabled: true,
          format: "<b style='color:{point.color}'>{point.name}</b><br/>₹{point.y:,.0f}",
          style: { color: "#e2e8f0", fontSize: "12px", textOutline: "none" },
          distance: 18,
        },
        states: { hover: { brightness: 0.1 } },
      },
    },
    series: [{
      type: "pie",
      name: "Amount",
      data: [
        {
          name: "Income",
          y: inflow,
          color: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [[0, "#34d399"], [1, "#059669"]],
          } as unknown as string,
        },
        {
          name: "Expenses",
          y: expense,
          color: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [[0, "#f87171"], [1, "#dc2626"]],
          } as unknown as string,
        },
      ],
    }],
    tooltip: {
      ...darkTheme.tooltip,
      pointFormat: '<span style="color:{point.color}">●</span> {series.name}: <b>₹{point.y:,.0f}</b> ({point.percentage:.1f}%)<br/>',
    },
  });

// ─── 2. Cash vs UPI Donut ────────────────────────────────────────────────────
export const getPaymentModeOptions = (cashAmount: number, upiAmount: number): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "pie", height: 300 },
    title: { text: "Payment Mode Split", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    plotOptions: {
      pie: {
        innerSize: "65%",
        borderWidth: 0,
        borderRadius: 6,
        dataLabels: {
          enabled: true,
          format: "<b style='color:{point.color}'>{point.name}</b><br/>₹{point.y:,.0f}",
          style: { color: "#e2e8f0", fontSize: "12px", textOutline: "none" },
          distance: 18,
        },
        states: { hover: { brightness: 0.1 } },
      },
    },
    series: [{
      type: "pie",
      name: "Spent",
      data: [
        {
          name: "Cash",
          y: cashAmount,
          color: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [[0, "#fbbf24"], [1, "#d97706"]],
          } as unknown as string,
        },
        {
          name: "UPI",
          y: upiAmount,
          color: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [[0, "#6366f1"], [1, "#4338ca"]],
          } as unknown as string,
        },
      ],
    }],
    tooltip: {
      ...darkTheme.tooltip,
      pointFormat: '<span style="color:{point.color}">●</span> {point.name}: <b>₹{point.y:,.0f}</b> ({point.percentage:.1f}%)<br/>',
    },
  });

// ─── 3. Daily Bar Chart ───────────────────────────────────────────────────────
export const getBarChartOptions = (dailyBarData: {
  categories: string[];
  inflow: number[];
  expense: number[];
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "column", height: 320 },
    title: { text: "Daily Inflow & Expenses – This Month", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    xAxis: {
      categories: dailyBarData.categories,
      title: { text: "Day", style: { color: "#64748b", fontSize: "11px" } },
      labels: { style: { color: "#94a3b8", fontSize: "10px", fontWeight: "600" } },
      lineColor: "#1e293b",
      tickColor: "#1e293b",
    },
    yAxis: {
      title: { text: "Amount (₹)", style: { color: "#64748b", fontSize: "11px" } },
      labels: {
        style: { color: "#94a3b8", fontSize: "11px" },
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          const v = Number(this.value);
          if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
      gridLineColor: "#1e293b",
      gridLineDashStyle: "Dot",
    },
    plotOptions: {
      column: {
        borderRadius: 4,
        borderWidth: 0,
        pointWidth: 6,
        groupPadding: 0.15,
        states: { hover: { brightness: 0.15 } },
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      headerFormat: '<div style="font-size:12px;font-weight:700;margin-bottom:6px">Day {point.key}</div>',
      pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>₹{point.y:,.0f}</b><br/>',
      shared: true,
    },
    legend: { ...darkTheme.legend, enabled: true },
    series: [
      {
        name: "Income",
        data: dailyBarData.inflow,
        type: "column",
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, "#34d399"], [1, "#059669"]],
        } as unknown as string,
      },
      {
        name: "Expenses",
        data: dailyBarData.expense,
        type: "column",
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, "#f87171"], [1, "#dc2626"]],
        } as unknown as string,
      },
    ],
  });

// ─── 4. Monthly Bar Chart ─────────────────────────────────────────────────────
export const getMonthlyBarChartOptions = (data: {
  categories: string[];
  inflow: number[];
  expense: number[];
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "column", height: 340 },
    title: { text: "Monthly Overview – This Year", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    xAxis: {
      categories: data.categories,
      crosshair: { color: "#334155", width: 1 },
      labels: { style: { color: "#94a3b8", fontSize: "11px", fontWeight: "600" } },
      lineColor: "#1e293b",
      tickColor: "#1e293b",
    },
    yAxis: {
      title: { text: "Amount (₹)", style: { color: "#64748b", fontSize: "11px" } },
      labels: {
        style: { color: "#94a3b8", fontSize: "11px" },
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          const v = Number(this.value);
          if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
      gridLineColor: "#1e293b",
      gridLineDashStyle: "Dot",
    },
    plotOptions: {
      column: {
        borderRadius: 5,
        borderWidth: 0,
        groupPadding: 0.1,
        states: { hover: { brightness: 0.15 } },
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      headerFormat: '<div style="font-size:12px;font-weight:700;margin-bottom:6px">{point.key}</div>',
      pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>₹{point.y:,.0f}</b><br/>',
      shared: true,
    },
    series: [
      {
        name: "Income",
        data: data.inflow,
        type: "column",
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, "#34d399"], [1, "#059669"]],
        } as unknown as string,
      },
      {
        name: "Expenses",
        data: data.expense,
        type: "column",
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, "#f87171"], [1, "#dc2626"]],
        } as unknown as string,
      },
    ],
  });

// ─── 5. Monthly Savings Bar ───────────────────────────────────────────────────
export const getMonthlySavingsBarChartOptions = (data: {
  categories: string[];
  data: number[];
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "column", height: 320 },
    title: { text: "Monthly Net Savings", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    xAxis: {
      categories: data.categories,
      labels: { style: { color: "#94a3b8", fontSize: "11px", fontWeight: "600" } },
      lineColor: "#1e293b",
      tickColor: "#1e293b",
    },
    yAxis: {
      title: { text: "Savings (₹)", style: { color: "#64748b", fontSize: "11px" } },
      labels: {
        style: { color: "#94a3b8", fontSize: "11px" },
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          const v = Number(this.value);
          if (Math.abs(v) >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
      gridLineColor: "#1e293b",
      gridLineDashStyle: "Dot",
      plotLines: [{
        value: 0,
        color: "#475569",
        width: 1,
        dashStyle: "Solid",
      }],
    },
    plotOptions: {
      column: {
        borderRadius: 5,
        borderWidth: 0,
        states: { hover: { brightness: 0.15 } },
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      pointFormatter: function (this: Highcharts.Point) {
        const v = this.y ?? 0;
        const color = v >= 0 ? "#34d399" : "#f87171";
        return `<span style="color:${color}">●</span> Savings: <b style="color:${color}">₹${v.toLocaleString()}</b><br/>`;
      },
    },
    series: [{
      name: "Savings",
      type: "column",
      data: data.data.map((v) => ({
        y: v,
        color: v >= 0
          ? { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, "#34d399"], [1, "#059669"]] }
          : { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, "#f87171"], [1, "#dc2626"]] },
      })),
    } as Highcharts.SeriesColumnOptions],
  });

// ─── 6. Category-wise Monthly Bar ────────────────────────────────────────────
export const getCategoryWiseMonthlyOptions = (data: {
  categories: string[];
  data: number[];
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "bar", height: 340 },
    title: { text: "Spending by Category – This Month", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    xAxis: {
      categories: data.categories,
      labels: { style: { color: "#94a3b8", fontSize: "11px", fontWeight: "600" } },
      lineColor: "#1e293b",
      tickColor: "#1e293b",
    },
    yAxis: {
      title: { text: "Amount (₹)", style: { color: "#64748b", fontSize: "11px" } },
      labels: {
        style: { color: "#94a3b8", fontSize: "11px" },
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          const v = Number(this.value);
          if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
      gridLineColor: "#1e293b",
      gridLineDashStyle: "Dot",
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          style: { color: "#94a3b8", fontSize: "11px", fontWeight: "600", textOutline: "none" },
          formatter: function (this: Highcharts.Point) {
            const v = this.y ?? 0;
            if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
            return "₹" + v;
          },
        },
        states: { hover: { brightness: 0.12 } },
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      pointFormat: '<span style="color:{point.color}">●</span> <b>₹{point.y:,.0f}</b><br/>',
    },
    legend: { enabled: false },
    series: [{
      name: "Spent",
      type: "bar",
      data: data.categories.map((cat, i) => ({
        y: data.data[i],
        color: getCatColor(cat, i),
      })),
    }],
  });

// ─── 7. Category-wise Monthly Donut ──────────────────────────────────────────
export const getCategoryWiseMonthlyOptionsDonut = (data: {
  categories: string[];
  data: number[];
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "pie", height: 360 },
    title: { text: "Category Breakdown – This Month", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    plotOptions: {
      pie: {
        innerSize: "60%",
        borderWidth: 0,
        borderRadius: 5,
        dataLabels: {
          enabled: true,
          format: "<b style='color:{point.color}'>{point.name}</b><br/>{point.percentage:.1f}%",
          style: { color: "#e2e8f0", fontSize: "11px", textOutline: "none" },
          distance: 20,
        },
        states: { hover: { brightness: 0.1 } },
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      pointFormat: '<span style="color:{point.color}">●</span> {point.name}: <b>₹{point.y:,.0f}</b> ({point.percentage:.1f}%)<br/>',
    },
    series: [{
      type: "pie",
      name: "Spent",
      data: data.categories.map((cat, i) => ({
        name: cat,
        y: data.data[i],
        color: getCatColor(cat, i),
      })),
    }],
  });

// ─── 8. Category-wise Yearly Bar ─────────────────────────────────────────────
export const getCategoryWiseYearlyOptions = (data: {
  categories: string[];
  data: number[];
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "bar", height: 340 },
    title: { text: "Category Spending – This Year", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    xAxis: {
      categories: data.categories,
      labels: { style: { color: "#94a3b8", fontSize: "11px", fontWeight: "600" } },
      lineColor: "#1e293b",
      tickColor: "#1e293b",
    },
    yAxis: {
      title: { text: "Amount (₹)", style: { color: "#64748b", fontSize: "11px" } },
      labels: {
        style: { color: "#94a3b8", fontSize: "11px" },
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          const v = Number(this.value);
          if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
      gridLineColor: "#1e293b",
      gridLineDashStyle: "Dot",
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          style: { color: "#94a3b8", fontSize: "11px", fontWeight: "600", textOutline: "none" },
          formatter: function (this: Highcharts.Point) {
            const v = this.y ?? 0;
            if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
            return "₹" + v;
          },
        },
        states: { hover: { brightness: 0.12 } },
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      pointFormat: '<span style="color:{point.color}">●</span> {point.name}: <b>₹{point.y:,.0f}</b><br/>',
    },
    legend: { enabled: false },
    series: [{
      name: "Spent",
      type: "bar",
      data: data.categories.map((cat, i) => ({
        y: data.data[i],
        color: getCatColor(cat, i),
        name: cat,
      })),
    }],
  });

// ─── 9. NEW: Cumulative Spending Line ─────────────────────────────────────────
export const getCumulativeSpendingOptions = (data: {
  categories: string[];
  cumulative: number[];
  daily: number[];
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "area", height: 320 },
    title: { text: "Cumulative Spending – This Month", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    xAxis: {
      categories: data.categories,
      title: { text: "Day", style: { color: "#64748b", fontSize: "11px" } },
      labels: { style: { color: "#94a3b8", fontSize: "10px", fontWeight: "600" } },
      lineColor: "#1e293b",
      tickColor: "#1e293b",
    },
    yAxis: {
      title: { text: "Amount (₹)", style: { color: "#64748b", fontSize: "11px" } },
      labels: {
        style: { color: "#94a3b8", fontSize: "11px" },
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          const v = Number(this.value);
          if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
      gridLineColor: "#1e293b",
      gridLineDashStyle: "Dot",
    },
    plotOptions: {
      area: {
        marker: { enabled: false, states: { hover: { enabled: true, radius: 5 } } },
        lineWidth: 2.5,
        states: { hover: { lineWidth: 3 } },
        fillOpacity: 0.15,
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      headerFormat: '<div style="font-size:12px;font-weight:700;margin-bottom:6px">Day {point.key}</div>',
      pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>₹{point.y:,.0f}</b><br/>',
      shared: true,
    },
    series: [
      {
        name: "Cumulative",
        type: "area",
        data: data.cumulative,
        color: "#f97316",
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, "rgba(249,115,22,0.25)"], [1, "rgba(249,115,22,0.0)"]],
        } as unknown as string,
      },
      {
        name: "Daily",
        type: "area",
        data: data.daily,
        color: "#6366f1",
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, "rgba(99,102,241,0.2)"], [1, "rgba(99,102,241,0.0)"]],
        } as unknown as string,
      },
    ],
  });

// ─── 10. NEW: Day-of-Week Spending Heatmap ───────────────────────────────────
export const getDayOfWeekOptions = (data: {
  labels: string[];
  income: number[];
  expense: number[];
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "column", height: 300 },
    title: { text: "Spending by Day of Week", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    xAxis: {
      categories: data.labels,
      labels: { style: { color: "#94a3b8", fontSize: "11px", fontWeight: "700" } },
      lineColor: "#1e293b",
      tickColor: "#1e293b",
    },
    yAxis: {
      title: { text: "Amount (₹)", style: { color: "#64748b", fontSize: "11px" } },
      labels: {
        style: { color: "#94a3b8", fontSize: "11px" },
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          const v = Number(this.value);
          if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
      gridLineColor: "#1e293b",
      gridLineDashStyle: "Dot",
    },
    plotOptions: {
      column: {
        borderRadius: 6,
        borderWidth: 0,
        groupPadding: 0.1,
        states: { hover: { brightness: 0.15 } },
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      headerFormat: '<div style="font-size:12px;font-weight:700;margin-bottom:6px">{point.key}</div>',
      pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>₹{point.y:,.0f}</b><br/>',
      shared: true,
    },
    series: [
      {
        name: "Income",
        data: data.income,
        type: "column",
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, "#34d399"], [1, "#059669"]],
        } as unknown as string,
      },
      {
        name: "Expenses",
        data: data.expense,
        type: "column",
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, "#f87171"], [1, "#dc2626"]],
        } as unknown as string,
      },
    ],
  });

// ─── 12. NEW: Category Trend Lines (last 12 months, one line per category) ───
export const getCategoryTrendOptions = (data: {
  months: string[];
  series: { name: string; color: string; data: number[] }[];
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "spline", height: 360 },
    title: { text: "Category Spending Trends – Last 12 Months", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    xAxis: {
      categories: data.months,
      labels: { style: { color: "#94a3b8", fontSize: "11px", fontWeight: "600" } },
      lineColor: "#1e293b",
      tickColor: "#1e293b",
    },
    yAxis: {
      title: { text: "Amount (₹)", style: { color: "#64748b", fontSize: "11px" } },
      labels: {
        style: { color: "#94a3b8", fontSize: "11px" },
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          const v = Number(this.value);
          if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
      gridLineColor: "#1e293b",
      gridLineDashStyle: "Dot",
    },
    plotOptions: {
      spline: {
        lineWidth: 2.5,
        marker: { enabled: false, states: { hover: { enabled: true, radius: 5 } } },
        states: { hover: { lineWidth: 3 } },
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      headerFormat: '<div style="font-size:12px;font-weight:700;margin-bottom:6px">{point.key}</div>',
      pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>₹{point.y:,.0f}</b><br/>',
      shared: true,
    },
    legend: { ...darkTheme.legend, enabled: true },
    series: data.series.map((s) => ({
      name: s.name,
      type: "spline" as const,
      data: s.data,
      color: s.color,
    })),
  });

// ─── 13. NEW: Month-over-Month Category Comparison ────────────────────────────
export const getMonthOverMonthOptions = (data: {
  categories: string[];
  thisMonth: number[];
  lastMonth: number[];
  thisMonthLabel: string;
  lastMonthLabel: string;
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "column", height: 340 },
    title: { text: "This Month vs Last Month – By Category", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    xAxis: {
      categories: data.categories,
      labels: { style: { color: "#94a3b8", fontSize: "11px", fontWeight: "600" } },
      lineColor: "#1e293b",
      tickColor: "#1e293b",
    },
    yAxis: {
      title: { text: "Amount (₹)", style: { color: "#64748b", fontSize: "11px" } },
      labels: {
        style: { color: "#94a3b8", fontSize: "11px" },
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          const v = Number(this.value);
          if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
      gridLineColor: "#1e293b",
      gridLineDashStyle: "Dot",
    },
    plotOptions: {
      column: {
        borderRadius: 5,
        borderWidth: 0,
        groupPadding: 0.1,
        states: { hover: { brightness: 0.15 } },
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      headerFormat: '<div style="font-size:12px;font-weight:700;margin-bottom:6px">{point.key}</div>',
      pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>₹{point.y:,.0f}</b><br/>',
      shared: true,
    },
    legend: { ...darkTheme.legend, enabled: true },
    series: [
      {
        name: data.thisMonthLabel,
        type: "column" as const,
        data: data.thisMonth,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, "#818cf8"], [1, "#4338ca"]],
        } as unknown as string,
      },
      {
        name: data.lastMonthLabel,
        type: "column" as const,
        data: data.lastMonth,
        color: "rgba(100,116,139,0.45)",
      },
    ],
  });

// ─── 14. NEW: Income Sources Over Time (stacked by income category) ───────────
export const getIncomeSourcesOptions = (data: {
  months: string[];
  series: { name: string; color: string; data: number[] }[];
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "column", height: 340 },
    title: { text: "Income Sources Over Time", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    xAxis: {
      categories: data.months,
      labels: { style: { color: "#94a3b8", fontSize: "11px", fontWeight: "600" } },
      lineColor: "#1e293b",
      tickColor: "#1e293b",
    },
    yAxis: {
      title: { text: "Amount (₹)", style: { color: "#64748b", fontSize: "11px" } },
      labels: {
        style: { color: "#94a3b8", fontSize: "11px" },
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          const v = Number(this.value);
          if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
      gridLineColor: "#1e293b",
      gridLineDashStyle: "Dot",
      stackLabels: {
        enabled: true,
        style: { color: "#94a3b8", fontSize: "10px", fontWeight: "600", textOutline: "none" },
        formatter: function (this: Highcharts.StackItemObject) {
          const v = this.total ?? 0;
          if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
    },
    plotOptions: {
      column: {
        stacking: "normal",
        borderWidth: 0,
        borderRadius: 4,
        states: { hover: { brightness: 0.12 } },
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      headerFormat: '<div style="font-size:12px;font-weight:700;margin-bottom:6px">{point.key}</div>',
      pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>₹{point.y:,.0f}</b><br/>',
      shared: true,
    },
    legend: { ...darkTheme.legend, enabled: true },
    series: data.series.map((s) => ({
      name: s.name,
      type: "column" as const,
      data: s.data,
      color: s.color,
    })),
  });

// ─── 15. NEW: Cash vs UPI Trend Over Months ───────────────────────────────────
export const getCashUpiTrendOptions = (data: {
  months: string[];
  cash: number[];
  upi: number[];
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "column", height: 320 },
    title: { text: "Cash vs UPI – Monthly Trend", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    xAxis: {
      categories: data.months,
      labels: { style: { color: "#94a3b8", fontSize: "11px", fontWeight: "600" } },
      lineColor: "#1e293b",
      tickColor: "#1e293b",
    },
    yAxis: {
      title: { text: "Amount (₹)", style: { color: "#64748b", fontSize: "11px" } },
      labels: {
        style: { color: "#94a3b8", fontSize: "11px" },
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          const v = Number(this.value);
          if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
      gridLineColor: "#1e293b",
      gridLineDashStyle: "Dot",
      stackLabels: {
        enabled: true,
        style: { color: "#94a3b8", fontSize: "10px", fontWeight: "600", textOutline: "none" },
        formatter: function (this: Highcharts.StackItemObject) {
          const v = this.total ?? 0;
          if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
    },
    plotOptions: {
      column: {
        stacking: "normal",
        borderWidth: 0,
        borderRadius: 4,
        states: { hover: { brightness: 0.12 } },
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      headerFormat: '<div style="font-size:12px;font-weight:700;margin-bottom:6px">{point.key}</div>',
      pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>₹{point.y:,.0f}</b><br/>',
      shared: true,
    },
    legend: { ...darkTheme.legend, enabled: true },
    series: [
      {
        name: "Cash",
        type: "column" as const,
        data: data.cash,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, "#fbbf24"], [1, "#d97706"]],
        } as unknown as string,
      },
      {
        name: "UPI",
        type: "column" as const,
        data: data.upi,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, "#818cf8"], [1, "#4338ca"]],
        } as unknown as string,
      },
    ],
  });

// ─── 16. NEW: Week-of-Month Spending Pattern ──────────────────────────────────
export const getWeekOfMonthOptions = (data: {
  weeks: string[];
  data: number[];
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "column", height: 300 },
    title: { text: "Week-of-Month Spending Pattern", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    xAxis: {
      categories: data.weeks,
      labels: { style: { color: "#94a3b8", fontSize: "12px", fontWeight: "700" } },
      lineColor: "#1e293b",
      tickColor: "#1e293b",
    },
    yAxis: {
      title: { text: "Total Spent (₹)", style: { color: "#64748b", fontSize: "11px" } },
      labels: {
        style: { color: "#94a3b8", fontSize: "11px" },
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          const v = Number(this.value);
          if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
      gridLineColor: "#1e293b",
      gridLineDashStyle: "Dot",
    },
    plotOptions: {
      column: {
        borderRadius: 8,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          style: { color: "#94a3b8", fontSize: "11px", fontWeight: "700", textOutline: "none" },
          formatter: function (this: Highcharts.Point) {
            const v = this.y ?? 0;
            if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
            return "₹" + v;
          },
        },
        states: { hover: { brightness: 0.15 } },
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      pointFormat: '<span style="color:{point.color}">●</span> Spent: <b>₹{point.y:,.0f}</b><br/>',
    },
    legend: { enabled: false },
    series: [{
      name: "Spent",
      type: "column" as const,
      data: data.data.map((v, i) => ({
        y: v,
        color: [
          { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, "#6366f1"], [1, "#4338ca"]] },
          { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, "#06b6d4"], [1, "#0891b2"]] },
          { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, "#f97316"], [1, "#ea580c"]] },
          { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, "#a855f7"], [1, "#9333ea"]] },
        ][i % 4] as unknown as string,
      })),
    } as Highcharts.SeriesColumnOptions],
  });

// ─── 11. NEW: Savings Rate Line Chart ────────────────────────────────────────
export const getSavingsRateOptions = (data: {
  categories: string[];
  rates: number[];
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "spline", height: 300 },
    title: { text: "Monthly Savings Rate (%)", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    xAxis: {
      categories: data.categories,
      labels: { style: { color: "#94a3b8", fontSize: "11px", fontWeight: "600" } },
      lineColor: "#1e293b",
      tickColor: "#1e293b",
    },
    yAxis: {
      title: { text: "Savings Rate (%)", style: { color: "#64748b", fontSize: "11px" } },
      labels: {
        style: { color: "#94a3b8", fontSize: "11px" },
        format: "{value}%",
      },
      gridLineColor: "#1e293b",
      gridLineDashStyle: "Dot",
      plotLines: [{
        value: 0,
        color: "#475569",
        width: 1,
        dashStyle: "Solid",
      }, {
        value: 20,
        color: "#34d39930",
        width: 1,
        dashStyle: "Dash",
        label: { text: "20% target", style: { color: "#34d399", fontSize: "10px" } },
      }],
    },
    plotOptions: {
      spline: {
        lineWidth: 3,
        marker: {
          enabled: true,
          radius: 4,
          symbol: "circle",
          states: { hover: { radius: 6 } },
        },
        zones: [
          { value: 0, color: "#ef4444" },
          { value: 20, color: "#f59e0b" },
          { color: "#34d399" },
        ],
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      pointFormatter: function (this: Highcharts.Point) {
        const v = this.y ?? 0;
        const color = v >= 20 ? "#34d399" : v >= 0 ? "#f59e0b" : "#ef4444";
        return `<span style="color:${color}">●</span> Savings Rate: <b style="color:${color}">${v.toFixed(1)}%</b><br/>`;
      },
    },
    series: [{
      name: "Savings Rate",
      type: "spline",
      data: data.rates,
      color: "#6366f1",
    }],
  });

// ─── 17. NEW: Rolling 30-Day Expense Line ─────────────────────────────────────
export const getRolling30DayOptions = (data: {
  labels: string[];
  values: number[];
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "area", height: 320 },
    title: { text: "Rolling 30-Day Expenses", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    xAxis: {
      categories: data.labels,
      labels: {
        style: { color: "#94a3b8", fontSize: "10px", fontWeight: "600" },
        step: 5,
      },
      lineColor: "#1e293b",
      tickColor: "#1e293b",
    },
    yAxis: {
      title: { text: "Amount (₹)", style: { color: "#64748b", fontSize: "11px" } },
      labels: {
        style: { color: "#94a3b8", fontSize: "11px" },
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          const v = Number(this.value);
          if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
      gridLineColor: "#1e293b",
      gridLineDashStyle: "Dot",
    },
    plotOptions: {
      area: {
        lineWidth: 2.5,
        marker: { enabled: false, states: { hover: { enabled: true, radius: 5 } } },
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, "rgba(239,68,68,0.25)"], [1, "rgba(239,68,68,0.0)"]],
        } as unknown as string,
        states: { hover: { lineWidth: 3 } },
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      pointFormatter: function (this: Highcharts.Point) {
        const v = this.y ?? 0;
        return `<span style="color:#f87171">●</span> Spent: <b>₹${v.toLocaleString()}</b><br/>`;
      },
    },
    series: [{
      name: "Daily Expense",
      type: "area",
      data: data.values,
      color: "#ef4444",
    }],
  });

// ─── 18. NEW: Average Transaction Size Over Time ──────────────────────────────
export const getAvgTxnSizeOptions = (data: {
  months: string[];
  avgExpense: number[];
  avgIncome: number[];
}): Highcharts.Options =>
  merge(darkTheme, {
    chart: { type: "spline", height: 320 },
    title: { text: "Average Transaction Size Over Time", style: { color: "#e2e8f0", fontSize: "14px", fontWeight: "700" } },
    xAxis: {
      categories: data.months,
      labels: { style: { color: "#94a3b8", fontSize: "11px", fontWeight: "600" } },
      lineColor: "#1e293b",
      tickColor: "#1e293b",
    },
    yAxis: {
      title: { text: "Avg Amount (₹)", style: { color: "#64748b", fontSize: "11px" } },
      labels: {
        style: { color: "#94a3b8", fontSize: "11px" },
        formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
          const v = Number(this.value);
          if (v >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
          return "₹" + v;
        },
      },
      gridLineColor: "#1e293b",
      gridLineDashStyle: "Dot",
    },
    plotOptions: {
      spline: {
        lineWidth: 2.5,
        marker: {
          enabled: true,
          radius: 4,
          symbol: "circle",
          states: { hover: { radius: 6 } },
        },
        states: { hover: { lineWidth: 3 } },
      },
    },
    tooltip: {
      ...darkTheme.tooltip,
      headerFormat: '<div style="font-size:12px;font-weight:700;margin-bottom:6px">{point.key}</div>',
      pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>₹{point.y:,.0f}</b><br/>',
      shared: true,
    },
    legend: { ...darkTheme.legend, enabled: true },
    series: [
      {
        name: "Avg Expense",
        type: "spline",
        data: data.avgExpense,
        color: "#f87171",
      },
      {
        name: "Avg Income",
        type: "spline",
        data: data.avgIncome,
        color: "#34d399",
      },
    ],
  });
