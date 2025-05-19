import * as React from "react";
import AppBar from "@mui/material/AppBar";
import RateReviewIcon from "@mui/icons-material/RateReview";
import Toolbar from "@mui/material/Toolbar";
import { FaPenNib } from "react-icons/fa";
import { Login } from "./Login";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import PostAddRoundedIcon from "@mui/icons-material/PostAddRounded";
import { useContext, useState } from "react";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UserContext from "./UserProvider";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import InfoIcon from "@mui/icons-material/Info";

import {
  ListItemText,
  ListItemIcon,
  Box,
  Avatar,
  Divider,
  Drawer,
  Stack,
  Menu,
  MenuItem,
  IconButton,
  ListItemButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

export const Header = () => {
  const { user, setUser } = useContext(UserContext);
  const [anchor, setAnchor] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const handleClick = (e) => {
    setAnchor(e.currentTarget);
  };
  const handleClose = () => {
    setAnchor(null);
  };
  const handleLogin = () => {
    setShowLogin(true);
  };
  const handleLoginClose = () => {
    setShowLogin(false);
  };
  const handleLogout = () => {
    setUser(null);
  };
  return (
    <div>
      <Dialog
        onClose={handleLoginClose}
        open={showLogin}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <Login updated={handleLoginClose} />
        </DialogContent>
      </Dialog>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          // width: "calc(100% - 350px)",
          height: 54,
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
          <div className="ml-auto mr-12">
            <Stack
              direction="row"
              sx={{
                p: 2,
                gap: 1,
                alignItems: "center",
              }}
            >
              <IconButton component={Link} to="/PostRegister">
                <FaPenNib />
              </IconButton>
              <Avatar
                component={Link}
                to={`/${user && user.handle}`}
                src={user && user.picture}
                sx={{ width: 34, height: 34 }}
              />
              <IconButton
                aria-label="more"
                id="long-button"
                //   aria-controls={open ? "long-menu" : undefined}
                //   aria-expanded={open ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleClick}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={handleClose}
              >
                {user ? (
                  <MenuItem>
                    <ListItemIcon onClick={() => handleLogout()}>
                      <LogoutRoundedIcon />
                    </ListItemIcon>
                    <ListItemText onClick={() => handleLogout()}>
                      Log out
                    </ListItemText>
                  </MenuItem>
                ) : (
                  <MenuItem>
                    <ListItemIcon>
                      <LoginRoundedIcon />
                    </ListItemIcon>
                    <ListItemText onClick={() => handleLogin()}>
                      Log in
                    </ListItemText>
                  </MenuItem>
                )}
                <MenuItem
                  component={Link}
                  to={"/information"}
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
                  <ListItemText primary="About"></ListItemText>
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
