import File from "../models/file.model.js";
import Workspace from "../models/workspace.model.js";

class FileService {
  async verifyWorkspacePermission(workspaceId, userId) {
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": userId,
    });
    if (!workspace) {
      const error = new Error("No permission");
      error.status = 403;
      throw error;
    }
    return workspace;
  }

  async createFile({ name, type, workspaceId, parent, userId }) {
    await this.verifyWorkspacePermission(workspaceId, userId);

    const file = await File.create({
      name,
      type,
      workspace: workspaceId,
      parent: parent || null,
    });

    return file;
  }

  async getFiles(workspaceId) {
    const files = await File.find({
      workspace: workspaceId,
    });
    return files;
  }

  async getFileContent(fileId) {
    const file = await File.findById(fileId);
    if (!file) {
      const error = new Error("File not found");
      error.status = 404;
      throw error;
    }
    return file;
  }

  async updateFileContent(fileId, content, userId) {
    const file = await File.findById(fileId);
    if (!file) {
      const error = new Error("File not found");
      error.status = 404;
      throw error;
    }

    await this.verifyWorkspacePermission(file.workspace, userId);

    file.content = content;
    await file.save();

    return file;
  }

  async renameFile(fileId, newName, userId) {
    const file = await File.findById(fileId);
    if (!file) {
      const error = new Error("File not found");
      error.status = 404;
      throw error;
    }

    await this.verifyWorkspacePermission(file.workspace, userId);

    file.name = newName;
    await file.save();

    return file;
  }

  async deleteFile(fileId, userId) {
    const file = await File.findById(fileId);
    if (!file) {
      const error = new Error("File not found");
      error.status = 404;
      throw error;
    }

    await this.verifyWorkspacePermission(file.workspace, userId);

    if (file.type === "folder") {
      // Fetch all files in the workspace to build the subtree
      const allFiles = await File.find({ workspace: file.workspace });
      const idsToDelete = [fileId];

      // Recursively find all children
      const addChildren = (parentId) => {
        const children = allFiles.filter(
          (f) => f.parent && f.parent.toString() === parentId.toString()
        );
        children.forEach((child) => {
          idsToDelete.push(child._id);
          addChildren(child._id);
        });
      };

      addChildren(fileId);

      await File.deleteMany({ _id: { $in: idsToDelete } });
      return idsToDelete;
    } else {
      await File.deleteOne({ _id: fileId });
      return [fileId];
    }
  }
}

export default new FileService();
