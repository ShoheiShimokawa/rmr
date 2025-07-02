import { getNotificationAll } from "../api/notification";
import React, { useState, useEffect, useCallback } from "react";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { useNotify } from "../hooks/NotifyProvider";
import { Link } from "react-router-dom";
import { Review } from "./Review";
import { timeAgo } from "../util";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import FavoriteIcon from "@mui/icons-material/Favorite";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import {
  Avatar,
  List,
  ListItem,
  CircularProgress,
  Divider,
  Box,
} from "@mui/material";
export const Notification = () => {
  const { user } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();
  const find = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getNotificationAll(user && user.userId);
      const sortedNotifications = result.data.slice().sort((a, b) => {
        return new Date(b.registerDate) - new Date(a.registerDate);
      });
      setNotifications(sortedNotifications);
    } catch (error) {
      notify("Failed to load.Please try later.", "error");
    } finally {
      setLoading(false);
    }
  }, [user, notify]);

  useEffect(() => {
    find();
  }, [find]);

  return (
    <div>
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: 1,
          p: 2,
        }}
      >
        <div className="w-full">
          <div className="text-xl font-soft font-bold flex ml-4 mb-4 mt-4 items-center">
            <NotificationsRoundedIcon />{" "}
            <div className="ml-1">Notifications</div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center min-h-[150px]">
              <CircularProgress size={24} />
            </div>
          ) : (
            <>
              {notifications.length >= 1 ? (
                <>
                  <List>
                    {notifications.map((notification) => (
                      <>
                        <Divider flexItem />
                        <ListItem key={notification.notificationId}>
                          {notification.notificationType === "GOOD" ? (
                            <div className=" w-full mb-2 mt-2">
                              <div className="font-soft flex text-sm w-full items-center mb-4">
                                <FavoriteIcon
                                  sx={{ fontSize: "20px", mr: 2 }}
                                  className="text-red-500"
                                />
                                <Link
                                  to={`/${notification.notifier.handle}`}
                                  style={{ textDecoration: "none" }}
                                >
                                  <Avatar src={notification.notifier.picture} />
                                </Link>
                                <div className="ml-1  ml-4 flex items-center">
                                  <div className="font-bold">
                                    {notification.notifier.name}( @
                                    {notification.notifier.handle}) liked your
                                    post!
                                  </div>
                                  <div className="ml-2  text-zinc-500 font-soft text-xs">
                                    {timeAgo(notification.registerDate)}
                                  </div>
                                </div>
                              </div>

                              {/* <Card
                                elevation={0}
                                sx={{
                                  width: "100%",
                                  border: "1px solid #e0e0e0",
                                }}
                              > */}
                              {/* <CardContent> */}
                              <div className="flex">
                                <Divider
                                  orientation="vertical"
                                  flexItem
                                  sx={{
                                    borderWidth: "1.5px",
                                    borderColor: "#ddd",
                                    borderRadius: "4px",
                                    mx: 3,
                                  }}
                                />
                                <Review
                                  post={notification.post}
                                  visible={true}
                                  forNotification={true}
                                />
                              </div>
                              {/* </CardContent> */}
                              {/* </Card> */}
                            </div>
                          ) : notification.notificationType === "FOLLOW" ? (
                            <div className="font-soft mt-2 mb-2 text-sm ">
                              <div className="flex items-center">
                                <PersonAddAltRoundedIcon
                                  sx={{ fontSize: "20px", mr: 2 }}
                                />
                                <Link
                                  to={`/${notification.notifier.handle}`}
                                  style={{ textDecoration: "none" }}
                                >
                                  <Avatar src={notification.notifier.picture} />
                                </Link>
                                <div className="ml-1  ml-4 flex items-center">
                                  <div className="font-bold">
                                    {notification.notifier.name}( @
                                    {notification.notifier.handle}) followed
                                    you!
                                  </div>
                                  <div className="ml-2 text-zinc-500 text-xs">
                                    {timeAgo(notification.registerDate)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div>else</div>
                          )}
                        </ListItem>
                      </>
                    ))}
                  </List>
                </>
              ) : (
                <div>no data.</div>
              )}
            </>
          )}
        </div>
      </Box>
    </div>
  );
};
