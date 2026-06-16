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

  const fetchFiles = async () => {
    try {
      const res = await api.get(`/files/${id}`);
      setFiles(res.data.files);
    } catch (error) {
      console.log(error);
    }
  };

  const createItem = async (type) => {
    if (!name) return;

    try {
      await api.post("/files", {
        name,
        type,
        workspaceId: id,
      });

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

    try {
      await api.put(`/files/${activeFile._id}`, {
        content: code,
      });

      console.log("saved");
    } catch (error) {
      console.log(error);
    }
  };

  const getLanguage = (filename) => {
    const ext = filename.split(".").pop();

    const languages = {
      js: "javascript",
      jsx: "javascript",
      cpp: "cpp",
      py: "python",
      java: "java",
      html: "html",
      css: "css",
      json: "json",
    };

    return languages[ext] || "text";
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // autosave
  useEffect(() => {
    if (!activeFile) return;

    const timer = setTimeout(() => {
      saveFile();
    }, 1000);

    return () => clearTimeout(timer);
  }, [code]);

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white">
      {/* Explorer */}

      <div className="w-64 bg-[#181818] border-r border-gray-700 p-3">
        <h2 className="text-xl mb-4">Explorer</h2>

        <input
          placeholder="filename"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
          w-full
          bg-[#252526]
          px-2
          py-1
          rounded
          outline-none
          "
        />

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => createItem("file")}
            className="bg-gray-700 px-3 py-1 rounded"
          >
            File
          </button>

          <button
            onClick={() => createItem("folder")}
            className="bg-gray-700 px-3 py-1 rounded"
          >
            Folder
          </button>
        </div>

        <div className="mt-5">
          {files.map((file) => (
            <div
              key={file._id}
              onClick={() => openFile(file)}
              className="
              cursor-pointer
              px-2
              py-1
              rounded
              hover:bg-[#2a2d2e]
              "
            >
              {file.type === "folder" ? "📁" : "📄"} {file.name}
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}

      <div className="flex-1">
        {activeFile ? (
          <>
            <div className="h-10 bg-[#252526] flex items-center justify-between px-5 border-b border-gray-700">
              <span>{activeFile.name}</span>

              <button
                onClick={saveFile}
                className="bg-blue-600 px-3 py-1 rounded text-sm"
              >
                Save
              </button>
            </div>

            <Editor
              height="calc(100vh - 40px)"
              language={getLanguage(activeFile.name)}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
            />
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Open a file
          </div>
        )}
      </div>
    </div>
  );
}

export default Workspace;
