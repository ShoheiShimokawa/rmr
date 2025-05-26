// NotifyProvider.jsx
import { SnackbarProvider, useSnackbar } from "notistack";
import { createContext, useContext } from "react";
import { CustomSnackbar } from "../ui/CustomSnackbar"; // 上記コンポーネント

const NotifyContext = createContext();
export const useNotify = () => useContext(NotifyContext);

const NotifyWrapper = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();

  const notify = (messageText, variant = "info") => {
    enqueueSnackbar("", {
      content: (key, _) => (
        <CustomSnackbar key={key} message={messageText} variant={variant} />
      ),
    });
  };

  return (
    <NotifyContext.Provider value={{ notify }}>
      {children}
    </NotifyContext.Provider>
  );
};

export const NotifyProvider = ({ children }) => (
  <SnackbarProvider
    maxSnack={3}
    autoHideDuration={3000}
    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
  >
    <NotifyWrapper>{children}</NotifyWrapper>
  </SnackbarProvider>
);
