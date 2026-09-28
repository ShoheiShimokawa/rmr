import { useState } from "react";
import { Box, Card, CardContent, Chip, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Book } from "../book/Book";
import { formatCitation } from "./highlightUtils";

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : null);

/** 1件のハイライトを表示するカード。本人には編集・削除・コピーのメニューを出す。 */
export const HighlightCard = ({ highlight, isOwner, onEdit, onDelete, onCopy }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const closeMenu = () => setAnchorEl(null);

  return (
    <Card sx={{ mb: 1.5 }}>
      <CardContent sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {highlight.label && <Chip label={highlight.label.name} size="small" sx={{ mb: 1 }} />}
          <Box
            className="font-soft text-sm"
            sx={{ borderLeft: 3, borderColor: "divider", pl: 1.5, fontStyle: "italic" }}
          >
            “{highlight.quote}”
          </Box>
          {highlight.note && (
            <div className="font-soft text-sm text-zinc-600 dark:text-zinc-300 mt-1">{highlight.note}</div>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            {formatCitation(highlight)}
            {highlight.page ? ` · p.${highlight.page}` : ""}
            {formatDate(highlight.registerDate) ? ` · ${formatDate(highlight.registerDate)}` : ""}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 56 }}>
            <Book book={highlight.book} width="56px" height="80px" />
          </Box>
          {isOwner && (
            <>
              <IconButton size="small" onClick={(event) => setAnchorEl(event.currentTarget)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}>
                <MenuItem
                  onClick={() => {
                    closeMenu();
                    onEdit && onEdit(highlight);
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    closeMenu();
                    onCopy && onCopy(highlight);
                  }}
                >
                  Copy text
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    closeMenu();
                    onDelete && onDelete(highlight);
                  }}
                >
                  Delete
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
