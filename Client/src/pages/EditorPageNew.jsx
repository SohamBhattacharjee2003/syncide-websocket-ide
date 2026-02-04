import { useParams, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import logo from "../assets/logo.png";

// ═══════════════════════════════════════════════════════════════
// SYNCIDE - Professional Collaborative Code Editor
// ═══════════════════════════════════════════════════════════════

const languages = {
  javascript: { id: "javascript", name: "JavaScript", ext: "js", icon: "JS", color: "#f7df1e" },
  typescript: { id: "typescript", name: "TypeScript", ext: "ts", icon: "TS", color: "#3178c6" },
  python: { id: "python", name: "Python", ext: "py", icon: "PY", color: "#3776ab" },
  java: { id: "java", name: "Java", ext: "java", icon: "JV", color: "#ed8b00" },
  cpp: { id: "cpp", name: "C++", ext: "cpp", icon: "C+", color: "#00599c" },
  c: { id: "c", name: "C", ext: "c", icon: "C", color: "#a8b9cc" },
  rust: { id: "rust", name: "Rust", ext: "rs", icon: "RS", color: "#dea584" },
  go: { id: "go", name: "Go", ext: "go", icon: "GO", color: "#00add8" },
  ruby: { id: "ruby", name: "Ruby", ext: "rb", icon: "RB", color: "#cc342d" },
  php: { id: "php", name: "PHP", ext: "php", icon: "PH", color: "#777bb4" },
  swift: { id: "swift", name: "Swift", ext: "swift", icon: "SW", color: "#fa7343" },
  kotlin: { id: "kotlin", name: "Kotlin", ext: "kt", icon: "KT", color: "#7f52ff" },
  html: { id: "html", name: "HTML", ext: "html", icon: "HT", color: "#e34c26" },
  css: { id: "css", name: "CSS", ext: "css", icon: "CS", color: "#264de4" },
  json: { id: "json", name: "JSON", ext: "json", icon: "JS", color: "#5d5d5d" },
};

const getBoilerplate = (lang) => {
  const date = new Date().toLocaleDateString();
  const templates = {
    javascript: `// JavaScript - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\nfunction main() {\n  // Your code here\n  console.log("Hello, SyncIDE!");\n}\n\nmain();\n`,
    typescript: `// TypeScript - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\nfunction main(): void {\n  // Your code here\n  console.log("Hello, SyncIDE!");\n}\n\nmain();\n`,
    python: `# Python - SyncIDE\n# Author: Your Name\n# Date: ${date}\n\ndef main():\n    # Your code here\n    print("Hello, SyncIDE!")\n\nif __name__ == "__main__":\n    main()\n`,
    java: `// Java - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\npublic class Main {\n    public static void main(String[] args) {\n        // Your code here\n        System.out.println("Hello, SyncIDE!");\n    }\n}\n`,
    cpp: `// C++ - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    cout << "Hello, SyncIDE!" << endl;\n    return 0;\n}\n`,
    c: `// C - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\n#include <stdio.h>\n\nint main() {\n    // Your code here\n    printf("Hello, SyncIDE!\\n");\n    return 0;\n}\n`,
    rust: `// Rust - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\nfn main() {\n    // Your code here\n    println!("Hello, SyncIDE!");\n}\n`,
    go: `// Go - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Your code here\n    fmt.Println("Hello, SyncIDE!")\n}\n`,
    ruby: `# Ruby - SyncIDE\n# Author: Your Name\n# Date: ${date}\n\ndef main\n  # Your code here\n  puts "Hello, SyncIDE!"\nend\n\nmain\n`,
    php: `<?php\n// PHP - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\nfunction main() {\n    // Your code here\n    echo "Hello, SyncIDE!";\n}\n\nmain();\n?>\n`,
    swift: `// Swift - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\nimport Foundation\n\nfunc main() {\n    // Your code here\n    print("Hello, SyncIDE!")\n}\n\nmain()\n`,
    kotlin: `// Kotlin - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\nfun main() {\n    // Your code here\n    println("Hello, SyncIDE!")\n}\n`,
    html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>SyncIDE</title>\n</head>\n<body>\n    <!-- Your code here -->\n    <h1>Hello, SyncIDE!</h1>\n</body>\n</html>\n`,
    css: `/* CSS - SyncIDE */\n/* Author: Your Name */\n/* Date: ${date} */\n\nbody {\n    /* Your styles here */\n    font-family: sans-serif;\n}\n`,
    json: `{\n  "name": "syncide-project",\n  "version": "1.0.0"\n}\n`,
  };
  return templates[lang] || templates.javascript;
};

// Simple single file - users create their own files/folders
const getInitialFile = (lang = "javascript") => ({
  id: "1",
  name: `main.${languages[lang]?.ext || "js"}`,
  type: "file",
  language: lang,
  content: getBoilerplate(lang),
});

const participants = [
  { id: 1, name: "You", initials: "Y", color: "#10b981", isYou: true, hasVideo: true },
  { id: 2, name: "Emma Wilson", initials: "EW", color: "#8b5cf6", isHost: true, hasVideo: true, isSpeaking: true },
  { id: 3, name: "James Chen", initials: "JC", color: "#f59e0b", isMuted: true, hasVideo: false },
];

export default function EditorPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  // Simple flat file/folder list
  const [files, setFiles] = useState([getInitialFile("javascript")]);
  const [folders, setFolders] = useState([]);
  const [activeFileId, setActiveFileId] = useState("1");
  const [openTabs, setOpenTabs] = useState([{ id: "1", name: "main.js", language: "javascript", type: "file" }]);
  const [activeTabId, setActiveTabId] = useState("1"); // Track which tab is active (file or tool)
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [showTerminal, setShowTerminal] = useState(false);
  const [focusedUser, setFocusedUser] = useState(2);
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [terminalOutput, setTerminalOutput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  // New feature panels
  const [activePanel, setActivePanel] = useState("explorer"); // sidebar panel selection
  const [aiMessages, setAiMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI coding assistant. How can I help you today?" }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [notes, setNotes] = useState("# Project Notes\n\nAdd your notes here...");
  const [snippets] = useState([
    { id: 1, name: "Console Log", code: "console.log($1);", language: "javascript" },
    { id: 2, name: "Arrow Function", code: "const $1 = ($2) => {\n  $3\n};", language: "javascript" },
    { id: 3, name: "React Component", code: "const $1 = () => {\n  return (\n    <div>\n      $2\n    </div>\n  );\n};", language: "javascript" },
  ]);
  const [tasks, setTasks] = useState([
    { id: 1, title: "Fix auth bug", status: "in-progress", assignee: "EW" },
    { id: 2, title: "Add user validation", status: "todo", assignee: "JC" },
    { id: 3, title: "Write unit tests", status: "done", assignee: "Y" },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Tool tab definitions
  const toolTabs = {
    figma: { id: "tool-figma", name: "Figma Design", type: "tool", icon: "figma", color: "purple" },
    whiteboard: { id: "tool-whiteboard", name: "Whiteboard", type: "tool", icon: "whiteboard", color: "orange" },
    ai: { id: "tool-ai", name: "AI Copilot", type: "tool", icon: "ai", color: "emerald" },
    kanban: { id: "tool-kanban", name: "Tasks", type: "tool", icon: "kanban", color: "blue" },
    notes: { id: "tool-notes", name: "Notes", type: "tool", icon: "notes", color: "yellow" },
    snippets: { id: "tool-snippets", name: "Snippets", type: "tool", icon: "snippets", color: "cyan" },
    api: { id: "tool-api", name: "API Tester", type: "tool", icon: "api", color: "pink" },
  };

  // Open a tool as a tab
  const openToolTab = (toolKey) => {
    const tool = toolTabs[toolKey];
    if (!tool) return;
    
    // Check if tab already exists
    if (!openTabs.find(t => t.id === tool.id)) {
      setOpenTabs([...openTabs, tool]);
    }
    setActiveTabId(tool.id);
    setActivePanel(toolKey);
  };

  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, item: null });

  // Find file by ID - simple flat array lookup
  const findFile = (id) => files.find(f => f.id === id);

  const activeFile = findFile(activeFileId);
  const focused = participants.find(p => p.id === focusedUser) || participants[1];

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
  const createFile = (lang = selectedLanguage) => {
    if (!newItemName.trim()) return;
    const ext = languages[lang]?.ext || "js";
    const fileName = newItemName.includes(".") ? newItemName : `${newItemName}.${ext}`;
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
    setShowNewFileModal(false);
    setNewItemName("");
  };

  // Create new folder
  const createFolder = () => {
    if (!newItemName.trim()) return;
    const newFolder = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      type: "folder",
    };
    setFolders([...folders, newFolder]);
    setShowNewFolderModal(false);
    setNewItemName("");
  };

  // Delete file
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

  // Context menu
  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenu({ show: true, x: e.clientX, y: e.clientY, item });
  };

  // Copy room
  const copyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run code
  const runCode = () => {
    setShowTerminal(true);
    setTerminalOutput(`$ Running ${activeFile?.name}...\n\nHello, SyncIDE!\n\n✓ Completed in 0.12s`);
  };

  // Editor mount
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

  // Simple file item renderer (no folders)
  const FileItem = ({ file }) => {
    const isActive = file.id === activeFileId;
    const lang = languages[file.language];

    return (
      <motion.div
        className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer select-none group transition-colors ${
          isActive ? "bg-[#1e1e24] text-white" : "text-gray-400 hover:bg-[#1a1a1f] hover:text-gray-200"
        }`}
        onClick={() => openFile(file)}
        onContextMenu={(e) => handleContextMenu(e, file)}
        whileHover={{ x: 2 }}
      >
        <div 
          className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white shrink-0"
          style={{ backgroundColor: lang?.color || "#666" }}
        >
          {lang?.icon || "F"}
        </div>
        <span className="text-sm truncate flex-1">{file.name}</span>
        
        {/* Delete button on hover */}
        {files.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); deleteItem(file.id); }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
            title="Delete File"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="h-screen bg-[#0d0d0f] flex flex-col overflow-hidden text-sm" onClick={() => { setContextMenu({ show: false }); setShowLangDropdown(false); }}>
      
      {/* ══════════════════════ HEADER ══════════════════════ */}
      <header className="h-12 flex items-center justify-between px-3 bg-[#111114] border-b border-[#1e1e24]">
        
        {/* Left */}
        <div className="flex items-center gap-3">
          <motion.div className="flex items-center gap-2 cursor-pointer" whileHover={{ scale: 1.02 }} onClick={() => navigate("/")}>
            <motion.img 
              src={logo} 
              alt="SyncIDE" 
              className="w-8 h-8 object-contain"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-white font-semibold text-sm">Sync<span className="text-emerald-400">IDE</span></span>
          </motion.div>

          <div className="h-4 w-px bg-[#2a2a32]" />

          <motion.button
            onClick={copyRoomId}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#1a1a1f] border border-[#2a2a32] hover:border-emerald-500/40 transition-all"
            whileTap={{ scale: 0.98 }}
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="font-mono text-xs text-gray-400">{roomId}</span>
            {copied && <span className="text-emerald-400 text-[10px]">Copied!</span>}
          </motion.button>
        </div>

        {/* Center - Tabs */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#0d0d0f] rounded-lg p-1 max-w-[60vw] overflow-x-auto">
          {openTabs.map(tab => {
            const lang = languages[tab.language];
            const isToolTab = tab.type === "tool";
            const isActive = activeTabId === tab.id;
            
            // Tool tab colors
            const toolColors = {
              figma: { bg: "#a855f7", icon: "🎨" },
              whiteboard: { bg: "#f97316", icon: "✏️" },
              ai: { bg: "#10b981", icon: "🤖" },
              kanban: { bg: "#3b82f6", icon: "📋" },
              notes: { bg: "#eab308", icon: "📝" },
              snippets: { bg: "#06b6d4", icon: "💻" },
              api: { bg: "#ec4899", icon: "⚡" },
            };
            
            return (
              <div
                key={tab.id}
                onClick={() => switchTab(tab)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all whitespace-nowrap ${
                  isActive ? "bg-[#1e1e24] text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {isToolTab ? (
                  <div 
                    className="w-4 h-4 rounded-sm text-[10px] flex items-center justify-center" 
                    style={{ backgroundColor: toolColors[tab.icon]?.bg || "#666" }}
                  >
                    {toolColors[tab.icon]?.icon || "🔧"}
                  </div>
                ) : (
                  <div className="w-3 h-3 rounded-sm text-[7px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: lang?.color || "#666" }}>
                    {lang?.icon?.charAt(0) || "F"}
                  </div>
                )}
                <span className="text-xs">{tab.name}</span>
                {openTabs.length > 1 && (
                  <button onClick={(e) => closeTab(tab.id, e)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowLangDropdown(!showLangDropdown); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1a1a1f] border border-[#2a2a32] hover:border-[#3a3a42] transition-all"
            >
              <div className="w-3.5 h-3.5 rounded-sm text-[8px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: languages[activeFile?.language]?.color || "#666" }}>
                {languages[activeFile?.language]?.icon?.charAt(0) || "F"}
              </div>
              <span className="text-xs text-gray-300">{languages[activeFile?.language]?.name || "Text"}</span>
              <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>

            <AnimatePresence>
              {showLangDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-1 w-48 bg-[#1a1a1f] border border-[#2a2a32] rounded-lg shadow-xl overflow-hidden z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="max-h-64 overflow-y-auto py-1">
                    {Object.values(languages).map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => changeLanguage(lang.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#252530] transition-colors ${
                          activeFile?.language === lang.id ? "bg-[#252530] text-emerald-400" : "text-gray-300"
                        }`}
                      >
                        <div className="w-4 h-4 rounded-sm text-[8px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: lang.color }}>
                          {lang.icon.charAt(0)}
                        </div>
                        <span className="text-xs">{lang.name}</span>
                        <span className="text-[10px] text-gray-500 ml-auto">.{lang.ext}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            onClick={runCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500 text-white text-xs font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21"/></svg>
            Run
          </motion.button>

          <div className="h-4 w-px bg-[#2a2a32]" />

          {/* Users */}
          <div className="flex -space-x-1.5">
            {participants.map((p, i) => (
              <div
                key={p.id}
                className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-[#111114] cursor-pointer hover:z-10 hover:scale-110 transition-transform"
                style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)`, zIndex: 10 - i }}
                onClick={() => setFocusedUser(p.id)}
                title={p.name}
              >
                {p.initials.charAt(0)}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ══════════════════════ MAIN ══════════════════════ */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ═══════ SIDEBAR - VS CODE STYLE ═══════ */}
        <div className="w-12 bg-[#111114] border-r border-[#1e1e24] flex flex-col items-center py-2 gap-1">
          <button 
            onClick={() => setActivePanel("explorer")}
            className={`p-2 rounded-md transition-colors ${activePanel === "explorer" ? "bg-[#1e1e24] text-white" : "text-gray-500 hover:text-white hover:bg-[#1e1e24]"}`} 
            title="Explorer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><path d="M14 2v6h6"/>
            </svg>
          </button>
          <button 
            onClick={() => openToolTab("ai")}
            className={`p-2 rounded-md transition-colors ${activePanel === "ai" ? "bg-[#1e1e24] text-emerald-400" : "text-gray-500 hover:text-emerald-400 hover:bg-[#1e1e24]"}`} 
            title="AI Copilot"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z"/>
              <circle cx="9" cy="13" r="1.5" fill="currentColor"/>
              <circle cx="15" cy="13" r="1.5" fill="currentColor"/>
              <path d="M9 17h6" strokeLinecap="round"/>
            </svg>
          </button>
          <button 
            onClick={() => openToolTab("figma")}
            className={`p-2 rounded-md transition-colors ${activePanel === "figma" ? "bg-[#1e1e24] text-purple-400" : "text-gray-500 hover:text-purple-400 hover:bg-[#1e1e24]"}`} 
            title="Figma / Design"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5z"/>
              <path d="M12 2h3.5a3.5 3.5 0 110 7H12V2z"/>
              <path d="M12 12.5a3.5 3.5 0 117 0 3.5 3.5 0 11-7 0z"/>
              <path d="M5 19.5A3.5 3.5 0 018.5 16H12v3.5a3.5 3.5 0 11-7 0z"/>
              <path d="M5 12.5A3.5 3.5 0 018.5 9H12v7H8.5A3.5 3.5 0 015 12.5z"/>
            </svg>
          </button>
          <button 
            onClick={() => openToolTab("whiteboard")}
            className={`p-2 rounded-md transition-colors ${activePanel === "whiteboard" ? "bg-[#1e1e24] text-orange-400" : "text-gray-500 hover:text-orange-400 hover:bg-[#1e1e24]"}`} 
            title="Whiteboard"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M7 7l4 4M15 7l-4 4M7 17l4-4M15 17l-4-4"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </button>
          <button 
            onClick={() => openToolTab("kanban")}
            className={`p-2 rounded-md transition-colors ${activePanel === "kanban" ? "bg-[#1e1e24] text-blue-400" : "text-gray-500 hover:text-blue-400 hover:bg-[#1e1e24]"}`} 
            title="Tasks / Kanban"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="5" height="18" rx="1"/>
              <rect x="10" y="3" width="5" height="12" rx="1"/>
              <rect x="17" y="3" width="5" height="15" rx="1"/>
            </svg>
          </button>
          <button 
            onClick={() => openToolTab("notes")}
            className={`p-2 rounded-md transition-colors ${activePanel === "notes" ? "bg-[#1e1e24] text-yellow-400" : "text-gray-500 hover:text-yellow-400 hover:bg-[#1e1e24]"}`} 
            title="Notes"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>
            </svg>
          </button>
          <button 
            onClick={() => openToolTab("snippets")}
            className={`p-2 rounded-md transition-colors ${activePanel === "snippets" ? "bg-[#1e1e24] text-cyan-400" : "text-gray-500 hover:text-cyan-400 hover:bg-[#1e1e24]"}`} 
            title="Code Snippets"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/>
            </svg>
          </button>
          <button 
            onClick={() => openToolTab("api")}
            className={`p-2 rounded-md transition-colors ${activePanel === "api" ? "bg-[#1e1e24] text-pink-400" : "text-gray-500 hover:text-pink-400 hover:bg-[#1e1e24]"}`} 
            title="API Tester"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </button>
          <button 
            onClick={() => setActivePanel("search")}
            className={`p-2 rounded-md transition-colors ${activePanel === "search" ? "bg-[#1e1e24] text-white" : "text-gray-500 hover:text-white hover:bg-[#1e1e24]"}`} 
            title="Search"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
          <button 
            onClick={() => setActivePanel("git")}
            className={`p-2 rounded-md transition-colors ${activePanel === "git" ? "bg-[#1e1e24] text-orange-500" : "text-gray-500 hover:text-orange-500 hover:bg-[#1e1e24]"}`} 
            title="Git"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 009 9"/>
            </svg>
          </button>
          <div className="flex-1" />
          <button className="p-2 rounded-md text-gray-500 hover:text-white hover:bg-[#1e1e24] transition-colors" title="Settings">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
        </div>

        {/* ═══════ PANEL CONTENT (Explorer/Search/Git only) ═══════ */}
        <div style={{ width: sidebarWidth }} className="bg-[#111114] border-r border-[#1e1e24] flex flex-col overflow-hidden">
          
          {/* ═══════ EXPLORER PANEL ═══════ */}
          {activePanel === "explorer" && (
            <>
              {/* Header */}
              <div className="h-9 flex items-center justify-between px-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider border-b border-[#1e1e24]">
                <span>Files</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowNewFileModal(true)}
                    className="p-1 hover:bg-[#1e1e24] rounded"
                    title="New File"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15h6"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowNewFolderModal(true)}
                    className="p-1 hover:bg-[#1e1e24] rounded"
                    title="New Folder"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><path d="M12 11v6M9 14h6"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Folders & Files List */}
              <div className="flex-1 overflow-y-auto py-1">
                {/* Folders */}
                {folders.map(folder => (
                  <div
                    key={folder.id}
                    className="flex items-center gap-2 px-3 py-1.5 cursor-pointer text-gray-400 hover:bg-[#1a1a1f] hover:text-gray-200 group"
                    onContextMenu={(e) => handleContextMenu(e, folder)}
                  >
                    <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 6a2 2 0 012-2h5l2 2h7a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"/>
                    </svg>
                    <span className="text-sm truncate flex-1">{folder.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteItem(folder.id); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                      title="Delete Folder"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                ))}
                {/* Files */}
                {files.map(file => (
                  <FileItem key={file.id} file={file} />
                ))}
              </div>
            </>
          )}

          {/* ═══════ SEARCH PANEL ═══════ */}
          {activePanel === "search" && (
            <div className="flex flex-col h-full">
              <div className="h-9 flex items-center px-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider border-b border-[#1e1e24] gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                Search
              </div>
              <div className="p-3">
                <input
                  type="text"
                  placeholder="Search in files..."
                  className="w-full bg-[#0d0d0f] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-gray-500">
                    <input type="checkbox" className="rounded bg-[#1e1e24] border-[#2a2a32]" />
                    Match case
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-500">
                    <input type="checkbox" className="rounded bg-[#1e1e24] border-[#2a2a32]" />
                    Regex
                  </label>
                </div>
              </div>
              <div className="flex-1 p-3 pt-0">
                <p className="text-xs text-gray-500 text-center mt-8">Type to search across all files</p>
              </div>
            </div>
          )}

          {/* ═══════ GIT PANEL ═══════ */}
          {activePanel === "git" && (
            <div className="flex flex-col h-full">
              <div className="h-9 flex items-center px-3 text-[11px] font-medium text-orange-500 uppercase tracking-wider border-b border-[#1e1e24] gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 009 9"/>
                </svg>
                Source Control
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-white">main</span>
                  <span className="text-xs text-gray-500 ml-auto">synced</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 uppercase">Changes (1)</p>
                  <div className="flex items-center gap-2 p-2 bg-[#1e1e24] rounded-lg">
                    <span className="text-xs text-green-400">M</span>
                    <span className="text-sm text-gray-300">main.js</span>
                  </div>
                </div>
                <textarea
                  placeholder="Commit message..."
                  className="w-full mt-3 bg-[#0d0d0f] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none resize-none h-16"
                />
                <button className="w-full mt-2 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors">
                  Commit
                </button>
              </div>
            </div>
          )}

          {/* Tool panels show a quick access hint */}
          {["ai", "figma", "whiteboard", "kanban", "notes", "snippets", "api"].includes(activePanel) && (
            <div className="flex flex-col h-full items-center justify-center p-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#1e1e24] flex items-center justify-center text-2xl mb-3">
                {activePanel === "ai" && "🤖"}
                {activePanel === "figma" && "🎨"}
                {activePanel === "whiteboard" && "✏️"}
                {activePanel === "kanban" && "📋"}
                {activePanel === "notes" && "📝"}
                {activePanel === "snippets" && "💻"}
                {activePanel === "api" && "⚡"}
              </div>
              <p className="text-white font-medium mb-1">
                {toolTabs[activePanel]?.name}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Opened in main workspace
              </p>
              <p className="text-xs text-gray-600">
                Switch to the tab above to view
              </p>
            </div>
          )}
        </div>

        {/* ═══════ EDITOR / TOOL WORKSPACE ═══════ */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            {/* Code Editor - shown when a file tab is active */}
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

            {/* ═══════ FIGMA WORKSPACE ═══════ */}
            {activeTabId === "tool-figma" && (
              <div className="h-full bg-[#1a1a1f] flex flex-col">
                {/* Figma Toolbar */}
                <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <span className="text-lg">🎨</span>
                      </div>
                      <span className="text-white font-medium">Design Canvas</span>
                    </div>
                    <div className="h-6 w-px bg-[#2a2a32]" />
                    <div className="flex gap-1">
                      {["Select", "Frame", "Rectangle", "Ellipse", "Text", "Pen"].map(tool => (
                        <button key={tool} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors">
                          {tool}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">100%</span>
                    <button className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
                      Export
                    </button>
                  </div>
                </div>
                {/* Canvas Area */}
                <div className="flex-1 relative overflow-hidden" style={{ background: "repeating-conic-gradient(#1e1e24 0% 25%, #111114 0% 50%) 50% / 20px 20px" }}>
                  {/* Sample Design Elements */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-white rounded-2xl shadow-2xl p-6">
                    <div className="w-full h-8 bg-gray-100 rounded-lg mb-4" />
                    <div className="flex gap-4 mb-4">
                      <div className="w-24 h-24 bg-purple-100 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-10 bg-purple-500 rounded-lg" />
                      <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                    </div>
                  </div>
                  {/* Right Sidebar - Properties */}
                  <div className="absolute right-0 top-0 bottom-0 w-64 bg-[#111114] border-l border-[#2a2a32] p-4">
                    <h3 className="text-white text-sm font-medium mb-4">Properties</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Position</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" value="200" className="bg-[#0d0d0f] border border-[#2a2a32] rounded px-2 py-1 text-xs text-white" readOnly />
                          <input type="text" value="150" className="bg-[#0d0d0f] border border-[#2a2a32] rounded px-2 py-1 text-xs text-white" readOnly />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Size</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" value="400" className="bg-[#0d0d0f] border border-[#2a2a32] rounded px-2 py-1 text-xs text-white" readOnly />
                          <input type="text" value="300" className="bg-[#0d0d0f] border border-[#2a2a32] rounded px-2 py-1 text-xs text-white" readOnly />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Fill</label>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-white border border-[#2a2a32]" />
                          <span className="text-xs text-gray-400">#FFFFFF</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════ WHITEBOARD WORKSPACE ═══════ */}
            {activeTabId === "tool-whiteboard" && (
              <div className="h-full bg-[#1a1a1f] flex flex-col">
                {/* Whiteboard Toolbar */}
                <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <span className="text-lg">✏️</span>
                      </div>
                      <span className="text-white font-medium">Whiteboard</span>
                    </div>
                    <div className="h-6 w-px bg-[#2a2a32]" />
                    <div className="flex gap-1 bg-[#0d0d0f] rounded-lg p-1">
                      {[
                        { icon: "✏️", name: "Pen" },
                        { icon: "🖌️", name: "Brush" },
                        { icon: "⬜", name: "Rectangle" },
                        { icon: "⭕", name: "Circle" },
                        { icon: "📝", name: "Text" },
                        { icon: "🗑️", name: "Eraser" },
                      ].map(tool => (
                        <button key={tool.name} className="p-2 text-lg hover:bg-[#2a2a32] rounded transition-colors" title={tool.name}>
                          {tool.icon}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ffffff"].map(color => (
                        <button key={color} className="w-6 h-6 rounded-full border-2 border-[#2a2a32] hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors">
                      Clear All
                    </button>
                    <button className="px-3 py-1.5 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors">
                      Save
                    </button>
                  </div>
                </div>
                {/* Canvas */}
                <div className="flex-1 relative cursor-crosshair" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 19px, #1e1e24 19px, #1e1e24 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #1e1e24 19px, #1e1e24 20px)" }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🎨</div>
                      <p className="text-gray-500">Click and drag to draw</p>
                      <p className="text-gray-600 text-sm mt-1">All team members can see your drawings in real-time</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════ AI COPILOT WORKSPACE ═══════ */}
            {activeTabId === "tool-ai" && (
              <div className="h-full bg-[#0d0d0f] flex flex-col">
                {/* AI Header */}
                <div className="h-14 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <span className="text-xl">🤖</span>
                    </div>
                    <div>
                      <h2 className="text-white font-semibold">AI Copilot</h2>
                      <p className="text-xs text-gray-500">Powered by Advanced AI</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded-lg transition-colors">
                      Clear Chat
                    </button>
                    <button className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                      New Chat
                    </button>
                  </div>
                </div>
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] ${msg.role === "user" ? "order-2" : ""}`}>
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs">🤖</div>
                            <span className="text-xs text-gray-500">AI Copilot</span>
                          </div>
                        )}
                        <div className={`rounded-2xl px-4 py-3 ${
                          msg.role === "user" 
                            ? "bg-emerald-600 text-white rounded-tr-md" 
                            : "bg-[#1e1e24] text-gray-300 border border-[#2a2a32] rounded-tl-md"
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Quick Actions */}
                <div className="px-6 py-3 border-t border-[#1e1e24] bg-[#111114]">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {["Explain this code", "Find bugs", "Optimize performance", "Write tests", "Add documentation", "Refactor code"].map(q => (
                      <button
                        key={q}
                        onClick={() => {
                          setAiMessages([...aiMessages, { role: "user", content: q }]);
                          setTimeout(() => {
                            setAiMessages(prev => [...prev, { role: "assistant", content: `I'd be happy to help ${q.toLowerCase()}! Please share the code you'd like me to analyze, or I can work with the currently open file in the editor.` }]);
                          }, 500);
                        }}
                        className="px-3 py-1.5 text-xs bg-[#1e1e24] hover:bg-[#2a2a32] text-gray-400 hover:text-white rounded-full border border-[#2a2a32] transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Input */}
                <div className="p-4 border-t border-[#2a2a32]">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && aiInput.trim()) {
                          setAiMessages([...aiMessages, { role: "user", content: aiInput }]);
                          setAiInput("");
                          setTimeout(() => {
                            setAiMessages(prev => [...prev, { role: "assistant", content: "I'm analyzing your request... This is a demo response. In production, this would connect to an AI API like OpenAI GPT-4 or Claude for intelligent code assistance." }]);
                          }, 500);
                        }
                      }}
                      placeholder="Ask anything about your code..."
                      className="flex-1 bg-[#1e1e24] border border-[#2a2a32] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                    />
                    <button
                      onClick={() => {
                        if (aiInput.trim()) {
                          setAiMessages([...aiMessages, { role: "user", content: aiInput }]);
                          setAiInput("");
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl transition-all font-medium"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════ KANBAN / TASKS WORKSPACE ═══════ */}
            {activeTabId === "tool-kanban" && (
              <div className="h-full bg-[#0d0d0f] flex flex-col">
                {/* Kanban Header */}
                <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <span className="text-lg">📋</span>
                    </div>
                    <span className="text-white font-medium">Project Tasks</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (newTaskTitle.trim()) {
                        setTasks([...tasks, { id: Date.now(), title: newTaskTitle, status: "todo", assignee: "You" }]);
                        setNewTaskTitle("");
                      }
                    }}
                    className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    + Add Task
                  </button>
                </div>
                {/* Add Task Input */}
                <div className="px-4 py-3 bg-[#111114] border-b border-[#2a2a32]">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newTaskTitle.trim()) {
                        setTasks([...tasks, { id: Date.now(), title: newTaskTitle, status: "todo", assignee: "You" }]);
                        setNewTaskTitle("");
                      }
                    }}
                    placeholder="Type a task and press Enter..."
                    className="w-full bg-[#0d0d0f] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                {/* Kanban Columns */}
                <div className="flex-1 flex gap-4 p-4 overflow-x-auto">
                  {[
                    { id: "todo", title: "To Do", color: "gray" },
                    { id: "in-progress", title: "In Progress", color: "yellow" },
                    { id: "done", title: "Done", color: "green" },
                  ].map(column => (
                    <div key={column.id} className="flex-1 min-w-[280px] bg-[#111114] rounded-xl border border-[#2a2a32] flex flex-col">
                      <div className="p-3 border-b border-[#2a2a32] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-${column.color}-500`} />
                          <span className="text-white font-medium text-sm">{column.title}</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-[#1e1e24] px-2 py-0.5 rounded">
                          {tasks.filter(t => t.status === column.id).length}
                        </span>
                      </div>
                      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                        {tasks.filter(t => t.status === column.id).map(task => (
                          <div key={task.id} className="bg-[#1a1a1f] rounded-lg p-3 border border-[#2a2a32] hover:border-blue-500/30 transition-colors cursor-pointer group">
                            <p className={`text-sm ${column.id === "done" ? "line-through text-gray-500" : "text-white"}`}>{task.title}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-gray-500">#{task.id}</span>
                              <div className="flex items-center gap-2">
                                {column.id !== "done" && (
                                  <button 
                                    onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, status: column.id === "todo" ? "in-progress" : "done" } : t))}
                                    className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    Move →
                                  </button>
                                )}
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[8px] text-white font-bold">
                                  {task.assignee.charAt(0)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════ NOTES WORKSPACE ═══════ */}
            {activeTabId === "tool-notes" && (
              <div className="h-full bg-[#0d0d0f] flex flex-col">
                <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                      <span className="text-lg">📝</span>
                    </div>
                    <span className="text-white font-medium">Project Notes</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors">Bold</button>
                    <button className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors">Italic</button>
                    <button className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors">List</button>
                    <button className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors">Save</button>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-full bg-[#111114] border border-[#2a2a32] rounded-xl p-6 text-gray-300 resize-none focus:outline-none focus:border-yellow-500/50 font-mono text-sm leading-relaxed"
                    placeholder="Write your notes here... Supports Markdown!"
                  />
                </div>
              </div>
            )}

            {/* ═══════ SNIPPETS WORKSPACE ═══════ */}
            {activeTabId === "tool-snippets" && (
              <div className="h-full bg-[#0d0d0f] flex flex-col">
                <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <span className="text-lg">💻</span>
                    </div>
                    <span className="text-white font-medium">Code Snippets Library</span>
                  </div>
                  <button className="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors">
                    + New Snippet
                  </button>
                </div>
                <div className="flex-1 p-4 grid grid-cols-2 gap-4 overflow-y-auto">
                  {snippets.map(snippet => (
                    <div 
                      key={snippet.id} 
                      className="bg-[#111114] rounded-xl border border-[#2a2a32] hover:border-cyan-500/30 transition-colors cursor-pointer group overflow-hidden"
                      onClick={() => {
                        if (activeFile) {
                          setFiles(files.map(f => f.id === activeFileId ? { ...f, content: f.content + "\n\n" + snippet.code } : f));
                          // Switch back to the file tab
                          const fileTab = openTabs.find(t => t.type === "file");
                          if (fileTab) switchTab(fileTab);
                        }
                      }}
                    >
                      <div className="p-4 border-b border-[#2a2a32]">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-medium">{snippet.name}</h3>
                          <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">{snippet.language}</span>
                        </div>
                      </div>
                      <pre className="p-4 text-xs text-gray-400 font-mono bg-[#0a0a0c] overflow-x-auto">
                        {snippet.code}
                      </pre>
                      <div className="p-3 bg-[#111114] border-t border-[#2a2a32] flex items-center justify-between">
                        <span className="text-xs text-gray-500">Click to insert into editor</span>
                        <button className="text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Insert →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════ API TESTER WORKSPACE ═══════ */}
            {activeTabId === "tool-api" && (
              <div className="h-full bg-[#0d0d0f] flex flex-col">
                <div className="h-12 bg-[#111114] border-b border-[#2a2a32] flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                      <span className="text-lg">⚡</span>
                    </div>
                    <span className="text-white font-medium">API Tester</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors">
                      History
                    </button>
                    <button className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2a2a32] rounded transition-colors">
                      Collections
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex">
                  {/* Request Panel */}
                  <div className="flex-1 border-r border-[#2a2a32] flex flex-col">
                    <div className="p-4 border-b border-[#2a2a32]">
                      <div className="flex gap-2">
                        <select className="bg-[#1e1e24] border border-[#2a2a32] rounded-lg px-3 py-2.5 text-sm text-green-400 focus:outline-none font-medium">
                          <option>GET</option>
                          <option>POST</option>
                          <option>PUT</option>
                          <option>DELETE</option>
                          <option>PATCH</option>
                        </select>
                        <input
                          type="text"
                          placeholder="https://api.example.com/users"
                          className="flex-1 bg-[#1e1e24] border border-[#2a2a32] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
                        />
                        <button className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors font-medium">
                          Send
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex border-b border-[#2a2a32]">
                        {["Params", "Headers", "Body", "Auth"].map(tab => (
                          <button key={tab} className="px-4 py-2 text-sm text-gray-500 hover:text-white border-b-2 border-transparent hover:border-pink-500 transition-colors">
                            {tab}
                          </button>
                        ))}
                      </div>
                      <div className="flex-1 p-4">
                        <textarea
                          placeholder='{"key": "value"}'
                          className="w-full h-full bg-[#111114] border border-[#2a2a32] rounded-lg p-4 text-sm text-gray-300 resize-none focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Response Panel */}
                  <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-[#2a2a32] flex items-center justify-between">
                      <span className="text-white font-medium">Response</span>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-green-400">200 OK</span>
                        <span className="text-gray-500">245ms</span>
                        <span className="text-gray-500">1.2 KB</span>
                      </div>
                    </div>
                    <div className="flex-1 p-4 overflow-auto">
                      <pre className="text-sm text-gray-300 font-mono">
{`{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    ]
  },
  "message": "Users fetched successfully"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Terminal */}
          <AnimatePresence>
            {showTerminal && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 150 }}
                exit={{ height: 0 }}
                className="bg-[#0d0d0f] border-t border-[#1e1e24] overflow-hidden"
              >
                <div className="h-8 flex items-center justify-between px-3 border-b border-[#1e1e24]">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
                    </svg>
                    <span className="text-gray-400 text-xs">Terminal</span>
                  </div>
                  <button onClick={() => setShowTerminal(false)} className="p-1 hover:bg-[#1e1e24] rounded text-gray-500">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="p-3 font-mono text-xs text-gray-300 whitespace-pre-wrap">{terminalOutput}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════ RIGHT PANEL ═══════ */}
        <div className="w-72 bg-[#111114] border-l border-[#1e1e24] flex flex-col">
          {/* Video */}
          <div className="p-3">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-[#1a1a1f] to-[#0d0d0f]">
              <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 40% 30%, ${focused.color}40, transparent 60%)` }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div className="relative">
                  {focused.isSpeaking && (
                    <motion.div className="absolute inset-0 rounded-2xl" style={{ border: `2px solid ${focused.color}` }} animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  )}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold" style={{ background: `linear-gradient(135deg, ${focused.color}, ${focused.color}88)` }}>
                    {focused.initials}
                  </div>
                </motion.div>
              </div>
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 text-xs text-white">
                {focused.isSpeaking && <div className="flex gap-0.5">{[1,2,3].map(i => <motion.div key={i} className="w-0.5 bg-emerald-400 rounded-full" animate={{ height: [3, 8, 3] }} transition={{ duration: 0.4, repeat: Infinity, delay: i*0.1 }}/>)}</div>}
                <span>{focused.name}</span>
                {focused.isHost && <span className="px-1 py-0.5 rounded text-[8px] bg-amber-500/20 text-amber-400">HOST</span>}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="px-3 pb-3">
            <div className="flex justify-center gap-2 p-2 rounded-xl bg-[#0d0d0f] border border-[#1e1e24]">
              <CtrlBtn active={isMicOn} danger={!isMicOn} onClick={() => setIsMicOn(!isMicOn)}>
                {isMicOn ? <MicIcon /> : <MicOffIcon />}
              </CtrlBtn>
              <CtrlBtn active={isCameraOn} danger={!isCameraOn} onClick={() => setIsCameraOn(!isCameraOn)}>
                {isCameraOn ? <VideoIcon /> : <VideoOffIcon />}
              </CtrlBtn>
              <CtrlBtn><ScreenIcon /></CtrlBtn>
              <div className="w-px h-8 bg-[#2a2a32]" />
              <motion.button onClick={() => navigate("/")} className="p-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <PhoneIcon />
              </motion.button>
            </div>
          </div>

          {/* Participants */}
          <div className="px-3 pb-3">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Session · {participants.length}</div>
            <div className="grid grid-cols-3 gap-2">
              {participants.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} onClick={() => setFocusedUser(p.id)}
                  className={`aspect-square rounded-lg overflow-hidden cursor-pointer bg-[#1a1a1f] relative group ${focusedUser === p.id ? "ring-2 ring-emerald-500" : ""}`}>
                  <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 50% 40%, ${p.color}60, transparent 70%)` }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}aa)` }}>{p.initials.charAt(0)}</div>
                  </div>
                  <div className="absolute bottom-1 left-1 text-[8px] text-white/70 bg-black/40 px-1 rounded">{p.isYou ? "You" : p.name.split(" ")[0]}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex-1" />
        </div>
      </div>

      {/* ══════════════════════ FLOATING CHAT ══════════════════════ */}
      <div className="fixed bottom-20 right-6 z-50">
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-[380px] h-[480px] bg-[#111114] border border-[#2a2a32] rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden mb-3"
            >
              {/* Chat Header */}
              <div className="px-4 py-3 bg-[#0d0d0f] border-b border-[#2a2a32] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                      </svg>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0d0d0f]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Team Chat</h3>
                    <p className="text-gray-500 text-xs">3 members online</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChat(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#1e1e24] transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Online Users Bar */}
              <div className="px-4 py-2 bg-[#0a0a0c] border-b border-[#2a2a32] flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0a0a0c] flex items-center justify-center text-white text-[8px] font-bold">Y</div>
                  <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-[#0a0a0c] flex items-center justify-center text-white text-[8px] font-bold">EW</div>
                  <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-[#0a0a0c] flex items-center justify-center text-white text-[8px] font-bold">JC</div>
                </div>
                <span className="text-[10px] text-gray-500">Emma is typing...</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Date Divider */}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-[#2a2a32]" />
                  <span className="text-[10px] text-gray-600 font-medium">Today</span>
                  <div className="flex-1 h-px bg-[#2a2a32]" />
                </div>

                {/* Message from Emma */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    EW
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">Emma Wilson</span>
                      <span className="text-[10px] text-gray-600">10:32 AM</span>
                    </div>
                    <div className="bg-[#1e1e24] px-4 py-2.5 rounded-2xl rounded-tl-md text-sm text-gray-300">
                      Let's fix the auth bug first 🔧
                    </div>
                  </div>
                </div>

                {/* My Message */}
                <div className="flex gap-3 justify-end">
                  <div className="max-w-[80%]">
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <span className="text-[10px] text-gray-600">10:33 AM</span>
                      <span className="text-sm font-medium text-emerald-400">You</span>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 rounded-2xl rounded-tr-md text-sm text-white">
                      On it! Checking now
                    </div>
                  </div>
                </div>

                {/* Message from James */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    JC
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">James Chen</span>
                      <span className="text-[10px] text-gray-600">10:35 AM</span>
                    </div>
                    <div className="bg-[#1e1e24] px-4 py-2.5 rounded-2xl rounded-tl-md text-sm text-gray-300">
                      I'll help with frontend validation 👍
                    </div>
                  </div>
                </div>

                {/* Typing Indicator */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    EW
                  </div>
                  <div className="bg-[#1e1e24] px-4 py-3 rounded-2xl rounded-tl-md">
                    <div className="flex gap-1.5">
                      <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                      <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                      <motion.div className="w-2 h-2 bg-gray-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 bg-[#0d0d0f] border-t border-[#2a2a32]">
                <div className="flex gap-3 items-center">
                  <button className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-[#1e1e24] transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/>
                    </svg>
                  </button>
                  <input 
                    placeholder="Type a message..." 
                    className="flex-1 bg-[#1e1e24] border border-[#2a2a32] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all" 
                  />
                  <motion.button 
                    className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Toggle Button */}
        <motion.button
          onClick={() => setShowChat(!showChat)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
            showChat 
              ? 'bg-[#1e1e24] text-gray-400' 
              : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-500/30'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {showChat ? (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
              </svg>
              {/* Notification Badge */}
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                2
              </span>
            </>
          )}
        </motion.button>
      </div>

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

      {/* ══════════════════════ NEW FILE MODAL ══════════════════════ */}
      <AnimatePresence>
        {showNewFileModal && (
          <Modal onClose={() => setShowNewFileModal(false)}>
            <div className="p-4 border-b border-[#2a2a32]">
              <h3 className="text-white font-medium">New File</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-gray-400 text-xs block mb-2">File Name</label>
                <input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="filename.js"
                  className="w-full bg-[#0d0d0f] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  onKeyDown={(e) => e.key === "Enter" && createFile()}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-2">Language</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {Object.values(languages).slice(0, 10).map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => createFile(lang.id)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg border border-[#2a2a32] hover:border-emerald-500/40 hover:bg-[#1e1e24] transition-all"
                    >
                      <div className="w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: lang.color }}>{lang.icon.charAt(0)}</div>
                      <span className="text-[9px] text-gray-400">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3 bg-[#0d0d0f] flex justify-end gap-2">
              <button onClick={() => setShowNewFileModal(false)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white">Cancel</button>
              <button onClick={() => createFile()} className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg">Create</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ══════════════════════ NEW FOLDER MODAL ══════════════════════ */}
      <AnimatePresence>
        {showNewFolderModal && (
          <Modal onClose={() => setShowNewFolderModal(false)}>
            <div className="p-4 border-b border-[#2a2a32]">
              <h3 className="text-white font-medium">New Folder</h3>
            </div>
            <div className="p-4">
              <label className="text-gray-400 text-xs block mb-2">Folder Name</label>
              <input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="folder-name"
                className="w-full bg-[#0d0d0f] border border-[#2a2a32] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                onKeyDown={(e) => e.key === "Enter" && createFolder()}
                autoFocus
              />
            </div>
            <div className="p-3 bg-[#0d0d0f] flex justify-end gap-2">
              <button onClick={() => setShowNewFolderModal(false)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white">Cancel</button>
              <button onClick={createFolder} className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg">Create</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════ COMPONENTS ═══════════════

function Modal({ children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-[360px] bg-[#1a1a1f] border border-[#2a2a32] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function CtrlBtn({ children, active, danger, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className={`p-2.5 rounded-lg transition-all ${
        danger ? "bg-red-500/10 text-red-400 border border-red-500/20"
        : active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        : "bg-[#1a1a1f] text-gray-400 border border-[#2a2a32] hover:text-white"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

const MicIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>;
const MicOffIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="2" y1="2" x2="22" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0019 12v-2"/><path d="M5 10v2a7 7 0 0012 5"/><path d="M15 9.34V5a3 3 0 00-5.68-1.33"/><line x1="12" y1="19" x2="12" y2="22"/></svg>;
const VideoIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 13l5.223 3.482a.5.5 0 00.777-.416V7.87a.5.5 0 00-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>;
const VideoOffIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.66 6H14a2 2 0 012 2v2.5l5.248-3.062A.5.5 0 0122 7.87v8.196"/><path d="M16 16a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2"/><path d="M2 2l20 20"/></svg>;
const ScreenIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const PhoneIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
