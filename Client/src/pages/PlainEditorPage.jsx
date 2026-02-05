import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import logo from "../assets/logo.png";

// Constants
import { languages } from "../constants";

// Utils
import { getBoilerplate } from "../utils";

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
  ChevronDownIcon,
  HistoryIcon,
  ThemeIcon,
  HelpIcon,
  FeedbackIcon,
} from "../components/ui";

// Tool tabs configuration
const toolTabs = {
  figma: { id: "tool-figma", name: "Design", icon: "figma", type: "tool" },
  whiteboard: { id: "tool-whiteboard", name: "Whiteboard", icon: "whiteboard", type: "tool" },
  ai: { id: "tool-ai", name: "AI Copilot", icon: "ai", type: "tool" },
  kanban: { id: "tool-kanban", name: "Tasks", icon: "kanban", type: "tool" },
  notes: { id: "tool-notes", name: "Notes", icon: "notes", type: "tool" },
  snippets: { id: "tool-snippets", name: "Snippets", icon: "snippets", type: "tool" },
  api: { id: "tool-api", name: "API", icon: "api", type: "tool" },
};

const toolColors = {
  figma: { icon: "🎨", color: "purple" },
  whiteboard: { icon: "🖊️", color: "orange" },
  ai: { icon: "🤖", color: "emerald" },
  kanban: { icon: "📋", color: "blue" },
  notes: { icon: "📝", color: "yellow" },
  snippets: { icon: "✂️", color: "cyan" },
  api: { icon: "🔗", color: "pink" },
};

// ═══════════════════════════════════════════════════════════════
// SIDEBAR BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════
function SidebarButton({ children, active, onClick, title, color = "default" }) {
  const colorClasses = {
    default: active ? "text-emerald-400 bg-emerald-500/10" : "text-white/40 hover:text-white/70 hover:bg-white/5",
    emerald: active ? "text-emerald-400 bg-emerald-500/10" : "text-white/40 hover:text-emerald-400/70 hover:bg-emerald-500/5",
    purple: active ? "text-purple-400 bg-purple-500/10" : "text-white/40 hover:text-purple-400/70 hover:bg-purple-500/5",
    orange: active ? "text-orange-400 bg-orange-500/10" : "text-white/40 hover:text-orange-400/70 hover:bg-orange-500/5",
    blue: active ? "text-blue-400 bg-blue-500/10" : "text-white/40 hover:text-blue-400/70 hover:bg-blue-500/5",
    yellow: active ? "text-yellow-400 bg-yellow-500/10" : "text-white/40 hover:text-yellow-400/70 hover:bg-yellow-500/5",
    cyan: active ? "text-cyan-400 bg-cyan-500/10" : "text-white/40 hover:text-cyan-400/70 hover:bg-cyan-500/5",
    pink: active ? "text-pink-400 bg-pink-500/10" : "text-white/40 hover:text-pink-400/70 hover:bg-pink-500/5",
  };

  return (
    <motion.button
      onClick={onClick}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${colorClasses[color]}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={title}
    >
      {active && (
        <motion.div
          layoutId="sidebarIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-r-full"
        />
      )}
      {children}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════
// ACCOUNT MENU ITEM
// ═══════════════════════════════════════════════════════════════
function AccountMenuItem({ icon, label, shortcut, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
    >
      <span className="text-white/40">{icon}</span>
      <span className="flex-1 text-left font-medium">{label}</span>
      {shortcut && <span className="text-[10px] text-white/30 font-mono">{shortcut}</span>}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function PlainEditorPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  // File/Folder state
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFileId, setActiveFileId] = useState("1");
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState("1");
  
  // Modal state
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  
  // UI state
  const [workspace, setWorkspace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [sidebarWidth] = useState(260);
  const [showTerminal, setShowTerminal] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [terminalOutput, setTerminalOutput] = useState("Welcome to SyncIDE Terminal\n$ ");
  const [isExecuting, setIsExecuting] = useState(false);
  const [activePanel, setActivePanel] = useState("explorer");
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, item: null });
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  // Initialize workspace and files
  useEffect(() => {
    const savedWorkspaces = localStorage.getItem("syncide_workspaces");
    if (savedWorkspaces) {
      const workspaces = JSON.parse(savedWorkspaces);
      const ws = workspaces.find(w => w.id === workspaceId);
      if (ws) {
        setWorkspace(ws);
        setSelectedLanguage(ws.language || "javascript");
        
        // Load saved code or use boilerplate
        const savedCode = localStorage.getItem(`syncide_code_${workspaceId}`);
        const initialFile = {
          id: "1",
          name: `main.${languages[ws.language]?.ext || "js"}`,
          type: "file",
          language: ws.language || "javascript",
          content: savedCode || getBoilerplate(ws.language || "javascript"),
        };
        setFiles([initialFile]);
        setOpenTabs([{ id: "1", name: initialFile.name, language: initialFile.language, type: "file" }]);
        setIsLoading(false);
        return;
      }
    }
    
    // Workspace not found - create a default one
    const defaultWorkspace = {
      id: workspaceId,
      name: `Workspace ${workspaceId?.slice(0, 6) || "New"}`,
      type: "plain",
      language: "javascript",
      color: "#10b981",
      createdAt: new Date().toISOString(),
      lastOpened: new Date().toISOString()
    };
    
    const existingWorkspaces = JSON.parse(localStorage.getItem("syncide_workspaces") || "[]");
    existingWorkspaces.push(defaultWorkspace);
    localStorage.setItem("syncide_workspaces", JSON.stringify(existingWorkspaces));
    
    const initialFile = {
      id: "1",
      name: "main.js",
      type: "file",
      language: "javascript",
      content: getBoilerplate("javascript"),
    };
    setFiles([initialFile]);
    setOpenTabs([{ id: "1", name: "main.js", language: "javascript", type: "file" }]);
    setWorkspace(defaultWorkspace);
    setIsLoading(false);
  }, [workspaceId]);

  // Auto-save code
  useEffect(() => {
    if (!isSaved && workspace && files.length > 0) {
      const timer = setTimeout(() => {
        const activeFile = files.find(f => f.id === activeFileId);
        if (activeFile) {
          localStorage.setItem(`syncide_code_${workspaceId}`, activeFile.content);
          setIsSaved(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [files, isSaved, workspaceId, workspace, activeFileId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        const activeFile = files.find(f => f.id === activeFileId);
        if (activeFile) {
          localStorage.setItem(`syncide_code_${workspaceId}`, activeFile.content);
          setIsSaved(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [files, workspaceId, activeFileId]);

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
    setIsSaved(false);
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

  // Handle editor mount
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, col: e.position.column });
    });
  };

  // Handle insert snippet
  const handleInsertSnippet = (code) => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      editorRef.current.executeEdits("snippet", [{
        range: selection,
        text: code,
        forceMoveMarkers: true
      }]);
    }
  };

  // Run code
  const runCode = async () => {
    if (!activeFile || isExecuting) return;
    
    setShowTerminal(true);
    setIsExecuting(true);
    
    const code = editorRef.current?.getValue() || "";
    const lang = activeFile.language;
    
    setTerminalOutput(prev => prev + `\n$ Running ${activeFile.name}...\n`);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulated output based on language
    let output = "";
    if (lang === "javascript" || lang === "typescript") {
      try {
        const logs = [];
        const mockConsole = { log: (...args) => logs.push(args.join(" ")) };
        const wrappedCode = `(function(console) { ${code} })(mockConsole)`;
        eval(wrappedCode.replace("mockConsole", JSON.stringify(mockConsole)));
        output = logs.length > 0 ? logs.join("\n") : "Code executed successfully (no output)";
      } catch (e) {
        output = `Error: ${e.message}`;
      }
    } else {
      output = `[Simulated] Code execution for ${languages[lang]?.name || lang} completed successfully.\nNote: This is a browser-based editor. Use a local runtime for actual execution.`;
    }
    
    setTerminalOutput(prev => prev + output + "\n$ ");
    setIsExecuting(false);
  };

  // Clear terminal
  const clearTerminal = () => {
    setTerminalOutput("Terminal cleared\n$ ");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <p className="text-white/50">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0c] flex flex-col overflow-hidden" onClick={() => {
      setContextMenu({ show: false, x: 0, y: 0, item: null });
      setShowLangDropdown(false);
      setShowAccountMenu(false);
    }}>
      
      {/* ══════════════════════ TOP BAR ══════════════════════ */}
      <header className="h-auto bg-[#0f0f12] border-b border-[#1e1e24] shrink-0 relative z-40">
        {/* Main Header */}
        <div className="h-14 flex items-center justify-between px-5">
          {/* Left - Logo & Workspace */}
          <div className="flex items-center gap-4">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate("/dashboard")}
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
                <span className="text-white/30 text-[10px] font-medium -mt-0.5">Plain Editor</span>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="w-px h-10 bg-white/10" />

            {/* Workspace Info */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                style={{ background: `${workspace?.color || "#10b981"}20` }}
              >
                {languages[selectedLanguage]?.icon?.charAt(0) || "📁"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{workspace?.name || "Workspace"}</span>
                <div className="flex items-center gap-2 text-[10px] text-white/40">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Solo Mode</span>
                  {!isSaved && <span className="text-amber-400">• Unsaved</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Account & Actions */}
          <div className="flex items-center gap-4">
            {/* Account */}
            <div className="relative">
              <motion.button
                onClick={(e) => { e.stopPropagation(); setShowAccountMenu(!showAccountMenu); }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.05] transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                  SB
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
                        onClick={() => navigate("/dashboard")}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                        </svg>
                        <span>Back to Dashboard</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Toolbar */}
        <div className="h-12 flex items-center justify-between px-5 bg-[#0d0d10] border-t border-white/5">
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

            {/* Terminal Toggle */}
            <motion.button
              onClick={() => setShowTerminal(!showTerminal)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                showTerminal 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-white/[0.03] border border-white/[0.05] text-white/60 hover:text-white"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TerminalIcon />
              <span className="text-sm font-medium">Terminal</span>
            </motion.button>

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
              onContextMenu={(e, item) => {
                e.preventDefault();
                setContextMenu({ show: true, x: e.clientX, y: e.clientY, item });
              }}
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
                theme="vs-dark"
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
      </div>

      {/* ══════════════════════ STATUS BAR ══════════════════════ */}
      <footer className="h-6 bg-gradient-to-r from-emerald-600 to-cyan-600 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white/90 text-[11px] font-medium">
            <div className={`w-2 h-2 rounded-full ${isSaved ? "bg-white" : "bg-yellow-300 animate-pulse"}`} />
            <span>{isSaved ? "Saved" : "Editing"}</span>
          </div>
          <span className="text-white/50 text-[11px]">|</span>
          <span className="text-white/70 text-[11px]">Solo Mode</span>
        </div>
        <div className="flex items-center gap-3 text-white/70 text-[11px]">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span className="text-white/50">|</span>
          <span>{languages[activeFile?.language]?.name || "Plain Text"}</span>
          <span className="text-white/50">|</span>
          <span>UTF-8</span>
        </div>
      </footer>

      {/* ══════════════════════ MODALS ══════════════════════ */}
      {showNewFileModal && (
        <NewFileModal
          onClose={() => setShowNewFileModal(false)}
          onCreate={(name) => {
            createFile(name);
            setShowNewFileModal(false);
          }}
        />
      )}

      {showNewFolderModal && (
        <NewFolderModal
          onClose={() => setShowNewFolderModal(false)}
          onCreate={(name) => {
            createFolder(name);
            setShowNewFolderModal(false);
          }}
        />
      )}

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bg-[#1a1a1f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={() => deleteItem(contextMenu.item?.id)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
