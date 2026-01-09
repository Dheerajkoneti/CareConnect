import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"], // prevent polling → fixes CORS spam
});

export default socket;
