import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
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
} from "@mui/material";

export const Header = () => {
  const { user, setUser } = useContext(UserContext);
  const [anchor, setAnchor] = useState(null);
  const navigate = useNavigate();
  const goLogin = () => navigate("/login");
  const handleClick = (e) => {
    setAnchor(e.currentTarget);
  };
  const handleClose = () => {
    setAnchor(null);
  };
  const handleLogin = () => {
    goLogin();
  };
  const handleLogout = () => {
    setUser(null);
  };
  return (
    <div>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: "calc(100% - 350px)",
          height: 54,
          backgroundColor: "white",
          color: "black",
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
              <Avatar
                component={Link}
                to={"/mypage"}
                src={user && user.picture}
                sx={{ width: 32, height: 32 }}
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
                    <ListItemIcon>
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
                      textDecoration: "none", // 👈 ホバー時も
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
