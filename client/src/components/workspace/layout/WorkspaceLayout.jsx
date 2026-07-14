import React from "react";
import ActivityBar from "./ActivityBar";
import StatusBar from "./StatusBar";
import ExplorerPanel from "./ExplorerPanel";
import EditorArea from "./EditorArea";
import BottomPanel from "./BottomPanel";
import InviteModal from "../InviteModal";
import WorkspaceNavbar from "./WorkspaceNavbar";

export default function WorkspaceLayout({
  // Workspace Layout / General State
  workspaceId,
  showInviteModal,
  setShowInviteModal,
  onlineUsers,
  isSaving,
  bottomTab,
  setBottomTab,
  
  // Explorer Props
  name,
  setName,
  createItem,
  files,
  
  // Editor / Bottom Panel Props
  activeFile,
  handleCodeChange,
  saveFile,
  runCode,
  openFiles,
  activeFileId,
  openFile,
  closeTab,
  cursors,
  handleCursorChange,
  
  // Bottom Panel Props
  output,
  isExecuting,
  
  // File operations
  renameItem,
  deleteItem,
  duplicateItem,
  moveItem
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black text-white overflow-hidden">
      <WorkspaceNavbar 
        workspaceName={name}
        activeFile={activeFile}
        onlineUsers={onlineUsers}
        isSaving={isSaving}
      />
      <div className="flex flex-1 min-h-0 min-w-0">
        <ExplorerPanel 
          onlineUsers={onlineUsers}
          setShowInviteModal={setShowInviteModal}
          name={name}
          setName={setName}
          createItem={createItem}
          files={files}
          activeFile={activeFile}
          openFile={openFile}
          renameItem={renameItem}
          deleteItem={deleteItem}
          duplicateItem={duplicateItem}
          moveItem={moveItem}
        />
        
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <EditorArea 
            activeFile={activeFile}
            files={files}
            handleCodeChange={handleCodeChange}
            saveFile={saveFile}
            runCode={runCode}
            saving={isSaving}
            openFiles={openFiles}
            activeFileId={activeFileId}
            openFile={openFile}
            closeTab={closeTab}
            cursors={cursors}
            handleCursorChange={handleCursorChange}
          />
          
          <BottomPanel 
            bottomTab={bottomTab}
            setBottomTab={setBottomTab}
            output={output}
            isExecuting={isExecuting}
          />
        </div>
      </div>

      {showInviteModal && (
        <InviteModal workspaceId={workspaceId} onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}
