import { useContext, useEffect } from "react";
import { getPostAll } from "../api/post";
import { Post } from "./Post";
import { Skeleton, Box } from "@mui/material";
import { useNotify } from "../hooks/NotifyProvider";
import UserContext from "./UserProvider";
import { Divider } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useGoodPostIds } from "../hooks/usePost";
import { queryKeys } from "../api/queryKeys";

export const Community = () => {
  const { user } = useContext(UserContext);
  const { notify } = useNotify();

  const {
    data: posts,
    isLoading: loadingPosts,
    isError: isPostsError,
  } = useQuery({
    queryKey: queryKeys.posts(),
    queryFn: async () => {
      const result = await getPostAll();
      const sorted = result.data
        .slice()
        .sort((a, b) => new Date(b.registerDate) - new Date(a.registerDate));
      return sorted.filter(
        (post) =>
          post.postType === "WITH_THOUGHTS" || post.postType === "RECOMMENDED"
      );
    },
  });

  const { isLoading: loadingGood, isError: isGoodError } = useGoodPostIds(
    user?.userId
  );

  useEffect(() => {
    if (isPostsError || isGoodError) {
      notify("Failed to load.Please try later.", "error");
    }
  }, [isPostsError, isGoodError, notify]);

  const isLoading = loadingPosts || (user && loadingGood);
  return (
    <div>
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: 1,
          p: 2,
        }}
      >
        <div className="container space-y-1 w-xl">
          {isLoading
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
                  <Post post={post} visible={true} />
                  <Divider />
                </div>
              ))}
        </div>
      </Box>
    </div>
  );
};
