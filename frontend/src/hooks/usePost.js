import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getGoodPostAll,
  getGooder,
  findPostByBookId,
  good,
  deleteGood,
} from "../api/post";
import { queryKeys } from "../api/queryKeys";

// 他人の操作で頻繁に変わりうる社交的データなので、投稿フィード等より短め
const SOCIAL_STALE_TIME = 1000 * 30;

/** 自分がいいねした投稿のID一覧を返します。(Community.jsxと同じキー・ロジックを共有し、キャッシュを一本化する) */
export const useGoodPostIds = (userId) => {
  return useQuery({
    queryKey: queryKeys.goodPosts(userId),
    queryFn: async () => {
      if (!userId) return [];
      const res = await getGoodPostAll(userId);
      return res.data.map((g) => g.post.postId);
    },
    enabled: !!userId,
  });
};

/** ある投稿にいいねした人達を返します。 */
export const usePostGooders = (postId) => {
  return useQuery({
    queryKey: queryKeys.postGooders(postId),
    queryFn: async () => {
      const result = await getGooder(postId);
      return result.data;
    },
    enabled: !!postId,
    staleTime: SOCIAL_STALE_TIME,
  });
};

/** ある本に紐づく投稿(感想)を返します。 */
export const usePostsByBook = (bookId) => {
  return useQuery({
    queryKey: queryKeys.postsByBook(bookId),
    queryFn: async () => {
      const result = await findPostByBookId(bookId);
      return result.data;
    },
    enabled: !!bookId,
  });
};

/** 投稿にいいねします。 */
export const useGoodMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId }) => good(postId),
    onMutate: async ({ postId, userId }) => {
      const key = queryKeys.goodPosts(userId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old = []) =>
        old.includes(postId) ? old : [...old, postId]
      );
      return { previous, userId };
    },
    onError: (_err, _vars, context) => {
      if (context) queryClient.setQueryData(queryKeys.goodPosts(context.userId), context.previous);
    },
    onSettled: (_result, _err, { postId, userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.postGooders(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.goodPosts(userId) });
    },
  });
};

/** いいねを取り消します。 */
export const useUnGoodMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId }) => deleteGood(postId),
    onMutate: async ({ postId, userId }) => {
      const key = queryKeys.goodPosts(userId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old = []) => old.filter((id) => id !== postId));
      return { previous, userId };
    },
    onError: (_err, _vars, context) => {
      if (context) queryClient.setQueryData(queryKeys.goodPosts(context.userId), context.previous);
    },
    onSettled: (_result, _err, { postId, userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.postGooders(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.goodPosts(userId) });
    },
  });
};
