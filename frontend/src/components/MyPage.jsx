import { Profile } from "./Profile";
import { BookShelf } from "./BookShelf";
import { MyPosts } from "./MyPosts";

import { useState, useEffect, useContext } from "react";
import {
  Divider,
  Tabs,
  Tab,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import UserContext from "./UserProvider";

export const MyPage = () => {
  const { user } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const TabPanel = ({ children, value, index }) => {
    return (
      <div hidden={value !== index}>
        {value === index && <Box p={1}>{children}</Box>}
      </div>
    );
  };

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };
  return (
    <div>
      <div className="flex">
        <Profile account={user} />
      </div>
      <Divider />
      <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="BookShelf" />
        <Tab label="Posts" />
      </Tabs>
      <TabPanel value={tabIndex} index={0}>
        <BookShelf account={user} />
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <MyPosts account={user} />
      </TabPanel>
    </div>
  );
};
