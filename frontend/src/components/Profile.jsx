import { getProfile, getFollower } from "../api/account";
import { getPostAllByUser } from "../api/post";
import { Avatar, Typography } from "@mui/material";
import { useContext } from "react";
import UserContext from './UserProvider';

export const Profile = () => {
    const { user } = useContext(UserContext);

    return (
        <div>
            <div>
                <Avatar src={user.picture} />
                <Typography variant="h1" component="h2">
                    {user.name}
                </Typography>
            </div>
            <div>
                <Typography></Typography>
            </div>
        </div>
    )
};