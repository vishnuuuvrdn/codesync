import React from "react";
import EditorPanel from "../EditorPanel";

export default function EditorArea({
  activeFile,
  files,
  handleCodeChange,
  saveFile,
  runCode,
  saving,
  openFiles,
  activeFileId,
  openFile,
  closeTab,
  cursors,
  handleCursorChange,
}) {
  return (
    <div className="flex-1 h-full min-h-0 overflow-hidden flex flex-col min-w-0 bg-[#1e1e1e]">
      <EditorPanel
        activeFile={activeFile}
        files={files}
        onCodeChange={handleCodeChange}
        onSave={saveFile}
        onRun={runCode}
        saving={saving}
        openFiles={openFiles}
        activeFileId={activeFileId}
        onTabClick={(tabId) => {
          const file = openFiles.find((f) => f._id === tabId);
          if (file) openFile(file);
        }}
        onCloseTab={closeTab}
        cursors={cursors}
        onCursorChange={handleCursorChange}
      />
    </div>
  );
}
