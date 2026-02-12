import { useParams, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import logo from "../assets/logo.png";

// Constants
import { languages, toolTabs, toolColors, participants } from "../constants";

// Utils
import { getBoilerplate, getInitialFile } from "../utils";

// Workspaces
import {
  FigmaWorkspace,
  WhiteboardWorkspace,
  AIWorkspace,
  KanbanWorkspace,
  NotesWorkspace,
  SnippetsWorkspace,
  APIWorkspace,
} from "../components/workspaces";

// Panels
import {
  ExplorerPanel,
  SearchPanel,
  GitPanel,
  ToolHintPanel,
} from "../components/panels";

// Modals
import { NewFileModal, NewFolderModal } from "../components/modals";

// UI Components
import {
  CtrlBtn,
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  ScreenIcon,
  PhoneIcon,
  ExplorerIcon,
  AIIcon,
  FigmaIcon,
  WhiteboardIcon,
  KanbanIcon,
  NotesIcon,
  SnippetsIcon,
  APIIcon,
  SearchIcon,
  GitIcon,
  SettingsIcon,
  CloseIcon,
  TerminalIcon,
  PlayIcon,
  AccountIcon,
  BellIcon,
  DebugIcon,
  CloudIcon,
  SyncIcon,
  SplitIcon,
  SaveIcon,
  MoreIcon,
  ChevronDownIcon,
  LeaveIcon,
  HistoryIcon,
  ThemeIcon,
  ExtensionsIcon,
  LiveIcon,
  HelpIcon,
  FeedbackIcon,
  RemoteIcon,
  CopyIcon,
} from "../components/ui";

// Chat
import { FloatingChat } from "../components/chat";

// ═══════════════════════════════════════════════════════════════
// SYNCIDE - Professional Collaborative Code Editor
// ═══════════════════════════════════════════════════════════════

export default function EditorPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  // File/Folder state
  const [files, setFiles] = useState([getInitialFile("javascript")]);
  const [folders, setFolders] = useState([]);
  const [activeFileId, setActiveFileId] = useState("1");
  const [openTabs, setOpenTabs] = useState([{ id: "1", name: "main.js", language: "javascript", type: "file" }]);
  const [activeTabId, setActiveTabId] = useState("1");
  
  // Modal state
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  
  // UI state
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [sidebarWidth] = useState(260);
  const [showTerminal, setShowTerminal] = useState(false);
  const [pinnedUser, setPinnedUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [terminalOutput, setTerminalOutput] = useState("Welcome to SyncIDE Terminal\n$ ");
  const [isExecuting, setIsExecuting] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [activePanel, setActivePanel] = useState("explorer");
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, item: null });
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Find file by ID
  const findFile = (id) => files.find(f => f.id === id);
  const activeFile = findFile(activeFileId);

  // Open a tool as a tab
  const openToolTab = (toolKey) => {
    const tool = toolTabs[toolKey];
    if (!tool) return;
    if (!openTabs.find(t => t.id === tool.id)) {
      setOpenTabs([...openTabs, tool]);
    }
    setActiveTabId(tool.id);
    setActivePanel(toolKey);
  };

  // Open file
  const openFile = (file) => {
    setActiveFileId(file.id);
    setActiveTabId(file.id);
    if (!openTabs.find(t => t.id === file.id)) {
      setOpenTabs([...openTabs, { id: file.id, name: file.name, language: file.language, type: "file" }]);
    }
  };

  // Close tab
  const closeTab = (id, e) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(t => t.id !== id);
    setOpenTabs(newTabs);
    if (activeTabId === id && newTabs.length > 0) {
      const lastTab = newTabs[newTabs.length - 1];
      setActiveTabId(lastTab.id);
      if (lastTab.type === "file") {
        setActiveFileId(lastTab.id);
      }
    }
  };

  // Switch tab
  const switchTab = (tab) => {
    setActiveTabId(tab.id);
    if (tab.type === "file") {
      setActiveFileId(tab.id);
    }
  };

  // Update file content
  const updateContent = (content) => {
    setFiles(files.map(f => f.id === activeFileId ? { ...f, content } : f));
  };

  // Create new file
  const createFile = (name, lang = selectedLanguage) => {
    const ext = languages[lang]?.ext || "js";
    const fileName = name && name.includes(".") ? name : `${name || "untitled"}.${ext}`;
    const newFile = {
      id: Date.now().toString(),
      name: fileName,
      type: "file",
      language: lang,
      content: getBoilerplate(lang),
    };
    setFiles([...files, newFile]);
    setOpenTabs([...openTabs, { id: newFile.id, name: newFile.name, language: lang, type: "file" }]);
    setActiveFileId(newFile.id);
    setActiveTabId(newFile.id);
  };

  // Create new folder
  const createFolder = (name) => {
    const newFolder = {
      id: Date.now().toString(),
      name: name.trim(),
      type: "folder",
    };
    setFolders([...folders, newFolder]);
  };

  // Delete file/folder
  const deleteItem = (id) => {
    setFiles(files.filter(f => f.id !== id));
    setFolders(folders.filter(f => f.id !== id));
    setOpenTabs(openTabs.filter(t => t.id !== id));
    if (activeFileId === id && files.length > 1) {
      const remaining = files.filter(f => f.id !== id);
      setActiveFileId(remaining[0]?.id || "");
    }
    setContextMenu({ show: false, x: 0, y: 0, item: null });
  };

  // Change language of current file
  const changeLanguage = (lang) => {
    const ext = languages[lang]?.ext || "js";
    const baseName = activeFile?.name.split('.')[0] || "main";
    const newName = `${baseName}.${ext}`;
    setFiles(files.map(f => 
      f.id === activeFileId 
        ? { ...f, language: lang, name: newName, content: getBoilerplate(lang) }
        : f
    ));
    setOpenTabs(openTabs.map(t => 
      t.id === activeFileId 
        ? { ...t, language: lang, name: newName }
        : t
    ));
    setSelectedLanguage(lang);
    setShowLangDropdown(false);
  };

  // Context menu handler
  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenu({ show: true, x: e.clientX, y: e.clientY, item });
  };

  // Copy room ID
  const copyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run code
  const runCode = async () => {
    if (!activeFile || isExecuting) return;
    
    setShowTerminal(true);
    setIsExecuting(true);
    
    const code = editorRef.current?.getValue() || "";
    const language = activeFile.language;
    
    setTerminalOutput(prev => 
      `${prev}Running ${activeFile.name}...\n\n`
    );
    
    try {
      const response = await fetch("http://localhost:5000/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language }),
      });
      
      const result = await response.json();
      
      if (result.error && !result.output) {
        setTerminalOutput(prev => 
          `${prev}❌ Error:\n${result.error}\n\n$ `
        );
      } else {
        const output = result.output || "(No output)";
        const errorOutput = result.error ? `\n⚠️ Stderr:\n${result.error}` : "";
        const status = result.success ? "✅" : "❌";
        const duration = (result.duration / 1000).toFixed(2);
        
        setTerminalOutput(prev => 
          `${prev}${output}${errorOutput}\n\n${status} Completed in ${duration}s (exit code: ${result.exitCode})\n\n$ `
        );
      }
    } catch (err) {
      setTerminalOutput(prev => 
        `${prev}❌ Failed to execute: ${err.message}\n\nMake sure the backend server is running on http://localhost:5000\n\n$ `
      );
    } finally {
      setIsExecuting(false);
    }
  };

  // Clear terminal
  const clearTerminal = () => {
    setTerminalOutput("$ ");
  };

  // Editor mount handler
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.defineTheme("syncide", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6b7280", fontStyle: "italic" },
        { token: "keyword", foreground: "c084fc" },
        { token: "string", foreground: "4ade80" },
        { token: "number", foreground: "fbbf24" },
        { token: "function", foreground: "60a5fa" },
      ],
      colors: {
        "editor.background": "#0d0d0f",
        "editor.foreground": "#e5e7eb",
        "editor.lineHighlightBackground": "#1a1a1f",
        "editorLineNumber.foreground": "#4b5563",
        "editorLineNumber.activeForeground": "#10b981",
        "editorCursor.foreground": "#10b981",
        "editor.selectionBackground": "#10b98125",
      },
    });
    monaco.editor.setTheme("syncide");
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, col: e.position.column });
    });
  };

  // Insert snippet handler
  const handleInsertSnippet = (code) => {
    if (activeFile) {
      setFiles(files.map(f => f.id === activeFileId ? { ...f, content: f.content + "\n\n" + code } : f));
      const fileTab = openTabs.find(t => t.type === "file");
      if (fileTab) switchTab(fileTab);
    }
  };

  return (
    <div className="h-screen bg-[#0d0d0f] flex flex-col overflow-hidden text-sm" onClick={() => { setContextMenu({ show: false }); setShowLangDropdown(false); setShowAccountMenu(false); setShowNotifications(false); }}>
      
      {/* ══════════════════════ HEADER ══════════════════════ */}
      <header className="flex flex-col bg-[#0a0a0c]">
        {/* Top Bar - Main Header */}
        <div className="h-16 flex items-center justify-between px-5 bg-gradient-to-r from-[#0f0f12] via-[#131316] to-[#0f0f12] border-b border-white/5">
          
          {/* Left Section - Logo & Room */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer group" 
              whileHover={{ scale: 1.02 }} 
              onClick={() => navigate("/")}
            >
              <div className="relative">
                <motion.img
                  src={logo}
                  alt="SyncIDE"
                  className="w-10 h-10 object-contain"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg tracking-tight">
                  Sync<span className="text-emerald-400">IDE</span>
                </span>
                <span className="text-white/30 text-[10px] font-medium -mt-0.5">Collaborative Editor</span>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="w-px h-10 bg-white/10" />

            {/* Room Info */}
            <motion.button
              onClick={copyRoomId}
              className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-200"
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <motion.div 
                  className="w-3 h-3 rounded-full bg-emerald-400" 
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }} 
                  transition={{ duration: 2, repeat: Infinity }} 
                />
                <div className="absolute inset-0 bg-emerald-400/50 blur-md rounded-full" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-white/40 font-medium">ROOM ID</span>
                <span className="font-mono text-sm text-white/70 group-hover:text-white tracking-wider">{roomId}</span>
              </div>
              <CopyIcon />
              <AnimatePresence>
                {copied && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-emerald-400 text-xs font-bold"
                  >
                    ✓
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Center Section - Live Status & Collaborators */}
          <div className="flex items-center gap-5">
            {/* Live Indicator */}
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/15 to-orange-500/15 rounded-xl border border-red-500/30"
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div 
                className="w-2.5 h-2.5 rounded-full bg-red-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-sm text-red-400 font-bold tracking-wider">LIVE</span>
            </motion.div>

            {/* Collaborators */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {participants.slice(0, 4).map((p, i) => (
                  <motion.div
                    key={p.id}
                    className="relative"
                    whileHover={{ scale: 1.15, zIndex: 20 }}
                    style={{ zIndex: 10 - i }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white ring-3 ring-[#0f0f12] cursor-pointer shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}88)` }}
                      onClick={() => setPinnedUser(p.id)}
                      title={p.name}
                    >
                      {p.initials}
                    </div>
                    {p.isSpeaking && (
                      <motion.div 
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#0f0f12]"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
              {participants.length > 4 && (
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-xs text-white/60 font-bold border border-white/10">
                  +{participants.length - 4}
                </div>
              )}
              <span className="text-xs text-white/40 font-medium ml-1">{participants.length} online</span>
            </div>
          </div>

          {/* Right Section - Actions & User */}
          <div className="flex items-center gap-3">
            {/* Sync Status */}
            <motion.div
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]"
              title={isSyncing ? "Syncing..." : "All changes synced"}
            >
              <motion.div
                className={isSyncing ? "text-emerald-400" : "text-white/40"}
                animate={isSyncing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isSyncing ? Infinity : 0, ease: "linear" }}
              >
                {isSyncing ? <SyncIcon /> : <CloudIcon />}
              </motion.div>
              <span className="text-xs text-white/50 font-medium">
                {isSyncing ? "Syncing..." : "Synced"}
              </span>
            </motion.div>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowAccountMenu(false); }}
                className="relative w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BellIcon />
                {hasNotifications && (
                  <motion.span 
                    className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-[#18181b]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 border-b border-white/[0.05] flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Notifications</span>
                      <button 
                        onClick={() => setHasNotifications(false)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      <NotificationItem icon="👤" title="Emma joined the room" time="2m ago" color="emerald" />
                      <NotificationItem icon="☁️" title="Changes synced" time="5m ago" color="blue" />
                      <NotificationItem icon="🔌" title="Extension update" time="1h ago" color="purple" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Account */}
            <div className="relative">
              <motion.button
                onClick={(e) => { e.stopPropagation(); setShowAccountMenu(!showAccountMenu); setShowNotifications(false); }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-emerald-500/20">
                    SB
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#0f0f12]" />
                </div>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-semibold text-white">Soham B.</span>
                  <span className="text-[10px] text-emerald-400 font-bold">✦ Pro</span>
                </div>
                <ChevronDownIcon />
              </motion.button>

              <AnimatePresence>
                {showAccountMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-[#18181b]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* User Info */}
                    <div className="p-4 border-b border-white/[0.05]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center text-base font-bold text-white shadow-lg">
                          SB
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">Soham Bhattacharjee</p>
                          <p className="text-xs text-white/40 truncate">soham@example.com</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 rounded-lg border border-emerald-500/20">
                          ✦ Pro
                        </span>
                        <span className="text-xs text-white/30">•</span>
                        <span className="text-xs text-white/40">{participants.length} collaborators</span>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="p-2">
                      <AccountMenuItem icon={<AccountIcon />} label="My Account" onClick={() => navigate("/account")} />
                      <AccountMenuItem icon={<SettingsIcon />} label="Settings" shortcut="⌘," onClick={() => navigate("/settings")} />
                      <AccountMenuItem icon={<ThemeIcon />} label="Appearance" />
                      <AccountMenuItem icon={<HistoryIcon />} label="Activity" />
                    </div>

                    <div className="border-t border-white/[0.05] p-2">
                      <AccountMenuItem icon={<HelpIcon />} label="Help & Docs" />
                      <AccountMenuItem icon={<FeedbackIcon />} label="Feedback" />
                    </div>

                    <div className="border-t border-white/[0.05] p-2">
                      <button 
                        onClick={() => navigate("/")}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LeaveIcon />
                        <span>Leave Room</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Toolbar */}
        <div className="h-12 flex items-center justify-between px-5 bg-[#0d0d10] border-b border-white/5">
          {/* File Tabs */}
          <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1 border border-white/[0.03]">
            {openTabs.map(tab => {
              const lang = languages[tab.language];
              const isToolTab = tab.type === "tool";
              const isActive = activeTabId === tab.id;
              
              return (
                <motion.div
                  key={tab.id}
                  onClick={() => switchTab(tab)}
                  className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? "bg-white/[0.08] text-white shadow-sm" 
                      : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                    />
                  )}
                  {isToolTab ? (
                    <span className="text-base">{toolColors[tab.icon]?.icon || "🔧"}</span>
                  ) : (
                    <div 
                      className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold text-white" 
                      style={{ backgroundColor: lang?.color || "#666" }}
                    >
                      {lang?.icon?.charAt(0) || "F"}
                    </div>
                  )}
                  <span className="text-sm font-medium">{tab.name}</span>
                  {openTabs.length > 1 && (
                    <button 
                      onClick={(e) => closeTab(tab.id, e)} 
                      className="opacity-0 group-hover:opacity-100 ml-1 p-1 hover:bg-white/10 rounded transition-opacity"
                    >
                      <CloseIcon />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <motion.button
                onClick={(e) => { e.stopPropagation(); setShowLangDropdown(!showLangDropdown); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="w-4 h-4 rounded text-[8px] font-bold flex items-center justify-center text-white" 
                  style={{ backgroundColor: languages[activeFile?.language]?.color || "#666" }}
                >
                  {languages[activeFile?.language]?.icon?.charAt(0) || "F"}
                </div>
                <span className="text-sm font-medium">{languages[activeFile?.language]?.name || "Text"}</span>
                <ChevronDownIcon />
              </motion.button>

              <AnimatePresence>
                {showLangDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-[#18181b]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {Object.values(languages).map(lang => (
                        <button
                          key={lang.id}
                          onClick={() => changeLanguage(lang.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                            activeFile?.language === lang.id 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                          }`}
                        >
                          <div 
                            className="w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center text-white" 
                            style={{ backgroundColor: lang.color }}
                          >
                            {lang.icon.charAt(0)}
                          </div>
                          <span className="text-sm font-medium flex-1">{lang.name}</span>
                          <span className="text-xs text-white/30">.{lang.ext}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Tool Buttons */}
            <div className="flex items-center gap-1">
              <HeaderButton icon={<SaveIcon />} tooltip="Save" shortcut="⌘S" onClick={() => { setIsSyncing(true); setTimeout(() => setIsSyncing(false), 1000); }} />
              <HeaderButton icon={<DebugIcon />} tooltip="Debug" color="orange" />
              <HeaderButton icon={<TerminalIcon />} tooltip="Terminal" active={showTerminal} onClick={() => setShowTerminal(!showTerminal)} />
              <HeaderButton icon={<SplitIcon />} tooltip="Split View" />
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Run Button */}
            <motion.button
              onClick={runCode}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/30"
              whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              <PlayIcon />
              <span>Run Code</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* ══════════════════════ MAIN ══════════════════════ */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ═══════ SIDEBAR - VS CODE STYLE ═══════ */}
        <div className="w-14 bg-[#111114] border-r border-[#1e1e24] flex flex-col items-center py-2 gap-1">
          <SidebarButton active={activePanel === "explorer"} onClick={() => setActivePanel("explorer")} title="Explorer"><ExplorerIcon /></SidebarButton>
          <SidebarButton active={activePanel === "ai"} color="emerald" onClick={() => openToolTab("ai")} title="AI Copilot"><AIIcon /></SidebarButton>
          <SidebarButton active={activePanel === "figma"} color="purple" onClick={() => openToolTab("figma")} title="Figma / Design"><FigmaIcon /></SidebarButton>
          <SidebarButton active={activePanel === "whiteboard"} color="orange" onClick={() => openToolTab("whiteboard")} title="Whiteboard"><WhiteboardIcon /></SidebarButton>
          <SidebarButton active={activePanel === "kanban"} color="blue" onClick={() => openToolTab("kanban")} title="Tasks / Kanban"><KanbanIcon /></SidebarButton>
          <SidebarButton active={activePanel === "notes"} color="yellow" onClick={() => openToolTab("notes")} title="Notes"><NotesIcon /></SidebarButton>
          <SidebarButton active={activePanel === "snippets"} color="cyan" onClick={() => openToolTab("snippets")} title="Code Snippets"><SnippetsIcon /></SidebarButton>
          <SidebarButton active={activePanel === "api"} color="pink" onClick={() => openToolTab("api")} title="API Tester"><APIIcon /></SidebarButton>
          <SidebarButton active={activePanel === "search"} onClick={() => setActivePanel("search")} title="Search"><SearchIcon /></SidebarButton>
          <SidebarButton active={activePanel === "git"} color="orange" onClick={() => setActivePanel("git")} title="Git"><GitIcon /></SidebarButton>
          <div className="flex-1" />
          <SidebarButton title="Settings" onClick={() => navigate("/settings")}><SettingsIcon /></SidebarButton>
        </div>

        {/* ═══════ PANEL CONTENT ═══════ */}
        <div style={{ width: sidebarWidth }} className="bg-[#111114] border-r border-[#1e1e24] flex flex-col overflow-hidden">
          {activePanel === "explorer" && (
            <ExplorerPanel
              files={files}
              folders={folders}
              activeFileId={activeFileId}
              onOpenFile={openFile}
              onDeleteItem={deleteItem}
              onNewFile={() => setShowNewFileModal(true)}
              onNewFolder={() => setShowNewFolderModal(true)}
              onContextMenu={handleContextMenu}
            />
          )}
          {activePanel === "search" && <SearchPanel />}
          {activePanel === "git" && <GitPanel />}
          {["ai", "figma", "whiteboard", "kanban", "notes", "snippets", "api"].includes(activePanel) && (
            <ToolHintPanel activePanel={activePanel} />
          )}
        </div>

        {/* ═══════ EDITOR / TOOL WORKSPACE ═══════ */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            {/* Code Editor */}
            {activeFile && !activeTabId.startsWith("tool-") && (
              <Editor
                height="100%"
                language={activeFile.language === "cpp" ? "cpp" : activeFile.language}
                value={activeFile.content || ""}
                onChange={(v) => updateContent(v || "")}
                onMount={handleEditorMount}
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  fontLigatures: true,
                  lineHeight: 1.6,
                  padding: { top: 12 },
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  renderLineHighlight: "all",
                  bracketPairColorization: { enabled: true },
                }}
              />
            )}

            {/* Tool Workspaces */}
            {activeTabId === "tool-figma" && <FigmaWorkspace />}
            {activeTabId === "tool-whiteboard" && <WhiteboardWorkspace />}
            {activeTabId === "tool-ai" && <AIWorkspace />}
            {activeTabId === "tool-kanban" && <KanbanWorkspace />}
            {activeTabId === "tool-notes" && <NotesWorkspace />}
            {activeTabId === "tool-snippets" && <SnippetsWorkspace onInsertSnippet={handleInsertSnippet} />}
            {activeTabId === "tool-api" && <APIWorkspace />}
          </div>

          {/* Terminal */}
          <AnimatePresence>
            {showTerminal && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 200 }}
                exit={{ height: 0 }}
                className="bg-[#0a0a0c] border-t border-[#1e1e24] overflow-hidden flex flex-col"
              >
                {/* Terminal Header */}
                <div className="h-9 flex items-center justify-between px-4 bg-[#0d0d10] border-b border-[#1e1e24] shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <TerminalIcon />
                      <span className="text-white/70 text-xs font-medium">Terminal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-medium rounded-full border border-emerald-500/20">
                        zsh
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isExecuting && (
                      <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[10px] font-medium rounded-full border border-yellow-500/20 animate-pulse">
                        Running...
                      </span>
                    )}
                    <button 
                      onClick={clearTerminal} 
                      className="p-1.5 hover:bg-white/5 rounded text-white/40 hover:text-white/70 transition-colors"
                      title="Clear Terminal"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
                      </svg>
                    </button>
                    <button 
                      onClick={() => setShowTerminal(false)} 
                      className="p-1.5 hover:bg-white/5 rounded text-white/40 hover:text-white/70 transition-colors"
                      title="Close Terminal"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                </div>
                {/* Terminal Output */}
                <div className="flex-1 overflow-auto p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed bg-[#0a0a0c]">
                  {terminalOutput}
                  {isExecuting && (
                    <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5" />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════ RIGHT PANEL - GOOGLE MEET STYLE ═══════ */}
        <div className="w-[420px] bg-[#111114] border-l border-[#1e1e24] flex flex-col overflow-hidden">
          {/* Video Layout - Changes based on pinned state */}
          {(() => {
            const visibleParticipants = participants.slice(0, 3);
            const hiddenParticipants = participants.slice(3);
            const hiddenCount = hiddenParticipants.length;

            // If someone is pinned, show spotlight layout
            if (pinnedUser) {
              const mainUser = participants.find(p => p.id === pinnedUser);
              const otherParticipants = participants.filter(p => p.id !== pinnedUser);
              const visibleOthers = otherParticipants.slice(0, 2);
              const hiddenOthers = otherParticipants.slice(2);
              const hiddenOthersCount = hiddenOthers.length;

              return (
                <>
                  {/* Pinned User - Large Display */}
                  <div className="p-4">
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a1f] to-[#0d0d0f] group" style={{ aspectRatio: '16/10', minHeight: '220px' }}>
                      <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 40% 30%, ${mainUser?.color}50, transparent 60%)` }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div className="relative">
                          {mainUser?.isSpeaking && (
                            <motion.div 
                              className="absolute -inset-4 rounded-3xl" 
                              style={{ border: `3px solid ${mainUser.color}` }} 
                              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 0.2, 0.8] }} 
                              transition={{ duration: 1.5, repeat: Infinity }} 
                            />
                          )}
                          <div 
                            className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl" 
                            style={{ background: `linear-gradient(135deg, ${mainUser?.color}, ${mainUser?.color}88)` }}
                          >
                            {mainUser?.initials}
                          </div>
                        </motion.div>
                      </div>
                      {/* User Info */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-sm text-sm text-white">
                        {mainUser?.isSpeaking && (
                          <div className="flex gap-0.5 items-end">
                            {[1,2,3].map(i => (
                              <motion.div 
                                key={i} 
                                className="w-1 bg-emerald-400 rounded-full" 
                                animate={{ height: [4, 12, 4] }} 
                                transition={{ duration: 0.4, repeat: Infinity, delay: i*0.1 }}
                              />
                            ))}
                          </div>
                        )}
                        <span className="font-medium">{mainUser?.name}</span>
                        {mainUser?.isHost && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/30 text-amber-400 border border-amber-500/30">
                            HOST
                          </span>
                        )}
                      </div>
                      {/* Unpin Button */}
                      <motion.button
                        onClick={() => setPinnedUser(null)}
                        className="absolute top-3 right-3 p-2 rounded-xl bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Unpin"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v10m0 0l-4-4m4 4l4-4M8 22h8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </motion.button>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="px-3 pb-4">
                    <div className="flex justify-center gap-2 p-2.5 rounded-2xl bg-[#0a0a0c] border border-[#1e1e24]">
                      <CtrlBtn active={isMicOn} danger={!isMicOn} onClick={() => setIsMicOn(!isMicOn)}>
                        {isMicOn ? <MicIcon /> : <MicOffIcon />}
                      </CtrlBtn>
                      <CtrlBtn active={isCameraOn} danger={!isCameraOn} onClick={() => setIsCameraOn(!isCameraOn)}>
                        {isCameraOn ? <VideoIcon /> : <VideoOffIcon />}
                      </CtrlBtn>
                      <CtrlBtn><ScreenIcon /></CtrlBtn>
                      <div className="w-px h-8 bg-[#2a2a32]" />
                      <motion.button 
                        onClick={() => navigate("/")} 
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all" 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                      >
                        <PhoneIcon />
                      </motion.button>
                    </div>
                  </div>

                  {/* Other Participants - Smaller Grid */}
                  <div className="px-3 pb-3 flex-1 flex flex-col">
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">
                      Others · {otherParticipants.length}
                    </div>
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      {visibleOthers.map((p, i) => (
                        <motion.div 
                          key={p.id} 
                          initial={{ opacity: 0, scale: 0.8 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          transition={{ delay: i * 0.05 }}
                          onClick={() => setPinnedUser(p.id)}
                          className="relative rounded-2xl overflow-hidden cursor-pointer bg-[#1a1a1f] group hover:ring-2 hover:ring-white/20 hover:scale-[1.02] transition-all"
                          style={{ aspectRatio: '4/3', minHeight: '100px' }}
                        >
                          <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 50% 40%, ${p.color}60, transparent 70%)` }} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div className="relative">
                              {p.isSpeaking && (
                                <motion.div 
                                  className="absolute -inset-2 rounded-xl" 
                                  style={{ border: `2px solid ${p.color}` }} 
                                  animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0.2, 0.7] }} 
                                  transition={{ duration: 1.2, repeat: Infinity }} 
                                />
                              )}
                              <div 
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg" 
                                style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}aa)` }}
                              >
                                {p.initials}
                              </div>
                            </motion.div>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 text-xs text-white font-medium bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg truncate text-center">
                            {p.isYou ? "You" : p.name.split(" ")[0]}
                          </div>
                          <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-3.5 h-3.5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2v10m0 0l-4-4m4 4l4-4M8 22h8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </motion.div>
                      ))}
                      {hiddenOthersCount > 0 && (
                        <ParticipantsOverflowTile 
                          hiddenParticipants={hiddenOthers}
                          hiddenCount={hiddenOthersCount}
                          onSelectParticipant={(p) => setPinnedUser(p.id)}
                        />
                      )}
                    </div>
                  </div>
                </>
              );
            }

            // No one pinned - Equal stacked layout
            return (
              <>
                {/* Equal Stacked Video Tiles */}
                <div className="p-4 flex-1 flex flex-col gap-3 overflow-hidden min-h-0">
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-medium shrink-0">
                    Session · {participants.length} participant{participants.length !== 1 ? 's' : ''}
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-3 min-h-0">
                    {visibleParticipants.map((p, i) => (
                      <motion.div 
                        key={p.id} 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: i * 0.08 }}
                        onClick={() => setPinnedUser(p.id)}
                        className={`relative flex-1 min-h-[100px] rounded-2xl overflow-hidden cursor-pointer bg-[#1a1a1f] group hover:ring-2 hover:ring-white/20 transition-all ${
                          p.isSpeaking ? "ring-2 ring-emerald-500/50" : ""
                        }`}
                      >
                        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 50% 40%, ${p.color}60, transparent 70%)` }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div className="relative">
                            {p.isSpeaking && (
                              <motion.div 
                                className="absolute -inset-3 rounded-2xl" 
                                style={{ border: `3px solid ${p.color}` }} 
                                animate={{ scale: [1, 1.08, 1], opacity: [0.8, 0.3, 0.8] }} 
                                transition={{ duration: 1.3, repeat: Infinity }} 
                              />
                            )}
                            <div 
                              className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg" 
                              style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}aa)` }}
                            >
                              {p.initials}
                            </div>
                          </motion.div>
                        </div>
                        
                        {/* Speaking indicator */}
                        {p.isSpeaking && (
                          <div className="absolute top-3 left-3 flex gap-0.5 items-end bg-black/60 px-2 py-1.5 rounded-lg">
                            {[1,2,3].map(j => (
                              <motion.div 
                                key={j} 
                                className="w-1 bg-emerald-400 rounded-full" 
                                animate={{ height: [4, 10, 4] }} 
                                transition={{ duration: 0.35, repeat: Infinity, delay: j*0.1 }}
                              />
                            ))}
                          </div>
                        )}
                        
                        {/* User Info */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-sm text-sm text-white">
                          <span className="font-medium">{p.isYou ? "You" : p.name}</span>
                          {p.isHost && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/30 text-amber-400">
                              HOST
                            </span>
                          )}
                          {p.isYou && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/30 text-emerald-400">
                              YOU
                            </span>
                          )}
                        </div>

                        {/* Pin on hover */}
                        <div className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v10m0 0l-4-4m4 4l4-4M8 22h8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </motion.div>
                    ))}

                    {/* +X others tile */}
                    {hiddenCount > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.25 }}
                        className="flex-1 min-h-[100px]"
                      >
                        <ParticipantsOverflowTile 
                          hiddenParticipants={hiddenParticipants}
                          hiddenCount={hiddenCount}
                          onSelectParticipant={(p) => setPinnedUser(p.id)}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Controls */}
                {/* Controls - Fixed at bottom */}
                <div className="px-4 py-3 shrink-0 border-t border-[#1e1e24] bg-[#111114]">
                  <div className="flex justify-center gap-2 p-2.5 rounded-2xl bg-[#0a0a0c] border border-[#1e1e24]">
                    <CtrlBtn active={isMicOn} danger={!isMicOn} onClick={() => setIsMicOn(!isMicOn)}>
                      {isMicOn ? <MicIcon /> : <MicOffIcon />}
                    </CtrlBtn>
                    <CtrlBtn active={isCameraOn} danger={!isCameraOn} onClick={() => setIsCameraOn(!isCameraOn)}>
                      {isCameraOn ? <VideoIcon /> : <VideoOffIcon />}
                    </CtrlBtn>
                    <CtrlBtn><ScreenIcon /></CtrlBtn>
                    <div className="w-px h-8 bg-[#2a2a32]" />
                    <motion.button 
                      onClick={() => navigate("/")} 
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all" 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                    >
                      <PhoneIcon />
                    </motion.button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* ══════════════════════ FLOATING CHAT ══════════════════════ */}
      <FloatingChat isOpen={showChat} onToggle={() => setShowChat(!showChat)} />

      {/* ══════════════════════ STATUS BAR ══════════════════════ */}
      <footer className="h-6 bg-[#111114] border-t border-[#1e1e24] flex items-center justify-between px-3 text-[10px]">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="flex items-center gap-1">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-400" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span>Connected</span>
          </div>
          <button onClick={() => setShowTerminal(!showTerminal)} className={`hover:text-gray-300 ${showTerminal ? "text-emerald-400" : ""}`}>Terminal</button>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>{languages[activeFile?.language]?.name || "Plain Text"}</span>
          <span>UTF-8</span>
        </div>
      </footer>

      {/* ══════════════════════ CONTEXT MENU ══════════════════════ */}
      <AnimatePresence>
        {contextMenu.show && contextMenu.item && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bg-[#1a1a1f] border border-[#2a2a32] rounded-lg shadow-xl py-1 z-50 min-w-[140px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button 
              onClick={() => { openFile(contextMenu.item); setContextMenu({ show: false }); }} 
              className="w-full px-3 py-1.5 text-left text-xs text-gray-300 hover:bg-[#252530] flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
              Open
            </button>
            {files.length > 1 && (
              <button onClick={() => deleteItem(contextMenu.item.id)} className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                Delete
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════ MODALS ══════════════════════ */}
      <NewFileModal 
        isOpen={showNewFileModal} 
        onClose={() => setShowNewFileModal(false)} 
        onCreate={createFile} 
      />
      <NewFolderModal 
        isOpen={showNewFolderModal} 
        onClose={() => setShowNewFolderModal(false)} 
        onCreate={createFolder} 
      />
    </div>
  );
}

// Sidebar Button Component
function SidebarButton({ children, active, color, onClick, title }) {
  const colorClasses = {
    emerald: "text-emerald-400",
    purple: "text-purple-400",
    orange: "text-orange-400",
    blue: "text-blue-400",
    yellow: "text-yellow-400",
    cyan: "text-cyan-400",
    pink: "text-pink-400",
  };

  return (
    <button 
      onClick={onClick}
      className={`p-2.5 rounded-md transition-colors ${
        active 
          ? `bg-[#1e1e24] ${color ? colorClasses[color] : "text-white"}` 
          : `text-gray-500 hover:${color ? colorClasses[color] : "text-white"} hover:bg-[#1e1e24]`
      }`} 
      title={title}
    >
      {children}
    </button>
  );
}

// Header Button Component (for toolbar icons)
function HeaderButton({ icon, tooltip, shortcut, onClick, active, badge, color }) {
  const colorHover = {
    orange: "hover:text-orange-400 hover:bg-orange-500/10",
    blue: "hover:text-blue-400 hover:bg-blue-500/10",
    purple: "hover:text-purple-400 hover:bg-purple-500/10",
  };

  return (
    <motion.button
      onClick={onClick}
      className={`relative p-2 rounded-lg transition-all ${
        active 
          ? "text-emerald-400 bg-emerald-500/10" 
          : `text-white/40 ${color ? colorHover[color] : "hover:text-white/80 hover:bg-white/[0.05]"}`
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={shortcut ? `${tooltip} (${shortcut})` : tooltip}
    >
      {icon}
      {badge && (
        <motion.div
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}

// Account Menu Item Component
function AccountMenuItem({ icon, label, shortcut, connected, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-all group"
    >
      <span className="text-white/40 group-hover:text-white/70">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {shortcut && <span className="text-[10px] text-white/20 font-mono">{shortcut}</span>}
      {connected && (
        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </span>
      )}
    </button>
  );
}

// Notification Item Component
function NotificationItem({ icon, title, time, color = "neutral" }) {
  const colorClasses = {
    emerald: "bg-emerald-500/10",
    blue: "bg-blue-500/10",
    purple: "bg-purple-500/10",
    neutral: "bg-white/5",
  };

  return (
    <motion.div 
      className="px-2 py-2 mx-1 my-0.5 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-all flex items-start gap-2.5"
      whileHover={{ x: 2 }}
    >
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-white/80 truncate">{title}</p>
        <p className="text-[10px] text-white/30">{time}</p>
      </div>
    </motion.div>
  );
}

// Participants Overflow Tile Component (for +X others)
function ParticipantsOverflowTile({ hiddenParticipants, hiddenCount, onSelectParticipant }) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="relative h-full">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }} 
        animate={{ opacity: 1, scale: 1 }} 
        onClick={() => setShowPopup(!showPopup)}
        className="relative h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#1f1f24] to-[#16161a] flex items-center justify-center cursor-pointer hover:from-[#252530] hover:to-[#1a1a1f] transition-all border border-white/5 hover:border-white/10 group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Stacked avatars preview */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex -space-x-3">
            {hiddenParticipants.slice(0, 3).map((p, i) => (
              <div 
                key={p.id}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#16161a] shadow-md"
                style={{ 
                  background: `linear-gradient(135deg, ${p.color}, ${p.color}88)`,
                  zIndex: 3 - i,
                  transform: `translateY(${i * 2}px)`
                }}
              >
                {p.initials.charAt(0)}
              </div>
            ))}
          </div>
        </div>
        
        {/* Count overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-bold text-white">+{hiddenCount}</div>
            <div className="text-[10px] text-white/60 font-medium">others</div>
          </div>
        </div>

        {/* Expand icon on hover */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </motion.div>

      {/* Full-screen modal popup at top of screen */}
      <AnimatePresence>
        {showPopup && (
          <>
            {/* Backdrop with blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPopup(false)}
            />
            
            {/* Modal at top of screen */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[101] w-[90vw] max-w-3xl"
            >
              <div className="bg-[#0f0f12] border border-white/10 rounded-3xl shadow-2xl shadow-black/70 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#1a1a1f] to-[#131316]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Other Participants</h3>
                      <p className="text-sm text-white/40">{hiddenCount} more people in this session</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setShowPopup(false)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.button>
                </div>

                {/* Video Grid */}
                <div className="p-5 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {hiddenParticipants.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => {
                          onSelectParticipant(p);
                          setShowPopup(false);
                        }}
                        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1f1f24] to-[#16161a] cursor-pointer group border border-white/5 hover:border-emerald-500/30 transition-all"
                        style={{ aspectRatio: '4/3' }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Avatar placeholder for video */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div 
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-xl"
                            style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}88)` }}
                          >
                            {p.initials}
                          </div>
                        </div>

                        {/* Speaking indicator */}
                        {p.isSpeaking && (
                          <motion.div 
                            className="absolute inset-0 rounded-2xl border-2 border-emerald-400"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}

                        {/* Status badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          {p.isMuted && (
                            <div className="p-1.5 rounded-lg bg-red-500/20 backdrop-blur-sm">
                              <svg className="w-3.5 h-3.5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="2" y1="2" x2="22" y2="22"/>
                                <path d="M18.89 13.23A7.12 7.12 0 0019 12v-2"/>
                              </svg>
                            </div>
                          )}
                          {!p.hasVideo && (
                            <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                              <svg className="w-3.5 h-3.5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.66 6H14a2 2 0 012 2v2.5l5.248-3.062A.5.5 0 0122 7.87v8.196"/>
                                <path d="M2 2l20 20"/>
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Name & badges */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white truncate">{p.name.split(' ')[0]}</span>
                              {p.isHost && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/30 text-amber-400">
                                  HOST
                                </span>
                              )}
                            </div>
                            {p.isSpeaking && (
                              <div className="flex gap-0.5">
                                {[1,2,3].map(j => (
                                  <motion.div 
                                    key={j} 
                                    className="w-0.5 bg-emerald-400 rounded-full" 
                                    animate={{ height: [3, 8, 3] }} 
                                    transition={{ duration: 0.4, repeat: Infinity, delay: j*0.1 }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pin overlay on hover */}
                        <motion.div 
                          className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <div className="px-4 py-2 rounded-xl bg-emerald-500/90 text-white text-sm font-semibold flex items-center gap-2 shadow-lg">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2v10m0 0l-4-4m4 4l4-4M8 22h8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Pin to Focus
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/5 bg-[#0d0d0f] flex items-center justify-between">
                  <p className="text-xs text-white/40">Click on a participant to pin them to the main view</p>
                  <motion.button
                    onClick={() => setShowPopup(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
