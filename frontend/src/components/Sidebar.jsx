import React from "react";
import { motion } from "framer-motion";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  IconButton,
} from "@mui/material";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaPenNib } from "react-icons/fa";
import SearchIcon from "@mui/icons-material/Search";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { useThemeMode } from "../hooks/ThemeModeProvider";
import { useRequireLogin } from "../hooks/useRequireLogin";

const items = [
  {
    text: "Community",
    path: "/",
    icon: <PeopleAltRoundedIcon />,
    outlineIcon: <PeopleAltOutlinedIcon />,
  },
  {
    text: "Books",
    path: "/book",
    icon: <SearchIcon />,
    outlineIcon: <SearchIcon />,
  },
  {
    text: "Analytics",
    path: "/analytics",
    icon: <AutoGraphIcon />,
    outlineIcon: <AutoGraphOutlinedIcon />,
  },
];

const NavItem = ({ item, location }) => (
  <motion.div whileTap={{ scale: 0.95 }}>
    <Link
      to={item.path}
      className="flex flex-col items-center text-xs text-zinc-700 dark:text-zinc-300"
    >
      <div>
        {React.cloneElement(
          location.pathname === item.path ? item.icon : item.outlineIcon,
          {
            sx: {
              color:
                location.pathname === item.path ? "text.primary" : "text.disabled",
            },
          }
        )}
      </div>
      <div className="text-[0.64rem] mt-1 font-soft">{item.text}</div>
    </Link>
  </motion.div>
);

export const Sidebar = ({ mobile = false }) => {
  const { resolvedMode } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, LoginDialog, showLoginDialog } = useRequireLogin();

  const handlePostClick = () => {
    if (isLoggedIn()) navigate("/postRegister");
  };

  if (mobile) {
    return (
      <>
        {showLoginDialog && <LoginDialog />}
        <Box
          className="flex justify-around items-center pt-2 pb-3 border-t"
          sx={{
            bgcolor:
              resolvedMode === "dark" ? "background.default" : "background.paper",
          }}
        >
          {items.slice(0, 2).map((item) => (
            <NavItem key={item.text} item={item} location={location} />
          ))}
          <motion.div whileTap={{ scale: 0.9 }}>
            <IconButton
              onClick={handlePostClick}
              aria-label="Create post"
              sx={{
                bgcolor: "text.primary",
                color: "background.default",
                width: 40,
                height: 40,
                "&:hover": { bgcolor: "text.primary", opacity: 0.85 },
              }}
            >
              <FaPenNib size="16px" />
            </IconButton>
          </motion.div>
          {items.slice(2).map((item) => (
            <NavItem key={item.text} item={item} location={location} />
          ))}
        </Box>
      </>
    );
  }

  return (
    <Box
      sx={{
        width: "250px",
        position: "sticky",
        top: "100px",
        bgcolor: "background.default",
        alignSelf: "flex-start",
        p: 4,
      }}
    >
      <List>
        {items.map((item) => (
          <motion.div key={item.text} whileTap={{ scale: 0.95 }}>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: 4,
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
                <ListItemIcon>
                  {React.cloneElement(
                    location.pathname === item.path
                      ? item.icon
                      : item.outlineIcon,
                    {
                      sx: {
                        color:
                          location.pathname === item.path
                            ? "text.primary"
                            : "text.disabled",
                      },
                    }
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    sx: {
                      textDecoration: "none",
                      fontWeight: "bold",
                      fontFamily: "'Nunito sans'",
                      fontSize: "1.1rem",
                      color:
                        location.pathname === item.path
                          ? "inherit"
                          : "text.disabled",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </motion.div>
        ))}
      </List>
    </Box>
  );
};
