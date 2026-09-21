import { Button } from "@mui/material";

/**
 * アプリ共通のモノクロ強調ボタン(登録・送信などの主要アクション用)。
 * light: 黒背景+白文字、dark: 白背景+黒文字(theme.palette.text.primary/background.defaultで自動反転)。
 */
export const PrimaryButton = ({ sx, ...props }) => (
  <Button
    variant="contained"
    sx={{
      textTransform: "none",
      fontWeight: "bold",
      bgcolor: "text.primary",
      color: "background.default",
      "&:hover": {
        bgcolor: "text.primary",
        opacity: 0.85,
      },
      ...sx,
    }}
    {...props}
  />
);
