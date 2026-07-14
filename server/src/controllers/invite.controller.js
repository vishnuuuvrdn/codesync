import * as inviteService from "../services/invite.service.js";

export const generateInvite = async (req, res) => {
  try {
    const { workspaceId, maxUses, expiresInHours } = req.body;
    const invite = await inviteService.generateInvite(
      workspaceId,
      req.user._id,
      maxUses,
      expiresInHours
    );
    res.status(201).json({ invite });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getInvite = async (req, res) => {
  try {
    const invite = await inviteService.validateInvite(req.params.code);
    res.json({ invite });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const joinWorkspace = async (req, res) => {
  try {
    const workspace = await inviteService.joinWorkspace(req.params.code, req.user._id);
    res.json({ workspace, message: "Successfully joined workspace" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const revokeInvite = async (req, res) => {
  try {
    const invite = await inviteService.revokeInvite(req.params.code, req.user._id);
    res.json({ invite, message: "Invitation revoked" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
