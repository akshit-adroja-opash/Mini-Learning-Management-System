import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api"
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("mini_lms_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;