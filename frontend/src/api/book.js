import http from "./http";

export const findBooks = (query, country, langRestrict) => {
  return http.get("books", { params: { query, country, langRestrict } });
};

export const registerBook = (params) => {
  return http.post("book", params);
};
