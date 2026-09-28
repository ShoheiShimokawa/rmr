import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Book } from "../book/Book";
import { HighlightActionsMenu } from "./HighlightActionsMenu";
import { formatCitation, formatQuote } from "./highlightUtils";

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : null);

/**
 * 1件の引用(Quote)を表示するカード。本人には編集・削除・コピーのメニューを出す。
 * showBookは、既に本の情報が別の場所(Record画面・本の詳細)に表示されている
 * 文脈では重複するため、falseで表紙を省略できる。表紙はクリックするとonViewBookを呼ぶ。
 * onUseInReviewを渡すと、この引用をReviewへ挿入するボタンを出す(Record画面のQuotesタブ用)。
 */
export const HighlightCard = ({
  highlight,
  isOwner,
  showBook = true,
  onEdit,
  onDelete,
  onCopy,
  onViewBook,
  onUseInReview,
}) => {
  return (
    <Card sx={{ mb: 1.5 }}>
      <CardContent sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box className="font-soft text-sm" sx={{ borderLeft: 3, borderColor: "divider", pl: 1.5 }}>
            {formatQuote(highlight)}
          </Box>
          {highlight.note && (
            <div className="font-soft text-sm text-zinc-600 dark:text-zinc-300 mt-1">{highlight.note}</div>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            {formatCitation(highlight)}
            {highlight.page ? ` · p.${highlight.page}` : ""}
            {formatDate(highlight.registerDate) ? ` · ${formatDate(highlight.registerDate)}` : ""}
          </Typography>
          {onUseInReview && (
            <Button
              size="small"
              startIcon={<DescriptionOutlinedIcon fontSize="small" />}
              onClick={() => onUseInReview(highlight)}
              sx={{ textTransform: "none", pl: 0, mt: 0.5 }}
            >
              Use in review
            </Button>
          )}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          {isOwner && (
            <HighlightActionsMenu highlight={highlight} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy} />
          )}
          {showBook && (
            <Box sx={{ width: 56 }}>
              <Book
                book={highlight.book}
                width="56px"
                height="80px"
                onClick={() => onViewBook && onViewBook(highlight.book)}
              />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
