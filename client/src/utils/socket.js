import { io } from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
  console.error("❌ REACT_APP_API_URL missing for socket");
}

const socket = io(API_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;