import { List, ListItem, ListItemButton, ListItemText, ListItemIcon, Box, Avatar, Divider, Drawer, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import InfoIcon from '@mui/icons-material/Info';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import { FaBook } from "react-icons/fa";
import { useContext } from 'react';
import UserContext from './UserProvider';

export const Sidebar = () => {
    const { user } = useContext(UserContext);
    const items = [{ text: "Community", path: "/posts", icon: <PeopleIcon /> },
    { text: "Search", path: "/book", icon: <SearchIcon /> }, 
    { text: "Analytics", path: "/analytics", icon: <AutoGraphIcon /> }
    ]
    return (
        <div>
            <Drawer
                sx={{
                    [`& .MuiDrawer-paper`]: { width: 200, boxSizing: "border-box" },
                }}
                variant="permanent"
            >
                
                <Stack sx={{ justifyContent: 'space-between' }}>
                    <List dense>
                        {items.map((item) => (
                            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                                <ListItemButton component={Link} to={item.path}>
                                    <ListItemIcon>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    <Divider />
                    <List dense>
                        <ListItem disablePadding sx={{ display: 'block' }}>
                            <ListItemButton component={Link} to={"/information"}>
                                <ListItemIcon > <InfoIcon /></ListItemIcon>
                                <ListItemText primary="About" />
                                
                            </ListItemButton>
                        </ListItem>
                    </List>
                    <Divider />
                    <List dense>
                        <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton component={Link} to={"/mypage"} sx={{ textDecoration: "none" }} >
                            <ListItemIcon ><Avatar src={user.picture} sx={{ width: 22, height: 24 }} /> </ListItemIcon>
                            <ListItemText primary="My page" 
                             />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Stack>
            </Drawer>
        </div>
    )
}