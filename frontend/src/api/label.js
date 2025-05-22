import axios from "axios";

const url = "http://localhost:8080/api/";

export const getLabels = (userId) => {
  return axios.get(url + "label", { params: { userId } });
};
