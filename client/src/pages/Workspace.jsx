import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import api from "../api/axios";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import CollaboratorsList from "../components/workspace/CollaboratorsList";
import CreateItem from "../components/workspace/CreateItem";
import FileTree from "../components/workspace/FileTree";
import EditorPanel from "../components/workspace/EditorPanel";
import OutputPanel from "../components/workspace/OutputPanel";
import TerminalPanel from "../components/workspace/TerminalPanel";
import InviteModal from "../components/workspace/InviteModal";
import WorkspaceLayout from "../components/workspace/layout/WorkspaceLayout";
import { WorkspaceSessionProvider, useWorkspaceSession } from "../contexts/WorkspaceSessionContext";

function WorkspaceContent() {
  const { id } = useParams();
  const { currentUser } = useAuth();

  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [bottomTab, setBottomTab] = useState("terminal");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const {
    openFiles,
    activeFileId,
    openFile,
    closeFile,
    updateFileContent,
    markClean,
    syncDeletedFiles,
  } = useWorkspaceSession();

  const activeFile = openFiles.find((f) => f._id === activeFileId);
  const code = activeFile?.content || "";
  const typingTimeoutRef = useRef(null);

  const fetchFilesRef = useRef(null);
  const syncDeletedFilesRef = useRef(syncDeletedFiles);
  const updateFileContentRef = useRef(updateFileContent);
  const openFilesRef = useRef(openFiles);

  useEffect(() => {
    openFilesRef.current = openFiles;
  }, [openFiles]);

  useEffect(() => {
    syncDeletedFilesRef.current = syncDeletedFiles;
  }, [syncDeletedFiles]);

  useEffect(() => {
    updateFileContentRef.current = updateFileContent;
  }, [updateFileContent]);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await api.get(`/files/${id}`);
      setFiles(res.data.files);
    } catch (error) {
      console.error("fetchFiles error:", error);
    }
  }, [id]);

  // Keep ref stable for socket listeners
  useEffect(() => {
    fetchFilesRef.current = fetchFiles;
  }, [fetchFiles]);

  const createItem = async (type) => {
    if (!name.trim()) return;
    try {
      await api.post("/files", { name, type, workspaceId: id });
      setName("");
      // Don't call fetchFiles — rely on socket file-created event for real-time sync.
      // But fetch as fallback for self since socket won't fire on same sender.
      fetchFiles();
    } catch (error) {
      console.error("createItem error:", error);
    }
  };

  const renameItem = async (fileId, newName) => {
    try {
      await api.put(`/files/rename/${fileId}`, { name: newName });
      // Rely on socket file-renamed event for sync, but update local state immediately too
      setFiles((prev) =>
        prev.map((f) => (f._id === fileId ? { ...f, name: newName } : f))
      );
    } catch (error) {
      console.error("renameItem error:", error);
    }
  };

  const deleteItem = async (fileId) => {
    try {
      await api.delete(`/files/${fileId}`);
      // Optimistic local update before socket confirms
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      syncDeletedFiles([fileId]);
    } catch (error) {
      console.error("deleteItem error:", error);
    }
  };

  const duplicateItem = async (fileId) => {
    try {
      await api.post(`/files/${fileId}/duplicate`);
      // Socket file-duplicated event will trigger fetchFiles
    } catch (error) {
      console.error("duplicateItem error:", error);
    }
  };

  const moveItem = async (fileId, newParentId) => {
    try {
      await api.put(`/files/${fileId}/move`, { parentId: newParentId });
      // Socket file-moved event will update local state
    } catch (error) {
      console.error("moveItem error:", error);
    }
  };

  const closeTab = (fileId) => {
    closeFile(fileId);
  };

  const runCode = async () => {
    if (!activeFile) return;

    const languageMap = {
      js: "javascript",
      jsx: "javascript",
      py: "python",
      cpp: "cpp",
      c: "c",
      java: "java",
    };

    const extension = activeFile.name.split(".").pop()?.toLowerCase() || "";
    const language = languageMap[extension];

    if (!language) {
      setOutput(`Unsupported file type: .${extension}`);
      setBottomTab("output");
      return;
    }

    try {
      setBottomTab("output");
      setIsExecuting(true);
      setOutput("");

      const { data } = await api.post("/run", { language, code });

      if (data.stderr) {
        setOutput(data.stderr);
      } else {
        setOutput(data.stdout || "(no output)");
      }
    } catch (error) {
      setOutput(error.response?.data?.message || "Failed to execute code.");
    } finally {
      setIsExecuting(false);
    }
  };

  // Use ref to capture current code for saveFile — avoids stale closure
  const codeRef = useRef(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  const saveFile = async (fileId) => {
    if (!fileId) return;
    setSaving(true);
    try {
      await api.put(`/files/${fileId}`, { content: codeRef.current });
      markClean(fileId);
    } catch (error) {
      console.error("saveFile error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCodeChange = (newContent) => {
    if (!activeFileId) return;
    setFiles((prev) =>
      prev.map((f) => (f._id === activeFileId ? { ...f, content: newContent } : f))
    );
    updateFileContent(activeFileId, newContent);
    socket.emit("file-update", { workspaceId: id, fileId: activeFileId, content: newContent });
    
    // Typing indicator logic
    socket.emit("presence-update", { workspaceId: id, status: "typing" });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("presence-update", { workspaceId: id, status: "online" });
    }, 2000);
  };

  const handleCursorChange = (position) => {
    if (!activeFileId || !currentUser) return;
    socket.emit("cursor-move", {
      workspaceId: id,
      fileId: activeFileId,
      position,
      user: { id: currentUser._id, username: currentUser.username },
    });
  };

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Socket lifecycle: connect when user is available, disconnect on unmount
  useEffect(() => {
    if (!currentUser) return;

    // Handle Idle status
    let idleTimeout;
    const resetIdle = () => {
      if (idleTimeout) clearTimeout(idleTimeout);
      socket.emit("presence-update", { workspaceId: id, status: "online" });
      idleTimeout = setTimeout(() => {
        socket.emit("presence-update", { workspaceId: id, status: "idle" });
      }, 60000); // 1 minute of no mouse/keyboard = idle
    };

    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown", resetIdle);
    resetIdle();

    socket.connect();

    socket.emit("join-workspace", {
      workspaceId: id,
      user: { id: currentUser._id, username: currentUser.username },
    });

    const handleReceiveCursorMove = ({ fileId, position, user }) => {
      setCursors((prev) => ({
        ...prev,
        [user.id]: { fileId, position, user },
      }));
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
      setCursors((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((uid) => {
          if (!users.find((u) => u.id === uid)) delete next[uid];
        });
        return next;
      });
    };

    const handleFileUpdated = ({ fileId, content }) => {
      setFiles((prev) => prev.map((f) => (f._id === fileId ? { ...f, content } : f)));
      updateFileContentRef.current(fileId, content);
    };

    const handleFileCreated = (file) => {
      setFiles((prev) => {
        // Avoid duplicate entries
        if (prev.find((f) => f._id === file._id)) return prev;
        return [...prev, file];
      });
    };

    const handleFileRenamed = (file) => {
      setFiles((prev) => prev.map((f) => (f._id === file._id ? { ...f, name: file.name } : f)));
    };

    const handleFileDeleted = (fileId) => {
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      syncDeletedFilesRef.current([fileId]);
    };

    const handleFileMoved = (file) => {
      setFiles((prev) => prev.map((f) => (f._id === file._id ? file : f)));
    };

    const handleFileDuplicated = () => {
      // Refetch all files to get the complete duplicated subtree
      fetchFilesRef.current?.();
    };

    const handlePeerJoined = ({ user }) => {
      // Sync unsaved changes to the newly joined peer
      if (openFilesRef.current.length > 0) {
        openFilesRef.current.forEach(file => {
          if (file.isDirty) {
            socket.emit("file-update", { workspaceId: id, fileId: file._id, content: file.content });
          }
        });
      }
    };

    socket.on("file-updated", handleFileUpdated);
    socket.on("file-created", handleFileCreated);
    socket.on("file-renamed", handleFileRenamed);
    socket.on("file-deleted", handleFileDeleted);
    socket.on("file-moved", handleFileMoved);
    socket.on("file-duplicated", handleFileDuplicated);
    socket.on("receive-cursor-move", handleReceiveCursorMove);
    socket.on("online-users", handleOnlineUsers);
    socket.on("peer-joined", handlePeerJoined);

    return () => {
      socket.emit("leave-workspace", id);
      socket.off("file-updated", handleFileUpdated);
      socket.off("file-created", handleFileCreated);
      socket.off("file-renamed", handleFileRenamed);
      socket.off("file-deleted", handleFileDeleted);
      socket.off("file-moved", handleFileMoved);
      socket.off("file-duplicated", handleFileDuplicated);
      socket.off("receive-cursor-move", handleReceiveCursorMove);
      socket.off("online-users", handleOnlineUsers);
      socket.off("peer-joined", handlePeerJoined);
      socket.disconnect();
      window.removeEventListener("mousemove", resetIdle);
      if (idleTimeout) clearTimeout(idleTimeout);
    };
  }, [id, currentUser]);

  return (
    <WorkspaceLayout 
      workspaceId={id}
      showInviteModal={showInviteModal}
      setShowInviteModal={setShowInviteModal}
      onlineUsers={onlineUsers}
      isSaving={saving}
      bottomTab={bottomTab}
      setBottomTab={setBottomTab}
      name={name}
      setName={setName}
      createItem={createItem}
      files={files}
      activeFile={activeFile}
      handleCodeChange={handleCodeChange}
      saveFile={saveFile}
      runCode={runCode}
      openFiles={openFiles}
      activeFileId={activeFileId}
      openFile={openFile}
      closeTab={closeTab}
      cursors={cursors}
      handleCursorChange={handleCursorChange}
      output={output}
      isExecuting={isExecuting}
      renameItem={renameItem}
      deleteItem={deleteItem}
      duplicateItem={duplicateItem}
      moveItem={moveItem}
    />
  );
}

export default function Workspace() {
  const { id } = useParams();
  return (
    <WorkspaceSessionProvider workspaceId={id}>
      <WorkspaceContent />
    </WorkspaceSessionProvider>
  );
}
