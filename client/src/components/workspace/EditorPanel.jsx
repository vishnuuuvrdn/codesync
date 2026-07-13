import { useState, useRef, useEffect, useCallback } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

const LANGUAGE_MAP = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  cpp: "cpp",
  cc: "cpp",
  c: "c",
  py: "python",
  java: "java",
  html: "html",
  css: "css",
  json: "json",
  md: "markdown",
  sh: "shell",
  yaml: "yaml",
  yml: "yaml",
};

function getLanguage(filename) {
  const ext = filename?.split(".").pop()?.toLowerCase() || "";
  return LANGUAGE_MAP[ext] || "plaintext";
}

function EditorPanel({
  openFiles = [],
  files = [],
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

  // Refs to avoid stale closures in addCommand callbacks
  const activeFileIdRef = useRef(activeFileId);
  const onSaveRef = useRef(onSave);
  const onCloseTabRef = useRef(onCloseTab);

  useEffect(() => {
    activeFileIdRef.current = activeFileId;
  }, [activeFileId]);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    onCloseTabRef.current = onCloseTab;
  }, [onCloseTab]);

  const activeFile = openFiles.find((f) => f._id === activeFileId);
  const code = activeFile?.content || "";

  const handleEditorMount = (editor, monacoInstance) => {
    setEditorInstance(editor);
    decorationsCollectionRef.current = editor.createDecorationsCollection();

    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) onCursorChange(e.position);
    });

    // Keybindings — use refs to avoid stale closures
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
      onSaveRef.current?.(activeFileIdRef.current);
    });

    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyW, () => {
      if (activeFileIdRef.current) {
        onCloseTabRef.current?.(activeFileIdRef.current);
      }
    });

    // Ctrl+/ — Toggle line comment (Monaco handles this natively, but we register it to prevent default)
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Slash,
      () => editor.getAction("editor.action.commentLine")?.run()
    );

    // Ctrl+P is intentionally left to Monaco's built-in command palette
  };

  // Auto-save debounce
  const saveTimeoutRef = useRef(null);

  const handleCodeChangeLocal = useCallback(
    (value) => {
      onCodeChange(value);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        onSaveRef.current?.(activeFileIdRef.current);
      }, 2000);
    },
    [onCodeChange]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  // Remote cursor decorations
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
        },
      }));

    decorationsCollectionRef.current.set(decorations);
  }, [cursors, activeFileId, editorInstance, monaco]);

  if (openFiles.length === 0 || !activeFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 select-none">
        <svg width="40" height="40" viewBox="0 0 16 16" fill="none" className="text-zinc-800">
          <path d="M4 2h5.5L12 4.5V14H4V2z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
          <path d="M9 2v3h3" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
        </svg>
        <div className="text-center">
          <p className="text-zinc-600 text-sm">Open a file to start editing</p>
          <p className="text-zinc-700 text-xs mt-1">Right-click a file in the explorer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Tab bar */}
      <div className="h-9 shrink-0 flex items-center justify-between border-b border-zinc-900 bg-zinc-950">
        <div className="flex items-center h-full overflow-x-auto min-w-0 no-scrollbar">
          {openFiles.map((file) => (
            <div
              key={file._id}
              onClick={() => onTabClick(file._id)}
              className={`group flex items-center gap-1.5 px-3 py-1.5 h-full cursor-pointer border-r border-zinc-900 transition-colors min-w-[100px] max-w-[180px] shrink-0
                ${activeFileId === file._id ? "bg-zinc-900 text-zinc-200" : "hover:bg-zinc-900/50 text-zinc-500"}
              `}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 16 16"
                fill="none"
                className={`shrink-0 ${activeFileId === file._id ? "text-zinc-400" : "text-zinc-600"}`}
              >
                <path d="M4 2h5.5L12 4.5V14H4V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
              <span className="truncate text-xs flex-1">{file.name}</span>
              {file.isDirty && (
                <span className="text-blue-400 text-[10px] shrink-0">●</span>
              )}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(file._id);
                }}
                className={`flex items-center justify-center w-4 h-4 rounded hover:bg-zinc-700 transition-colors shrink-0
                  ${activeFileId === file._id ? "opacity-60 hover:opacity-100" : "opacity-0 group-hover:opacity-60 hover:!opacity-100"}
                `}
              >
                <svg width="9" height="9" viewBox="0 0 16 16" fill="none" className="text-zinc-400">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 px-4 shrink-0">
          {saving && <span className="text-zinc-500 text-xs">saving…</span>}
          <button
            onClick={() => onSave(activeFileId)}
            className="text-zinc-500 hover:text-zinc-200 text-xs transition-colors cursor-pointer"
            title="Save (Ctrl+S)"
          >
            Save
          </button>
          <button
            onClick={onRun}
            disabled={isExecuting}
            className="px-3 py-1 rounded bg-green-700 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition cursor-pointer text-white"
          >
            {isExecuting ? "Running…" : "▶ Run"}
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="h-6 flex items-center px-4 bg-[#1e1e1e] border-b border-zinc-900 text-[11px] text-zinc-500 shrink-0 overflow-hidden">
        {(() => {
          const breadcrumbs = [];
          let current = files.find((f) => f._id === activeFile._id) || activeFile;
          while (current) {
            breadcrumbs.unshift(current.name);
            current = files.find((f) => f._id === current.parent);
          }
          return breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && <span className="text-zinc-700 mx-0.5">›</span>}
              <span className={`truncate ${i === breadcrumbs.length - 1 ? "text-zinc-300" : "text-zinc-600"}`}>
                {crumb}
              </span>
            </span>
          ));
        })()}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          path={activeFile._id}
          language={getLanguage(activeFile.name)}
          theme="vs-dark"
          value={code}
          onChange={(value = "") => handleCodeChangeLocal(value)}
          onMount={handleEditorMount}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, Consolas, monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            lineNumbersMinChars: 3,
            renderWhitespace: "selection",
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true },
          }}
        />
      </div>
    </div>
  );
}

export default EditorPanel;
