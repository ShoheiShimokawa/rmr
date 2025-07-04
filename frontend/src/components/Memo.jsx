import { getMemos } from "../api/memo";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { CustomDialog } from "../ui/CustomDialog";
import { useState, useEffect, useMemo, useCallback } from "react";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Book } from "./book/Book";
import { useRequireLogin } from "../hooks/useRequireLogin";
import { StepMemoRegister } from "./StepMemoRegister";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { MemoDetail } from "./MemoDetail";

export const Memo = () => {
  const [memos, setMemos] = useState([]);
  const { user } = useContext(UserContext);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [openRegister, setOpenRegister] = useState(false);
  const { isLoggedIn, LoginDialog, showLoginDialog } = useRequireLogin();

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
    if (!isLoggedIn()) return;
    setOpenRegister(true);
  };

  const handleCloseRegister = () => {
    setOpenRegister(false);
  };

  const handleOpenDetail = (index) => {
    if (!isLoggedIn()) return;
    setSelectedMemo(memos[index]);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
  };

  const find = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      const result = await getMemos(user && user.userId);
      setMemos(result.data);
      return result.data;
    } catch (error) {}
  }, [user]);
  useEffect(() => {
    find();
  }, [find]);
  return (
    <div>
      {showLoginDialog && <LoginDialog />}
      <CustomDialog
        open={openDetail}
        title="Highlight"
        width={"700px"}
        onClose={handleCloseDetail}
      >
        <MemoDetail
          memo={selectedMemo && selectedMemo}
          updated={async () => {
            const updatedMemos = await find();
            const updatedGroup = updatedMemos.find(
              (group) =>
                group.reading.readingId === selectedMemo.reading.readingId
            );
            if (updatedGroup) setSelectedMemo(updatedGroup);
          }}
        />
      </CustomDialog>
      <CustomDialog
        open={openRegister}
        title="Add Highlight"
        onClose={handleCloseRegister}
      >
        <StepMemoRegister updated={find} />
      </CustomDialog>

      <div>
        {memos.length >= 1 ? (
          <>
            <div className="mb-2 mt-3 flex justify-end">
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
                New Highlight
              </Button>
            </div>
            {formatted.map((entry, i) => (
              <Card sx={{ mb: 1 }}>
                <CardContent
                  className="cursor-pointer"
                  key={i}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => {
                    handleOpenDetail(i);
                  }}
                >
                  <Box sx={{ flex: 1, pr: 2 }}>
                    <Box
                      sx={{
                        mb: 1,
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      {entry.labels
                        .filter((label) => label?.label)
                        .map((label) => (
                          <Chip
                            key={label.labelId}
                            label={label.label}
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

                    <div className="font-soft text-sm">
                      📝{entry.primaryMemo.memo}
                    </div>

                    {entry.otherCount > 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        other {entry.otherCount} memo
                        {entry.otherCount > 1 ? "s" : ""}
                      </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary">
                      <div className="text-xs">
                        📚 {entry.reading.book.title}（
                        {entry.reading.book.author}）
                      </div>
                    </Typography>
                  </Box>

                  <Box sx={{ minWidth: 100, maxWidth: 120 }}>
                    <Book book={entry.reading.book} />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 2,
              my: 16,
              backgroundColor: "#F5F5F5",
            }}
          >
            <MenuBookIcon sx={{ fontSize: 40, mb: 1 }} />
            <div className="font-soft font-bold text-xl mb-1">
              No highlights yet
            </div>
            <div className="font-soft mt-4">
              <div className="mb-2">Note your favorite phrases here!</div>
            </div>
            <div className="mt-5">
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
                New Highlight
              </Button>
            </div>
          </Paper>
        )}
      </div>
    </div>
  );
};
