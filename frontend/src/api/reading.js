import axios from "axios"

const url = "http://localhost:8080/api/";

// export const findReadings = () => {
//     return axios.get(url + "reading/book");
// }
export const findReadingByUser = (userId) => {
    return axios.get(url + "reading", { params: { userId } });
}


export const getReading = (bookId) => {
    return axios.get(url + "reading/book", { params: { bookId } });
}

export const registerReading = (params) => {
    return axios.post(url + "reading", params);
}

export const updateReading = (params) => {
    return axios.post(url + "reading/update", params);
}

export const toDoing = (readingId) => {
    return axios.post(url + "reading/doing", { readingId })
}

export const deleteReading = (readingId) => {
    return axios.post(url + "reading/delete", { readingId });
}

export const getMonthlyData = (userId) => {
    return axios.get(url + "analytics", { params: { userId } })
}