
import axios from "axios";

const api = axios.create({
  baseURL: "https://churn-backend-7ge1.onrender.com",
  timeout: 15000,
});

export default api;
