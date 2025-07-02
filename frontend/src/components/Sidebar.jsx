import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
} from "@mui/material";
import { useLocation, Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

export const Sidebar = ({ mobile = false }) => {
  const location = useLocation();
  const items = [
    {
      text: "Community",
      path: "/",
      icon: <PeopleAltRoundedIcon />,
      outlineIcon: <PeopleAltOutlinedIcon />,
    },
    {
      text: "Search",
      path: "/book",
      icon: <SearchIcon />,
      outlineIcon: <SearchIcon />,
    },
    {
      text: "Highlights",
      path: "/highlights",
      icon: <DescriptionRoundedIcon />,
      outlineIcon: <DescriptionOutlinedIcon />,
    },
    {
      text: "Analytics",
      path: "/analytics",
      icon: <AutoGraphIcon />,
      outlineIcon: <AutoGraphOutlinedIcon />,
    },
  ];

  if (mobile) {
    return (
      <Box
        className="flex justify-around items-center py-2 border-t"
        sx={{
          backgroundColor: "#f9fafb",
        }}
      >
        {items.map((item) => (
          <Link
            to={item.path}
            key={item.text}
            className="flex flex-col items-center text-xs text-zinc-700"
          >
            <div>
              {React.cloneElement(
                location.pathname === item.path ? item.icon : item.outlineIcon,
                {
                  sx: {
                    color:
                      location.pathname === item.path
                        ? "#000"
                        : "rgba(0,0,0,0.4)",
                  },
                }
              )}
            </div>
            <div className="text-[0.64rem] mt-1 font-soft">{item.text}</div>
          </Link>
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "250px",
        position: "sticky",
        top: "100px",
        bgcolor: "background.paper",
        alignSelf: "flex-start",
        backgroundColor: "#F5F5F5",
        p: 4,
      }}
    >
      <List>
        {items.map((item) => (
          <ListItem key={item.text} disablePadding>
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
                          ? "#000"
                          : "rgba(0,0,0,0.4)",
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
                        : "rgba(0, 0, 0, 0.5)",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
