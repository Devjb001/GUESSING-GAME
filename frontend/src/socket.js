// src/socket.js
import { io } from "socket.io-client";

// connect to your backend server
const socket = io("http://localhost:4000", {
  transports: ["websocket"], // ensure low-latency connection
});

export default socket;
