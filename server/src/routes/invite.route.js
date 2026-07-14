import express from "express";
import {
  generateInvite,
  getInvite,
  joinWorkspace,
  revokeInvite,
} from "../controllers/invite.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Generate a new invite
router.post("/", protect, generateInvite);

// Validate/Get an invite
router.get("/:code", protect, getInvite);

// Join a workspace using an invite code
router.post("/:code/join", protect, joinWorkspace);

// Revoke an invite (owner only)
router.delete("/:code", protect, revokeInvite);

export default router;
