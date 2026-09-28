import { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

/**
 * 引用の編集・コピー・削除をまとめた「…」メニュー。HighlightCard/HighlightRowで共有する。
 */
export const HighlightActionsMenu = ({ highlight, onEdit, onDelete, onCopy }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const closeMenu = () => setAnchorEl(null);

  return (
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
  );
};
