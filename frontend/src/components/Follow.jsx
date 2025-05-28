import { getFollow } from "../api/account";
import { CustomDialog } from "../ui/CustomDialog";
import { Profile } from "../components/Profile";
import {
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";

export const Follow = ({ followerId }) => {
  const [follows, setFollow] = useState([]);
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState();

  const handleSelectUser = (selectedUser) => {
    setSelectedUser(selectedUser);
    handleOpenProfile();
  };

  const handleOpenProfile = () => {
    setOpenProfile(true);
  };

  const handleCloseProfile = () => {
    setOpenProfile(false);
  };
  const find = async () => {
    const result = await getFollow(followerId);
    setFollow(result.data);
    console.log(result);
  };
  useEffect(() => {
    find();
  }, []);

  return (
    <div>
      <CustomDialog
        open={openProfile}
        title="profile"
        onClose={handleCloseProfile}
      >
        <Profile account={selectedUser} />
      </CustomDialog>
      {follows.length !== 0 ? (
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        >
          {follows.map((follow) => (
            <ListItem onClick={() => handleSelectUser(follow)}>
              <ListItemAvatar>
                <Avatar src={follow.user.picture && follow.user.picture} />
              </ListItemAvatar>
              <ListItemText
                primary={follow.user.name}
                secondary={follow.user.handle}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <div>No follows</div>
      )}
    </div>
  );
};
