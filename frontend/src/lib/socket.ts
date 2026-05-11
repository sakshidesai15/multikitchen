import { io } from "socket.io-client";

const socketBaseUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || window.location.origin;
const socket = io(socketBaseUrl);

export default socket;
