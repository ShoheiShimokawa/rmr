import { Box, Card } from "@mui/material";
import { Book } from "../book/Book";
import { HighlightRow } from "./HighlightRow";

/**
 * 引用(Quote)を本ごとにまとめて表示するグループ。表紙・書名・著者は見出しに1回だけ出し、
 * 各引用はHighlightRowで軽量に並べる(ProfileHighlightsの本ごとグルーピング表示用)。
 * 見出しをクリックするとonViewBookを呼ぶ(表紙クリックと同じ、本の詳細を開く導線)。
 */
export const HighlightGroup = ({ book, highlights, isOwner, onEdit, onDelete, onCopy, onViewBook, onUseInReview }) => (
  <Card sx={{ mb: 1.5, overflow: "hidden" }}>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.5,
        borderBottom: 1,
        borderColor: "divider",
        cursor: onViewBook ? "pointer" : "default",
      }}
      onClick={() => onViewBook && onViewBook(book)}
    >
      <Box sx={{ width: 30, flexShrink: 0 }}>
        <Book book={book} width="30px" height="42px" />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <div className="font-soft text-sm font-bold truncate">{book?.title}</div>
        <div className="font-soft text-xs text-zinc-500 dark:text-zinc-400 truncate">{book?.author}</div>
      </Box>
      <div className="font-soft text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
        {highlights.length}
      </div>
    </Box>
    <Box>
      {highlights.map((highlight, index) => (
        <HighlightRow
          key={highlight.memoId}
          highlight={highlight}
          isOwner={isOwner}
          isFirst={index === 0}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopy={onCopy}
          onUseInReview={onUseInReview}
        />
      ))}
    </Box>
  </Card>
);
