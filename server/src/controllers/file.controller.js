import fileService from "../services/file.service.js";

export const createFile = async (req, res) => {
  try {
    const { name, type, workspaceId, parent } = req.body;
    const file = await fileService.createFile({
      name,
      type,
      workspaceId,
      parent,
      userId: req.user._id,
    });
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
    const file = await fileService.getFileContent(fileId);
    res.json({ file });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updateFileContent = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { content } = req.body;
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
    const file = await fileService.renameFile(fileId, name, req.user._id);
    res.json({ message: "Renamed", file });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const deletedIds = await fileService.deleteFile(fileId, req.user._id);
    res.json({ message: "Deleted", deletedIds });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
