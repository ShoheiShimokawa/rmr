import axios from "axios";

const url = "http://localhost:8080/api/";

export const getProfile = (userId) => {
  return axios.get(url + "account", userId);
};

export const getByHandle = (handle) => {
  return axios.get(url + "account/handle", { params: { handle } });
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
