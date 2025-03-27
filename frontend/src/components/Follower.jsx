import { getFollower,getFollow } from "../api/account";
import { Avatar, Typography,List,ListItem,ListItemText,ListItemAvatar} from "@mui/material";
import { useContext ,useEffect,useState} from "react";

export const Follower =({userId})=>{
    const [followers,setFollowers] =useState([]);
    const find =async()=>{
        const result = await getFollower(userId);
        setFollowers(result.data);
    }
    useEffect(() => {
      find();
  }, []);
    return (
        <div>
           {followers.length !==0 ? (
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
    {followers.map((follower)=>(
      <ListItem>
        <ListItemAvatar>
          <Avatar src={follower.follower.picture && follower.follower.picture} />
        </ListItemAvatar>
        <ListItemText primary={follower.follower.name} secondary={follower.follower.handle} />
      </ListItem>
      ))}
    </List>
    ) : <div>No followers</div>}
        </div>
    )
}