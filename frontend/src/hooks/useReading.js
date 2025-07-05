import { useQueryClient } from "@tanstack/react-query";
import * as api from "../api/reading";
import { useCallback } from "react";

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
    async (params) => {
      const result = await api.registerReading(params);
      queryClient.invalidateQueries(["posts"]);
      return result;
    },
    [queryClient]
  );

  const updateReading = useCallback(
    async (params) => {
      const result = await api.updateReading(params);
      queryClient.invalidateQueries(["posts"]);
      return result;
    },
    [queryClient]
  );

  const toDoing = useCallback(async (readingId) => {
    return await api.toDoing(readingId);
  }, []);

  const deleteReading = useCallback(async (readingId) => {
    return await api.deleteReading(readingId);
  }, []);

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
