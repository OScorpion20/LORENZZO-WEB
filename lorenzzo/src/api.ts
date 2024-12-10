import axios from "axios";

const API = axios.create({
  baseURL: process.env.NODE_ENV === "production"
    ? "https://lorenzzo-web.onrender.com" // URL del backend en producción
    : "http://localhost:5000", // URL del backend en desarrollo
});

export default API;
