import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import CollaboratorsList from "../components/workspace/CollaboratorsList";
import CreateItem from "../components/workspace/CreateItem";
import FileTree from "../components/workspace/FileTree";
import EditorPanel from "../components/workspace/EditorPanel";
import OutputPanel from "../components/workspace/OutputPanel";

function Workspace() {
  const { id } = useParams();
  const { currentUser } = useAuth();

  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const activeFile = openFiles.find(f => f._id === activeFileId);
  const code = activeFile?.content || "";

  const activeFileIdRef = useRef(activeFileId);
  useEffect(() => {
    activeFileIdRef.current = activeFileId;
  }, [activeFileId]);

  const skipNextAutosave = useRef(false);

  const fetchFiles = async () => {
    try {
      const res = await api.get(`/files/${id}`);
      setFiles(res.data.files);
    } catch (error) {
      console.log(error);
    }
  };

  const createItem = async (type) => {
    if (!name.trim()) return;
    try {
      await api.post("/files", { name, type, workspaceId: id });
      setName("");
      fetchFiles();
    } catch (error) {
      console.log(error);
    }
  };

  const openFile = async (file) => {
    if (file.type === "folder") return;
    
    if (openFiles.find(f => f._id === file._id)) {
      skipNextAutosave.current = true;
      setActiveFileId(file._id);
      return;
    }

    try {
      const res = await api.get(`/files/open/${file._id}`);
      skipNextAutosave.current = true;
      setOpenFiles(prev => [...prev, res.data.file]);
      setActiveFileId(file._id);
    } catch (error) {
      console.log(error);
    }
  };

  const closeTab = (fileId, e) => {
    e?.stopPropagation();
    setOpenFiles(prev => prev.filter(f => f._id !== fileId));
    if (activeFileId === fileId) {
      const remaining = openFiles.filter(f => f._id !== fileId);
      if (remaining.length > 0) {
        skipNextAutosave.current = true;
        setActiveFileId(remaining[remaining.length - 1]._id);
      } else {
        setActiveFileId(null);
      }
    }
  };

  const renameItem = async (fileId, newName) => {
    try {
      await api.put(`/files/rename/${fileId}`, { name: newName });
      fetchFiles();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteItem = async (fileId) => {
    try {
      await api.delete(`/files/${fileId}`);
      setOpenFiles(prev => prev.filter(f => f._id !== fileId));
      if (activeFileId === fileId) {
        const remaining = openFiles.filter(f => f._id !== fileId);
        setActiveFileId(remaining.length > 0 ? remaining[remaining.length - 1]._id : null);
      }
      fetchFiles();
    } catch (error) {
      console.log(error);
    }
  };

  const runCode = async () => {
    if (!activeFile) return;

    try {
      setIsExecuting(true);
      setOutput("");

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
        setOutput("Unsupported language.");
        return;
      }

      const { data } = await api.post("/run", {
        language,
        code,
      });

      if (data.stderr) {
        setOutput(data.stderr);
      } else {
        setOutput(data.stdout);
      }
    } catch (error) {
      setOutput(error.response?.data?.message || "Failed to execute code.");
    } finally {
      setIsExecuting(false);
    }
  };

  const saveFile = async (fileId, content) => {
    if (!fileId) return;
    setSaving(true);
    try {
      await api.put(`/files/${fileId}`, { content });
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCodeChange = (value) => {
    if (!activeFileId) return;
    
    setOpenFiles(prev => prev.map(f => 
      f._id === activeFileId ? { ...f, content: value } : f
    ));

    socket.emit("file-change", {
      workspaceId: id,
      fileId: activeFileId,
      content: value,
    });
  };

  const handleCursorChange = (position) => {
    if (!activeFileId || !currentUser) return;
    socket.emit("cursor-move", {
      workspaceId: id,
      fileId: activeFileId,
      position,
      user: {
        id: currentUser._id,
        username: currentUser.username,
      },
    });
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave, skipping the save that would fire right after opening a file.
  useEffect(() => {
    if (!activeFileId) return;
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }
    const timer = setTimeout(() => saveFile(activeFileId, code), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Socket connects once per workspace, not on every file switch.
  useEffect(() => {
    if (!currentUser) return;

    socket.connect();

    socket.emit("join-workspace", {
      workspaceId: id,
      user: {
        id: currentUser._id,
        username: currentUser.username,
      },
    });

    const handleReceiveFileChange = ({ fileId, content }) => {
      setOpenFiles(prev => prev.map(f => 
        f._id === fileId ? { ...f, content } : f
      ));
    };

    const handleReceiveCursorMove = ({ fileId, position, user }) => {
      setCursors((prev) => ({
        ...prev,
        [user.id]: { fileId, position, user },
      }));
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
      // Clean up cursors of users who left
      setCursors((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((uid) => {
          if (!users.find(u => u.id === uid)) {
            delete next[uid];
          }
        });
        return next;
      });
    };

    socket.on("receive-file-change", handleReceiveFileChange);
    socket.on("receive-cursor-move", handleReceiveCursorMove);
    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.emit("leave-workspace", id);
      socket.off("receive-file-change", handleReceiveFileChange);
      socket.off("receive-cursor-move", handleReceiveCursorMove);
      socket.off("online-users", handleOnlineUsers);
      socket.disconnect();
    };
  }, [id, currentUser]);

  return (
    <div className="flex h-full bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 shrink-0 flex flex-col border-r border-zinc-900 bg-zinc-950">
        <CollaboratorsList onlineUsers={onlineUsers} />
        <CreateItem name={name} setName={setName} createItem={createItem} />
        <FileTree
          files={files}
          activeFile={activeFile}
          onOpenFile={openFile}
          onRenameItem={renameItem}
          onDeleteItem={deleteItem}
        />
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">
          <EditorPanel
            openFiles={openFiles}
            activeFileId={activeFileId}
            saving={saving}
            onCodeChange={handleCodeChange}
            onSave={() => saveFile(activeFileId, code)}
            onRun={runCode}
            isExecuting={isExecuting}
            onTabClick={(id) => { skipNextAutosave.current = true; setActiveFileId(id); }}
            onCloseTab={closeTab}
            cursors={cursors}
            onCursorChange={handleCursorChange}
          />
        </div>

        <OutputPanel output={output} isExecuting={isExecuting} />
      </div>
    </div>
  );
}

export default Workspace;
