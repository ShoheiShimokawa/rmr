import http from "./http";

export const getPostAll = () => {
  return http.get("post");
};

export const findPostByBookId = (id) => {
  return http.get("post/book/id", { params: { id } });
};

export const getPostAllByUser = (userId) => {
  return http.get("post/user", { params: { userId } });
};

export const getPostRecord = (userId) => {
  return http.get("post/record", { params: { userId } });
};

export const getGooder = (postId) => {
  return http.get("post/good", { params: { postId } });
};

export const getGoodPostAll = (userId) => {
  return http.get("post/good/user", { params: { userId } });
};

// いいねした本人(userId)は認証トークンからサーバ側で復元されるため、postIdだけを送る
export const good = (postId) => {
  return http.post("post/good", { postId });
};

export const deleteGood = (postId) => {
  return http.post("post/good/delete", { postId });
};
