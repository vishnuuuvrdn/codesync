import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import api from "../api/axios";

function Workspace() {
  const { id } = useParams();

  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [activeFile, setActiveFile] = useState(null);
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

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

  const getLanguage = (filename) => {
    const ext = filename.split(".").pop();
    const map = {
      js: "javascript",
      jsx: "javascript",
      cpp: "cpp",
      py: "python",
      java: "java",
      html: "html",
      css: "css",
      json: "json",
    };
    return map[ext] || "text";
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (!activeFile) return;
    const timer = setTimeout(() => saveFile(), 1000);
    return () => clearTimeout(timer);
  }, [code]);

  return (
    <div className="flex h-full bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 shrink-0 flex flex-col border-r border-zinc-900 bg-zinc-950">
        {/* New file/folder */}
        <div className="px-3 py-3 border-b border-zinc-900">
          <input
            placeholder="filename or folder"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createItem("file")}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-600 text-white text-xs rounded-md px-2.5 py-1.5 outline-none placeholder:text-zinc-600 transition-colors mb-2"
          />
          <div className="flex gap-1.5">
            <button
              onClick={() => createItem("file")}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs rounded-md py-1.5 transition-colors cursor-pointer"
            >
              + File
            </button>
            <button
              onClick={() => createItem("folder")}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs rounded-md py-1.5 transition-colors cursor-pointer"
            >
              + Folder
            </button>
          </div>
        </div>

        {/* File tree */}
        <div className="flex-1 overflow-y-auto py-2">
          {files.length === 0 ? (
            <p className="text-zinc-700 text-xs px-4 py-3">No files yet.</p>
          ) : (
            files.map((file) => (
              <div
                key={file._id}
                onClick={() => openFile(file)}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs cursor-pointer transition-colors
                  ${activeFile?._id === file._id ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"}
                  ${file.type === "folder" ? "cursor-default" : ""}
                `}
              >
                {file.type === "folder" ? (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="shrink-0 text-zinc-600"
                  >
                    <path
                      d="M1.5 3.5A1 1 0 012.5 2.5h3l1.5 2h6a1 1 0 011 1v7a1 1 0 01-1 1h-11a1 1 0 01-1-1v-9z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="shrink-0 text-zinc-600"
                  >
                    <path
                      d="M4 2h5.5L12 4.5V14H4V2z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 2v3h3"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                <span className="truncate">{file.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeFile ? (
          <>
            <div className="h-9 shrink-0 flex items-center justify-between px-4 border-b border-zinc-900 bg-zinc-950">
              <div className="flex items-center gap-2">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-zinc-600"
                >
                  <path
                    d="M4 2h5.5L12 4.5V14H4V2z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 2v3h3"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-zinc-400 text-xs">{activeFile.name}</span>
              </div>
              <div className="flex items-center gap-3">
                {saving && (
                  <span className="text-zinc-600 text-xs">saving…</span>
                )}
                <button
                  onClick={saveFile}
                  className="text-zinc-500 hover:text-white text-xs transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
            <Editor
              height="calc(100vh - 80px)"
              language={getLanguage(activeFile.name)}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              options={{
                fontSize: 13,
                fontFamily: "ui-monospace, Consolas, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                lineNumbersMinChars: 3,
              }}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 16 16"
              fill="none"
              className="text-zinc-800"
            >
              <path
                d="M4 2h5.5L12 4.5V14H4V2z"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <path
                d="M9 2v3h3"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-zinc-700 text-sm">Select a file to edit</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Workspace;
