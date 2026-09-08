import { useEffect } from "react";
import { usePostGooders } from "../hooks/usePost";
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

export const GoodDetail = ({ postId }) => {
  const { data: goods = [], isLoading, isError } = usePostGooders(postId);
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
          {goods.length !== 0 ? (
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
              {goods.map((good) => (
                <ListItem
                  key={good.goodId}
                  onClick={() => {
                    handleClick(good.user.handle && good.user.handle);
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
                    <Avatar src={good.user.picture && good.user.picture} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={good.user.name}
                    secondary={`@${good.user.handle}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <div className="font-soft flex justify-center">Not yet</div>
          )}
        </>
      )}
    </div>
  );
};
