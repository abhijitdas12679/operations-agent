import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://tk12679-operations-agent-backend.hf.space";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");

      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/"
      ) {
        window.location.href = "/login";
      }
    }

    if (error.response?.status === 403) {
      console.error("Access denied");
    }

    if (error.response?.status >= 500) {
      console.error("Server error");
    }

    return Promise.reject(error);
  }
);

export default api;