import { useCallback, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/memo";
import { queryKeys } from "../api/queryKeys";
import UserContext from "../components/UserProvider";

/** 指定ユーザのハイライト一覧を返す。本人には全件、それ以外には公開分のみが返る。 */
export const useHighlightsByUser = (userId) => {
  const { user } = useContext(UserContext);
  const viewerId = user?.userId ?? null;
  return useQuery({
    queryKey: queryKeys.highlightsByUser(userId, viewerId),
    queryFn: async () => {
      const result = await api.getHighlightsByUser(userId);
      return result.data;
    },
    enabled: !!userId,
  });
};

/** ログイン中のユーザ自身のハイライト一覧を返す。 */
export const useMyHighlights = () => {
  const { user } = useContext(UserContext);
  return useHighlightsByUser(user?.userId);
};

/** ハイライトを1件返す。非公開かつ本人以外の場合は404になる。 */
export const useHighlight = (memoId) => {
  const { user } = useContext(UserContext);
  const viewerId = user?.userId ?? null;
  return useQuery({
    queryKey: queryKeys.highlight(memoId, viewerId),
    queryFn: async () => {
      const result = await api.getHighlight(memoId);
      return result.data;
    },
    enabled: !!memoId,
    retry: false,
  });
};

/** ハイライトの作成・更新・削除と、関連キャッシュの無効化をまとめて行う。 */
export const useHighlightMutations = () => {
  const queryClient = useQueryClient();

  const invalidateForOwner = useCallback(
    (ownerId) => {
      if (!ownerId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.highlightsByUserAll(ownerId) });
    },
    [queryClient]
  );

  const createHighlight = useCallback(
    async (params, { ownerId } = {}) => {
      const result = await api.registerHighlight(params);
      invalidateForOwner(ownerId);
      return result;
    },
    [invalidateForOwner]
  );

  const updateHighlight = useCallback(
    async (params, { ownerId } = {}) => {
      const result = await api.updateHighlight(params);
      invalidateForOwner(ownerId);
      queryClient.invalidateQueries({ queryKey: queryKeys.highlightAll(params.memoId) });
      return result;
    },
    [invalidateForOwner, queryClient]
  );

  const deleteHighlight = useCallback(
    async (memoId, { ownerId } = {}) => {
      const result = await api.deleteHighlight(memoId);
      invalidateForOwner(ownerId);
      queryClient.removeQueries({ queryKey: queryKeys.highlightAll(memoId) });
      return result;
    },
    [invalidateForOwner, queryClient]
  );

  return { createHighlight, updateHighlight, deleteHighlight };
};
