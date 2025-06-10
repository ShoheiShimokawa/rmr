import { Profile } from "./Profile";
import { getPostAllByUser } from "../api/post";
import { BookShelf } from "./book/BookShelf";
import { Post } from "./Post";
import { getByHandle } from "../api/account";
import { useState, useEffect, useCallback } from "react";
import { Divider, Tabs, Tab, Box, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import { useNotify } from "../hooks/NotifyProvider";

export const UserPage = () => {
  const { handle } = useParams();
  const [user, setUser] = useState();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  const find = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getByHandle(handle);
      setUser(result.data);
      const postResult = await getPostAllByUser(
        result.data.userId && result.data.userId
      );

      const sortedPosts = postResult.data.slice().sort((a, b) => {
        const dateA = a.registerDate ? new Date(a.registerDate).getTime() : 0;
        const dateB = b.registerDate ? new Date(b.registerDate).getTime() : 0;
        return dateB - dateA;
      });
      setPosts(sortedPosts);
    } catch (error) {
      notify("Failed to Loading.", "error");
    } finally {
      setLoading(false);
    }
  }, [handle, notify]);
  useEffect(() => {
    find();
  }, [find]);

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
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <CircularProgress />
          </div>
        ) : (
          <>
            {posts.length !== 0 ? (
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
            ) : (
              <div className="font-soft flex justify-center text-zinc-500">
                No Posts yet.
              </div>
            )}
          </>
        )}
      </TabPanel>
    </div>
  );
};
