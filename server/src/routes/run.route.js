import express from "express";
import { executeCode } from "../controllers/run.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, executeCode);

export default router;
