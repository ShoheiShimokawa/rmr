import { getFollow } from "../api/account";
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

export const Follow = ({ followerId }) => {
  const [follows, setFollow] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  const handleClick = (selectedHandle) => {
    const newUrl = `${window.location.origin}/${selectedHandle}`;
    window.open(newUrl, "_blank");
  };

  const find = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getFollow(followerId);
      setFollow(result.data);
    } catch (error) {
      notify("Failed to loading.", "error");
    } finally {
      setLoading(false);
    }
  }, [followerId, notify]);
  useEffect(() => {
    find();
  }, [find]);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <>
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
                    secondary={`@${follow.user.handle}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <div className="font-soft flex justify-center">No follows</div>
          )}
        </>
      )}
    </div>
  );
};
