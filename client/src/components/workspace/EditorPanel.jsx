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

    editor.onDidChangeCursorSelection((e) => {
      if (onCursorChange) {
        onCursorChange({
          position: e.selection.getPosition(),
          selection: e.selection,
        });
      }
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
      .flatMap((c) => {
        let hash = 0;
        for (let i = 0; i < c.user.id.length; i++) hash = (hash << 5) - hash + c.user.id.charCodeAt(i);
        const colorIndex = Math.abs(hash) % 7;
        
        const isSelection = c.selection && 
          (c.selection.startLineNumber !== c.selection.endLineNumber || 
           c.selection.startColumn !== c.selection.endColumn);
           
        const result = [];
        
        if (isSelection) {
          result.push({
            range: new monaco.Range(
              c.selection.startLineNumber,
              c.selection.startColumn,
              c.selection.endLineNumber,
              c.selection.endColumn
            ),
            options: {
              className: `remote-selection-${colorIndex}`,
            }
          });
        }
        
        result.push({
          range: new monaco.Range(
            c.position.lineNumber,
            c.position.column,
            c.position.lineNumber,
            c.position.column
          ),
          options: {
            className: `remote-cursor remote-cursor-${colorIndex}`,
            hoverMessage: { value: c.user.username },
            stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            before: {
              content: '\u200B',
              inlineClassName: `remote-cursor-label remote-cursor-label-${colorIndex}`,
              inlineClassNameAffectsLetterSpacing: true,
            }
          },
        });
        
        return result;
      });

    decorationsCollectionRef.current.set(decorations);
  }, [cursors, activeFileId, editorInstance, monaco]);

  if (openFiles.length === 0 || !activeFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center select-none bg-black">
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-10 max-w-md w-full flex flex-col items-center shadow-xl">
          <svg width="48" height="48" viewBox="0 0 22 22" fill="none" className="mb-6">
            <rect width="22" height="22" rx="5" fill="white" />
            <path d="M6 8l5-3 5 3-5 3-5-3z" fill="black" opacity="0.9" />
            <path d="M16 8v5l-5 3V11l5-3z" fill="black" opacity="0.4" />
            <path d="M6 8v5l5 3V11L6 8z" fill="black" opacity="0.65" />
          </svg>
          <h2 className="text-xl text-white font-semibold tracking-tight mb-2">Welcome to CodeSync</h2>
          <p className="text-zinc-400 text-sm mb-8 text-center">Your modern, collaborative developer workspace.</p>
          <div className="flex w-full gap-3">
            <button className="flex-1 bg-white hover:bg-zinc-100 text-black text-sm font-medium rounded-lg py-2 transition-colors pointer-events-none">
              Create File
            </button>
            <button className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white text-sm font-medium rounded-lg py-2 transition-colors pointer-events-none">
              Create Folder
            </button>
          </div>
          <div className="w-full mt-3">
            <button className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white text-sm font-medium rounded-lg py-2 transition-colors pointer-events-none">
              Invite Collaborator
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black">
      {/* Tab bar */}
      <div className="h-10 shrink-0 flex items-center justify-between bg-black border-b border-zinc-900 px-4">
        <div className="flex items-center h-full overflow-x-auto min-w-0 no-scrollbar gap-2">
          {openFiles.map((file) => {
            const isActive = activeFileId === file._id;
            return (
              <div
                key={file._id}
                onClick={() => onTabClick(file._id)}
                className={`group flex items-center gap-2 h-full cursor-pointer transition-colors min-w-[80px] max-w-[200px] shrink-0 relative
                  ${isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"}
                `}
              >
                {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`shrink-0 ${isActive ? "text-zinc-300" : "text-zinc-500"}`}
                >
                  <path d="M4 2h5.5L12 4.5V14H4V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
                <span className={`truncate text-[12px] font-medium flex-1 ${isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}>{file.name}</span>
                {file.isDirty ? (
                  <span className="text-white text-[16px] shrink-0 w-4 h-4 flex items-center justify-center">●</span>
                ) : (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(file._id);
                    }}
                    className={`flex items-center justify-center w-4 h-4 rounded hover:bg-zinc-800 transition-colors shrink-0
                      ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                    `}
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="text-zinc-400">
                      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
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
            className="px-3 py-1.5 rounded-md bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition-colors cursor-pointer text-black shadow-sm flex items-center gap-1.5"
          >
            {isExecuting ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-3 w-3 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 2.5L13.5 8L4 13.5V2.5Z" />
                </svg>
                Run
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 relative min-h-0 bg-black">
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
