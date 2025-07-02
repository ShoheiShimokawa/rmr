import { getGooder } from "../api/post";
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

export const GoodDetail = ({ postId }) => {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  const handleClick = (selectedHandle) => {
    const newUrl = `${window.location.origin}/${selectedHandle}`;
    window.open(newUrl, "_blank");
  };

  const find = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getGooder(postId && postId);
      setGoods(result.data);
    } catch (error) {
      notify("Failed to loading.", "error");
    } finally {
      setLoading(false);
    }
  }, [postId, notify]);
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
