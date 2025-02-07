import axios from "axios"

const url = "http://localhost:8080/api/";

export const login = (token) => {
    return axios.post(url + "auth/google", { token });
}