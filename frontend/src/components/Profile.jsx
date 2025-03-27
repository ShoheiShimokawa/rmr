import { getProfile, getFollower,getFollow } from "../api/account";
import {Follower} from "../components/Follower";
import {Follow} from "../components/Follow";
import { Avatar, Dialog,TypographyDialog,Typography,DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import { useContext ,useEffect,useState} from "react";
import UserContext from './UserProvider';

export const Profile = ({account}) => {
    const [follower,setFollower]=useState([]);
    const [follow,setFollow]=useState([]);
    const [showFollow,setShowFollow]=useState(false);
    const [showFollower,setShowFollower]=useState(false);

const handleSelectFollow =()=>{
    setShowFollow(true);
}
const handleCloseFollow =()=>{
    setShowFollow(false)
}
const handleSelectFollower =()=>{
    setShowFollower(true);
}
const handleCloseFollower =()=>{
    setShowFollower(false);
}

    const find =async ()=>{
        const follow=await getFollow(account.userId);
        setFollow(follow.data);
        const follower = await getFollower(account.userId);
        setFollower(follower.data);
    }
    useEffect(()=>{
        find();
    },[]);

    return (
        <div>
             <Dialog onClose={handleCloseFollow} open={showFollow}>
             <DialogTitle>Follows</DialogTitle>
              <DialogContent>
                <Follow followerId={account.userId}/>
              </DialogContent>
             </Dialog>
             <Dialog onClose={handleCloseFollower} open={showFollower}>
             <DialogTitle>Followers</DialogTitle>
              <DialogContent>
                <Follower userId={account.userId}/>
              </DialogContent>
             </Dialog>
            <div className="flex">
                <Avatar src={account.picture} className="mr-2"/>
                <Typography  component="h2">
                    {account.name}
                    <div className="text-zinc-500">{account.handle}</div>
                </Typography>
            </div>
            <div className="mb-2 mt-2"> {account.description}</div>
            <div className="flex">
                <div className="flex">
                 <div className="mr-1 hover:underline cursor-pointer" onClick={handleSelectFollow}  >
                {follow.length!=0 ? follow.length : 0} </div>
                <div>follows</div>
                </div>
                <div className="flex ml-2">
                <div className="flex">
                    <div className="mr-1 hover:underline cursor-pointer" onClick={handleSelectFollower}>
                    {follower.length!=0 ? follower.length : 0}</div> 
                    <div>followers</div>
                </div>
            </div>
        </div></div>
    )
};