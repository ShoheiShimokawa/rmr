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
          position: "sticky",
          // left: "100px",
          top: "80px",
          bgcolor: "background.paper",
          // borderRight: "1px solid #ddd",
          alignSelf: "flex-start",

          p: 1,
          px: 1,
        }}
      >
        <List>
          {items.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  px: 2,
                  py: 1.5,
                  transition: "0.2s",
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
                  "& .MuiTypography-root": {
                    textDecoration: "none",
                  },
                  "&:hover .MuiTypography-root": {
                    textDecoration: "none",
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    "&:hover": {
                      textDecoration: "none",
                    },
                  }}
                  primaryTypographyProps={{
                    sx: {
                      textDecoration: "none",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </div>
  );
};
