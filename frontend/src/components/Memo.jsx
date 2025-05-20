import { getMemos } from "../api/memo";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { useState, useEffect, useMemo } from "react";
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
import AddIcon from "@mui/icons-material/Add";
import { MemoDetail } from "./MemoDetail";
import { MemoRegister } from "./MemoRegister";

export const Memo = () => {
  const [memos, setMemos] = useState([]);
  const { user } = useContext(UserContext);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [openRegister, setOpenRegister] = useState(false);

  const formatted = useMemo(() => {
    return memos.map((item) => {
      const allMemos = item.labelingMemo.flatMap((group) =>
        group.memos.map((memo) => ({
          ...memo,
          label: group.label,
        }))
      );

      const sortedMemos = allMemos.sort(
        (a, b) => new Date(a.registerDate) - new Date(b.registerDate)
      );

      const primaryMemo = sortedMemos[0];
      const otherCount = sortedMemos.length - 1;
      const uniqueLabels = [
        ...new Map(allMemos.map((m) => [m.label.labelId, m.label])).values(),
      ];

      return {
        reading: item.reading,
        labels: uniqueLabels,
        primaryMemo,
        otherCount,
      };
    });
  }, [memos]);

  const handleOpenRegister = () => {
    setOpenRegister(true);
  };

  const handleCloseRegister = () => {
    setOpenRegister(false);
  };

  const handleOpenDetail = (index) => {
    setSelectedMemo(memos[index]);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
  };

  const find = async () => {
    const result = await getMemos(user && user.userId);
    setMemos(result.data);
    console.log(result.data);
  };
  useEffect(() => {
    find();
  }, []);
  return (
    <div>
      <Dialog
        open={openDetail}
        sx={{
          "& .MuiDialog-paper": {
            width: "650px",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>Highlights</DialogTitle>
        <DialogContent>
          <MemoDetail memo={selectedMemo && selectedMemo} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openRegister}
        sx={{
          "& .MuiDialog-paper": {
            width: "650px",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>Add Highlight</DialogTitle>
        <DialogContent>
          <MemoRegister />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRegister}>Cancel</Button>
        </DialogActions>
      </Dialog>
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
          "&:hover": {
            backgroundColor: "#333",
          },
        }}
      >
        add Highlight
      </Button>
      <div>
        {memos.length >= 1 && (
          <>
            {formatted.map((entry, i) => (
              <Box
                className="cursor-pointer"
                key={i}
                sx={{
                  mb: 1,
                  p: 2,
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  "&:hover": {
                    filter: "brightness(0.8)",
                  },
                }}
                onClick={() => {
                  handleOpenDetail(i);
                }}
              >
                {/* ラベル表示 */}
                <Box sx={{ mb: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {entry.labels.map((label) => (
                    <Chip
                      key={label.labelId}
                      label={label.name}
                      variant="outlined"
                      size="small"
                      sx={{
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "none",
                        },
                      }}
                    />
                  ))}
                </Box>

                {/* メインメモ */}
                <div className="text-sm">📝 {entry.primaryMemo.memo}</div>

                {/* その他メモ数 */}
                {entry.otherCount > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    🗒️ other {entry.otherCount} memo
                    {entry.otherCount > 1 ? "s" : ""}
                  </Typography>
                )}

                {/* 本の情報 */}
                <Typography variant="body2" color="text.secondary">
                  📚 {entry.reading.book.title}（{entry.reading.book.author}）
                </Typography>
              </Box>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
