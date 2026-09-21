import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getAppTheme } from "../theme/appTheme";

// public/index.html のFOUC対策インラインスクリプトと同じキー名にすること
const STORAGE_KEY = "themeMode";

const getSystemPreference = () =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

// Provider外(単体テスト等)でuseThemeMode()が呼ばれてもクラッシュしないよう、
// light固定のフォールバック値をデフォルトとして持たせる。
const ThemeModeContext = createContext({
  mode: "light",
  resolvedMode: "light",
  setMode: () => {},
  toggleMode: () => {},
});
export const useThemeMode = () => useContext(ThemeModeContext);

export const ThemeModeProvider = ({ children }) => {
  // mode: ユーザーが明示的に選んだ値("light"/"dark")。未選択時は"system"としてOS設定に追従する。
  const [mode, setMode] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  });
  const [systemPreference, setSystemPreference] = useState(getSystemPreference);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setSystemPreference(e.matches ? "dark" : "light");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (mode === "system") {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }, [mode]);

  const resolvedMode = mode === "system" ? systemPreference : mode;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedMode === "dark");
    document.documentElement.setAttribute("data-theme", resolvedMode);
  }, [resolvedMode]);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const current = prev === "system" ? getSystemPreference() : prev;
      return current === "dark" ? "light" : "dark";
    });
  }, []);

  const muiTheme = useMemo(() => getAppTheme(resolvedMode), [resolvedMode]);

  const value = { mode, resolvedMode, setMode, toggleMode };

  return (
    <ThemeModeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
};
