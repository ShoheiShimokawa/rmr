import http from "./http";

export const getHighlightsByUser = (userId) => {
  return http.get("memo", { params: { userId } });
};

export const getHighlight = (memoId) => {
  return http.get("memo/id", { params: { memoId } });
};

export const registerHighlight = (params) => {
  return http.post("memo", params);
};

export const updateHighlight = (params) => {
  return http.post("memo/update", params);
};

export const deleteHighlight = (memoId) => {
  return http.post("memo/delete", { memoId });
};
