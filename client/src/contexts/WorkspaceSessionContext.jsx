import { createContext, useContext, useState, useEffect, useCallback } from "react";

const WorkspaceSessionContext = createContext(null);

export const useWorkspaceSession = () => useContext(WorkspaceSessionContext);

export const WorkspaceSessionProvider = ({ children, workspaceId }) => {
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});

  // Load session from localStorage on mount
  // We only restore tab metadata (id, name, type), NOT content — content is fetched on demand.
  useEffect(() => {
    if (!workspaceId) return;
    try {
      const stored = localStorage.getItem(`codesync_session_${workspaceId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.openFiles) {
          // Strip content to avoid bloating localStorage and restore stale data
          setOpenFiles(
            parsed.openFiles.map(({ _id, name, type, parent }) => ({
              _id,
              name,
              type,
              parent,
              content: "",
              isDirty: false,
            }))
          );
        }
        if (parsed.activeFileId) setActiveFileId(parsed.activeFileId);
        if (parsed.expandedFolders) setExpandedFolders(parsed.expandedFolders);
      }
    } catch (e) {
      console.error("Failed to load workspace session", e);
    }
  }, [workspaceId]);

  // Save session to localStorage on changes — only save metadata, not file content
  useEffect(() => {
    if (!workspaceId) return;
    try {
      const toStore = {
        openFiles: openFiles.map(({ _id, name, type, parent }) => ({
          _id,
          name,
          type,
          parent,
        })),
        activeFileId,
        expandedFolders,
      };
      localStorage.setItem(`codesync_session_${workspaceId}`, JSON.stringify(toStore));
    } catch (e) {
      console.error("Failed to save workspace session", e);
    }
  }, [workspaceId, openFiles, activeFileId, expandedFolders]);

  const openFile = useCallback((file) => {
    if (!file || file.type === "folder") return;
    setOpenFiles((prev) => {
      if (prev.find((f) => f._id === file._id)) return prev;
      return [...prev, file];
    });
    setActiveFileId(file._id);
  }, []);

  const closeFile = useCallback((fileId) => {
    setOpenFiles((prev) => {
      const newFiles = prev.filter((f) => f._id !== fileId);
      setActiveFileId((currentActiveId) => {
        if (currentActiveId === fileId) {
          return newFiles.length > 0 ? newFiles[newFiles.length - 1]._id : null;
        }
        return currentActiveId;
      });
      return newFiles;
    });
  }, []);

  const toggleFolder = useCallback((folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  }, []);

  const updateFileContent = useCallback((fileId, content) => {
    setOpenFiles((prev) =>
      prev.map((f) =>
        f._id === fileId ? { ...f, content, isDirty: true } : f
      )
    );
  }, []);

  const markClean = useCallback((fileId) => {
    setOpenFiles((prev) =>
      prev.map((f) => (f._id === fileId ? { ...f, isDirty: false } : f))
    );
  }, []);

  // Close any open tabs that were deleted (supports multiple IDs for folder deletion)
  const syncDeletedFiles = useCallback((deletedIds) => {
    const idSet = new Set(deletedIds.map(String));
    setOpenFiles((prev) => {
      const filtered = prev.filter((f) => !idSet.has(String(f._id)));
      setActiveFileId((currentActiveId) => {
        if (currentActiveId && idSet.has(String(currentActiveId))) {
          return filtered.length > 0 ? filtered[filtered.length - 1]._id : null;
        }
        return currentActiveId;
      });
      return filtered;
    });
  }, []);

  return (
    <WorkspaceSessionContext.Provider
      value={{
        openFiles,
        setOpenFiles,
        activeFileId,
        setActiveFileId,
        expandedFolders,
        setExpandedFolders,
        openFile,
        closeFile,
        toggleFolder,
        updateFileContent,
        markClean,
        syncDeletedFiles,
      }}
    >
      {children}
    </WorkspaceSessionContext.Provider>
  );
};
