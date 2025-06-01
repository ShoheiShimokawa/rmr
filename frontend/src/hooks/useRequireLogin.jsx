import { useContext, useEffect, useState } from "react";
import UserContext from "../components/UserProvider";
import { CustomDialog } from "../ui/CustomDialog";

import { Login } from "../components/Login";

export const useRequireLogin = () => {
  const { user } = useContext(UserContext);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const isLoggedIn = () => {
    if (!user) {
      setShowLoginDialog(true);
      return false;
    }
    return true;
  };

  const closeLoginDialog = () => setShowLoginDialog(false);

  const LoginDialog = () => (
    <CustomDialog
      open={showLoginDialog}
      title="Login is Required"
      onClose={closeLoginDialog}
      width="400px"
    >
      <Login />
    </CustomDialog>
  );

  return {
    user,
    isLoggedIn,
    LoginDialog,
    showLoginDialog,
    closeLoginDialog,
  };
};
