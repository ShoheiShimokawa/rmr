import { Skeleton } from "@mui/material";
import { Book } from "./Book";

const SKELETON_COUNT = 6;

/**
 * 見出し付きの横スクロール本棚。itemsは{key, book, caption, footer}の配列。
 * loading中はSkeletonを表示し、空のときはemptyTextが無ければ何も描画しない。
 * カードの見た目(背景・枠)は持たず、呼び出し元が1枚のカードにまとめる前提。
 */
export const BookRow = ({ title, items = [], loading, emptyText, onSelect }) => {
  if (!loading && items.length === 0 && !emptyText) {
    return null;
  }

  return (
    <div>
      <div className="font-soft font-bold mb-3">{title}</div>
      {loading ? (
        <div className="flex overflow-x-auto gap-4">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[88px] space-y-1">
              <Skeleton variant="rounded" width={80} height={120} />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="60%" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="font-soft text-sm text-zinc-500 dark:text-zinc-400">{emptyText}</div>
      ) : (
        <div className="flex overflow-x-auto gap-4 pb-1">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex-shrink-0 w-[88px] cursor-pointer"
              onClick={() => onSelect && onSelect(item.book)}
            >
              <Book book={item.book} width="80px" height="120px" />
              <div className="mt-1 text-xs font-soft line-clamp-2">{item.book?.title}</div>
              {item.caption && (
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{item.caption}</div>
              )}
              {item.footer}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
