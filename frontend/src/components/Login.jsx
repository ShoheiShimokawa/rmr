import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import UserContext from "./UserProvider";
import { HandleRegister } from "./HandleRegister";
import { useContext, useState } from "react";
import { useNotify } from "../hooks/NotifyProvider";
import { CustomDialog } from "../ui/CustomDialog";
export const Login = ({ updated }) => {
  const navigate = useNavigate();
  const goToCommunity = () => navigate("/");
  const { user, setUser } = useContext(UserContext);
  const [kari, setKari] = useState(false);
  const [account, setAccount] = useState({});
  const { notify } = useNotify();

  const handleKari = () => {
    setKari(true);
  };

  const handleCloseKari = () => {
    setKari(false);
  };

  const handleLoginSuccess = async (response) => {
    const token = response.credential;
    try {
      const result = await fetch("http://localhost:8080/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
      const userData = await result.json();
      if (result.status === 200 && userData.registered === false) {
        const account = {
          name: userData.name,
          email: userData.email,
          picture: userData.picture,
          googleSub: userData.googleSub,
        };
        setAccount(account);
        handleKari();
      }
      if (userData.user && userData.user.handle) {
        setUser(userData.user);
        updated && updated();
        goToCommunity();
        notify("You've successfully logged in", "success");
      }
    } catch (error) {
      console.error("Login failed", error);
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
          onError={() => console.log("Login Failed")}
        />
      </div>
    </div>
  );
};
