import axios from "axios";

const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// ログイン済みなら Authorization ヘッダにトークンを付与する
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// トークンが無効・期限切れの場合はローカルの認証状態をクリアする
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default http;
