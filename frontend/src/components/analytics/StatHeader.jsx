// "Total Revenue $45,864 +10%"のような、ミニマルなラベル+大きい数値+差分バッジの見出し。
export const StatHeader = ({ label, value, unit, delta }) => (
  <div className="mb-3">
    <div className="text-sm text-zinc-400">{label}</div>
    <div className="flex items-baseline gap-2 mt-1">
      <div className="text-3xl font-extrabold text-zinc-600 dark:text-white">
        {value}
        {unit && <span className="text-base font-normal text-zinc-400 ml-1">{unit}</span>}
      </div>
      {delta}
    </div>
  </div>
);
