import http from "./http";

export const getByUserIdAndBookId = (userId, bookId) => {
  return http.get("reading/book/user", { params: { userId, bookId } });
};
export const findReadingById = (id, isbn) => {
  return http.get("reading/id/book", { params: { id, isbn } });
};
export const findReadingByUser = (userId) => {
  return http.get("reading", { params: { userId } });
};

export const getReading = (bookId) => {
  return http.get("reading/book", { params: { bookId } });
};

export const registerReading = (params) => {
  return http.post("reading", params);
};

export const updateReading = (params) => {
  return http.post("reading/update", params);
};

export const toDoing = (readingId) => {
  return http.post("reading/doing", { readingId });
};

export const deleteReading = (readingId) => {
  return http.post("reading/delete", { readingId });
};

export const getMonthlyData = (userId) => {
  return http.get("analytics", { params: { userId } });
};
