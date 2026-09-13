import Chart from "react-apexcharts";
import { CHART_INK, baseChartOptions } from "./chartTheme";

export const YearlyTrendChart = ({ yearly }) => {
  if (yearly.length === 0) {
    return <div className="flex justify-center items-center min-h-[200px] text-zinc-500">No data.</div>;
  }

  const base = baseChartOptions();
  const options = {
    ...base,
    chart: { ...base.chart, type: "bar" },
    plotOptions: { bar: { columnWidth: "45%", borderRadius: 4 } },
    xaxis: { ...base.xaxis, categories: yearly.map((y) => String(y.year)) },
    yaxis: { ...base.yaxis, min: 0, forceNiceScale: true, tickAmount: 4 },
    colors: [CHART_INK.primary],
    legend: { show: false },
    tooltip: { ...base.tooltip, y: { formatter: (value) => `${value} books` } },
  };
  const series = [{ name: "Books read", data: yearly.map((y) => y.total) }];

  return <Chart options={options} series={series} type="bar" height={190} width="100%" />;
};
