import { GoogleLogin } from "@react-oauth/google";
import { Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import UserContext from "./UserProvider";
import { HandleRegister } from "./HandleRegister";
import { useContext, useState } from "react";
import {
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

export const Login = ({ updated }) => {
  const navigate = useNavigate();
  const goToCommunity = () => navigate("/");
  const goRegisterHandle = () => navigate("/handleRegister");
  const { user, setUser } = useContext(UserContext);
  const [kari, setKari] = useState(false);

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
      } else {
        handleKari();
        // updated && updated();
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };
  return (
    <div>
      <Dialog onClose={handleCloseKari} open={kari}>
        <DialogTitle>create Account</DialogTitle>
        <DialogContent>
          <HandleRegister account={user} />
        </DialogContent>
      </Dialog>
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
