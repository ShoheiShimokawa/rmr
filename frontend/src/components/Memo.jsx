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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export const Memo = () => {
  const [memos, setMemos] = useState([]);
  const { user } = useContext(UserContext);

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
      <Button
        variant="outline"
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
        add Highlight
      </Button>
      <div>
        {memos.length >= 1 && (
          <>
            {formatted.map((entry, i) => (
              <Box
                key={i}
                sx={{ mb: 1, p: 2, border: "1px solid #ccc", borderRadius: 2 }}
              >
                {/* ラベル表示 */}
                <Box sx={{ mb: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {entry.labels.map((label) => (
                    <Chip
                      key={label.labelId}
                      label={label.name}
                      variant="outlined"
                      size="small"
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
                    🧾 other {entry.otherCount} memo
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
