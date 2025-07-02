import axios from "axios";

const url = process.env.REACT_APP_API_URL;

export const getNotificationAll = (userId) => {
  return axios.get(url + "notification", { params: { userId } });
};

export const markAllAsDone = (userId) => {
  return axios.post(url + "notification", { userId });
};
