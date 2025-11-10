import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://careconnect-3-x25w.onrender.com",
  withCredentials: true,
});

export default instance;
