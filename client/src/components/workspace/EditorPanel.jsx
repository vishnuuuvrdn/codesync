import Editor from "@monaco-editor/react";

function EditorPanel({ activeFile, code, saving, onCodeChange, onSave }) {
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

  if (!activeFile) {
    return (
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
    );
  }

  return (
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
          {saving && <span className="text-zinc-600 text-xs">saving…</span>}
          <button
            onClick={onSave}
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
        onChange={(value = "") => onCodeChange(value)}
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
  );
}

export default EditorPanel;
