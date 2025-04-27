import {
  List,
  ListItem,
  ListItemButton,
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
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import InfoIcon from "@mui/icons-material/Info";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { FaBook } from "react-icons/fa";
import { useContext, useState } from "react";
import UserContext from "./UserProvider";
import { useNavigate } from "react-router-dom";

export const Sidebar = () => {
  const { user, setUser } = useContext(UserContext);
  const [anchor, setAnchor] = useState(null);
  const items = [
    { text: "Community", path: "/posts", icon: <PeopleIcon /> },
    { text: "Search", path: "/book", icon: <SearchIcon /> },
    { text: "Analytics", path: "/analytics", icon: <AutoGraphIcon /> },
  ];
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
      <Box
        sx={{
          width: "250px", // 固定幅
          height: "100vh", // 画面いっぱいの高さ
          position: "fixed", // スクロールしても固定
          left: "100px", // 左に余白をとる
          top: 10,
          bgcolor: "background.paper",
          borderRight: "1px solid #ddd",
          p: 1, // 内側余白（padding）
        }}
      >
        <List>
          {items.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "none", // 👈 ホバー時も
                  },
                  "& a": {
                    textDecoration: "none", // ← これを追加する！
                    color: "inherit", // 色も引き継ぎたいなら
                  },
                  "&:hover a": {
                    textDecoration: "none",
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "none", // 👈 ホバー時も
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {/* <Stack
            direction="row"
            sx={{
              p: 2,
              gap: 1,
              alignItems: "center",
              borderTop: "1px solid",
              borderColor: "divider",
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
                  <ListItemText onClick={() => handleLogout()}>
                    Log out
                  </ListItemText>
                </MenuItem>
              ) : (
                <MenuItem>
                  <ListItemText onClick={() => handleLogin()}>
                    Log in
                  </ListItemText>
                </MenuItem>
              )}
            </Menu>
          </Stack> */}
      </Box>
    </div>
  );
};
