import Highcharts from "highcharts";

export const getDonutOptions = (
  inflow: number,
  expense: number
): Highcharts.Options => ({
  chart: {
    type: "pie",
    backgroundColor: "transparent",
    style: {
      color: "#9CA3AF",
    },
  },
  title: {
    text: "Monthly Fund Distribution",
    style: { color: "#9CA3AF" },
  },
  plotOptions: {
    pie: {
      innerSize: "60%",
      dataLabels: {
        format: "<b>{point.name}</b>: ₹{point.y}",
        style: { color: "#9CA3AF" },
      },
    },
  },
  series: [
    {
      type: "pie",
      data: [
        { name: "Inflow", y: inflow, color: "#6366F1" },
        { name: "Expense", y: expense, color: "#F43F5E" },
      ],
    },
  ],
});

export const getPaymentModeOptions = (
  cashAmount: number,
  upiAmount: number
): Highcharts.Options => ({
  chart: {
    type: "pie",
    backgroundColor: "transparent",
    style: {
      color: "#9CA3AF",
    },
  },
  title: {
    text: "Payment Mode Distribution (This Month)",
    style: { color: "#9CA3AF" },
  },
  plotOptions: {
    pie: {
      innerSize: "60%",
      dataLabels: {
        format: "<b>{point.name}</b>: ₹{point.y}",
        style: { color: "#9CA3AF" },
      },
    },
  },
  series: [
    {
      type: "pie",
      data: [
        { name: "Cash", y: cashAmount, color: "#F59E0B" },
        { name: "UPI", y: upiAmount, color: "#10B981" },
      ],
    },
  ],
});


interface SavingsData {
  categories: string[];
  data: number[];
}

export const getMonthlySavingsBarChartOptions = (
  data: SavingsData
): Highcharts.Options => ({
  chart: {
    type: "column",
    backgroundColor: "transparent",
  },
  title: {
    text: "",
    style: {
      color: "#e2e8f0",
    },
  },
  xAxis: {
    categories: data.categories,
    title: {
      text: "Month",
      style: {
        color: "#cbd5e1",
      },
    },
    labels: {
      style: {
        color: "#cbd5e1",
      },
    },
    lineColor: "#475569",
    tickColor: "#475569",
  },
  yAxis: {

    title: {
      text: "Amount (₹) ",
      style: {
        color: "#cbd5e1",
      },
    },
    labels: {
      formatter: function () {
        return "₹ " + this.value;
      },
      style: {
        color: "#cbd5e1",
      },
    },
    gridLineColor: "#334155",
  },
  tooltip: {
    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
    pointFormat:
      '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
      '<td style="padding:0"><b>₹{point.y:.2f}</b></td></tr>',
    footerFormat: "</table>",
    shared: true,
    useHTML: true,
    backgroundColor: "#334155",
    borderColor: "#475569",
    style: {
      color: "#e2e8f0",
    },
  },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
      colorByPoint: false,
    },
    series: {
      dataLabels: {
        enabled: false,
      },
    },
  },
  series: [
    {
      name: "Savings",
      data: data.data.map((value) => ({
        y: value,
        color: value >= 0 ? "#34d399" : "#ef4444", // Green for positive, Red for negative
      })),
      type: "column",
    } as Highcharts.SeriesColumnOptions,
  ],
  credits: {
    enabled: false,
  },
});


export const getBarChartOptions = (dailyBarData: {
  categories: string[];
  inflow: number[];
  expense: number[];
}): Highcharts.Options => ({
  chart: {
    type: "column",
    backgroundColor: "transparent",
    style: {
      color: "#9CA3AF",
    },
  },
  title: {
    text: "Daily Inflow & Expense – This Month",
    style: { color: "#9CA3AF" },
  },
  xAxis: {
    categories: dailyBarData.categories,
    title: {
      text: "Days of Month",
      style: { color: "#9CA3AF", fontWeight: "600" },
    },
    labels: { style: { color: "#9CA3AF", fontWeight: "600" } },
  },
  yAxis: {
    title: { text: "Amount (₹)", style: { color: "#9CA3AF" } },
    labels: { style: { color: "#9CA3AF" } },
  },
  tooltip: {
    shared: true,
    valuePrefix: "₹",
    style: { color: "#9CA3AF" },
  },
  legend: {
    itemStyle: {
      color: "#9CA3AF",
    },
  },
  plotOptions: {
    column: {
      pointPadding: 2.5,
      borderWidth: 0,
      pointWidth: 5,
    },
  },
  series: [
    {
      name: "Inflow",
      data: dailyBarData.inflow,
      type: "column",
      color: "#6366F1",
    },
    {
      name: "Expense",
      data: dailyBarData.expense,
      type: "column",
      color: "#F43F5E",
    },
  ],
});

export const getMonthlyBarChartOptions = (data: {
  categories: string[];
  inflow: number[];
  expense: number[];
}) => ({
  chart: {
    type: "column",
    backgroundColor: "transparent",
  },
  title: {
    text: "Monthly Inflow & Expense – This Year",
    style: { color: "#9CA3AF" },
  },
  xAxis: {
    categories: data.categories,
    crosshair: true,
    labels: {
      style: {
        color: "#fff",
      },
    },
  },
  yAxis: {
    min: 0,
    title: {
      text: "Amount",
      style: {
        color: "#fff",
      },
    },
    labels: {
      style: {
        color: "#fff",
      },
    },
  },
  legend: {
    itemStyle: {
      color: "#fff",
    },
  },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
    },
  },
  series: [
    {
      name: "Inflow",
      data: data.inflow,
      color: "#4ade80", // green
    },
    {
      name: "Expense",
      data: data.expense,
      color: "#f87171", // red
    },
  ],
});


export const getCategoryWiseMonthlyOptions = (
  categoryWiseMonthlyData: {
    categories: string[];
    data: number[];
  }
) => ({
  chart: {
    type: 'column',
    backgroundColor: 'transparent'
  },
  title: {
    text: 'Spending by Category - This Month',
    style: { color: '#ccc' }
  },
  xAxis: {
    categories: categoryWiseMonthlyData.categories,
    labels: { style: { color: '#ccc' } }
  },
  yAxis: {
    min: 0,
    title: {
      text: 'Amount Spent',
      style: { color: '#ccc' }
    },
    labels: { style: { color: '#ccc' } }
  },
  legend: {
    itemStyle: {
      color: '#ccc',
    }
  },
  series: [
    {
      name: 'Expenses',
      data: categoryWiseMonthlyData.data,
      type: 'column',
      color: '#46d212'
    }
  ],
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
    },
  },
});


export const getCategoryWiseMonthlyOptionsDonut = ({
  categories,
  data,
}: {
  categories: string[];
  data: number[];
}): Highcharts.Options => {
  const donutCategoryData = categories.map((category, idx) => ({
    name: category,
    y: data[idx],
  }));

  return {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
    },
    title: {
      text: "Category-wise Monthly Expenses",
      style: {
        color: "#ffffff",
        fontSize: "18px",
      },
    },
    tooltip: {
      pointFormat: "<b>{point.y:.2f}</b> ({point.percentage:.1f}%)",
    },
    plotOptions: {
      pie: {
        innerSize: "60%", // donut look
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: {point.percentage:.1f}%",
          style: {
            color: "#ffffff",
          },
        },
      },
    },
    series: [
      {
        data: donutCategoryData,
        type: "pie",
      },
    ],
    credits: {
      enabled: false,
    },
  };
};


export const getCategoryWiseYearlyOptions = ({
  categories,
  data,
}: {
  categories: string[];
  data: number[];
}): Highcharts.Options => ({
  chart: {
    type: "column",
    backgroundColor: "transparent",
  },
  title: {
    text: "Category-wise Spending – This Year",
    style: {
      color: "#fff", // light text color for dark mode
      fontSize: "18px",
    },
  },
  xAxis: {
    categories: categories,
    title: {
      text: "Categories",
      style: { color: "#ccc" }, // subtle gray text for axis title
    },
    labels: {
      style: { color: "#ccc" }, // gray labels
    },
    gridLineColor: "#444", // subtle grid lines
  },
  yAxis: {
    min: 0,
    title: {
      text: "Amount Spent (₹)",
      style: { color: "#ccc" },
    },
    labels: {
      style: { color: "#ccc" },
    },
    gridLineColor: "#444", // subtle grid lines
  },
  legend: {
    enabled: false,
  },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0,
    },
  },
  series: [
    {
      name: "Expense",
      type: "column",
      data: data,
      color: "#FBBF24", // amber color for columns to contrast against the dark background
    },
  ],
  tooltip: {
    backgroundColor: "#ffffff", // darker tooltip background
    style: {
      color: "#000000", // white text for tooltip
    },
  },
});
