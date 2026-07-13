import FileHistory from "../models/fileHistory.model.js";
import File from "../models/file.model.js";
import fileService from "./file.service.js";

class HistoryService {
  async createSnapshot(fileId, content, savedBy = null, summary = "Auto-save") {
    const snapshot = await FileHistory.create({
      fileId,
      content,
      savedBy,
      summary,
    });
    return snapshot;
  }

  async listHistory(fileId, userId) {
    const file = await File.findById(fileId);
    if (!file) {
      const error = new Error("File not found");
      error.status = 404;
      throw error;
    }
    
    await fileService.verifyWorkspacePermission(file.workspace, userId);

    return FileHistory.find({ fileId }).sort({ timestamp: -1 }).populate("savedBy", "username email");
  }

  async restoreVersion(historyId, userId) {
    const snapshot = await FileHistory.findById(historyId);
    if (!snapshot) {
      const error = new Error("Snapshot not found");
      error.status = 404;
      throw error;
    }

    const file = await File.findById(snapshot.fileId);
    if (!file) {
      const error = new Error("Target file no longer exists");
      error.status = 404;
      throw error;
    }

    await fileService.verifyWorkspacePermission(file.workspace, userId);

    // Save the CURRENT state as a backup snapshot
    await this.createSnapshot(file._id, file.content, userId, "Pre-restore backup");

    // Restore the old content
    file.content = snapshot.content;
    await file.save();

    // Create a snapshot for the restore action
    await this.createSnapshot(file._id, snapshot.content, userId, `Restored from ${snapshot.timestamp.toISOString()}`);

    return file;
  }

  async deleteHistory(historyId, userId) {
    const snapshot = await FileHistory.findById(historyId);
    if (!snapshot) return;

    const file = await File.findById(snapshot.fileId);
    if (file) {
      await fileService.verifyWorkspacePermission(file.workspace, userId);
    }

    await FileHistory.findByIdAndDelete(historyId);
  }
}

export default new HistoryService();
