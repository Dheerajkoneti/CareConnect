// client/src/utils/socket.js
import { io } from "socket.io-client";

// Use the backend URL your app already uses
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
