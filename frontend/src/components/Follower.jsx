import { getFollower } from "../api/account";
import { useNotify } from "../hooks/NotifyProvider";
import {
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState, useCallback } from "react";

export const Follower = ({ userId }) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  const handleClick = (selectedHandle) => {
    const newUrl = `${window.location.origin}/${selectedHandle}`;
    window.open(newUrl, "_blank");
  };
  const find = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getFollower(userId);
      setFollowers(result.data);
    } catch (error) {
      notify("Failed to loading.", "error");
    } finally {
      setLoading(false);
    }
  }, [userId, notify]);
  useEffect(() => {
    find();
  }, [find]);
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
                    handleClick(
                      follower.follower.handle && follower.follower.handle
                    );
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
                    secondary={`@${follower.follower.handle}`}
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
