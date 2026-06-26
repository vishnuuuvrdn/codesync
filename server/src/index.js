import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import initializeSocket from "./sockets/socket.js";

dotenv.config();

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

initializeSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
