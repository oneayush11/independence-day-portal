import axios from "axios";

// Vite dev server proxies /api -> http://localhost:5001 (see vite.config.js)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("idp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
