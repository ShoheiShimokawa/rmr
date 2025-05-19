import axios from "axios";

const url = "http://localhost:8080/api/";

export const getMemos = (userId) => {
  return axios.get(url + "memo", { params: { userId } });
};
