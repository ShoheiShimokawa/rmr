import { useContext } from "react";
import UserContext from "./UserProvider";
import { useState, useEffect, useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";

import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import { BookInfo } from "./book/BookInfo";

export const MemoDetail = ({ memo }) => {
  return (
    <div>
      {memo && (
        <div>
          {memo.labelingMemo.map((group, j) => (
            <Box key={j} sx={{ mb: 2, pl: 1 }}>
              {group.label?.label && (
                <Chip label={group.label.label} size="small" className="mb-1" />
              )}
              {group.memos.map((memo) => (
                <div key={memo.memoId}>
                  <div className="text-sm "> {memo.memo}</div>
                  <div className="text-sm text-gray-500 italic mb-2">
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
              // onClick={handleOpen}
              sx={{
                textTransform: "none",
                backgroundColor: "#000",

                color: "#fff",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#333",
                },
              }}
            >
              add
            </Button>
          </div>

          <Typography variant="body2" color="text.secondary">
            <div className="text-xs">
              📚 {memo.reading.book.title}（{memo.reading.book.author}）
            </div>
          </Typography>
        </div>
      )}
      <div></div>
    </div>
  );
};
