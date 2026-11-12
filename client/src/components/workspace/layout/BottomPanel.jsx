import React from "react";
import TerminalPanel from "../TerminalPanel";
import OutputPanel from "../OutputPanel";

export default function BottomPanel({
  bottomTab,
  setBottomTab,
  output,
  isExecuting
}) {
  return (
    <div className="flex flex-col h-[250px] shrink-0 bg-black min-w-0 border-t border-zinc-900">
      <div className="flex px-4 shrink-0 h-10 items-center gap-4">
        <button
          onClick={() => setBottomTab("terminal")}
          className={`text-sm font-medium tracking-tight transition-colors relative h-full flex items-center ${
            bottomTab === "terminal"
              ? "text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Terminal
          {bottomTab === "terminal" && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />}
        </button>
        <button
          onClick={() => setBottomTab("output")}
          className={`text-sm font-medium tracking-tight transition-colors relative h-full flex items-center ${
            bottomTab === "output"
              ? "text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Output
          {bottomTab === "output" && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />}
        </button>
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden relative border-t border-zinc-900/50">
        <div style={{ display: bottomTab === "terminal" ? "block" : "none", height: "100%" }}>
          <TerminalPanel isVisible={bottomTab === "terminal"} />
        </div>
        <div style={{ display: bottomTab === "output" ? "block" : "none", height: "100%" }}>
          <OutputPanel output={output} isExecuting={isExecuting} />
        </div>
      </div>
    </div>
  );
}
