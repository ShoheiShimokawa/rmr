import * as React from "react";
import { Link } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { FaPenNib } from "react-icons/fa";
import { useNotify } from "../hooks/NotifyProvider";
import { Login } from "./Login";
import { useContext, useState } from "react";
import { CustomDialog } from "../ui/CustomDialog";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UserContext from "./UserProvider";
import { useNavigate } from "react-router-dom";
import InfoIcon from "@mui/icons-material/Info";
import { useRequireLogin } from "../hooks/useRequireLogin";
import {
  ListItemIcon,
  Avatar,
  Divider,
  Stack,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";

export const Header = () => {
  const { user, setUser } = useContext(UserContext);
  const [anchor, setAnchor] = useState(null);
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const goToCommunity = () => navigate("/");
  const { isLoggedIn, LoginDialog, showLoginDialog } = useRequireLogin();
  const { notify } = useNotify();

  const handleClick = (e) => {
    setAnchor(e.currentTarget);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleInfo = () => {
    navigate("/information");
    handleClose();
  };
  const handleUserPage = () => {
    if (isLoggedIn()) {
      navigate(`/${user && user.handle}`);
    }
  };
  const handleLogin = () => {
    setShowLogin(true);
  };
  const handleLoginClose = () => {
    setShowLogin(false);
  };
  const handleLogout = () => {
    setUser(null);
    goToCommunity();
    handleClose();
    notify("Logged out successfully.", "success");
  };
  const handlePostClick = () => {
    if (isLoggedIn()) {
      navigate("/PostRegister");
      handleClose();
    }
  };
  return (
    <div>
      <CustomDialog
        open={showLogin}
        title="Login"
        onClose={handleLoginClose}
        width="400px"
      >
        <Login updated={handleLoginClose} />
      </CustomDialog>
      {showLoginDialog && <LoginDialog />}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          height: 80,
          backgroundColor: "white",
          color: "black",
          alignSelf: "flex-start",
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: "48px",
          }}
        >
          <div className="ml-10 mt-2">
            <Link to="/">
              <img
                src="/rmr_logo.png"
                alt="readMore Logo"
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "contain",
                }}
              />
            </Link>
          </div>
          <div className="ml-auto mr-12">
            <Stack
              direction="row"
              sx={{
                p: 2,
                gap: 1,
                alignItems: "center",
              }}
            >
              <IconButton onClick={handlePostClick}>
                <FaPenNib />
              </IconButton>
              <Avatar
                onClick={handleUserPage}
                src={user && user.picture}
                sx={{ width: 34, height: 34 }}
              />
              <IconButton
                aria-label="more"
                id="long-button"
                aria-haspopup="true"
                onClick={handleClick}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu anchorEl={anchor} open={open} onClose={handleClose}>
                {user ? (
                  <MenuItem
                    onClick={() => handleLogout()}
                    sx={{
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "none",
                      },
                    }}
                  >
                    <ListItemIcon>
                      <LogoutRoundedIcon />
                    </ListItemIcon>
                    Log out
                  </MenuItem>
                ) : (
                  <MenuItem
                    onClick={() => handleLogin()}
                    sx={{
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "none",
                      },
                    }}
                  >
                    <ListItemIcon>
                      <LoginRoundedIcon />
                    </ListItemIcon>
                    Log in
                  </MenuItem>
                )}
                <MenuItem
                  onClick={handleInfo}
                  sx={{
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "none",
                    },
                  }}
                >
                  <ListItemIcon>
                    <InfoIcon />
                  </ListItemIcon>
                  About
                </MenuItem>
              </Menu>
            </Stack>
          </div>
        </Toolbar>
        <Divider />
      </AppBar>
    </div>
  );
};
