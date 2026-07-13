import { useState, useMemo, useEffect, useRef } from "react";

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
  const [isExpanded, setIsExpanded] = useState(false);
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
    setIsExpanded((prev) => !prev);
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

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={handleRightClick}
        className={`flex items-center gap-1.5 py-1.5 text-xs cursor-pointer transition-colors
          ${isActive ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"}
        `}
        style={{ paddingLeft: `${1 + depth * 1}rem`, paddingRight: '1rem' }}
      >
        {isFolder ? (
          <span
            onClick={handleToggle}
            className={`shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""} text-zinc-600 hover:text-zinc-400`}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "16px", height: "16px" }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M5.5 3L10.5 8L5.5 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ) : (
          <span style={{ width: "16px", display: "inline-block" }} />
        )}
        
        {isFolder ? (
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0 text-zinc-600"
          >
            <path
              d="M1.5 3.5A1 1 0 012.5 2.5h3l1.5 2h6a1 1 0 011 1v7a1 1 0 01-1 1h-11a1 1 0 01-1-1v-9z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0 text-zinc-600"
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
        )}
        {isRenaming ? (
          <input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-zinc-700 text-white text-xs rounded px-1 outline-none w-full"
          />
        ) : (
          <span className="truncate select-none">{node.name}</span>
        )}
      </div>
      
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
  );
};

function FileTree({ files, activeFile, onOpenFile, onRenameItem, onDeleteItem }) {
  const [contextMenu, setContextMenu] = useState(null);
  const [renamingNodeId, setRenamingNodeId] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleContextMenu = (e, node) => {
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node,
    });
  };

  const handleRenameClick = () => {
    if (contextMenu?.node) {
      setRenamingNodeId(contextMenu.node._id);
    }
    setContextMenu(null);
  };

  const handleDeleteClick = () => {
    if (contextMenu?.node) {
      onDeleteItem(contextMenu.node._id);
    }
    setContextMenu(null);
  };

  // Build tree structure from flat array
  const fileTree = useMemo(() => {
    const map = {};
    const roots = [];

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
        if (node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(roots);
    return roots;
  }, [files]);

  return (
    <div className="flex-1 overflow-y-auto py-2 relative">
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

      {contextMenu && (
        <div
          className="fixed bg-zinc-800 border border-zinc-700 rounded-md shadow-xl py-1 z-50 text-xs text-zinc-300 min-w-[120px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleRenameClick}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            Rename
          </button>
          <button
            onClick={handleDeleteClick}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-700 text-red-400 hover:text-red-300 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default FileTree;
