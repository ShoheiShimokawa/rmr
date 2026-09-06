import http from "./http";

export const getProfile = (userId) => {
  return http.get("account", { params: { userId } });
};

export const getByHandle = (handle) => {
  return http.get("account/handle", { params: { handle } });
};

export const registerAccount = (params) => {
  return http.post("account/register", params);
};

export const getFollower = (userId) => {
  return http.get("account/follower", { params: { userId } });
};
export const getFollow = (followerId) => {
  return http.get("account/follow", { params: { followerId } });
};

// フォローする本人(followerId)は認証トークンからサーバ側で復元されるため、targetのuserIdだけを送る
export const follow = (userId) => {
  return http.post("account/follow", { userId });
};

export const deleteFollow = (id) => {
  return http.post("account/follow/delete", { id });
};
export const updateProfile = (params) => {
  return http.post("account/update", params);
};
