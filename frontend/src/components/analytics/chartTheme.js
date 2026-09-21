/** 大分類ジャンル → 固定カテゴリ配色(8色, 順不同ではない) */
export const GENRE_COLORS = {
  FICTION: "#d86353", // テラコッタ
  NON_FICTION: "#00a5b0", // インクの青緑
  PROFESSIONAL_TECHNICAL: "#cf6f19", // 真鍮
  ACADEMICS_RESEARCH: "#538ae6", // 紺
  ARTS_CULTURE: "#af8600", // オリーブ/マスタード
  PRACTICAL_HOBBIES: "#9b74d9", // プラム
  EDUCATION_STUDYAIDS: "#55a144", // 深緑(布装丁)
  ENTERTAINMENT: "#cd6199", // バーガンディ
};

/** 分類に収まらないジャンル、および表示上"Other"に畳み込んだ分の色(暖かみのあるグレー) */
export const OTHER_GENRE_COLOR = "#9c8f7c";

/** mode("light"/"dark")別のチャート用インク色 */
export const CHART_INK = {
  light: {
    primary: "#0b0b0b",
    secondary: "#52514e",
    muted: "#898781",
    grid: "#e1e0d9",
  },
  dark: {
    primary: "#ecf9ff",
    secondary: "#c9c7be",
    muted: "#8f8d85",
    grid: "#3a3f47",
  },
};

export const CHART_FONT_FAMILY = "Nunito Sans, Noto Sans JP, sans-serif";

/**
 * ApexChartsの共通オプション。個々のチャートでmergeして使う。
 * ApexChartsは渡されたoptionsのネストしたオブジェクトを直接書き換えるため、
 * チャート間で同じオブジェクトを共有しないよう呼び出しごとに新しいオブジェクトを返す。
 */
export const baseChartOptions = (mode = "light") => {
  const ink = CHART_INK[mode] || CHART_INK.light;
  return {
    chart: {
      fontFamily: CHART_FONT_FAMILY,
      toolbar: { show: false },
      // 初回描画時だけ動かす。データ更新時(MonthlyVolumeChartの期間切替など)まで
      // 毎回再生されると煩わしい上、ApexChartsの再アニメーションはupdateOptions()の
      // 連続呼び出しと競合しやすいため、dynamicAnimationは無効にする。
      animations: {
        enabled: true,
        easing: "easeout",
        speed: 650,
        dynamicAnimation: { enabled: false },
      },
    },
    grid: {
      borderColor: ink.grid,
      strokeDashArray: 0,
    },
    legend: {
      fontFamily: CHART_FONT_FAMILY,
      labels: { colors: ink.secondary },
      markers: { size: 8 },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: mode,
    },
    xaxis: {
      labels: { style: { colors: ink.muted, fontSize: "12px" } },
      axisBorder: { color: ink.grid },
      axisTicks: { color: ink.grid },
    },
    yaxis: {
      labels: { style: { colors: ink.muted, fontSize: "12px" } },
    },
  };
};

/** ジャンルの表示色を返す(未分類はグレー)。 */
export const genreColor = (largeGenre) => GENRE_COLORS[largeGenre] || OTHER_GENRE_COLOR;
