import { useEffect } from "react";
import { useFollows } from "../hooks/useFollow";
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

export const Follow = ({ followerId }) => {
  const { data: follows = [], isLoading, isError } = useFollows(followerId);
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
