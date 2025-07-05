import axios from "axios";

const url = process.env.REACT_APP_API_URL;

export const findBooks = (query, country) => {
  return axios.get(url + "books", { params: { query, country } });
};

export const registerBook = (params) => {
  return axios.post(url + "book", params);
};
