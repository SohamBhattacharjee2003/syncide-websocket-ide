import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  VscChevronUp,
  VscChevronDown,
  VscTerminal,
  VscOutput,
  VscDebugConsole,
  VscClearAll,
  VscAdd,
  VscClose,
} from "react-icons/vsc";
import socket from "../../../shared/socket/socket";

const terminalTabs = [
  { id: "terminal", label: "Terminal", icon: VscTerminal },
  { id: "output", label: "Output", icon: VscOutput },
  { id: "console", label: "Debug Console", icon: VscDebugConsole },
];

// ─── Interactive Terminal using server-side shell via socket ───────────────────
function InteractiveTerminal({ roomId, outputLines, onOutput }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [isConnected, setIsConnected] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [outputLines]);

  // Focus on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Listen for terminal events
  useEffect(() => {
    const onReady = () => {
      setIsConnected(true);
      setIsStarting(false);
      onOutput({ type: "system", text: "✅ Shell ready — type any command (npm install, python, git, etc.)" });
    };
    const onOutput_ = ({ data }) => {
      onOutput({ type: "output", text: data });
    };
    const onClosed = () => {
      setIsConnected(false);
      onOutput({ type: "system", text: "[Shell session ended — click Connect to start a new one]" });
    };

    socket.on("terminal-ready", onReady);
    socket.on("terminal-output", onOutput_);
    socket.on("terminal-closed", onClosed);

    return () => {
      socket.off("terminal-ready", onReady);
      socket.off("terminal-output", onOutput_);
      socket.off("terminal-closed", onClosed);
    };
  }, [onOutput]);

  const startTerminal = useCallback(() => {
    setIsStarting(true);
    setIsConnected(false);
    onOutput({ type: "system", text: "🔌 Connecting to shell..." });
    socket.emit("terminal-start", { roomId });
  }, [roomId, onOutput]);

  const stopTerminal = useCallback(() => {
    socket.emit("terminal-stop");
    setIsConnected(false);
    onOutput({ type: "system", text: "[Shell disconnected]" });
  }, [onOutput]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const cmd = input;
      if (isConnected) {
        // Send to server shell
        socket.emit("terminal-input", { data: cmd + "\n" });
        // Track history locally (display typed command)
        onOutput({ type: "command", text: `$ ${cmd}` });
      } else {
        // Not connected — handle simple built-ins locally
        onOutput({ type: "command", text: `$ ${cmd}` });
        if (cmd.trim() === "clear") {
          onOutput({ type: "clear", text: "" });
        } else if (!cmd.trim()) {
          // do nothing
        } else {
          onOutput({ type: "error", text: `Terminal not connected. Click "Connect" to start a shell session.` });
        }
      }
      if (cmd.trim()) setHistory((h) => [...h, cmd]);
      setHistIdx(-1);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIdx = histIdx < history.length - 1 ? histIdx + 1 : histIdx;
        setHistIdx(newIdx);
        setInput(history[history.length - 1 - newIdx] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx > 0) {
        const newIdx = histIdx - 1;
        setHistIdx(newIdx);
        setInput(history[history.length - 1 - newIdx] || "");
      } else {
        setHistIdx(-1);
        setInput("");
      }
    } else if (e.ctrlKey && e.key === "c") {
      if (isConnected) {
        socket.emit("terminal-input", { data: "\u0003" }); // SIGINT
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connection controls */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 bg-black/20">
        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-white/20"}`} />
        <span className="text-[10px] text-white/40 flex-1">
          {isConnected ? "Shell active" : isStarting ? "Connecting..." : "Not connected"}
        </span>
        {!isConnected ? (
          <button
            onClick={startTerminal}
            disabled={isStarting}
            className="px-2 py-1 text-[10px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded border border-emerald-500/30 transition-colors disabled:opacity-50"
          >
            {isStarting ? "Connecting..." : "Connect"}
          </button>
        ) : (
          <button
            onClick={stopTerminal}
            className="px-2 py-1 text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded border border-red-500/30 transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Output area */}
      <div
        className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-0.5 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {outputLines.map((line, idx) => (
          <div
            key={idx}
            className={`leading-relaxed whitespace-pre-wrap break-all ${
              line.type === "command" ? "text-emerald-400" :
              line.type === "error" ? "text-red-400" :
              line.type === "system" ? "text-cyan-400/80 italic" :
              "text-neutral-300"
            }`}
          >
            {line.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input row */}
      <div className="flex items-center px-3 py-2 border-t border-white/5 bg-black/10">
        <span className={`font-mono text-xs mr-2 ${isConnected ? "text-emerald-400" : "text-white/30"}`}>
          {isConnected ? "$" : "○"}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isConnected ? "Type command... (Ctrl+C to cancel)" : "Connect shell to start typing..."}
          className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-neutral-600"
        />
      </div>
    </div>
  );
}

// ─── Output Panel (for run code results) ─────────────────────────────────────
function OutputPanel({ content }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [content]);

  return (
    <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-neutral-300 whitespace-pre-wrap break-all">
      {content || <span className="text-white/20 italic">No output yet. Run code to see results here.</span>}
      <div ref={endRef} />
    </div>
  );
}

// ─── Main Terminal Component ──────────────────────────────────────────────────
export default function Terminal({
  isOpen = false,
  onToggle,
  roomId,
  runOutput = "",      // code run output string
  isExecuting = false, // whether code is running
}) {
  const [activeTab, setActiveTab] = useState("terminal");
  const [termLines, setTermLines] = useState([
    { type: "system", text: "Welcome to SyncIDE Terminal — powered by a real shell" },
    { type: "system", text: 'Click "Connect" above to start an interactive shell session' },
    { type: "system", text: "You can run: npm install, pip install, git, node, python, etc." },
  ]);

  const handleOutput = useCallback((lineOrEvent) => {
    if (lineOrEvent.type === "clear") {
      setTermLines([]);
      return;
    }
    if (lineOrEvent.type === "output" && lineOrEvent.text) {
      // Raw shell output — split by newlines
      const rawLines = lineOrEvent.text.split(/\r?\n/);
      setTermLines((prev) => [
        ...prev,
        ...rawLines.filter((l) => l !== "").map((l) => ({ type: "output", text: l })),
      ]);
      return;
    }
    setTermLines((prev) => [...prev, lineOrEvent]);
  }, []);

  const clearTerminal = () => {
    setTermLines([]);
  };

  return (
    <motion.div
      initial={false}
      animate={{ height: isOpen ? 260 : 32 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="bg-[#0a0a0a] border-t border-white/5 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="h-8 flex items-center justify-between px-2 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-1">
          {terminalTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors
                  ${activeTab === tab.id
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.id === "output" && isExecuting && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            onClick={clearTerminal}
            className="p-1 text-neutral-500 hover:text-white rounded transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Clear terminal"
          >
            <VscClearAll className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            onClick={onToggle}
            className="p-1 text-neutral-500 hover:text-white rounded transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isOpen ? (
              <VscChevronDown className="w-4 h-4" />
            ) : (
              <VscChevronUp className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {activeTab === "terminal" && (
              <InteractiveTerminal
                roomId={roomId}
                outputLines={termLines}
                onOutput={handleOutput}
              />
            )}
            {activeTab === "output" && (
              <OutputPanel content={runOutput} />
            )}
            {activeTab === "console" && (
              <div className="flex-1 p-3 font-mono text-xs text-white/30 italic">
                Debug Console — browser console messages will appear here.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
