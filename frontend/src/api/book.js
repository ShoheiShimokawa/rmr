import axios from "axios"

const url = "http://localhost:8080/api/";

export const findBooks = (query) => {
    return axios.get(url + "books", { params: { query } });
}

export const registerBook = (params) => {
    return axios.post(url + "book", params);
}

