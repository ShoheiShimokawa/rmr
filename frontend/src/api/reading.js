import axios from "axios";

const url = process.env.REACT_APP_API_URL;

export const getByUserIdAndBookId = (userId, bookId) => {
  return axios.get(url + "reading/book/user", { params: { userId, bookId } });
};
export const findReadingById = (id) => {
  return axios.get(url + "reading/id/book", { params: { id } });
};
export const findReadingByUser = (userId) => {
  return axios.get(url + "reading", { params: { userId } });
};

export const getReading = (bookId) => {
  return axios.get(url + "reading/book", { params: { bookId } });
};

export const registerReading = (params) => {
  return axios.post(url + "reading", params);
};

export const updateReading = (params) => {
  return axios.post(url + "reading/update", params);
};

export const toDoing = (readingId) => {
  return axios.post(url + "reading/doing", { readingId });
};

export const deleteReading = (readingId) => {
  return axios.post(url + "reading/delete", { readingId });
};

export const getMonthlyData = (userId) => {
  return axios.get(url + "analytics", { params: { userId } });
};
