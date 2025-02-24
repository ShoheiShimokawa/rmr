import axios from "axios"

const url = "http://localhost:8080/api/";

export const getPostAll = (userId) => {
    return axios.get(url + "post", userId);
}

export const getPostAllByUser = (userId) => {
    return axios.get(url + "post/user", userId);
}

export const getGooder = (postId) => {
    return axios.get(url + "post/good", postId);
}

export const good = (params) => {
    return axios.post(url + "post/good", params);
}
