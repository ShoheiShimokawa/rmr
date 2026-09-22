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

export const getAnalytics = (userId, zone) => {
  return http.get("analytics", { params: { userId, zone } });
};

// 下書きの本人(userId)は認証トークンからサーバ側で復元されるため送らない
export const findReadingDrafts = () => {
  return http.get("reading/draft");
};

export const saveReadingDraft = (params) => {
  return http.post("reading/draft", params);
};

export const deleteReadingDraft = (bookId) => {
  return http.post("reading/draft/delete", { bookId });
};
