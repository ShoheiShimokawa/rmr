import { useContext, useEffect, useState, useCallback } from "react";
import { getPostAll } from "../api/post";
import { Post } from "./Post";
import { debounce } from "lodash";
import { Skeleton } from "@mui/material";
import { useNotify } from "../hooks/NotifyProvider";
import UserContext from "./UserProvider";
import { getGoodPostAll } from "../api/post";
import { Divider, Button } from "@mui/material";

export const Community = ({}) => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const { user } = useContext(UserContext);
  const { notify } = useNotify();
  const [goodPostIds, setGoodPostIds] = useState([]);

  const find = async () => {
    setLoading(true);
    const result = await getPostAll();
    const sortedPosts = result.data.slice().sort((a, b) => {
      return new Date(b.registerDate) - new Date(a.registerDate);
    });
    setPosts(sortedPosts);
    const goodList = await getGoodPostAll(user && user.userId);
    const likedIds = goodList.data.map((g) => g.post.postId);
    console.log(goodList.data);
    setGoodPostIds(likedIds);
    setLoading(false);
  };

  useEffect(() => {
    find();
  }, []);
  return (
    <div>
      <div className="container space-y-1 w-xl">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="mb-6">
                <div className="flex items-start gap-4">
                  <Skeleton variant="circular" width={40} height={40} />
                  <div className="flex-1 space-y-1 mb-2">
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={20} />
                    <div className="flex ">
                      <Skeleton variant="rounded" width={95} height={130} />
                      <div className="flex-1 gap-3 ml-2 ">
                        <Skeleton variant="text" width="70%" height={20} />
                        <Skeleton variant="text" width="30%" height={20} />
                      </div>
                    </div>
                  </div>
                </div>
                <Divider className="mt-4" />
              </div>
            ))
          : posts.length > 0 &&
            posts.map((post) => (
              <div key={post.postId}>
                <Post
                  post={post}
                  visible={true}
                  isInitiallyGooded={goodPostIds.includes(post.postId)}
                />
                <Divider />
              </div>
            ))}
      </div>
    </div>
  );
};
