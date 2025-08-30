// src/lib/axios.ts
import axios from "axios";

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`, // 👈 replace with your backend server
    headers: {
        "Content-Type": "application/json",
    },
});

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

export default api;
