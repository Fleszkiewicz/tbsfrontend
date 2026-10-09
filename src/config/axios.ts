import axios from "axios";
import { isTokenNearExpiry } from "../utils/utils";
import { userStore } from "../store/userStore";

export const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    let token = userStore.getState().accessToken;

    if (config.url?.includes("/auth/refresh")) {
      return config;
    }

    if (token && isTokenNearExpiry(token, 90)) {
      console.log(
        "[Interceptor] Token cerca de expirar. Intentando refrescar..."
      );
      const { data } = await api.post(`${API_URL}/auth/refresh`);
      token = data.accessToken;
      userStore.getState().setAccessToken(token!);
      console.log("[Interceptor] Token refrescado exitosamente");
    }

    if (token) {
      console.log("token actual", token);

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
