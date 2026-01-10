import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
  console.error("❌ REACT_APP_API_URL is missing");
}

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default instance;