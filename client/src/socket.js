import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  "https://careconnect-dini.onrender.com";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export default socket;