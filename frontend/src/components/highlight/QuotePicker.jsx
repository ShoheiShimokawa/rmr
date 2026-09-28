import { useMemo, useState } from "react";
import { Box, Button, Collapse } from "@mui/material";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useMyHighlights } from "../../hooks/useHighlight";
import { filterHighlights } from "./highlightUtils";

/**
 * その本の自分のQuotesから、感想への引用挿入を行う折りたたみセクション。
 * 保存済みのQuotesが無い本では、Quotesタブへの案内だけを出す。
 */
export const QuotePicker = ({ bookId, onInsert }) => {
  const [open, setOpen] = useState(false);
  const { data: myHighlights = [] } = useMyHighlights();
  const bookHighlights = useMemo(
    () => filterHighlights(myHighlights, { bookId }),
    [myHighlights, bookId]
  );

  if (!bookId) {
    return null;
  }

  if (bookHighlights.length === 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 font-soft mt-1 mb-1">
        <FormatQuoteIcon sx={{ fontSize: 14 }} />
        Save a line in Quotes to insert it here.
      </div>
    );
  }

  return (
    <Box sx={{ mt: 1, mb: 1 }}>
      <Button
        size="small"
        startIcon={<FormatQuoteIcon fontSize="small" />}
        endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        onClick={() => setOpen((v) => !v)}
        sx={{ textTransform: "none", pl: 0 }}
      >
        Insert a quote ({bookHighlights.length})
      </Button>
      <Collapse in={open}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
          {bookHighlights.map((highlight) => (
            <Box
              key={highlight.memoId}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: "action.hover",
              }}
            >
              <div className="font-soft text-xs line-clamp-2">{highlight.quote}</div>
              <Button
                size="small"
                onClick={() => onInsert(highlight)}
                sx={{ flexShrink: 0, textTransform: "none" }}
              >
                Insert
              </Button>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};
