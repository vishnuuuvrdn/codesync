import { io } from "socket.io-client";

// autoConnect: false prevents the socket from connecting on module import
// (before the user is authenticated). Connect manually in Workspace.jsx.
const socket = io("http://localhost:5000", {
  withCredentials: true,
  autoConnect: false,
});

export default socket;
