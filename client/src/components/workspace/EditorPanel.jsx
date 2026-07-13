import { useState, useRef, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

function EditorPanel({
  openFiles,
  activeFileId,
  saving,
  onCodeChange,
  onSave,
  onRun,
  isExecuting,
  onTabClick,
  onCloseTab,
  cursors = {},
  onCursorChange,
}) {
  const monaco = useMonaco();
  const [editorInstance, setEditorInstance] = useState(null);
  const decorationsCollectionRef = useRef(null);

  const activeFile = openFiles.find(f => f._id === activeFileId);
  const code = activeFile?.content || "";

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

  const handleEditorMount = (editor, monacoInstance) => {
    setEditorInstance(editor);
    decorationsCollectionRef.current = editor.createDecorationsCollection();

    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange(e.position);
      }
    });
  };

  useEffect(() => {
    if (!editorInstance || !decorationsCollectionRef.current || !monaco) return;
    
    const decorations = Object.values(cursors)
      .filter((c) => c.fileId === activeFileId)
      .map((c) => ({
        range: new monaco.Range(
          c.position.lineNumber, 
          c.position.column, 
          c.position.lineNumber, 
          c.position.column
        ),
        options: {
          className: "remote-cursor",
          hoverMessage: { value: c.user.username },
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        }
      }));
      
    decorationsCollectionRef.current.set(decorations);
  }, [cursors, activeFileId, editorInstance, monaco]);

  if (openFiles.length === 0 || !activeFile) {
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
    <div className="h-full flex flex-col min-h-0">
      <div className="h-9 shrink-0 flex items-center justify-between border-b border-zinc-900 bg-zinc-950">
        <div className="flex items-center h-full overflow-x-auto min-w-0 no-scrollbar">
          {openFiles.map(file => (
            <div
              key={file._id}
              onClick={() => onTabClick(file._id)}
              className={`group flex items-center gap-2 px-3 py-1.5 h-full cursor-pointer border-r border-zinc-900 transition-colors min-w-[120px] max-w-[200px]
                ${activeFileId === file._id ? "bg-zinc-900 text-zinc-200" : "hover:bg-zinc-900 text-zinc-500"}
              `}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                className={activeFileId === file._id ? "text-zinc-400" : "text-zinc-600"}
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
              <span className="truncate text-xs flex-1">{file.name}</span>
              <div 
                onClick={(e) => onCloseTab(file._id, e)}
                className={`flex items-center justify-center w-4 h-4 rounded hover:bg-zinc-700 transition-colors 
                  ${activeFileId === file._id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}
              >
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="text-zinc-400 hover:text-white">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-4 px-4 shrink-0 bg-zinc-950">
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

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          path={activeFile._id}
          language={getLanguage(activeFile.name)}
          theme="vs-dark"
          value={code}
          onChange={(value = "") => onCodeChange(value)}
          onMount={handleEditorMount}
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
