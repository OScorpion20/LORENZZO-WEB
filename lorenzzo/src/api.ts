import axios from "axios";

const API = axios.create({
  baseURL: "https://lorenzzo-web.onrender.com", // URL base del backend
});

export default API;
