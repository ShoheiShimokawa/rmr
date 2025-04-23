import {
  getProfile,
  getFollower,
  getFollow,
  follow,
  deleteFollow,
} from "../api/account";
import { Follower } from "../components/Follower";
import { Follow } from "../components/Follow";
import { ProfileChange } from "./ProfileChange";
import { ContributionMap } from "./ContributionMap";
import {
  Avatar,
  Dialog,
  TypographyDialog,
  Button,
  Typography,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
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
    const follow = await getFollow(account && account.userId);
    setFollows(follow.data);
    const result = await getFollower(account && account.userId);
    setFollowers(result.data);
    var isFollowed = result.data.find((v) => v.follower.userId === user.userId);
    isFollowed && setFollowed(isFollowed);
    isFollowed && setIsFollowed(true);
  };
  useEffect(() => {
    find();
  }, []);

  return (
    <div>
      <Dialog onClose={handleChangeClose} open={open}>
        <DialogTitle>profile setting</DialogTitle>
        <DialogContent>
          <ProfileChange account={user} update={handleGetProfile} />
        </DialogContent>
      </Dialog>
      <Dialog onClose={handleCloseFollow} open={showFollow}>
        <DialogTitle>Follows</DialogTitle>
        <DialogContent>
          <Follow followerId={account && account.userId} />
        </DialogContent>
      </Dialog>
      <Dialog onClose={handleCloseFollower} open={showFollower}>
        <DialogTitle>Followers</DialogTitle>
        <DialogContent>
          <Follower userId={account.userId && account.userId} />
        </DialogContent>
      </Dialog>
      <div className="flex" style={{ width: "300px", height: "auto" }}>
        <div className="flex">
          <div className="flex mr-4">
            <Avatar src={account.picture} className="mr-2" />
            <Typography component="h2">
              {account.name}
              <div className="text-zinc-500">{account.handle}</div>
            </Typography>
          </div>
          <div className="h-[50px] ml-6">
            {account.userId === user.userId ? (
              <Button
                size="small"
                variant="contained"
                onClick={handleChangeOpen}
                sx={{ textTransform: "none" }}
              >
                edit
              </Button>
            ) : !isFollowed ? (
              <div>
                <Button
                  size="small"
                  variant="contained"
                  sx={{ textTransform: "none" }}
                  onClick={() => {
                    handleFollow(account.userId);
                  }}
                >
                  follow
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  size="small"
                  variant="contained"
                  sx={{ textTransform: "none" }}
                  onClick={() => {
                    handleCancelFollow(followed && followed.id);
                  }}
                >
                  followed
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mb-2 mt-2"> {account.description}</div>
      <div className="flex">
        <div className="flex hover:underline cursor-pointer">
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
