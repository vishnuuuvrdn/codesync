import express from "express";
import {
  createFile,
  getFiles,
  getFileContent,
  updateFileContent,
  renameFile,
  deleteFile,
  moveFile,
  duplicateFile,
} from "../controllers/file.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Specific routes MUST be declared before parameterized routes to avoid conflicts.
// e.g. GET /open/:fileId must come before GET /:workspaceId
router.get("/open/:fileId", protect, getFileContent);
router.put("/rename/:fileId", protect, renameFile);
router.post("/:fileId/duplicate", protect, duplicateFile);
router.put("/:fileId/move", protect, moveFile);

// Generic parameterized routes last
router.post("/", protect, createFile);
router.get("/:workspaceId", protect, getFiles);
router.put("/:fileId", protect, updateFileContent);
router.delete("/:fileId", protect, deleteFile);

export default router;