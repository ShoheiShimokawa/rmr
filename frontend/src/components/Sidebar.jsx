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
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { FaBook } from "react-icons/fa";
import { useContext, useState } from "react";
import UserContext from "./UserProvider";
import { useNavigate } from "react-router-dom";

export const Sidebar = () => {
  const { user, setUser } = useContext(UserContext);
  const [anchor, setAnchor] = useState(null);
  const items = [
    { text: "Community", path: "/", icon: <PeopleIcon /> },
    { text: "Search", path: "/book", icon: <SearchIcon /> },
    {
      text: "Highlights",
      path: "/highlights",
      icon: <DescriptionRoundedIcon />,
    },
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
          width: "250px",
          height: "100vh",
          position: "fixed",
          left: "100px",
          top: 10,
          bgcolor: "background.paper",
          borderRight: "1px solid #ddd",
          p: 1,
        }}
      >
        <List>
          {items.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "none",
                  },
                  "& a": {
                    textDecoration: "none",
                    color: "inherit",
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
                      textDecoration: "none",
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
