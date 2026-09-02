import http from "./http";

// 通知は本人専用。userIdは認証トークンからサーバ側で復元される。
export const getNotificationAll = () => {
  return http.get("notification");
};

export const markAllAsDone = () => {
  return http.post("notification");
};
