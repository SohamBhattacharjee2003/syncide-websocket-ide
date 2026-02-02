import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  VscChevronUp,
  VscChevronDown,
  VscTerminal,
  VscOutput,
  VscDebugConsole,
  VscClearAll,
} from "react-icons/vsc";

const terminalTabs = [
  { id: "terminal", label: "Terminal", icon: VscTerminal },
  { id: "output", label: "Output", icon: VscOutput },
  { id: "console", label: "Debug Console", icon: VscDebugConsole },
];

export default function Terminal({ 
  isOpen = false, 
  onToggle,
  onCommand
}) {
  const [activeTab, setActiveTab] = useState("terminal");
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState([
    { type: "system", text: "Welcome to SyncIDE Terminal" },
    { type: "system", text: "Type 'help' for available commands" },
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState([]);
  
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleCommand = useCallback((cmd) => {
    if (!cmd.trim()) return;

    const newHistory = [...history, { type: "command", text: `$ ${cmd}` }];
    
    // Handle built-in commands
    if (cmd === "clear") {
      setHistory([]);
    } else if (cmd === "help") {
      setHistory([
        ...newHistory,
        { type: "output", text: "Available commands:" },
        { type: "output", text: "  clear    - Clear terminal" },
        { type: "output", text: "  help     - Show this help" },
        { type: "output", text: "  date     - Show current date" },
        { type: "output", text: "  whoami   - Show current user" },
      ]);
    } else if (cmd === "date") {
      setHistory([...newHistory, { type: "output", text: new Date().toString() }]);
    } else if (cmd === "whoami") {
      setHistory([...newHistory, { type: "output", text: "syncide-user" }]);
    } else {
      setHistory([...newHistory, { type: "error", text: `Command not found: ${cmd}` }]);
      onCommand?.(cmd);
    }

    setCommandHistory(prev => [...prev, cmd]);
    setCommand("");
    setHistoryIndex(-1);
  }, [history, onCommand]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCommand(command);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex] || "");
      } else {
        setHistoryIndex(-1);
        setCommand("");
      }
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ height: isOpen ? 200 : 32 }}
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
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            onClick={() => setHistory([])}
            className="p-1 text-neutral-500 hover:text-white rounded transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Clear"
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
            {/* Terminal output */}
            <div
              ref={terminalRef}
              className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1"
              onClick={() => inputRef.current?.focus()}
            >
              {history.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`
                    ${line.type === "command" ? "text-emerald-400" : ""}
                    ${line.type === "output" ? "text-neutral-400" : ""}
                    ${line.type === "error" ? "text-red-400" : ""}
                    ${line.type === "system" ? "text-cyan-400" : ""}
                  `}
                >
                  {line.text}
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center px-3 py-2 border-t border-white/5">
              <span className="text-emerald-400 font-mono text-xs mr-2">$</span>
              <input
                ref={inputRef}
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command..."
                className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-neutral-600"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
