import Workspace from "../models/workspace.model.js";

export const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Workspace name required",
      });
    }

    const workspace = await Workspace.create({
      name,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "owner",
        },
      ],
    });

    res.status(201).json({
      message: "Workspace created",

      workspace,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user._id,
    });

    res.json({
      workspaces,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
