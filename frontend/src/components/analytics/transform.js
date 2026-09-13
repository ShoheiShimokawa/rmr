// Analytics画面のチャート用データ整形(純関数)。
import { toLargeGenre } from "../../util";
import { GENRE_COLORS, OTHER_GENRE_COLOR } from "./chartTheme";

/** "Other"に畳み込まれたジャンルバケットを示す内部キー */
export const OTHER_KEY = "__OTHER__";

/**
 * ジャンル別件数を上位maxSlices件+"Other"に畳み込む。
 * OTHER/UNKNOWNは常にOtherへ、上位からあふれた分もOtherへ合算する。
 * 戻り値は件数降順(Otherは常に末尾)。
 */
export const foldGenres = (genres, maxSlices = 7) => {
  const real = [];
  let otherCount = 0;
  for (const g of genres) {
    if (g.largeGenre === "OTHER" || g.largeGenre === "UNKNOWN") {
      otherCount += g.count;
    } else {
      real.push(g);
    }
  }
  real.sort((a, b) => b.count - a.count);
  const keep = real.slice(0, maxSlices);
  const overflow = real.slice(maxSlices);
  otherCount += overflow.reduce((sum, g) => sum + g.count, 0);

  const slices = keep.map((g) => ({
    key: g.largeGenre,
    label: toLargeGenre(g.largeGenre),
    count: g.count,
    color: GENRE_COLORS[g.largeGenre] || OTHER_GENRE_COLOR,
  }));
  if (otherCount > 0) {
    slices.push({ key: OTHER_KEY, label: "Other", count: otherCount, color: OTHER_GENRE_COLOR });
  }
  return slices;
};

const pad2 = (n) => String(n).padStart(2, "0");
const monthKey = (year, month) => `${year}-${pad2(month)}`;

/** 選択("last12" または年)から表示対象の月キー("YYYY-MM")配列を作る。 */
export const monthKeysForSelection = (selection, today = new Date()) => {
  if (selection === "last12") {
    const keys = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      keys.push(monthKey(d.getFullYear(), d.getMonth() + 1));
    }
    return keys;
  }
  const year = Number(selection);
  return Array.from({ length: 12 }, (_, i) => monthKey(year, i + 1));
};

/** 指定した月キーに合わせて、欠けている月をtotal=0で埋める。 */
export const fillMonths = (monthlyPoints, monthKeys) => {
  const byMonth = new Map(monthlyPoints.map((p) => [p.month, p]));
  return monthKeys.map((month) => byMonth.get(month) || { month, total: 0, byLargeGenre: {} });
};

/** yearlyデータから年の選択肢(降順)を作る。 */
export const yearOptions = (yearlyPoints) => [...yearlyPoints].map((y) => y.year).sort((a, b) => b - a);

/** "YYYY-MM" を短い月ラベル(例: "Sep") + 年境界のみ年を添えたラベルにする。 */
export const formatMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short" });
};

/** 今月と先月の読了数を返す(データが無い月は0)。トグルの選択状態には依存しない。 */
export const monthlyDelta = (monthlyPoints, today = new Date()) => {
  const byMonth = new Map(monthlyPoints.map((p) => [p.month, p.total]));
  const currentKey = monthKey(today.getFullYear(), today.getMonth() + 1);
  const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const previousKey = monthKey(prev.getFullYear(), prev.getMonth() + 1);
  return { current: byMonth.get(currentKey) || 0, previous: byMonth.get(previousKey) || 0, month: currentKey };
};

/** 最新年と前年の読了数を返す(年データが無ければnull、前年が無ければ0)。 */
export const yearlyDelta = (yearlyPoints) => {
  if (yearlyPoints.length === 0) return null;
  const sorted = [...yearlyPoints].sort((a, b) => a.year - b.year);
  const latest = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2].total : 0;
  return { current: latest.total, previous, year: latest.year };
};
