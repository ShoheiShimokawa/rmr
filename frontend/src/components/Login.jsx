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
      setUser(userData.user);
      if (userData.user.handle) {
        updated && updated();
        goToCommunity();
        notify("You've successfully logged in", "success");
      } else {
        handleKari();
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
        <HandleRegister account={user} />
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
