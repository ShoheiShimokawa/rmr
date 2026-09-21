import { CustomDialog } from "../ui/CustomDialog";
import { useState } from "react";
import { MemoRegister } from "./MemoRegister";
import AddIcon from "@mui/icons-material/Add";

import { Typography, Chip, Box } from "@mui/material";
import { PrimaryButton } from "../ui/PrimaryButton";

export const MemoDetail = ({ memo, updated }) => {
  const [openRegister, setOpenRegister] = useState(false);
  const handleOpenRegister = () => {
    setOpenRegister(true);
  };

  const handleCloseRegister = () => {
    setOpenRegister(false);
  };

  return (
    <div>
      <CustomDialog
        open={openRegister}
        title="Add Highlight"
        onClose={handleCloseRegister}
      >
        <MemoRegister reading={memo.reading} updated={() => updated()} />
      </CustomDialog>
      {memo && (
        <div>
          {memo.labelingMemo.map((group, j) => (
            <Box
              key={j}
              sx={{
                mb: 2,
                pl: 1,
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "none",
                },
              }}
            >
              {group.label?.label && (
                <Chip
                  label={group.label.label}
                  size="small"
                  className="mb-1"
                  sx={{
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "none",
                    },
                  }}
                />
              )}
              {group.memos.map((memo) => (
                <div key={memo.memoId}>
                  <div className="text-sm font-soft"> {memo.memo}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic mb-2 font-soft">
                    (page {memo.page ? memo.page : "-"})
                  </div>
                </div>
              ))}
            </Box>
          ))}
          <div className="mb-3">
            <PrimaryButton
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenRegister}
              sx={{ fontFamily: "'Nunito sans'" }}
            >
              add
            </PrimaryButton>
          </div>

          <Typography variant="body2" color="text.secondary">
            <div className="text-xs font-soft">
              📚 {memo.reading.book.title}（{memo.reading.book.author}）
            </div>
          </Typography>
        </div>
      )}
      <div></div>
    </div>
  );
};
