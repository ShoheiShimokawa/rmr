import { getFollow } from "../api/account";
import { Avatar, Typography,List,ListItem,ListItemText,ListItemAvatar} from "@mui/material";
import { useContext ,useEffect,useState} from "react";

export const Follow =({followerId})=>{
    const [follows,setFollow] =useState([]);
    const find =async()=>{
        const result = await getFollow(followerId);
        setFollow(result.data);
        console.log(result)
    }
    useEffect(() => {
            find();
        }, []);

    return (
        <div>
          {follows.length !==0 ? (
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      {follows.map((follow)=>(
        <ListItem>
        <ListItemAvatar>
          <Avatar src={follow.user.picture && follow.user.picture} /> 
        </ListItemAvatar>
        <ListItemText primary={follow.user.name} secondary={follow.user.handle} />
      </ListItem>
      ))}
      
    </List>
    ) : <div>No follows</div>}
  </div>
    )
}