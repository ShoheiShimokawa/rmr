import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/reading";
import { useCallback } from "react";
import { queryKeys } from "../api/queryKeys";

/** ある本に紐づく全ユーザの読書記録を返します。 */
export const useReadingsByBook = (bookId) => {
  return useQuery({
    queryKey: queryKeys.readingsByBook(bookId),
    queryFn: async () => {
      const result = await api.findReadingById(bookId);
      return result.data;
    },
    enabled: !!bookId,
  });
};

/** ユーザに紐づく全ての読書記録を返します。 */
export const useReadingsByUser = (userId) => {
  return useQuery({
    queryKey: queryKeys.readingsByUser(userId),
    queryFn: async () => {
      const result = await api.findReadingByUser(userId);
      return result.data;
    },
    enabled: !!userId,
  });
};

export const useReading = () => {
  const queryClient = useQueryClient();

  const getByUserIdAndBookId = useCallback(async (userId, bookId) => {
    return await api.getByUserIdAndBookId(userId, bookId);
  }, []);
  const findReadingById = useCallback(async (id) => {
    return await api.findReadingById(id);
  }, []);
  const findReadingByUser = useCallback(async (userId) => {
    return await api.findReadingByUser(userId);
  }, []);

  const getReading = useCallback(async (bookId) => {
    return await api.getReading(bookId);
  }, []);

  const registerReading = useCallback(
    async (params, { sourceId } = {}) => {
      const result = await api.registerReading(params);
      queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.readingsByBook(params.bookId),
      });
      if (sourceId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.readingsByBook(sourceId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.postsByBook(sourceId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.readingsByUser(params.userId),
      });
      return result;
    },
    [queryClient]
  );

  const updateReading = useCallback(
    async (params, { sourceId } = {}) => {
      const result = await api.updateReading(params);
      queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.readingsByBook(params.bookId),
      });
      if (sourceId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.readingsByBook(sourceId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.postsByBook(sourceId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.readingsByUser(params.userId),
      });
      return result;
    },
    [queryClient]
  );

  // readingId単体の操作は対象のbookId/userIdを呼び出し元から渡してもらい、
  // 該当するキャッシュだけを無効化する(渡されなければキャッシュは無効化しない)。
  const toDoing = useCallback(
    async (readingId, { bookId, userId } = {}) => {
      const result = await api.toDoing(readingId);
      if (bookId) queryClient.invalidateQueries({ queryKey: queryKeys.readingsByBook(bookId) });
      if (userId) queryClient.invalidateQueries({ queryKey: queryKeys.readingsByUser(userId) });
      return result;
    },
    [queryClient]
  );

  const deleteReading = useCallback(
    async (readingId, { bookId, userId } = {}) => {
      const result = await api.deleteReading(readingId);
      if (bookId) queryClient.invalidateQueries({ queryKey: queryKeys.readingsByBook(bookId) });
      if (userId) queryClient.invalidateQueries({ queryKey: queryKeys.readingsByUser(userId) });
      return result;
    },
    [queryClient]
  );

  const getMonthlyData = useCallback(async (userId) => {
    return await api.getMonthlyData(userId);
  }, []);
  return {
    registerReading,
    getByUserIdAndBookId,
    findReadingById,
    findReadingByUser,
    getReading,
    updateReading,
    toDoing,
    deleteReading,
    getMonthlyData,
  };
};
