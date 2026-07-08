import Editor from "@monaco-editor/react";

function EditorPanel({
  activeFile,
  code,
  saving,
  onCodeChange,
  onSave,
  onRun,
  isExecuting,
}) {
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
      <div className="h-full flex flex-col items-center justify-center gap-2">
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
    // h-full + flex-col + min-h-0 is what actually caps this panel's height.
    // Without min-h-0, the Editor child below (height:100%) can force this
    // column to grow past its allotted space and push the terminal offscreen.
    <div className="h-full flex flex-col min-h-0">
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
        <div className="flex items-center gap-4">
          {saving && <span className="text-zinc-600 text-xs">saving...</span>}
          <button
            onClick={onSave}
            className="text-zinc-500 hover:text-white text-xs transition-colors cursor-pointer"
          >
            Save
          </button>
          <button
            onClick={onRun}
            disabled={isExecuting}
            className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition cursor-pointer"
          >
            {isExecuting ? "Running..." : "▶ Run"}
          </button>
        </div>
      </div>

      {/* flex-1 + min-h-0 gives Monaco a hard, scrollable box instead of
          letting height:100% cascade past the available space. */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
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
      </div>
    </div>
  );
}

export default EditorPanel;
