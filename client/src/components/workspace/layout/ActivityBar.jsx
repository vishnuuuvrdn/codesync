import React from "react";
import { Files, Search, TerminalSquare, Settings } from "lucide-react";

export default function ActivityBar() {
  return (
    <div className="w-[48px] h-full bg-[#18181b] flex flex-col items-center py-3 shrink-0 border-r border-zinc-900 select-none">
      <div className="flex flex-col gap-5 flex-1 w-full">
        <button className="flex justify-center w-full relative text-white cursor-pointer" title="Explorer">
          <Files size={22} strokeWidth={1.5} />
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-full bg-blue-500" />
        </button>
        <button className="flex justify-center w-full text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer" title="Search">
          <Search size={22} strokeWidth={1.5} />
        </button>
        <button className="flex justify-center w-full text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer" title="Terminal">
          <TerminalSquare size={22} strokeWidth={1.5} />
        </button>
      </div>
      
      <div className="flex flex-col gap-5 mt-auto w-full">
        <button className="flex justify-center w-full text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer" title="Settings">
          <Settings size={22} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
