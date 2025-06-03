import { getFollow } from "../api/account";
import { CustomDialog } from "../ui/CustomDialog";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";

export const Follow = ({ followerId }) => {
  const [follows, setFollow] = useState([]);
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState();
  const location = useLocation();

  const handleClick = (selectedHandle) => {
    const basePath = location.pathname.replace(/^\/@[^/]+/, "");
    const newUrl = `/${selectedHandle}${basePath}`;
    window.open(newUrl, "_blank");
  };

  const find = async () => {
    const result = await getFollow(followerId);
    setFollow(result.data);
  };
  useEffect(() => {
    find();
  }, []);

  return (
    <div>
      {follows.length !== 0 ? (
        <List sx={{ width: "100%", bgcolor: "background.paper" }}>
          {follows.map((follow) => (
            <ListItem
              key={follow.id}
              onClick={() => {
                handleClick(follow.user.handle && follow.user.handle);
              }}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                  textDecoration: "none",
                  borderRadius: 2,
                  "& *": {
                    textDecoration: "none",
                  },
                },
              }}
            >
              <ListItemAvatar>
                <Avatar src={follow.user.picture && follow.user.picture} />
              </ListItemAvatar>
              <ListItemText
                primary={follow.user.name}
                secondary={follow.user.handle}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <div>No follows</div>
      )}
    </div>
  );
};
