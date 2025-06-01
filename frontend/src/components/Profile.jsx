import {
  getProfile,
  getFollower,
  getFollow,
  follow,
  deleteFollow,
} from "../api/account";
import { useNotify } from "../hooks/NotifyProvider";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import ReviewsRoundedIcon from "@mui/icons-material/ReviewsRounded";
import { CustomDialog } from "../ui/CustomDialog";
import { Follower } from "../components/Follower";
import { Follow } from "../components/Follow";
import { ProfileChange } from "./ProfileChange";
import { ContributionMap } from "./ContributionMap";
import { Header } from "./Header";
import { getPostAllByUser } from "../api/post";
import { findReadingByUser } from "../api/reading";
import { Avatar, Button, Typography, CircularProgress } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import UserContext from "./UserProvider";

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

  const handleFollow = async (selectedUserId) => {
    setIsFollowed(true);
    const param = {
      userId: selectedUserId,
      followerId: user && user.userId,
    };
    const result = await follow(param);
    setFollowed(result.data);
    console.log("success follow.");
  };
  const handleCancelFollow = async (selectedFollowId) => {
    await deleteFollow(selectedFollowId);
    console.log("success delete follow.");
    setFollowed({});
    setIsFollowed(false);
  };

  const handleDeleteFollow = () => {};

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
    find();
    handleChangeClose();
  };

  const find = async () => {
    setLoading(true);
    try {
      const follow = await getFollow(account && account.userId);
      setFollows(follow.data);
      const result = await getFollower(account && account.userId);
      setFollowers(result.data);
      var isFollowed = result.data.find(
        (v) => v.follower.userId === user && user.userId
      );
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
      <CustomDialog
        open={open}
        title="profile setting"
        onClose={handleChangeClose}
      >
        <ProfileChange account={user} update={handleGetProfile} />
      </CustomDialog>
      <CustomDialog
        open={showFollow}
        title="Follows"
        onClose={handleCloseFollow}
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
      <div className="relative w-full flex items-start ml-4">
        <Avatar
          src={account.picture}
          className="mr-2"
          sx={{ width: 90, height: 90 }}
        />

        <div className="ml-2">
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
        </div>

        <div className="absolute right-0 top-0">
          {user && account.userId === user.userId ? (
            <Button
              size="small"
              variant="contained"
              onClick={handleChangeOpen}
              sx={{ textTransform: "none" }}
            >
              edit
            </Button>
          ) : !isFollowed ? (
            <Button
              size="small"
              variant="contained"
              sx={{ textTransform: "none" }}
              onClick={() => handleFollow(account.userId)}
            >
              follow
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              sx={{ textTransform: "none" }}
              onClick={() => handleCancelFollow(followed && followed.id)}
            >
              followed
            </Button>
          )}
        </div>
      </div>
      <div className="text-lg ml-1 font-bold">
        {account.name}
        <div className="text-zinc-500">{account.handle}</div>
      </div>
      <div className="mb-2 mt-2 ml-2"> {account.description}</div>
      <div className="flex">
        <div className="flex hover:underline cursor-pointer ml-2">
          <div className="mr-1 " onClick={handleSelectFollow}>
            {follows.length != 0 ? follows.length : 0} follows
          </div>
        </div>
        <div className="flex ml-2">
          <div
            className="flex hover:underline cursor-pointer"
            onClick={handleSelectFollower}
          >
            <div className="mr-1 ">
              {followers.length != 0 ? followers.length : 0} followers
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
