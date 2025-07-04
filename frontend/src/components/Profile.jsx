import {
  getProfile,
  getFollower,
  getFollow,
  follow,
  deleteFollow,
} from "../api/account";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNotify } from "../hooks/NotifyProvider";
import { CustomDialog } from "../ui/CustomDialog";
import { Follower } from "../components/Follower";
import { Follow } from "../components/Follow";
import { ProfileChange } from "./ProfileChange";
import { ContributionMap } from "./ContributionMap";
import { motion } from "framer-motion";
import {
  Avatar,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useContext, useEffect, useState, useCallback } from "react";
import UserContext from "./UserProvider";
import { useRequireLogin } from "../hooks/useRequireLogin";
import XIcon from "@mui/icons-material/X";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkIcon from "@mui/icons-material/Link";

export const Profile = ({ userId }) => {
  const { user, setUser } = useContext(UserContext);
  const [account, setAccount] = useState();
  const [open, setOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [follows, setFollows] = useState([]);
  const [showFollow, setShowFollow] = useState(false);
  const [showFollower, setShowFollower] = useState(false);
  const [followed, setFollowed] = useState({});
  const [isFollowed, setIsFollowed] = useState(false);
  const { notify } = useNotify();
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, LoginDialog, showLoginDialog } = useRequireLogin();

  const handleFollow = async (selectedUserId) => {
    try {
      if (!isLoggedIn()) return;
      setIsFollowed(true);
      const param = {
        userId: selectedUserId,
        followerId: user && user.userId,
      };
      const result = await follow(param);
      setFollowed(result.data);
      notify("You Followed.", "Success");
    } catch (error) {
      setIsFollowed(false);
      notify("You've already followed", "error");
    }
  };
  const handleCancelFollow = async (selectedFollowId) => {
    if (!isLoggedIn()) return;
    try {
      await deleteFollow(selectedFollowId);
      setFollowed({});
      setIsFollowed(false);
    } catch (error) {
      notify("Failed.", "error");
    }
  };

  const handleChangeOpen = () => {
    setOpen(true);
  };

  const handleChangeClose = () => {
    setOpen(false);
  };

  const handleSelectFollow = () => {
    setShowFollow(true);
  };
  const handleCloseFollow = () => {
    setShowFollow(false);
  };
  const handleSelectFollower = () => {
    setShowFollower(true);
  };
  const handleCloseFollower = () => {
    setShowFollower(false);
  };
  const handleGetProfile = async () => {
    const result = await getProfile(user && user.userId);
    result.data && setUser(result.data);
    handleChangeClose();
  };

  const find = useCallback(async () => {
    setLoading(true);
    try {
      const userPageAccount = await getProfile(userId && userId);
      setAccount(userPageAccount.data);
      const follow = await getFollow(userId && userId);
      setFollows(follow.data);
      const result = await getFollower(userId && userId);
      setFollowers(result.data);
      var isFollowed =
        user && result.data.find((v) => v.follower.userId === user.userId);
      isFollowed && setFollowed(isFollowed);
      isFollowed && setIsFollowed(true);
    } catch (error) {
      notify("Failed to load. Please try later.", "error");
    } finally {
      setLoading(false);
    }
  }, [userId, notify, user]);
  useEffect(() => {
    find();
  }, [find]);

  return (
    <div>
      {account && (
        <>
          {showLoginDialog && <LoginDialog />}
          <CustomDialog
            open={open}
            title="Profile setting"
            onClose={handleChangeClose}
          >
            <ProfileChange
              account={user}
              update={() => {
                handleGetProfile();
                find();
              }}
            />
          </CustomDialog>
          <CustomDialog
            open={showFollow}
            title="Follows"
            onClose={handleCloseFollow}
            width="500px"
          >
            <Follow followerId={account && account.userId} />
          </CustomDialog>
          <CustomDialog
            open={showFollower}
            title="Followers"
            onClose={handleCloseFollower}
          >
            <Follower userId={userId && userId} />
          </CustomDialog>
          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <CircularProgress size={20} />
            </div>
          ) : (
            <>
              <div className="relative w-full flex items-start ml-2">
                <Avatar src={account.picture} sx={{ width: 90, height: 90 }} />
                <div className="absolute right-10 top-10">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    {user && userId === user.userId ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<SettingsIcon />}
                        onClick={handleChangeOpen}
                        sx={{
                          textTransform: "none",
                          color: "#444",
                          borderColor: "#444",
                          fontFamily: "'Nunito sans'",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: "#eee",
                            borderColor: "#444",
                          },
                        }}
                      >
                        Edit
                      </Button>
                    ) : !isFollowed ? (
                      <Button
                        size="small"
                        variant="contained"
                        sx={{
                          textTransform: "none",
                          color: "#fff",
                          backgroundColor: "#000",
                          borderColor: "#444",
                          fontWeight: "bold",
                          fontFamily: "'Nunito sans'",
                          "&:hover": {
                            backgroundColor: "#333",
                            borderColor: "#444",
                          },
                        }}
                        onClick={() => handleFollow(account.userId)}
                      >
                        follow
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{
                          textTransform: "none",
                          borderColor: "#444",
                          fontWeight: "bold",
                          fontFamily: "'Nunito sans'",
                          color: "#444",
                          "&:hover": {
                            backgroundColor: "#eee",
                            borderColor: "#444",
                          },
                        }}
                        onClick={() =>
                          handleCancelFollow(followed && followed.id)
                        }
                      >
                        followed
                      </Button>
                    )}
                  </motion.div>
                </div>
              </div>
              <div className="ml-2 ">
                <div className="text-xl mt-3 font-bold font-soft">
                  {account.name}
                </div>
                <div className="text-zinc-500 font-soft text-lg">
                  @{account.handle}
                </div>
              </div>
              <div className=" mt-2  mb-2 ml-2 font-soft  break-words">
                {account.description}
              </div>
              <div className="flex mb-2">
                {" "}
                <motion.div whileTap={{ scale: 0.9 }}>
                  <div className="flex hover:text-zinc-500  cursor-pointer ml-2">
                    <div
                      className="mr-1 font-soft text-sm flex"
                      onClick={handleSelectFollow}
                    >
                      <div className="font-bold mr-1">
                        {follows.length !== 0 ? follows.length : 0}{" "}
                      </div>
                      follows
                    </div>
                  </div>
                </motion.div>
                <div className="flex ml-2">
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <div
                      className="flex hover:text-zinc-500 cursor-pointer"
                      onClick={handleSelectFollower}
                    >
                      <div className="mr-1 font-soft text-sm flex">
                        <div className="font-bold mr-1">
                          {followers.length !== 0 ? followers.length : 0}
                        </div>{" "}
                        followers
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
              {(account.x || account.facebook || account.link) && (
                <div className="ml-1 mb-2 flex">
                  {account.x && (
                    <Tooltip title={`@${account.x}`} arrow>
                      <IconButton
                        component="a"
                        href={`https://x.com/${account.x}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="inherit"
                      >
                        <XIcon
                          sx={{ fontSize: "20px", color: "rgba(0,0,0,0.4)" }}
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                  {account.facebook && (
                    <Tooltip title={`${account.facebook}`} arrow>
                      <IconButton
                        component="a"
                        href={`https://www.facebook.com/${account.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="inherit"
                      >
                        <FacebookIcon
                          sx={{ fontSize: "20px", color: "rgba(0,0,0,0.4)" }}
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                  {account.link && (
                    <Tooltip title={`${account.link}`} arrow>
                      <IconButton
                        component="a"
                        href={`${account.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="inherit"
                      >
                        <LinkIcon
                          sx={{ fontSize: "20px", color: "rgba(0,0,0,0.4)" }}
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
              )}
              <div className="w-full overflow-x-auto">
                <div className="min-w-[600px]">
                  <ContributionMap userId={userId && userId} />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
