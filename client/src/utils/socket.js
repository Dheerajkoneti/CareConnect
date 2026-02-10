import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  "https://careconnect-dini.onrender.com";

const socket = io("https://careconnect-dini.onrender.com", {
  withCredentials: true,
  transports: ["polling", "websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});
export default socket;
