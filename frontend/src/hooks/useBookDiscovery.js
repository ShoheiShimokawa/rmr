import { useQuery } from "@tanstack/react-query";
import * as api from "../api/book";
import { queryKeys } from "../api/queryKeys";

// 発見セクションは全ユーザー共通の集計(フォロー中の本以外)で、頻繁には変わらない
const STALE_TIME = 10 * 60 * 1000;

/** ★とRecommendのベイズ平均で評価の高い本を返す。 */
export const useTopRatedBooks = () => {
  return useQuery({
    queryKey: queryKeys.topRatedBooks(),
    queryFn: async ({ signal }) => {
      const result = await api.getTopRatedBooks({ signal });
      return result.data.items || [];
    },
    staleTime: STALE_TIME,
  });
};

/** 直近のアクティビティを重視した、今読まれている本を返す。 */
export const usePopularBooks = () => {
  return useQuery({
    queryKey: queryKeys.popularBooks(),
    queryFn: async ({ signal }) => {
      const result = await api.getPopularBooks({ signal });
      return result.data.items || [];
    },
    staleTime: STALE_TIME,
  });
};

/** フォロー中の人が最近読んでいる本を返す。viewerIdが無ければ(未ログイン)リクエストしない。 */
export const useFollowingBooks = (viewerId) => {
  return useQuery({
    queryKey: queryKeys.followingBooks(viewerId),
    queryFn: async ({ signal }) => {
      const result = await api.getFollowingBooks({ signal });
      return result.data.items || [];
    },
    enabled: !!viewerId,
    staleTime: 60 * 1000,
  });
};
