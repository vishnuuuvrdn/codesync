import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import workspaceRoutes from "./routes/workspace.route.js";
import fileRoutes from "./routes/file.route.js";
import runRoutes from "./routes/run.route.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "2mb" })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/run", runRoutes);

app.get("/", (req, res) => {
  res.json({ message: "CodeSync API", version: "1.0.0", status: "ok" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[API Error]", err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

export default app;
