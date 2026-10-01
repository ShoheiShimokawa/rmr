import http from "./http";

export const findBooks = (query, country, langRestrict) => {
  return http.get("books", { params: { query, country, langRestrict } });
};

export const registerBook = (params) => {
  return http.post("book", params);
};

// RMRに登録済みの本のタイトル・著者から予測変換候補を取得する(外部APIは呼ばない)。
export const suggestBooks = (query, { signal } = {}) => {
  return http.get("books/suggest", { params: { query }, signal });
};

// ★とRecommendのベイズ平均で評価の高い本を返す。
export const getTopRatedBooks = ({ signal } = {}) => {
  return http.get("books/top-rated", { signal });
};

// 直近のアクティビティを重視した、今読まれている本を返す。
export const getPopularBooks = ({ signal } = {}) => {
  return http.get("books/popular", { signal });
};

// フォロー中の人が最近読んでいる本を返す(未ログインなら空)。
export const getFollowingBooks = ({ signal } = {}) => {
  return http.get("books/following", { signal });
};
