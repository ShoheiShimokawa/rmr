import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";

export const Sidebar = ({ mobile = false }) => {
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

  if (mobile) {
    return (
      <Box
        className="flex justify-around items-center py-1 border-t"
        sx={{
          backgroundColor: "white",
        }}
      >
        {items.map((item) => (
          <Link
            to={item.path}
            key={item.text}
            className="flex flex-col items-center text-xs text-zinc-700"
          >
            <div>{item.icon}</div>
            <div className="text-[0.65rem] mt-1 font-soft">{item.text}</div>
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
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  sx: {
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontFamily: "'Nunito sans'",
                    fontSize: "1.1rem",
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
