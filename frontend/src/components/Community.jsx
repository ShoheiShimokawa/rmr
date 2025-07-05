import { useContext } from "react";
import { getPostAll, getGoodPostAll } from "../api/post";
import { Post } from "./Post";
import { Skeleton, Box } from "@mui/material";
import { useNotify } from "../hooks/NotifyProvider";
import UserContext from "./UserProvider";
import { Divider } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

export const Community = () => {
  const { user } = useContext(UserContext);
  const { notify } = useNotify();

  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ["posts"],
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
    staleTime: 1000 * 60 * 5,
    onError: () => notify("Failed to load.Please try later.", "error"),
  });

  const { data: goodPostIds = [], isLoading: loadingGood } = useQuery({
    queryKey: ["goodPosts", user?.userId],
    queryFn: async () => {
      if (!user) return [];
      const res = await getGoodPostAll(user.userId);
      return res.data.map((g) => g.post.postId);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    onError: () => notify("Failed to load.Please try later.", "error"),
  });

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
                  <Post
                    post={post}
                    visible={true}
                    isInitiallyGooded={goodPostIds.includes(post.postId)}
                  />
                  <Divider />
                </div>
              ))}
        </div>
      </Box>
    </div>
  );
};
