import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import socket from "../../socket/socket";
import { X, Plus } from "lucide-react";

function generateSessionId() {
  return `term-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function TerminalPanel() {
  const [sessions, setSessions] = useState(() => {
    const id = generateSessionId();
    return [{ id, name: "bash 1" }];
  });
  const [activeSessionId, setActiveSessionId] = useState(() => sessions[0]?.id ?? null);
  const sessionCountRef = useRef(1);

  const addSession = () => {
    sessionCountRef.current += 1;
    const newSession = {
      id: generateSessionId(),
      name: `bash ${sessionCountRef.current}`,
    };
    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(newSession.id);
  };

  const removeSession = (id) => {
    setSessions((prev) => {
      if (prev.length === 1) return prev; // keep at least one
      const next = prev.filter((s) => s.id !== id);
      setActiveSessionId((current) =>
        current === id ? (next[next.length - 1]?.id ?? null) : current
      );
      socket.emit("terminal-kill", { sessionId: id });
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Session tab bar */}
      <div className="h-8 shrink-0 flex items-center bg-zinc-950 border-b border-zinc-900 overflow-x-auto no-scrollbar">
        {sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => setActiveSessionId(s.id)}
            className={`group flex items-center gap-1.5 px-3 h-full cursor-pointer border-r border-zinc-900 text-xs transition-colors min-w-[90px] shrink-0
              ${activeSessionId === s.id ? "bg-zinc-900 text-zinc-200" : "text-zinc-600 hover:bg-zinc-900/50 hover:text-zinc-400"}
            `}
          >
            <span className="text-[10px] text-green-500">$</span>
            <span className="truncate flex-1">{s.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeSession(s.id);
              }}
              className={`p-0.5 rounded hover:bg-zinc-700 transition-opacity ${
                activeSessionId === s.id
                  ? "opacity-60 hover:opacity-100"
                  : "opacity-0 group-hover:opacity-60 hover:!opacity-100"
              }`}
            >
              <X size={10} />
            </button>
          </div>
        ))}
        <button
          onClick={addSession}
          className="p-1.5 mx-1 text-zinc-600 hover:text-zinc-300 rounded hover:bg-zinc-800 transition-colors shrink-0"
          title="New terminal"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Terminal instances — rendered but hidden when not active to preserve state */}
      <div className="flex-1 relative min-h-0">
        {sessions.map((s) => (
          <TerminalInstance
            key={s.id}
            sessionId={s.id}
            isActive={activeSessionId === s.id}
          />
        ))}
      </div>
    </div>
  );
}

function TerminalInstance({ sessionId, isActive }) {
  const containerRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const isStartedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      theme: {
        background: "#000000",
        foreground: "#d4d4d4",
        cursor: "#aeafad",
        selectionBackground: "#264f78",
        black: "#000000",
        red: "#cd3131",
        green: "#0dbc79",
        yellow: "#e5e510",
        blue: "#2472c8",
        magenta: "#bc3fbc",
        cyan: "#11a8cd",
        white: "#e5e5e5",
        brightBlack: "#666666",
        brightRed: "#f14c4c",
        brightGreen: "#23d18b",
        brightYellow: "#f5f543",
        brightBlue: "#3b8eea",
        brightMagenta: "#d670d6",
        brightCyan: "#29b8db",
        brightWhite: "#e5e5e5",
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, Consolas, monospace",
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: "block",
      scrollback: 5000,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Send input to backend
    const onDataDisposable = term.onData((data) => {
      socket.emit("terminal-input", { sessionId, data });
    });

    // Request a new docker session
    if (!isStartedRef.current) {
      socket.emit("terminal-start", { sessionId });
      isStartedRef.current = true;
    }

    const handleTerminalData = (payload) => {
      if (payload.sessionId === sessionId) {
        term.write(payload.data);
      }
    };

    const handleTerminalExit = (payload) => {
      if (payload.sessionId === sessionId) {
        term.writeln("\r\n\x1b[33m[Process exited]\x1b[0m");
      }
    };

    socket.on("terminal-data", handleTerminalData);
    socket.on("terminal-exit", handleTerminalExit);

    const doFit = () => {
      if (fitAddonRef.current && containerRef.current?.clientWidth > 0) {
        try {
          fitAddonRef.current.fit();
          socket.emit("terminal-resize", {
            sessionId,
            cols: term.cols,
            rows: term.rows,
          });
        } catch (_) {
          // Ignore fit errors during transitions
        }
      }
    };

    const resizeObserver = new ResizeObserver(() => doFit());
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    // Initial fit after DOM is painted
    const fitTimer = setTimeout(doFit, 80);

    return () => {
      clearTimeout(fitTimer);
      resizeObserver.disconnect();
      socket.off("terminal-data", handleTerminalData);
      socket.off("terminal-exit", handleTerminalExit);
      onDataDisposable.dispose();
      socket.emit("terminal-kill", { sessionId });
      term.dispose();
    };
  }, [sessionId]);

  // Re-fit when tab becomes active
  useEffect(() => {
    if (isActive && fitAddonRef.current) {
      const t = setTimeout(() => {
        try {
          fitAddonRef.current?.fit();
        } catch (_) {}
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isActive]);

  return (
    <div
      className={`absolute inset-0 p-1 ${isActive ? "block" : "hidden"}`}
      ref={containerRef}
    />
  );
}
