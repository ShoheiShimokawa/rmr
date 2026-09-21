import { createTheme } from "@mui/material/styles";

/**
 * mode("light"/"dark")に対応するMUIテーマを生成する。
 * background.default/paperのみアプリ固有の値を指定し、それ以外はMUIの既定パレットに委ねる。
 * dark時の値はDaisyUI組み込み"dark"テーマのbase-300/base-100と一致させている
 * (tailwind.config.jsのdaisyui.themes参照)。
 */
export const getAppTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      // primaryはモノクロ(light: 黒, dark: 白)。ローディング等はこの既定色に委ねる。
      primary: {
        main: mode === "dark" ? "#ffffff" : "#000000",
      },
      background: {
        default: mode === "dark" ? "#15191e" : "#F5F5F5",
        paper: mode === "dark" ? "#1d232a" : "#FFFFFF",
      },
    },
    shape: {
      borderRadius: 8,
    },
  });
