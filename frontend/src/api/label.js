import http from "./http";

export const getLabels = (userId) => {
  return http.get("label", { params: { userId } });
};
