import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL || "https://careconnect-3-x25w.onrender.com", {
  transports: ["websocket"],
});

export default socket;
