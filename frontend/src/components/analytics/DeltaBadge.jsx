// 前期間との差分バッジ。前期間が0件(データ無し)のときは%が破綻する
// (0→5冊が"+500%"になる等)ため、件数の差分表示に切り替える。
// 増加は淡いミント背景+濃い緑文字の柔らかいピル、増減なし・減少はグレー(中立)。
export const DeltaBadge = ({ current, previous }) => {
  if (current === 0 && previous === 0) return null;

  const diff = current - previous;
  const positive = diff > 0;

  const label = previous > 0 ? `${diff > 0 ? "+" : ""}${Math.round((diff / previous) * 100)}%` : `+${diff}`;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        positive ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-500"
      }`}
    >
      {label}
    </span>
  );
};
