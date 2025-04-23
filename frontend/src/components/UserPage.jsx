import { Profile } from "./Profile";
import { BookShelf } from "./BookShelf";
import { getByHandle } from "../api/account";
import { MyPosts } from "./MyPosts";
import { useState, useEffect } from "react";
import { Divider, Tabs, Tab, Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";

export const UserPage = () => {
  const { handle } = useParams();
  const [user, setUser] = useState();

  const find = async () => {
    const result = await getByHandle(handle);
    setUser(result.data);
  };
  useEffect(() => {
    find();
  }, []);

  const TabPanel = ({ children, value, index }) => {
    return (
      <div hidden={value !== index}>
        {value === index && <Box p={2}>{children}</Box>}
      </div>
    );
  };

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };
  return (
    <div>
      <IconButton component={Link} to="/posts" size="small">
        <ArrowBackIosNewRoundedIcon />
      </IconButton>
      {user && <Profile account={user} />}
      <Divider />
      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="Posts" />
        <Tab label="BookShelf" />
      </Tabs>
      <TabPanel value={tabIndex} index={0}>
        {user && <MyPosts account={user} />}
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        {user && <BookShelf account={user} />}
      </TabPanel>
    </div>
  );
};
