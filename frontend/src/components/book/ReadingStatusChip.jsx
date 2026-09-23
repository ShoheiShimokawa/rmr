import React, { useState } from "react";
import { Chip, Divider, ListItemIcon, Menu, MenuItem } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import { statusTypeStr, judgeIcon } from "../../badge/index";
import { useThemeMode } from "../../hooks/ThemeModeProvider";
import { motion } from "framer-motion";

const STATUSES = ["NONE", "DOING", "DONE"];

// To Read=黄, Reading Now=青, Completed=緑の薄い色。MUIの既定色(warning等)は
// オレンジ寄りで狙った色味と違うため、明示的に指定する。
const STATUS_TINTS = {
  NONE: {
    light: { bg: "#FFF3C4", fg: "#8A6D00" },
    dark: { bg: "rgba(255, 213, 79, 0.22)", fg: "#FFD54F" },
  },
  DOING: {
    light: { bg: "#D6EAFB", fg: "#0B5FA5" },
    dark: { bg: "rgba(66, 165, 245, 0.22)", fg: "#64B5F6" },
  },
  DONE: {
    light: { bg: "#DCF3DE", fg: "#1B7A2E" },
    dark: { bg: "rgba(102, 187, 106, 0.22)", fg: "#81C784" },
  },
};

/**
 * 現在の読書状態をChipで表示し、タップで状態の変更と削除を選べるようにします。
 * valueがnull(まだ読書記録が無い本)のときは、状態の追加だけを促します。
 */
export const ReadingStatusChip = ({
  value,
  onChange,
  onDelete,
  canDelete,
  disabled,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { resolvedMode } = useThemeMode();
  const tint = value ? STATUS_TINTS[value][resolvedMode === "dark" ? "dark" : "light"] : null;

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (status) => {
    handleClose();
    onChange(status);
  };

  return (
    <>
      <motion.div
        key={value ?? "none"}
        initial={{ scale: 0.7, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 450, damping: 15 }}
        whileTap={disabled ? {} : { scale: 0.96 }}
        className="inline-block"
      >
        <Chip
          size="small"
          icon={value ? judgeIcon(value) : undefined}
          label={
            <span className="flex items-center gap-1 font-soft font-bold">
              {value ? statusTypeStr(value) : "Add to my shelf"}
              <ExpandMoreRoundedIcon sx={{ fontSize: 14 }} />
            </span>
          }
          variant={value ? "filled" : "outlined"}
          onClick={handleOpen}
          disabled={disabled}
          sx={{
            cursor: disabled ? "default" : "pointer",
            // App.css のグローバルな`span:hover{text-decoration:underline}`を打ち消す
            "& span:hover": { textDecoration: "none" },
            ...(tint && {
              bgcolor: tint.bg,
              color: tint.fg,
              "& .MuiChip-icon": { color: tint.fg },
            }),
          }}
        />
      </motion.div>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {STATUSES.map((status) => (
          <MenuItem
            key={status}
            selected={value === status}
            onClick={() => handleSelect(status)}
          >
            <ListItemIcon>
              {React.cloneElement(judgeIcon(status), { fontSize: "small" })}
            </ListItemIcon>
            <div className="font-soft">{statusTypeStr(status)}</div>
          </MenuItem>
        ))}
        {canDelete && <Divider />}
        {canDelete && (
          <MenuItem
            onClick={() => {
              handleClose();
              onDelete();
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <div className="font-soft">Remove from my shelf</div>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
