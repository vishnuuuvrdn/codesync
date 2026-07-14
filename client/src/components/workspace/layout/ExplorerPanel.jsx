import React, { useState } from "react";
import { Search } from "lucide-react";
import CollaboratorsList from "../CollaboratorsList";
import CreateItem from "../CreateItem";
import FileTree from "../FileTree";

export default function ExplorerPanel({
  onlineUsers,
  setShowInviteModal,
  name,
  setName,
  createItem,
  files,
  activeFile,
  openFile,
  renameItem,
  deleteItem,
  duplicateItem,
  moveItem,
  workspaceName,
}) {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col h-full w-[280px] shrink-0 bg-black border-r border-zinc-900 min-w-0 select-none">
      {/* Top: Workspace Name & Search */}
      <div className="flex flex-col gap-4 px-6 pt-6 pb-2 shrink-0">
        <h2 className="text-white text-base font-semibold tracking-tight truncate">
          {workspaceName || "Workspace"}
        </h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-zinc-500 text-zinc-300 text-sm rounded-lg pl-9 pr-3 py-2 outline-none transition-colors placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Middle: Create Item & File Tree */}
      <div className="flex flex-col flex-1 min-h-0">
        <CreateItem name={name} setName={setName} createItem={createItem} />
        <FileTree
          files={files}
          activeFile={activeFile}
          onOpenFile={openFile}
          onRenameItem={renameItem}
          onDeleteItem={deleteItem}
          onDuplicateItem={duplicateItem}
          onMoveItem={moveItem}
          searchQuery={search}
        />
      </div>

      {/* Bottom: Collaborators (pinned) */}
      <div className="shrink-0 border-t border-zinc-900">
        <CollaboratorsList onlineUsers={onlineUsers} onInviteClick={() => setShowInviteModal(true)} />
      </div>
    </div>
  );
}
