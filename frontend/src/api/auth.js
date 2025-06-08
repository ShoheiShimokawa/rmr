import axios from "axios";

const url = process.env.REACT_APP_API_URL;

export const login = (token) => {
  return axios.post(url + "auth/google", { token });
};
