import { Box, Button } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { HighlightActionsMenu } from "./HighlightActionsMenu";
import { formatQuote } from "./highlightUtils";

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : null);

/**
 * HighlightGroup内で使う、本の情報を省いた軽量な1行表示。
 * 表紙・書名はグループの見出し側に既に出ているため、ここでは引用・コメント・ページ/日付と
 * 編集系メニューのみを表示する。
 */
export const HighlightRow = ({ highlight, isOwner, isFirst, onEdit, onDelete, onCopy, onUseInReview }) => {
  const meta = [highlight.page ? `p.${highlight.page}` : null, formatDate(highlight.registerDate)]
    .filter(Boolean)
    .join(" · ");

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 1,
        p: 1.5,
        borderTop: isFirst ? 0 : 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box className="font-soft text-sm" sx={{ borderLeft: 2, borderColor: "divider", pl: 1.25 }}>
          {formatQuote(highlight)}
        </Box>
        {highlight.note && (
          <div className="font-soft text-xs text-zinc-600 dark:text-zinc-300 mt-1 pl-[11px]">{highlight.note}</div>
        )}
        {meta && <div className="font-soft text-xs text-zinc-500 dark:text-zinc-400 mt-1 pl-[11px]">{meta}</div>}
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
      {isOwner && (
        <HighlightActionsMenu highlight={highlight} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy} />
      )}
    </Box>
  );
};
