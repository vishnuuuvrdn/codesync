import { customAlphabet } from "nanoid";
import Invitation from "../models/invitation.model.js";
import Workspace from "../models/workspace.model.js";

// 8-character alphabet: A-Z, 0-9
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

export const generateInvite = async (workspaceId, userId, maxUses, expiresInHours) => {
  // Validate workspace exists and user is owner
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new Error("Workspace not found");
  
  if (workspace.owner.toString() !== userId.toString()) {
    throw new Error("Only the workspace owner can generate invites");
  }

  const inviteCode = nanoid();

  let expiresAt = null;
  if (expiresInHours) {
    expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);
  }

  const invitation = await Invitation.create({
    workspace: workspaceId,
    inviteCode,
    createdBy: userId,
    expiresAt,
    maxUses: maxUses || 0,
    currentUses: 0,
    active: true,
  });

  return invitation;
};

export const validateInvite = async (inviteCode) => {
  const invitation = await Invitation.findOne({ inviteCode, active: true }).populate("workspace", "name owner");
  
  if (!invitation) {
    throw new Error("Invalid or inactive invitation code");
  }

  if (invitation.expiresAt && new Date() > invitation.expiresAt) {
    throw new Error("This invitation has expired");
  }

  if (invitation.maxUses > 0 && invitation.currentUses >= invitation.maxUses) {
    throw new Error("This invitation has reached its maximum uses");
  }

  return invitation;
};

export const joinWorkspace = async (inviteCode, userId) => {
  // Validate the invite
  const invitation = await validateInvite(inviteCode);
  
  // Validate workspace still exists
  const workspace = await Workspace.findById(invitation.workspace._id);
  if (!workspace) {
    throw new Error("The associated workspace no longer exists");
  }

  // Prevent duplicate membership
  const alreadyMember = workspace.members.find(
    (member) => member.user.toString() === userId.toString()
  );

  if (alreadyMember) {
    throw new Error("You are already a member of this workspace");
  }

  // Add member with 'editor' role
  workspace.members.push({
    user: userId,
    role: "editor",
  });
  await workspace.save();

  // Increment usage
  invitation.currentUses += 1;
  if (invitation.maxUses > 0 && invitation.currentUses >= invitation.maxUses) {
    invitation.active = false;
  }
  await invitation.save();

  return workspace;
};

export const revokeInvite = async (inviteCode, userId) => {
  const invitation = await Invitation.findOne({ inviteCode }).populate("workspace");
  if (!invitation) throw new Error("Invitation not found");

  if (invitation.workspace.owner.toString() !== userId.toString()) {
    throw new Error("Only the workspace owner can revoke invites");
  }

  invitation.active = false;
  await invitation.save();
  return invitation;
};
