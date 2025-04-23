// RequireAuth.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import UserContext from "./UserProvider";

const RequireAuth = ({ children }) => {
  const { user } = useContext(UserContext);

  if (!user) {
    // 未ログインならCommunity(home)へ
    return <Navigate to="/posts" replace />;
  }

  // ログイン済みならそのまま表示
  return children;
};

export default RequireAuth;
