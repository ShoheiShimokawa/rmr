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
