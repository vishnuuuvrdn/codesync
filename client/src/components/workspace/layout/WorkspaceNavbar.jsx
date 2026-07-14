import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function WorkspaceNavbar({
  workspaceName,
  activeFile,
  onlineUsers,
  isSaving,
}) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Create breadcrumb from activeFile.name and parent if available
  // E.g. src / App.jsx (Simplified for now since we don't have full path traversal here)
  const breadcrumb = activeFile ? activeFile.name : "";

  return (
    <div className="h-12 shrink-0 flex items-center justify-between px-6 border-b border-zinc-900 bg-black select-none">
      {/* Left: Logo & Workspace Name */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
            <rect width="22" height="22" rx="5" fill="white" />
            <path d="M6 8l5-3 5 3-5 3-5-3z" fill="black" opacity="0.9" />
            <path d="M16 8v5l-5 3V11l5-3z" fill="black" opacity="0.4" />
            <path d="M6 8v5l5 3V11L6 8z" fill="black" opacity="0.65" />
          </svg>
          <span className="text-zinc-300 text-sm font-medium tracking-tight hover:text-white transition-colors">
            codesync
          </span>
        </button>
        <div className="w-[1px] h-4 bg-zinc-800" />
        <span className="text-zinc-400 text-xs font-medium truncate max-w-[200px]">
          {workspaceName || "Workspace"}
        </span>
      </div>

      {/* Center: Active File Breadcrumb */}
      <div className="flex-1 flex justify-center items-center">
        {breadcrumb && (
          <span className="text-zinc-400 text-xs font-medium tracking-tight">
            {breadcrumb}
          </span>
        )}
      </div>

      {/* Right: Collaborators, Save Status, User Profile */}
      <div className="flex items-center justify-end gap-4 flex-1">
        <div className="flex items-center">
          {onlineUsers.slice(0, 5).map((user, i) => (
            <div
              key={user.socketId || user.id || i}
              className="w-6 h-6 rounded-full bg-zinc-800 border border-black flex items-center justify-center text-[10px] font-bold text-white -ml-2 first:ml-0"
              title={user.username}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
          ))}
          {onlineUsers.length > 5 && (
            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-black flex items-center justify-center text-[10px] font-bold text-white -ml-2">
              +{onlineUsers.length - 5}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          {isSaving ? (
            <span className="text-zinc-400">Saving...</span>
          ) : (
            <span className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="text-green-500">
                <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Saved
            </span>
          )}
        </div>

        <div className="w-[1px] h-4 bg-zinc-800" />

        {currentUser && (
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm cursor-pointer hover:ring-2 hover:ring-zinc-800 transition-all">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
