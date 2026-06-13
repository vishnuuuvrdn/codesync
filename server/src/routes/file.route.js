import express from "express";
import { createFile, getFiles, getFileContent, updateFileContent } from "../controllers/file.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createFile);
router.get("/:workspaceId", protect, getFiles);
router.get("/open/:fileId", protect, getFileContent);
router.put("/:fileId", protect, updateFileContent);

export default router;