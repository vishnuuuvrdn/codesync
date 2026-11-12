import fileService from "../services/file.service.js";
import File from "../models/file.model.js";

export const createFile = async (req, res) => {
  try {
    const { name, type, workspaceId, parent } = req.body;
    if (!name || !type || !workspaceId) {
      return res.status(400).json({ message: "name, type, and workspaceId are required" });
    }
    const file = await fileService.createFile({
      name,
      type,
      workspaceId,
      parent,
      userId: req.user._id,
    });

    const { io } = req.app.locals;
    io.to(workspaceId.toString()).emit("file-created", file);

    res.status(201).json({ message: "Created", file });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getFiles = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const files = await fileService.getFiles(workspaceId);
    res.json({ files });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getFileContent = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await fileService.getFileContent(fileId, req.user._id);
    res.json({ file });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updateFileContent = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { content } = req.body;
    if (content === undefined) {
      return res.status(400).json({ message: "content is required" });
    }
    const file = await fileService.updateFileContent(fileId, content, req.user._id);
    res.json({ message: "Saved", file });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const renameFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }
    const file = await fileService.renameFile(fileId, name, req.user._id);

    const { io } = req.app.locals;
    io.to(file.workspace.toString()).emit("file-renamed", file);

    res.json({ message: "Renamed", file });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Fetch workspace before deletion for broadcasting
    const fileDoc = await File.findById(fileId);
    if (!fileDoc) {
      return res.status(404).json({ message: "File not found" });
    }
    const workspaceId = fileDoc.workspace.toString();

    const deletedIds = await fileService.deleteFile(fileId, req.user._id);

    const { io } = req.app.locals;
    // Emit all deleted IDs so clients can clean up subtrees
    deletedIds.forEach((id) => {
      io.to(workspaceId).emit("file-deleted", id.toString());
    });

    res.json({ message: "Deleted", deletedIds });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const moveFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { parentId } = req.body;
    const userId = req.user._id;

    // parentId can be null (move to root) or a valid folder ID
    const file = await fileService.moveFile(fileId, parentId || null, userId);

    const { io } = req.app.locals;
    io.to(file.workspace.toString()).emit("file-moved", file);

    res.json({ file });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const duplicateFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user._id;

    const fileDoc = await fileService.duplicateFile(fileId, userId);

    const { io } = req.app.locals;
    // For folder duplication, refetch tells clients to sync all files
    io.to(fileDoc.workspace.toString()).emit("file-duplicated", fileDoc);

    res.status(201).json({ file: fileDoc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
