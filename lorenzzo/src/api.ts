import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // URL base del backend
});

export default API;
