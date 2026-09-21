import Chart from "react-apexcharts";
import { baseChartOptions } from "./chartTheme";
import { foldGenres } from "./transform";
import { useThemeMode } from "../../hooks/ThemeModeProvider";

export const GenrePieChart = ({ genres }) => {
  const { resolvedMode } = useThemeMode();
  const slices = foldGenres(genres);
  const total = slices.reduce((sum, s) => sum + s.count, 0);

  if (total === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px] text-zinc-500 dark:text-zinc-400">
        No data.
      </div>
    );
  }

  const base = baseChartOptions(resolvedMode);
  const options = {
    ...base,
    chart: { ...base.chart, type: "pie" },
    labels: slices.map((s) => s.label),
    colors: slices.map((s) => s.color),
    stroke: {
      show: true,
      width: 2,
      colors: [resolvedMode === "dark" ? "#1d232a" : "#fff"],
    },
    legend: { show: false },
    tooltip: {
      ...base.tooltip,
      y: { formatter: (value) => `${value} books` },
    },
  };
  const series = slices.map((s) => s.count);

  return (
    <div>
      <div className="flex justify-center">
        <Chart options={options} series={series} type="pie" height={200} width={200} />
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        {slices.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span>{s.label}</span>
            <span className="font-semibold text-zinc-800 dark:text-white">{s.count}</span>
            <span className="text-zinc-400">({Math.round((s.count / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};
