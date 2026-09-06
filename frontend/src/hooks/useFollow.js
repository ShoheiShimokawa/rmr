import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getFollower, getFollow, follow, deleteFollow } from "../api/account";
import { queryKeys } from "../api/queryKeys";

// 他人の操作で頻繁に変わりうる社交的データなので、投稿フィード等より短め
const STALE_TIME = 1000 * 30;

/** userIdをフォローしている人達(フォロワー)を返します。 */
export const useFollowers = (userId) => {
  return useQuery({
    queryKey: queryKeys.followers(userId),
    queryFn: async () => {
      const result = await getFollower(userId);
      return result.data;
    },
    enabled: !!userId,
    staleTime: STALE_TIME,
  });
};

/** followerIdがフォローしている人達を返します。 */
export const useFollows = (followerId) => {
  return useQuery({
    queryKey: queryKeys.follows(followerId),
    queryFn: async () => {
      const result = await getFollow(followerId);
      return result.data;
    },
    enabled: !!followerId,
    staleTime: STALE_TIME,
  });
};

/**
 * targetUserIdをフォローします。
 * `currentUser`はUserContextの自分のアカウント情報一式(楽観的にリストへ差し込む表示用)。
 */
export const useFollowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ targetUserId }) => follow(targetUserId),
    onMutate: async ({ targetUserId, currentUser }) => {
      const key = queryKeys.followers(targetUserId);
      await queryClient.cancelQueries({ queryKey: key });
      const previousFollowers = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old = []) => {
        if (old.some((f) => f.follower.userId === currentUser.userId)) return old;
        return [
          ...old,
          {
            id: `optimistic-${currentUser.userId}`,
            follower: currentUser,
            statusType: "VALID",
          },
        ];
      });
      return { previousFollowers, targetUserId };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(
          queryKeys.followers(context.targetUserId),
          context.previousFollowers
        );
      }
    },
    onSettled: (_result, _err, { targetUserId, currentUserId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.followers(targetUserId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.follows(currentUserId) });
    },
  });
};

/** フォローを解除します。 */
export const useUnfollowMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => deleteFollow(id),
    onMutate: async ({ id, targetUserId }) => {
      const key = queryKeys.followers(targetUserId);
      await queryClient.cancelQueries({ queryKey: key });
      const previousFollowers = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old = []) => old.filter((f) => f.id !== id));
      return { previousFollowers, targetUserId };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(
          queryKeys.followers(context.targetUserId),
          context.previousFollowers
        );
      }
    },
    onSettled: (_result, _err, { targetUserId, currentUserId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.followers(targetUserId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.follows(currentUserId) });
    },
  });
};
