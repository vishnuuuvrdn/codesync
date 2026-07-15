import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import initializeSocket from "./sockets/socket.js";
import terminalService from "./services/terminal.service.js";

dotenv.config();

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://codesync.vishnuuuvrdn.workers.dev",
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Make io available in controllers via req.app.locals
app.locals.io = io;

initializeSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[CodeSync] Server running on port ${PORT}`);
});

// Graceful shutdown — clean up terminal containers
const shutdown = () => {
  console.log("[CodeSync] Shutting down, cleaning up terminal sessions...");
  terminalService.killAll();
  server.close(() => {
    console.log("[CodeSync] Server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
