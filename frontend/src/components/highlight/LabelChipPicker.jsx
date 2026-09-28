import { useState } from "react";
import { Box, Chip, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { LABEL_MAX } from "./highlightUtils";

/**
 * 既存ラベルのチップ選択と、新規ラベルのインライン追加をまとめたピッカー。
 * 選べるラベルは同時に1つ。選択中のチップを再度押すと選択解除する。
 */
export const LabelChipPicker = ({ labels = [], value, onChange }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onChange(trimmed);
    }
    setDraft("");
    setAdding(false);
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
      {labels.map((label) => (
        <Chip
          key={label.labelId}
          label={label.name}
          size="small"
          color={value === label.name ? "primary" : "default"}
          variant={value === label.name ? "filled" : "outlined"}
          onClick={() => onChange(value === label.name ? "" : label.name)}
        />
      ))}
      {adding ? (
        <TextField
          autoFocus
          size="small"
          variant="standard"
          value={draft}
          placeholder="New label"
          slotProps={{ htmlInput: { maxLength: LABEL_MAX } }}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitDraft();
            }
            if (event.key === "Escape") {
              setDraft("");
              setAdding(false);
            }
          }}
          sx={{ width: 120 }}
        />
      ) : (
        <Chip
          icon={<AddIcon fontSize="small" />}
          label="New label"
          size="small"
          variant="outlined"
          onClick={() => setAdding(true)}
        />
      )}
    </Box>
  );
};
