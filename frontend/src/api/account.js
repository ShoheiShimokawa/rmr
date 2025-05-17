import axios from "axios";

const url = "http://localhost:8080/api/";

export const getProfile = (userId) => {
  return axios.get(url + "account", { params: { userId } });
};

export const getByHandle = (handle) => {
  return axios.get(url + "account/handle", { params: { handle } });
};

export const registerAccount = (params) => {
  return axios.post(url + "account/register", params);
};

export const getFollower = (userId) => {
  return axios.get(url + "account/follower", { params: { userId } });
};
export const getFollow = (followerId) => {
  return axios.get(url + "account/follow", { params: { followerId } });
};

export const follow = (params) => {
  return axios.post(url + "account/follow", params);
};

export const deleteFollow = (id) => {
  return axios.post(url + "account/follow/delete", { id });
};
export const updateProfile = (params) => {
  return axios.post(url + "account/update", params);
};
