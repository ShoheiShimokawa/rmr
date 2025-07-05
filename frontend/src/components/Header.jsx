import * as React from "react";
import { Link } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { FaPenNib } from "react-icons/fa";
import { useNotify } from "../hooks/NotifyProvider";
import { Login } from "./Login";
import { getNotificationAll, markAllAsDone } from "../api/notification";
import { useContext, useState, useEffect, useCallback } from "react";
import { CustomDialog } from "../ui/CustomDialog";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import UserContext from "./UserProvider";
import { useNavigate } from "react-router-dom";
import InfoIcon from "@mui/icons-material/Info";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import { useRequireLogin } from "../hooks/useRequireLogin";
import { motion } from "framer-motion";
import {
  ListItemIcon,
  Avatar,
  Stack,
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Box,
} from "@mui/material";

export const Header = () => {
  const { user, setUser } = useContext(UserContext);
  const [anchor, setAnchor] = useState(null);
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const goToCommunity = () => navigate("/");
  const [hasUnread, setHasUnread] = useState(false);
  const { isLoggedIn, LoginDialog, showLoginDialog } = useRequireLogin();
  const { notify } = useNotify();

  const find = useCallback(async () => {
    if (user) {
      const result = await getNotificationAll(user.userId);
      if (result.data.length >= 1) {
        const unread = result.data.filter((n) => n.statusType === "NONE");
        setHasUnread(unread.length > 0);
      }
    }
  }, [user]);

  useEffect(() => {
    find();
  }, [find]);

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
    handleClose();
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
  const handleMarkAsDone = async () => {
    await markAllAsDone(user && user.userId);
  };
  const handleNotificationClick = () => {
    if (isLoggedIn()) {
      navigate("/notifications");
      handleMarkAsDone();
      setHasUnread(false);
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
        <Login
          updated={() => {
            handleClose();
            handleLoginClose();
          }}
        />
      </CustomDialog>
      {showLoginDialog && <LoginDialog />}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          height: 65,
          backgroundColor: "white",
          color: "black",
          alignSelf: "flex-start",
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            display: "flex",
            minHeight: "48px",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "1000px",
              px: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="mt-2">
              <Link to="/">
                <img
                  src="/rmr_logo.png"
                  alt="rmr Logo"
                  className="select-none"
                  style={{
                    width: "auto",
                    height: "120px",
                    objectFit: "contain",
                  }}
                />
              </Link>
            </div>
            <div className="">
              <Stack
                direction="row"
                sx={{
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <motion.div whileTap={{ scale: 0.9 }}>
                  <IconButton onClick={handlePostClick}>
                    <FaPenNib size="24px" />
                  </IconButton>
                </motion.div>
                <motion.div whileTap={{ scale: 0.9 }}>
                  <IconButton onClick={handleNotificationClick}>
                    <Badge color="warning" variant="dot" invisible={!hasUnread}>
                      <NotificationsRoundedIcon />
                    </Badge>
                  </IconButton>
                </motion.div>
                <motion.div whileTap={{ scale: 0.9 }}>
                  <IconButton
                    aria-label="more"
                    id="long-button"
                    aria-haspopup="true"
                    onClick={handleClick}
                  >
                    <Avatar
                      src={user && user.picture}
                      sx={{ width: 34, height: 34 }}
                    />
                  </IconButton>
                </motion.div>
                <Menu anchorEl={anchor} open={open} onClose={handleClose}>
                  <MenuItem
                    onClick={handleUserPage}
                    sx={{
                      textDecoration: "none",
                      py: 1.6,
                      "&:hover": {
                        textDecoration: "none",
                      },
                    }}
                  >
                    <ListItemIcon>
                      <PersonRoundedIcon />
                    </ListItemIcon>
                    <div className="font-soft font-bold">My Page</div>
                  </MenuItem>
                  <MenuItem
                    onClick={handleInfo}
                    sx={{
                      textDecoration: "none",
                      py: 1.2,
                      "&:hover": {
                        textDecoration: "none",
                      },
                    }}
                  >
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <div className="font-soft">About</div>
                  </MenuItem>
                  {user ? (
                    <MenuItem
                      onClick={() => handleLogout()}
                      sx={{
                        textDecoration: "none",
                        py: 1.2,
                        "&:hover": {
                          textDecoration: "none",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <LogoutRoundedIcon />
                      </ListItemIcon>
                      <div className="font-soft">Log Out</div>
                    </MenuItem>
                  ) : (
                    <MenuItem
                      onClick={() => handleLogin()}
                      sx={{
                        textDecoration: "none",
                        py: 1.2,
                        "&:hover": {
                          textDecoration: "none",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <LoginRoundedIcon />
                      </ListItemIcon>
                      <div className="font-soft">Log In</div>
                    </MenuItem>
                  )}
                </Menu>
              </Stack>
            </div>
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
};
