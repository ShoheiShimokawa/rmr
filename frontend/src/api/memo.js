import http from "./http";

export const getById = (memoId) => {
  return http.get("memo/id", { params: { memoId } });
};

export const getMemos = (userId) => {
  return http.get("memo", { params: { userId } });
};

export const registerMemo = (params) => {
  return http.post("memo", params);
};
