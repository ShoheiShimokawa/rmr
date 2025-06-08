import axios from "axios";

const url = process.env.REACT_APP_API_URL;

export const getLabels = (userId) => {
  return axios.get(url + "label", { params: { userId } });
};
