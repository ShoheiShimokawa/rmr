import axios from "axios"

const url = "http://localhost:8080/api/";

export const getProfile = (userId) => {
    return axios.get(url + "account", userId);
}

export const getFollower = (userId) => {
    return axios.get(url + "account/follow", userId);
}

export const follow = (params) => {
    return axios.post(url + "account/follow", params);
}