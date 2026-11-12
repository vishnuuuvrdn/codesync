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
      workspace: workspaceId, // schema field is 'workspace'
      parent: parent || null,
    });

    return file;
  }

  async getFiles(workspaceId) {
    const files = await File.find({ workspace: workspaceId });
    return files;
  }

  async getFileContent(fileId, userId) {
    const file = await File.findById(fileId);
    if (!file) {
      const error = new Error("File not found");
      error.status = 404;
      throw error;
    }
    // Verify the requesting user has access to this file's workspace
    if (userId) {
      await this.verifyWorkspacePermission(file.workspace, userId);
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
      const allFiles = await File.find({ workspace: file.workspace });
      const idsToDelete = [fileId];

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

  async moveFile(fileId, newParentId, userId) {
    const file = await File.findById(fileId);
    if (!file) throw new Error("File not found");

    await this.verifyWorkspacePermission(file.workspace, userId);

    if (newParentId) {
      // Verify the target folder belongs to the same workspace
      const parent = await File.findOne({
        _id: newParentId,
        workspace: file.workspace,
        type: "folder",
      });
      if (!parent) throw new Error("Invalid parent folder");

      // Prevent moving a folder into itself or its children
      if (file.type === "folder") {
        let currentParent = parent;
        while (currentParent) {
          if (currentParent._id.toString() === file._id.toString()) {
            throw new Error("Cannot move a folder into itself");
          }
          if (currentParent.parent) {
            currentParent = await File.findById(currentParent.parent);
          } else {
            break;
          }
        }
      }
    }

    file.parent = newParentId || null;
    await file.save();
    return file;
  }

  async duplicateFile(fileId, userId) {
    const file = await File.findById(fileId);
    if (!file) throw new Error("File not found");

    await this.verifyWorkspacePermission(file.workspace, userId);

    // Use the correct schema field 'workspace', not 'workspaceId'
    const newFile = new File({
      workspace: file.workspace,
      name: `${file.name} (copy)`,
      type: file.type,
      parent: file.parent,
      content: file.content,
    });

    await newFile.save();

    // If it's a folder, recursively duplicate children
    if (file.type === "folder") {
      const duplicateChildren = async (oldParentId, newParentId) => {
        const children = await File.find({ parent: oldParentId });
        for (const child of children) {
          const newChild = new File({
            workspace: child.workspace,
            name: child.name,
            type: child.type,
            parent: newParentId,
            content: child.content,
          });
          await newChild.save();
          if (child.type === "folder") {
            await duplicateChildren(child._id, newChild._id);
          }
        }
      };
      await duplicateChildren(file._id, newFile._id);
    }

    return newFile;
  }
}

export default new FileService();
