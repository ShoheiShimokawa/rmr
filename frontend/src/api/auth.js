import http from "./http";

export const login = (token) => {
  return http.post("auth/google", { token });
};
