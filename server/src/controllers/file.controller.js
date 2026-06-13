import File from "../models/file.model.js";
import Workspace from "../models/workspace.model.js";

export const createFile = async (req, res) => {
  try {
    const { name, type, workspaceId, parent } = req.body;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user._id,
    });

    if (!workspace) {
      return res.status(403).json({
        message: "No permission",
      });
    }

    const file = await File.create({
      name,
      type,
      workspace: workspaceId,
      parent: parent || null,
    });

    res.status(201).json({
      message: "Created",
      file,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getFiles = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const files = await File.find({
      workspace: workspaceId,
    });

    res.json({
      files,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getFileContent = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    res.json({
      file,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateFileContent = async (req, res) => {
  try {
    const { fileId } = req.params;

    const { content } = req.body;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    const workspace = await Workspace.findOne({
      _id: file.workspace,

      "members.user": req.user._id,
    });

    if (!workspace) {
      return res.status(403).json({
        message: "No permission",
      });
    }

    file.content = content;

    await file.save();

    res.json({
      message: "Saved",

      file,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};