import Chart from "react-apexcharts";
import { CHART_INK, baseChartOptions } from "./chartTheme";
import { useThemeMode } from "../../hooks/ThemeModeProvider";

export const TopAuthorsChart = ({ topAuthors }) => {
  const { resolvedMode } = useThemeMode();
  if (topAuthors.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[160px] text-zinc-500 dark:text-zinc-400">
        No data.
      </div>
    );
  }

  // ApexChartsの横棒はcategories配列の先頭を上に描画するため、
  // 件数の多い順(topAuthorsはbackendで降順ソート済み)のまま渡す。
  const ordered = topAuthors;

  const base = baseChartOptions(resolvedMode);
  const ink = CHART_INK[resolvedMode] || CHART_INK.light;
  const options = {
    ...base,
    chart: { ...base.chart, type: "bar" },
    plotOptions: { bar: { horizontal: true, barHeight: "55%", borderRadiusApplication: "end", borderRadius: 4 } },
    xaxis: { ...base.xaxis, categories: ordered.map((a) => a.author), min: 0, forceNiceScale: true },
    yaxis: { labels: { style: { colors: ink.secondary, fontSize: "12px" } } },
    colors: [ink.primary],
    legend: { show: false },
    tooltip: { ...base.tooltip, y: { formatter: (value) => `${value} books` } },
  };
  const series = [{ name: "Books read", data: ordered.map((a) => a.count) }];
  const height = Math.max(140, ordered.length * 36);

  return <Chart options={options} series={series} type="bar" height={height} width="100%" />;
};
