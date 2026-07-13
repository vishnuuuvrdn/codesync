import express from "express";
import { getHistory, restoreHistory, deleteHistory } from "../controllers/history.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:fileId", verifyToken, getHistory);
router.post("/restore/:historyId", verifyToken, restoreHistory);
router.delete("/:historyId", verifyToken, deleteHistory);

export default router;
