import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

let socket;

function getSocketBaseUrl() {
  return API_BASE_URL.replace(/\/api$/, "");
}

export function connectStudentSocket(userId) {
  if (!userId) return null;
  if (!socket) {
    socket = io(getSocketBaseUrl(), {
      transports: ["websocket", "polling"],
    });
  }
  socket.emit("register-user", userId);
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
