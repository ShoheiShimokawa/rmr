import { useContext } from "react";
import UserContext from "./UserProvider";
import { CustomDialog } from "../ui/CustomDialog";
import { useState, useEffect, useMemo } from "react";
import { MemoRegister } from "./MemoRegister";
import AddIcon from "@mui/icons-material/Add";

import { Typography, Grid, Chip, Box, Button } from "@mui/material";

export const MemoDetail = ({ memo, updated }) => {
  const [openRegister, setOpenRegister] = useState(false);
  const [selectedReading, setSelectedReading] = useState();
  const handleOpenRegister = () => {
    setOpenRegister(true);
  };

  const handleCloseRegister = () => {
    setOpenRegister(false);
  };

  // useEffect(() => {
  //   find();
  // }, []);

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
            <Box key={j} sx={{ mb: 2, pl: 1 }}>
              {group.label?.label && (
                <Chip label={group.label.label} size="small" className="mb-1" />
              )}
              {group.memos.map((memo) => (
                <div key={memo.memoId}>
                  <div className="text-sm font-soft"> {memo.memo}</div>
                  <div className="text-sm text-gray-500 italic mb-2 font-soft">
                    (page {memo.page ? memo.page : "-"})
                  </div>
                </div>
              ))}
            </Box>
          ))}
          <div className="mb-3">
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenRegister}
              sx={{
                textTransform: "none",
                backgroundColor: "#000",

                color: "#fff",
                fontWeight: "bold",
                fontFamily: "'Nunito sans'",
                "&:hover": {
                  backgroundColor: "#333",
                },
              }}
            >
              add
            </Button>
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
