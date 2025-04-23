import axios from "axios";

const url = "http://localhost:8080/api/";

export const getPostAll = (userId) => {
  return axios.get(url + "post", userId);
};

export const getPostAllByUser = (userId) => {
  return axios.get(url + "post/user", { params: { userId } });
};

export const getPostRecord = (userId) => {
  return axios.get(url + "post/record", { params: { userId } });
};

export const getGooder = (postId) => {
  return axios.get(url + "post/good", { params: { postId } });
};

export const getGoodPostAll = (userId) => {
  return axios.get(url + "post/good/user", { params: { userId } });
};

export const good = (params) => {
  return axios.post(url + "post/good", params);
};

export const deleteGood = (goodId) => {
  return axios.post(url + "post/good/delete", goodId);
};
