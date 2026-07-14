import React, { useState, useMemo, useEffect, useRef } from "react";
import { DndContext, useDraggable, useDroppable, closestCenter, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { File, Folder, FolderOpen, Search, ChevronsUpDown, ChevronsDownUp } from "lucide-react";
import { useWorkspaceSession } from "../../contexts/WorkspaceSessionContext";

const FileNode = ({ 
  node, 
  activeFile, 
  onOpenFile, 
  depth = 0, 
  onContextMenu, 
  renamingNodeId, 
  setRenamingNodeId, 
  onRenameItem 
}) => {
  const { expandedFolders, toggleFolder } = useWorkspaceSession();
  const isExpanded = !!expandedFolders[node._id];
  const isFolder = node.type === "folder";
  const isActive = activeFile?._id === node._id;
  const isRenaming = renamingNodeId === node._id;
  
  const [editName, setEditName] = useState(node.name);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isRenaming) {
      setEditName(node.name);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isRenaming, node.name]);

  const handleToggle = (e) => {
    e.stopPropagation();
    toggleFolder(node._id);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (isFolder) {
      handleToggle(e);
    } else {
      onOpenFile(node);
    }
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, node);
  };

  const submitRename = () => {
    if (editName.trim() && editName !== node.name) {
      onRenameItem(node._id, editName.trim());
    }
    setRenamingNodeId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      submitRename();
    } else if (e.key === "Escape") {
      setRenamingNodeId(null);
    }
  };

  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: node._id,
    data: node,
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: isFolder ? node._id : "none",
    data: node,
    disabled: !isFolder,
  });

  const setRefs = (element) => {
    setDraggableRef(element);
    if (isFolder) setDroppableRef(element);
  };

  return (
    <div>
      <div
        ref={setRefs}
        {...attributes}
        {...listeners}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        className={`group flex items-center gap-1.5 py-1.5 text-sm cursor-pointer transition-colors select-none min-w-0 rounded-md mx-2
          ${isActive ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}
          ${isDragging ? "opacity-50" : "opacity-100"}
          ${isOver ? "bg-zinc-800 outline outline-1 outline-zinc-500" : ""}
        `}
        style={{ paddingLeft: `${0.25 + depth * 1.25}rem`, paddingRight: '0.5rem' }}
      >
        <div 
          onClick={isFolder ? handleToggle : undefined} 
          className="shrink-0 flex items-center justify-center w-4 h-4"
        >
          {isFolder ? (
            <svg
              width="10"
              height="10"
              viewBox="0 0 16 16"
              fill="none"
              className={`shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""} text-zinc-500`}
            >
              <path d="M5.5 3L10.5 8L5.5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
        </div>
        
        {isFolder ? (
          isExpanded ? (
            <FolderOpen size={14} className="shrink-0 text-accent" />
          ) : (
            <Folder size={14} className="shrink-0 text-accent" />
          )
        ) : (
          <File size={14} className="shrink-0 text-zinc-500" />
        )}

        {isRenaming ? (
          <input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-zinc-700 text-white text-xs rounded px-1 outline-none w-full min-w-0"
          />
        ) : (
          <span className="truncate flex-1 min-w-0">{node.name}</span>
        )}
      </div>
      
      <div 
        className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? "max-h-full opacity-100" : "max-h-0 opacity-0"}`}
      >
        {isFolder && isExpanded && node.children && (
          <div>
          {node.children.map((child) => (
            <FileNode
              key={child._id}
              node={child}
              activeFile={activeFile}
              onOpenFile={onOpenFile}
              depth={depth + 1}
              onContextMenu={onContextMenu}
              renamingNodeId={renamingNodeId}
              setRenamingNodeId={setRenamingNodeId}
              onRenameItem={onRenameItem}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default function FileTree({ 
  files, 
  activeFile, 
  onOpenFile, 
  onRenameItem, 
  onDeleteItem, 
  onDuplicateItem, 
  onMoveItem,
  searchQuery = ""
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [renamingNodeId, setRenamingNodeId] = useState(null);
  const { setExpandedFolders, expandedFolders, activeFileId } = useWorkspaceSession();

  // Auto-reveal active file
  useEffect(() => {
    if (searchQuery.trim() === "" && activeFileId) {
      const activeNode = files.find(f => f._id === activeFileId);
      if (activeNode) {
        const parentsToExpand = {};
        let currentParent = activeNode.parent;
        while (currentParent) {
          parentsToExpand[currentParent] = true;
          const parentNode = files.find(f => f._id === currentParent);
          currentParent = parentNode ? parentNode.parent : null;
        }
        setExpandedFolders(prev => ({ ...prev, ...parentsToExpand }));
      }
    }
  }, [activeFileId, files, setExpandedFolders]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleContextMenu = (e, node) => {
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleRenameClick = () => {
    if (contextMenu?.node) setRenamingNodeId(contextMenu.node._id);
    setContextMenu(null);
  };

  const handleDeleteClick = () => {
    if (contextMenu?.node) onDeleteItem(contextMenu.node._id);
    setContextMenu(null);
  };

  const handleDuplicateClick = () => {
    if (contextMenu?.node && onDuplicateItem) {
      onDuplicateItem(contextMenu.node._id);
    }
    setContextMenu(null);
  };

  // Build filtered tree structure
  const fileTree = useMemo(() => {
    const map = {};
    const roots = [];

    // Filter logic
    const filteredFiles = searchQuery 
      ? files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : files;

    // If searching, show as flat list or resolve parents. For simplicity, if searching, just flat list matching nodes (if we want them in tree, we have to include parents)
    if (searchQuery) {
      // Just return sorted flat list of matches for search
      return filteredFiles.sort((a, b) => a.name.localeCompare(b.name)).map(f => ({...f, children: []}));
    }

    files.forEach((file) => {
      map[file._id] = { ...file, children: [] };
    });

    files.forEach((file) => {
      if (file.parent && map[file.parent]) {
        map[file.parent].children.push(map[file._id]);
      } else {
        roots.push(map[file._id]);
      }
    });

    const sortNodes = (nodes) => {
      nodes.sort((a, b) => {
        if (a.type === "folder" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "folder") return 1;
        return a.name.localeCompare(b.name);
      });
      nodes.forEach((node) => {
        if (node.children.length > 0) sortNodes(node.children);
      });
    };

    sortNodes(roots);
    return roots;
  }, [files, searchQuery]);

  const expandAll = () => {
    const allFolders = {};
    files.filter(f => f.type === "folder").forEach(f => allFolders[f._id] = true);
    setExpandedFolders(allFolders);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const collapseAll = () => {
    setExpandedFolders({});
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const draggedNodeId = active.id;
      const targetFolderId = over.id === "root" ? null : over.id;
      
      const draggedFile = files.find(f => f._id === draggedNodeId);
      if (draggedFile && draggedFile.parent !== targetFolderId) {
        if (onMoveItem) onMoveItem(draggedNodeId, targetFolderId);
      }
    }
  };

  // Droppable root for dropping back to root level
  const { setNodeRef: setRootDroppable, isOver: isRootOver } = useDroppable({
    id: "root",
  });

  return (
    <div className="flex flex-col h-full overflow-hidden min-w-0">
      <div className="flex justify-end px-5 py-1">
        <div className="flex gap-2 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
          <button onClick={expandAll} className="text-zinc-500 hover:text-white" title="Expand All">
            <ChevronsUpDown size={12} />
          </button>
          <button onClick={collapseAll} className="text-zinc-500 hover:text-white" title="Collapse All">
            <ChevronsDownUp size={12} />
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div 
          ref={setRootDroppable}
          className={`flex-1 overflow-y-auto py-2 relative custom-scrollbar ${isRootOver ? "bg-zinc-900/50" : ""}`}
        >
          {fileTree.length === 0 ? (
            <p className="text-zinc-700 text-xs px-4 py-3">No files yet.</p>
          ) : (
            fileTree.map((node) => (
              <FileNode
                key={node._id}
                node={node}
                activeFile={activeFile}
                onOpenFile={onOpenFile}
                onContextMenu={handleContextMenu}
                renamingNodeId={renamingNodeId}
                setRenamingNodeId={setRenamingNodeId}
                onRenameItem={onRenameItem}
              />
            ))
          )}
        </div>
      </DndContext>

      {contextMenu && (
        <div
          className="fixed bg-zinc-800 border border-zinc-700 rounded shadow-xl py-1 z-50 text-xs text-zinc-200 min-w-[140px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={handleRenameClick} className="w-full text-left px-3 py-1.5 hover:bg-accent hover:text-white transition-colors">Rename</button>
          <button onClick={handleDuplicateClick} className="w-full text-left px-3 py-1.5 hover:bg-accent hover:text-white transition-colors">Duplicate</button>
          <div className="h-px bg-zinc-700 my-1 mx-2"></div>
          <button onClick={handleDeleteClick} className="w-full text-left px-3 py-1.5 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors">Delete</button>
        </div>
      )}
    </div>
  );
}
