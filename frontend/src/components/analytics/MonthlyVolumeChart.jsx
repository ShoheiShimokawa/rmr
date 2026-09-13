import { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { toLargeGenre } from "../../util";
import { CHART_INK, baseChartOptions } from "./chartTheme";
import { fillMonths, formatMonthLabel, monthKeysForSelection, yearOptions } from "./transform";
import { SegmentedControl } from "./SegmentedControl";

const RENDER_DEBOUNCE_MS = 200;

const formatMonthTitle = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const formatBreakdown = (point) =>
  Object.entries(point.byLargeGenre || {})
    .sort((a, b) => b[1] - a[1])
    .map(([genre, count]) => `${toLargeGenre(genre)}: ${count}`)
    .join(", ");

export const MonthlyVolumeChart = ({ monthly, yearly }) => {
  const years = useMemo(() => yearOptions(yearly), [yearly]);
  const [selection, setSelection] = useState("last12");
  // ボタンのハイライトはselectionで即時反映するが、ApexCharts側に渡す実際の
  // データはrenderSelectionとして少し遅らせて反映する(下のuseEffect参照)。
  const [renderSelection, setRenderSelection] = useState(selection);

  useEffect(() => {
    // ApexChartsはupdateOptions()が短い間隔で連続すると、内部のSVG更新が
    // 追いつかずpathが重複したり軸ラベルが消えたりすることがある。
    // 選択が落ち着いてから最後の1回だけチャートに反映することでこれを避ける。
    const timer = setTimeout(() => setRenderSelection(selection), RENDER_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [selection]);

  const monthKeys = useMemo(() => monthKeysForSelection(renderSelection), [renderSelection]);
  const points = useMemo(() => fillMonths(monthly, monthKeys), [monthly, monthKeys]);
  const hasData = points.some((p) => p.total > 0);

  const options = useMemo(() => {
    const base = baseChartOptions();
    return {
      ...base,
      chart: {
        ...base.chart,
        type: "line",
        dropShadow: { enabled: true, top: 6, left: 0, blur: 4, opacity: 0.15, color: CHART_INK.primary },
      },
      stroke: { curve: "smooth", width: 3 },
      markers: { size: 0, hover: { size: 5 } },
      grid: { ...base.grid, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
      xaxis: {
        ...base.xaxis,
        categories: points.map((p) => formatMonthLabel(p.month)),
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { show: false },
      colors: [CHART_INK.primary],
      legend: { show: false },
      // ApexChartsに生HTMLを直接DOM操作させるtooltip.customは、React側の
      // 再描画と競合してDOM例外を起こすことがあるため使わない。
      // 標準のformatter(文字列を返すだけ)経由でタイトル・内訳を表示する。
      tooltip: {
        x: { formatter: (_value, opts) => formatMonthTitle(points[opts.dataPointIndex].month) },
        y: {
          formatter: (value) => `${value} books`,
          title: {
            formatter: (_seriesName, opts) => {
              const breakdown = formatBreakdown(points[opts.dataPointIndex]);
              return breakdown ? `Total (${breakdown})` : "Total";
            },
          },
        },
      },
    };
  }, [points]);
  const series = useMemo(() => [{ name: "Books read", data: points.map((p) => p.total) }], [points]);

  return (
    <div>
      <div className="flex justify-end mb-2 overflow-x-auto">
        <SegmentedControl
          options={[
            { label: "Last 12 months", value: "last12" },
            ...years.map((year) => ({ label: String(year), value: year })),
          ]}
          value={selection}
          onChange={setSelection}
        />
      </div>
      {/* データの有無でChartコンポーネント自体をアンマウントしない。
          切り替えのたびにApexChartsインスタンスを破棄・再生成すると、
          内部の非同期クリーンアップとReactの再描画が競合してDOM例外を
          起こすことがあるため、常時マウントしたままオーバーレイで隠す。 */}
      <div className="relative min-h-[200px]">
        <Chart options={options} series={series} type="line" height={220} width="100%" />
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 bg-base-200">
            No data.
          </div>
        )}
      </div>
    </div>
  );
};
