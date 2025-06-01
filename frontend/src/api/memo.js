import axios from "axios";

const url = "http://localhost:8080/api/";

export const getById = (memoId) => {
  return axios.get(url + "memo/id", { params: { memoId } });
};

export const getMemos = (userId) => {
  return axios.get(url + "memo", { params: { userId } });
};

export const registerMemo = (params) => {
  return axios.post(url + "memo", params);
};
