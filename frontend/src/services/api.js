import axios from "axios";

const api = axios.create({
  baseURL: "https://churn-backend-w7dr.onrender.com",
});

export default api;
