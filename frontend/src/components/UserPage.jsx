import { Profile } from "./Profile";
import { getPostAllByUser } from "../api/post";
import { BookShelf } from "./book/BookShelf";
import { GiBookshelf } from "react-icons/gi";
import { Post } from "./Post";
import { getByHandle } from "../api/account";
import { useState, useEffect } from "react";
import { Divider, Tabs, Tab, Box, ListItem, List } from "@mui/material";
import { useParams } from "react-router-dom";

export const UserPage = () => {
  const { handle } = useParams();
  const [user, setUser] = useState();
  const [posts, setPosts] = useState([]);

  const find = async () => {
    const result = await getByHandle(handle);
    setUser(result.data);
    const postResult = await getPostAllByUser(
      result.data.userId && result.data.userId
    );
    const sortedPosts = postResult.data.slice().sort((a, b) => {
      return new Date(b.registerDate) - new Date(a.registerDate);
    });
    setPosts(sortedPosts);
  };
  useEffect(() => {
    find();
  }, [handle]);

  const TabPanel = ({ children, value, index }) => {
    return (
      <div hidden={value !== index}>
        {value === index && <Box p={1}>{children}</Box>}
      </div>
    );
  };

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };
  return (
    <div>
      {user && <Profile userId={user.userId} />}
      <Divider />
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        className="mb-4"
        textColor="inherit"
        TabIndicatorProps={{ style: { backgroundColor: "black" } }}
      >
        <Tab
          label="BookShelf"
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            fontFamily: "'Nunito sans'",
          }}
        />
        <Tab
          label="Posts"
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            fontFamily: "'Nunito sans'",
          }}
        />
      </Tabs>
      <TabPanel value={tabIndex} index={0}>
        {user && <BookShelf account={user && user} />}
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        {posts.length !== 0 && (
          <div className="space-y-1">
            <>
              {posts.map((post) => (
                <>
                  <Post post={post} visible={true} />
                  {posts.length > 1 && <Divider />}
                </>
              ))}
            </>
          </div>
        )}
      </TabPanel>
    </div>
  );
};
