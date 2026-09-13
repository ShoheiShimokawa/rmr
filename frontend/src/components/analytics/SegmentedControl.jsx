// daisyUIダッシュボードでよく見る、丸トラックに白いピルが乗る形のセグメントコントロール。
export const SegmentedControl = ({ options, value, onChange }) => (
  <div className="inline-flex items-center gap-0.5 bg-base-200 rounded-full p-1">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
          option.value === value ? "bg-base-100 shadow text-zinc-800" : "text-zinc-500 hover:text-zinc-700"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);
