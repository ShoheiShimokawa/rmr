import { Profile } from "./Profile";
import { getPostAllByUser, getGoodPostAll } from "../api/post";
import { BookShelf } from "./book/BookShelf";
import { Post } from "./Post";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { getByHandle } from "../api/account";
import { useState, useEffect, useCallback } from "react";
import { Divider, Tabs, Tab, Box, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import { useNotify } from "../hooks/NotifyProvider";
import { motion } from "framer-motion";

export const UserPage = () => {
  const { handle } = useParams();
  const [account, setAccount] = useState();
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [goodPostIds, setGoodPostIds] = useState([]);
  const { notify } = useNotify();

  const find = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getByHandle(handle);
      setAccount(result.data);
      const postResult = await getPostAllByUser(
        result.data.userId && result.data.userId
      );

      const sortedPosts = postResult.data.slice().sort((a, b) => {
        const dateA = a.registerDate ? new Date(a.registerDate).getTime() : 0;
        const dateB = b.registerDate ? new Date(b.registerDate).getTime() : 0;
        return dateB - dateA;
      });
      setPosts(sortedPosts);
      if (user) {
        const goodList = await getGoodPostAll(user.userId);
        const likedIds = goodList.data.map((g) => g.post.postId);
        setGoodPostIds(likedIds);
      }
    } catch (error) {
      notify("Failed to Loading.", "error");
    } finally {
      setLoading(false);
    }
  }, [handle, notify, user]);
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            boxShadow: 1,
            p: 2,
          }}
        >
          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <CircularProgress size={28} />
            </div>
          ) : (
            <>
              {account && <Profile userId={account.userId} />}
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
                {account && <BookShelf account={account && account} />}
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
                              <Post
                                post={post}
                                visible={true}
                                isInitiallyGooded={goodPostIds.includes(
                                  post.postId
                                )}
                              />
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
            </>
          )}
        </Box>
      </motion.div>
    </div>
  );
};
