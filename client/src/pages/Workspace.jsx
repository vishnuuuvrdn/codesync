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
  const [activeFile, setActiveFile] = useState(null);
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  // Keep a ref to the latest activeFile so the socket listener (registered
  // once) always sees the current file without forcing a reconnect.
  const activeFileRef = useRef(activeFile);
  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  // Skip the autosave that would otherwise fire the instant a file is opened
  // (code changes because we just loaded it, not because the user edited it).
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
    try {
      const res = await api.get(`/files/open/${file._id}`);
      skipNextAutosave.current = true;
      setActiveFile(res.data.file);
      setCode(res.data.file.content);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave, skipping the save that would fire right after opening a file.
  useEffect(() => {
    if (!activeFile) return;
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }
    const timer = setTimeout(() => saveFile(activeFile._id, code), 1000);
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
      const current = activeFileRef.current;
      if (!current) return;
      if (current._id === fileId) setCode(content);
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on("receive-file-change", handleReceiveFileChange);
    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.emit("leave-workspace", id);
      socket.off("receive-file-change", handleReceiveFileChange);
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
        <FileTree files={files} activeFile={activeFile} onOpenFile={openFile} />
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">
          <EditorPanel
            activeFile={activeFile}
            code={code}
            saving={saving}
            onCodeChange={handleCodeChange}
            onSave={() => saveFile(activeFile?._id, code)}
            onRun={runCode}
            isExecuting={isExecuting}
          />
        </div>

        <OutputPanel output={output} isExecuting={isExecuting} />
      </div>
    </div>
  );
}

export default Workspace;
