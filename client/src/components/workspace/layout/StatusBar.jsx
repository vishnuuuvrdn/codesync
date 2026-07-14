import React from "react";
import { Users, Server, CheckCheck, Code } from "lucide-react";

export default function StatusBar({ onlineUsers, workspaceName, isSaving }) {
  return (
    <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] select-none shrink-0">
      <div className="flex items-center gap-4 h-full">
        <div className="flex items-center gap-1.5 hover:bg-white/20 px-1.5 h-full cursor-pointer transition-colors">
          <Code size={12} />
          <span>{workspaceName || "Workspace"}</span>
        </div>
        <div className="flex items-center gap-1.5 hover:bg-white/20 px-1.5 h-full cursor-pointer transition-colors">
          <Users size={12} />
          <span>{onlineUsers?.length || 0} Connected</span>
        </div>
        <div className="flex items-center gap-1.5 hover:bg-white/20 px-1.5 h-full cursor-pointer transition-colors">
          <Server size={12} />
          <span>Docker Ready</span>
        </div>
      </div>

      <div className="flex items-center gap-4 h-full">
        <div className="flex items-center gap-1.5 hover:bg-white/20 px-1.5 h-full cursor-pointer transition-colors">
          {isSaving ? (
            <span className="animate-pulse">Saving...</span>
          ) : (
            <>
              <CheckCheck size={12} />
              <span>Saved</span>
            </>
          )}
        </div>
        <div className="flex items-center hover:bg-white/20 px-1.5 h-full cursor-pointer transition-colors">
          Ln 1, Col 1
        </div>
        <div className="flex items-center hover:bg-white/20 px-1.5 h-full cursor-pointer transition-colors">
          UTF-8
        </div>
        <div className="flex items-center hover:bg-white/20 px-1.5 h-full cursor-pointer transition-colors uppercase">
          JavaScript
        </div>
      </div>
    </div>
  );
}
