import { getProfile, getFollower, getFollow } from "../api/account";
import { Follower } from "../components/Follower";
import { Follow } from "../components/Follow";
import { ProfileChange } from "./ProfileChange";
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
  const { user } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [follower, setFollower] = useState([]);
  const [follow, setFollow] = useState([]);
  const [showFollow, setShowFollow] = useState(false);
  const [showFollower, setShowFollower] = useState(false);

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

  const find = async () => {
    const follow = await getFollow(account && account.userId);
    setFollow(follow.data);
    const follower = await getFollower(account && account.userId);
    setFollower(follower.data);
  };
  useEffect(() => {
    find();
  }, []);

  return (
    <div>
      <Dialog onClose={handleChangeClose} open={open}>
        <DialogTitle>profile setting</DialogTitle>
        <DialogContent>
          <ProfileChange account={user} />
        </DialogContent>
      </Dialog>
      <Dialog onClose={handleCloseFollow} open={showFollow}>
        <DialogTitle>Follows</DialogTitle>
        <DialogContent>
          <Follow followerId={account.userId && account.userId} />
        </DialogContent>
      </Dialog>
      <Dialog onClose={handleCloseFollower} open={showFollower}>
        <DialogTitle>Followers</DialogTitle>
        <DialogContent>
          <Follower userId={account.userId && account.userId} />
        </DialogContent>
      </Dialog>
      <div className="flex">
        <div className="flex">
          <div className="flex mr-4">
            <Avatar src={account.picture} className="mr-2" />
            <Typography component="h2">
              {account.name}
              <div className="text-zinc-500">{account.handle}</div>
            </Typography>
          </div>
          {account.userId === user.userId && (
            <Button size="small" variant="contained" onClick={handleChangeOpen}>
              edit
            </Button>
          )}
        </div>
      </div>
      <div className="mb-2 mt-2"> {account.description}</div>
      <div className="flex">
        <div className="flex">
          <div
            className="mr-1 hover:underline cursor-pointer"
            onClick={handleSelectFollow}
          >
            {follow.length != 0 ? follow.length : 0}{" "}
          </div>
          <div>follows</div>
        </div>
        <div className="flex ml-2">
          <div className="flex">
            <div
              className="mr-1 hover:underline cursor-pointer"
              onClick={handleSelectFollower}
            >
              {follower.length != 0 ? follower.length : 0}
            </div>
            <div>followers</div>
          </div>
        </div>
      </div>
    </div>
  );
};
