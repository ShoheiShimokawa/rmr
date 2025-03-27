import {Profile} from "./Profile";
import {BookShelf} from "./BookShelf";
import {MyPosts} from "./MyPosts";
import { useState, useEffect } from "react";
import {Divider,Tabs, Tab, Box } from '@mui/material';

export const UserPage =(account)=>{
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
    return(
        <div>
            <Profile account={account}/>
            <Divider />
            <Tabs value={tabIndex} onChange={handleTabChange} centered>
        <Tab label="Posts"  />
        <Tab label="BookShelf" />
      </Tabs>
      <TabPanel value={tabIndex} index={0}  >
      <MyPosts />
      </TabPanel>
      <TabPanel value={tabIndex} index={1}  >
      <BookShelf />
      </TabPanel>
        </div>
    );
};