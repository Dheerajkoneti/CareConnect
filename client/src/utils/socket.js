import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  "https://careconnect-dini.onrender.com";

const socket = io(SOCKET_URL, {
  path: "/socket.io",
  transports: ["websocket"],

  // 🔥 CRITICAL FOR STABLE CALLS
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,

  // 🔥 ENSURE SINGLE SOCKET
  forceNew: false,
});

export default socket;
