import { getFollower, getFollow } from "../api/account";
import { useNotify } from "../hooks/NotifyProvider";
import {
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

export const Follower = ({ userId }) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { notify } = useNotify();

  const handleClick = (selectedHandle) => {
    const basePath = location.pathname.replace(/^\/@[^/]+/, "");
    const newUrl = `/${selectedHandle}${basePath}`;
    window.open(newUrl, "_blank");
  };
  const find = async () => {
    try {
      setLoading(true);
      const result = await getFollower(userId);
      setFollowers(result.data);
    } catch (error) {
      notify("Failed to loading.", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    find();
  }, []);
  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center ">
          <CircularProgress />
        </div>
      ) : (
        <>
          {followers.length !== 0 ? (
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
              {followers.map((follower) => (
                <ListItem
                  key={follower.id}
                  onClick={() => {
                    handleClick(follower.user.handle && follower.user.handle);
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
                    <Avatar
                      src={
                        follower.follower.picture && follower.follower.picture
                      }
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={follower.follower.name}
                    secondary={follower.follower.handle}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <div className="font-soft flex justify-center">No followers</div>
          )}
        </>
      )}
    </div>
  );
};
