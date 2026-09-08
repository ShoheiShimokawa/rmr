import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import UserContext from "./UserProvider";
import { HandleRegister } from "./HandleRegister";
import { useContext, useState } from "react";
import { useNotify } from "../hooks/NotifyProvider";
import { useTranslation } from "react-i18next";
import { CustomDialog } from "../ui/CustomDialog";
import { login } from "../api/auth";
export const Login = ({ updated }) => {
  const navigate = useNavigate();
  const goToCommunity = () => navigate("/");
  const { setUser, setToken } = useContext(UserContext);
  const [kari, setKari] = useState(false);
  const [account, setAccount] = useState({});
  const { notify } = useNotify();
  const { t } = useTranslation();

  const handleKari = () => {
    setKari(true);
  };

  const handleCloseKari = () => {
    setKari(false);
  };

  const handleLoginSuccess = async (response) => {
    const token = response.credential;
    try {
      const result = await login(token);
      const userData = result.data;
      if (userData.registered === false) {
        const account = {
          name: userData.name,
          picture: userData.picture,
          registrationToken: userData.registrationToken,
        };
        setAccount(account);
        handleKari();
      }
      if (userData.user && userData.user.handle) {
        setUser(userData.user);
        setToken(userData.sessionToken);
        updated && updated();
        goToCommunity();
        notify(t("notify.loginSuccess"), "success");
      }
    } catch (error) {
      notify(t("notify.loginFailed"), "error");
    }
  };
  return (
    <div>
      <CustomDialog
        open={kari}
        title="create Account"
        onClose={handleCloseKari}
      >
        <HandleRegister
          account={account}
          updated={() => {
            handleCloseKari();
            updated && updated();
          }}
        />
      </CustomDialog>
      <div className="flex items-center  justify-center ">
        <GoogleLogin
          className="mx-auto"
          width="200px"
          onSuccess={handleLoginSuccess}
        />
      </div>
    </div>
  );
};
