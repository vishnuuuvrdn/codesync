import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());

app.use(cookieParser());

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "CodeSync API Running",
  });
});

export default app;
