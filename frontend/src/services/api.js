import axios from "axios";

const api = axios.create({
  baseURL: process.env.NODE_ENV === "production"
    ? "https://churn-backend-7ge1.onrender.com"
    : "http://127.0.0.1:8000",
  timeout: 20000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
