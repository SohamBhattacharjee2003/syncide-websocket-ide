// ═══════════════════════════════════════════════════════════════
// Language configurations for SyncIDE
// ═══════════════════════════════════════════════════════════════

export const languages = {
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

export const toolTabs = {
  figma: { id: "tool-figma", name: "Figma Design", type: "tool", icon: "figma", color: "purple" },
  whiteboard: { id: "tool-whiteboard", name: "Whiteboard", type: "tool", icon: "whiteboard", color: "orange" },
  ai: { id: "tool-ai", name: "AI Copilot", type: "tool", icon: "ai", color: "emerald" },
  kanban: { id: "tool-kanban", name: "Tasks", type: "tool", icon: "kanban", color: "blue" },
  notes: { id: "tool-notes", name: "Notes", type: "tool", icon: "notes", color: "yellow" },
  snippets: { id: "tool-snippets", name: "Snippets", type: "tool", icon: "snippets", color: "cyan" },
  api: { id: "tool-api", name: "API Tester", type: "tool", icon: "api", color: "pink" },
};

export const toolColors = {
  figma: { bg: "#a855f7", icon: "🎨" },
  whiteboard: { bg: "#f97316", icon: "✏️" },
  ai: { bg: "#10b981", icon: "🤖" },
  kanban: { bg: "#3b82f6", icon: "📋" },
  notes: { bg: "#eab308", icon: "📝" },
  snippets: { bg: "#06b6d4", icon: "💻" },
  api: { bg: "#ec4899", icon: "⚡" },
};

export const participants = [
  { id: 1, name: "You", initials: "Y", color: "#10b981", isYou: true, hasVideo: true },
  { id: 2, name: "Emma Wilson", initials: "EW", color: "#8b5cf6", isHost: true, hasVideo: true, isSpeaking: true },
  { id: 3, name: "James Chen", initials: "JC", color: "#f59e0b", isMuted: true, hasVideo: false },
  { id: 4, name: "Sarah Miller", initials: "SM", color: "#ec4899", hasVideo: true },
  { id: 5, name: "Alex Kim", initials: "AK", color: "#3b82f6", hasVideo: false },
  { id: 6, name: "David Brown", initials: "DB", color: "#ef4444", hasVideo: true },
];
