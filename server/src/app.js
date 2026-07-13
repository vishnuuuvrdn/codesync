import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import workspaceRoutes from "./routes/workspace.route.js";
import fileRoutes from "./routes/file.route.js"
import runRoutes from "./routes/run.route.js";
import historyRoutes from "./routes/history.route.js";

const app = express();

app.use(cors({
  origin:"http://localhost:5173",
  credentials: true
}));

app.use(cookieParser());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/run", runRoutes);
app.use("/api/history", historyRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "CodeSync API Running",
  });
});

export default app;
