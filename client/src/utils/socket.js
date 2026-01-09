import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_API_URL ||
  "https://careconnect-489.onrender.com";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

export default socket;
