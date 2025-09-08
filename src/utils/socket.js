
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:6500";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: false, // manual connect
});

// helpful logs
socket.on("connect_error", (err) => {
  console.log("❌ socket connect_error:", err?.message);
});
socket.on("error", (err) => {
  console.log("❌ socket error:", err);
});
