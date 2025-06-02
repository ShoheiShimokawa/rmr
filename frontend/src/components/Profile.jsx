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
import { getPostAllByUser } from "../api/post";
import { findReadingByUser } from "../api/reading";
import { Avatar, Button, Typography, CircularProgress } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import UserContext from "./UserProvider";
import { useRequireLogin } from "../hooks/useRequireLogin";

export const Profile = ({ account }) => {
  const { user, setUser } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [follows, setFollows] = useState([]);
  const [showFollow, setShowFollow] = useState(false);
  const [showFollower, setShowFollower] = useState(false);
  const [followed, setFollowed] = useState({});
  const [isFollowed, setIsFollowed] = useState(false);
  const [readings, setReadings] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();
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
      console.log("success follow.");
    } catch (error) {
      setIsFollowed(false);
      notify("You've already followed", "error");
    }
  };
  const handleCancelFollow = async (selectedFollowId) => {
    if (!isLoggedIn()) return;
    await deleteFollow(selectedFollowId);
    console.log("success delete follow.");
    setFollowed({});
    setIsFollowed(false);
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

  const find = async () => {
    setLoading(true);
    try {
      const follow = await getFollow(account && account.userId);
      setFollows(follow.data);
      const result = await getFollower(account && account.userId);
      setFollowers(result.data);
      var isFollowed =
        user && result.data.find((v) => v.follower.userId === user.userId);

      isFollowed && setFollowed(isFollowed);
      isFollowed && setIsFollowed(true);
      const readingResult = await findReadingByUser(account && account.userId);
      setReadings(readingResult.data);
      const postResult = await getPostAllByUser(account && account.userId);
      setPosts(postResult.data);
    } catch (error) {
      notify("Failed to load. Please try later.", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    find();
  }, []);

  return (
    <div>
      {showLoginDialog && <LoginDialog />}
      <CustomDialog
        open={open}
        title="profile setting"
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
        <Follower userId={account.userId && account.userId} />
      </CustomDialog>
      <div className="relative w-full flex items-start ml-2">
        <Avatar src={account.picture} sx={{ width: 90, height: 90 }} />

        {/* <div className="ml-2">
          <MenuBookRoundedIcon />
          {loading ? (
            <CircularProgress size="10px" />
          ) : readings.length !== 0 ? (
            readings.length
          ) : (
            0
          )}
          <br />
          🖋️
          {loading ? (
            <CircularProgress size="10px" />
          ) : posts.length !== 0 ? (
            posts.length
          ) : (
            0
          )}
        </div> */}

        <div className="absolute right-10 top-10">
          {user && account.userId === user.userId ? (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<SettingsIcon />}
              onClick={handleChangeOpen}
              sx={{
                textTransform: "none",
                color: "#444", // テキスト色
                borderColor: "#444", // 枠線の色
                "&:hover": {
                  backgroundColor: "#eee", // ホバー時の背景
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
                color: "#444",
                "&:hover": {
                  backgroundColor: "#eee", // ホバー時の背景
                  borderColor: "#444",
                },
              }}
              onClick={() => handleCancelFollow(followed && followed.id)}
            >
              followed
            </Button>
          )}
        </div>
      </div>
      <div className="text-lg ml-3 mt-2 font-bold font-soft">
        {account.name}
        <div className="text-zinc-500 font-soft">{account.handle}</div>
      </div>
      <div className="mb-2 mt-2 ml-2 font-soft"> {account.description}</div>
      <div className="flex mb-2">
        <div className="flex hover:underline cursor-pointer ml-2">
          <div
            className="mr-1 font-soft text-sm flex"
            onClick={handleSelectFollow}
          >
            <div className="font-bold mr-1">
              {follows.length != 0 ? follows.length : 0}{" "}
            </div>
            follows
          </div>
        </div>
        <div className="flex ml-2">
          <div
            className="flex hover:underline cursor-pointer"
            onClick={handleSelectFollower}
          >
            <div className="mr-1 font-soft text-sm flex">
              <div className="font-bold mr-1">
                {followers.length != 0 ? followers.length : 0}
              </div>{" "}
              followers
            </div>
          </div>
        </div>
      </div>
      <div style={{ width: "700px", height: "auto" }}>
        <ContributionMap userId={account && account.userId} />
      </div>
    </div>
  );
};
