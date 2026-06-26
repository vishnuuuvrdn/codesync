import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import socket from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import CollaboratorsList from "../components/workspace/CollaboratorsList";
import CreateItem from "../components/workspace/CreateItem";
import FileTree from "../components/workspace/FileTree";
import EditorPanel from "../components/workspace/EditorPanel";

function Workspace() {
  const { id } = useParams();
  const { currentUser } = useAuth();

  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [activeFile, setActiveFile] = useState(null);
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

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
    try {
      const res = await api.get(`/files/open/${file._id}`);
      setActiveFile(res.data.file);
      setCode(res.data.file.content);
    } catch (error) {
      console.log(error);
    }
  };

  const saveFile = async () => {
    if (!activeFile) return;
    setSaving(true);
    try {
      await api.put(`/files/${activeFile._id}`, { content: code });
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCodeChange = (value) => {
    setCode(value);
    if (!activeFile) return;
    socket.emit("file-change", {
      workspaceId: id,
      fileId: activeFile._id,
      content: value,
    });
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (!activeFile) return;
    const timer = setTimeout(() => saveFile(), 1000);
    return () => clearTimeout(timer);
  }, [code]);

  useEffect(() => {
    socket.connect();

    socket.emit("join-workspace", {
      workspaceId: id,
      user: {
        id: currentUser._id,
        username: currentUser.username,
      },
    });

    socket.on("receive-file-change", ({ fileId, content }) => {
      if (!activeFile) return;
      if (activeFile._id === fileId) setCode(content);
    });

    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.emit("leave-workspace", id);
      socket.off("receive-file-change");
      socket.off("online-users");
      socket.disconnect();
    };
  }, [id, activeFile]);

  return (
    <div className="flex h-full bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 shrink-0 flex flex-col border-r border-zinc-900 bg-zinc-950">
        <CollaboratorsList onlineUsers={onlineUsers} />
        <CreateItem name={name} setName={setName} createItem={createItem} />
        <FileTree files={files} activeFile={activeFile} onOpenFile={openFile} />
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <EditorPanel
          activeFile={activeFile}
          code={code}
          saving={saving}
          onCodeChange={handleCodeChange}
          onSave={saveFile}
        />
      </div>
    </div>
  );
}

export default Workspace;
