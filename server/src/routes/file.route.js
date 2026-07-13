import express from "express";
import { createFile, getFiles, getFileContent, updateFileContent, renameFile, deleteFile } from "../controllers/file.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createFile);
router.get("/:workspaceId", protect, getFiles);
router.get("/open/:fileId", protect, getFileContent);
router.put("/:fileId", protect, updateFileContent);
router.put("/rename/:fileId", protect, renameFile);
router.delete("/:fileId", protect, deleteFile);

export default router;