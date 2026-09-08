import { useEffect } from "react";
import { useFollowers } from "../hooks/useFollow";
import { useNotify } from "../hooks/NotifyProvider";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
} from "@mui/material";

export const Follower = ({ userId }) => {
  const { data: followers = [], isLoading, isError } = useFollowers(userId);
  const { notify } = useNotify();
  const { t } = useTranslation();

  useEffect(() => {
    if (isError) notify(t("notify.loadFailed"), "error");
  }, [isError, notify, t]);

  const handleClick = (selectedHandle) => {
    const newUrl = `${window.location.origin}/${selectedHandle}`;
    window.open(newUrl, "_blank");
  };
  return (
    <div>
      {isLoading ? (
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
