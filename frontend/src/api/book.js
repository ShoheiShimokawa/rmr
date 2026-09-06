import http from "./http";

export const findBooks = (query, country) => {
  return http.get("books", { params: { query, country } });
};

export const registerBook = (params) => {
  return http.post("book", params);
};
