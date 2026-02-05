import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

// Mock workspace data
const initialWorkspaces = [
  {
    id: "ws_demo_1",
    name: "React Dashboard",
    type: "realtime",
    language: "javascript",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastOpened: new Date(Date.now() - 3600000).toISOString(),
    collaborators: 3,
    files: 12,
    color: "#10b981"
  },
  {
    id: "ws_demo_2",
    name: "Python ML Project",
    type: "plain",
    language: "python",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastOpened: new Date(Date.now() - 86400000).toISOString(),
    collaborators: 1,
    files: 8,
    color: "#3b82f6"
  },
  {
    id: "ws_demo_3",
    name: "API Backend",
    type: "realtime",
    language: "typescript",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    lastOpened: new Date(Date.now() - 86400000 * 3).toISOString(),
    collaborators: 5,
    files: 24,
    color: "#8b5cf6"
  }
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Load user and workspaces from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("syncide_user");
    if (!savedUser) {
      navigate("/auth");
      return;
    }
    setUser(JSON.parse(savedUser));

    const savedWorkspaces = localStorage.getItem("syncide_workspaces");
    if (savedWorkspaces) {
      setWorkspaces(JSON.parse(savedWorkspaces));
    } else {
      setWorkspaces(initialWorkspaces);
      localStorage.setItem("syncide_workspaces", JSON.stringify(initialWorkspaces));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("syncide_user");
    navigate("/");
  };

  const handleOpenWorkspace = (workspace) => {
    // Update last opened
    const updated = workspaces.map(ws => 
      ws.id === workspace.id 
        ? { ...ws, lastOpened: new Date().toISOString() }
        : ws
    );
    setWorkspaces(updated);
    localStorage.setItem("syncide_workspaces", JSON.stringify(updated));
    
    // Navigate to editor
    if (workspace.type === "realtime") {
      navigate(`/editor/${workspace.id}`);
    } else {
      navigate(`/editor-plain/${workspace.id}`);
    }
  };

  const handleDeleteWorkspace = (id) => {
    const updated = workspaces.filter(ws => ws.id !== id);
    setWorkspaces(updated);
    localStorage.setItem("syncide_workspaces", JSON.stringify(updated));
  };

  const filteredWorkspaces = workspaces.filter(ws => {
    const matchesSearch = ws.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || ws.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="SyncIDE" className="w-9 h-9" />
            <span className="text-xl font-bold text-white">SyncIDE</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workspaces..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-white/80 hidden sm:block">{user.name}</span>
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-lg font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-sm text-white/50">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link to="/account" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Account Settings</span>
                        </Link>
                        <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Preferences</span>
                        </Link>
                      </div>
                      <div className="p-2 border-t border-white/5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Welcome back, {user.name?.split(" ")[0]} 👋
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/50"
          >
            Continue working on your projects or create a new workspace
          </motion.p>
        </div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Total Workspaces", value: workspaces.length, icon: "📁", color: "emerald" },
            { label: "Real-time", value: workspaces.filter(w => w.type === "realtime").length, icon: "⚡", color: "cyan" },
            { label: "Plain Editors", value: workspaces.filter(w => w.type === "plain").length, icon: "📝", color: "violet" },
            { label: "Total Files", value: workspaces.reduce((acc, w) => acc + w.files, 0), icon: "📄", color: "amber" }
          ].map((stat, i) => (
            <div key={i} className="p-5 bg-[#111114] border border-white/5 rounded-2xl hover:border-white/10 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-${stat.color}-500/10 text-${stat.color}-400`}>
                  Active
                </span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-white/50">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Actions Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">Your Workspaces</h2>
            <span className="px-2.5 py-1 bg-white/5 rounded-lg text-sm text-white/50">
              {filteredWorkspaces.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
              {[
                { value: "all", label: "All" },
                { value: "realtime", label: "Real-time" },
                { value: "plain", label: "Plain" }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setFilterType(filter.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterType === filter.value
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
                </svg>
              </button>
            </div>

            {/* Create Button */}
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Workspace</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Workspaces Grid/List */}
        <AnimatePresence mode="wait">
          {filteredWorkspaces.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
                <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No workspaces found</h3>
              <p className="text-white/50 mb-6">
                {searchQuery ? "Try a different search term" : "Create your first workspace to get started"}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Workspace</span>
              </button>
            </motion.div>
          ) : viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredWorkspaces.map((workspace, i) => (
                <WorkspaceCard 
                  key={workspace.id} 
                  workspace={workspace} 
                  delay={i * 0.05}
                  onOpen={() => handleOpenWorkspace(workspace)}
                  onDelete={() => handleDeleteWorkspace(workspace.id)}
                  formatDate={formatDate}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredWorkspaces.map((workspace, i) => (
                <WorkspaceListItem 
                  key={workspace.id} 
                  workspace={workspace} 
                  delay={i * 0.05}
                  onOpen={() => handleOpenWorkspace(workspace)}
                  onDelete={() => handleDeleteWorkspace(workspace.id)}
                  formatDate={formatDate}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateWorkspace={(newWorkspace) => {
          const updated = [newWorkspace, ...workspaces];
          setWorkspaces(updated);
          localStorage.setItem("syncide_workspaces", JSON.stringify(updated));
          setShowCreateModal(false);
          handleOpenWorkspace(newWorkspace);
        }}
      />
    </div>
  );
}

// Workspace Card Component
function WorkspaceCard({ workspace, delay, onOpen, onDelete, formatDate }) {
  const [showMenu, setShowMenu] = useState(false);

  const languageIcons = {
    javascript: "🟨",
    typescript: "🔷",
    python: "🐍",
    html: "🌐",
    css: "🎨",
    java: "☕",
    go: "🔵",
    rust: "🦀"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative p-5 bg-[#111114] border border-white/5 rounded-2xl hover:border-white/10 transition-all cursor-pointer"
      onClick={onOpen}
    >
      {/* Color Accent */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ background: workspace.color }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: `${workspace.color}20` }}
          >
            {languageIcons[workspace.language] || "📁"}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
              {workspace.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                workspace.type === "realtime" 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "bg-blue-500/10 text-blue-400"
              }`}>
                {workspace.type === "realtime" ? "⚡ Real-time" : "📝 Plain"}
              </span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a1f] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Rename
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicate
                  </button>
                  <div className="border-t border-white/5" />
                  <button 
                    onClick={onDelete}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-white/50">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{workspace.files} files</span>
        </div>
        {workspace.type === "realtime" && (
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{workspace.collaborators}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
        <span>Last opened {formatDate(workspace.lastOpened)}</span>
        <span className="capitalize">{workspace.language}</span>
      </div>
    </motion.div>
  );
}

// Workspace List Item Component
function WorkspaceListItem({ workspace, delay, onOpen, onDelete, formatDate }) {
  const languageIcons = {
    javascript: "🟨",
    typescript: "🔷",
    python: "🐍",
    html: "🌐",
    css: "🎨",
    java: "☕",
    go: "🔵",
    rust: "🦀"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="group flex items-center gap-4 p-4 bg-[#111114] border border-white/5 rounded-xl hover:border-white/10 transition-all cursor-pointer"
      onClick={onOpen}
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: `${workspace.color}20` }}
      >
        {languageIcons[workspace.language] || "📁"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-medium truncate group-hover:text-emerald-400 transition-colors">
            {workspace.name}
          </h3>
          <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${
            workspace.type === "realtime" 
              ? "bg-emerald-500/10 text-emerald-400" 
              : "bg-blue-500/10 text-blue-400"
          }`}>
            {workspace.type === "realtime" ? "⚡ Real-time" : "📝 Plain"}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-white/40">
          <span>{workspace.files} files</span>
          {workspace.type === "realtime" && <span>{workspace.collaborators} collaborators</span>}
          <span>Last opened {formatDate(workspace.lastOpened)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onDelete}
          className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <button className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

// Create Workspace Modal Component
function CreateWorkspaceModal({ isOpen, onClose, onCreateWorkspace }) {
  const [step, setStep] = useState(1);
  const [workspaceType, setWorkspaceType] = useState(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isCreating, setIsCreating] = useState(false);

  const languages = [
    { id: "javascript", name: "JavaScript", icon: "🟨" },
    { id: "typescript", name: "TypeScript", icon: "🔷" },
    { id: "python", name: "Python", icon: "🐍" },
    { id: "html", name: "HTML/CSS", icon: "🌐" },
    { id: "java", name: "Java", icon: "☕" },
    { id: "go", name: "Go", icon: "🔵" },
    { id: "rust", name: "Rust", icon: "🦀" },
    { id: "cpp", name: "C++", icon: "⚙️" }
  ];

  const handleCreate = async () => {
    if (!workspaceName.trim()) return;
    
    setIsCreating(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899"];
    const newWorkspace = {
      id: "ws_" + Date.now(),
      name: workspaceName,
      type: workspaceType,
      language,
      createdAt: new Date().toISOString(),
      lastOpened: new Date().toISOString(),
      collaborators: workspaceType === "realtime" ? 1 : 0,
      files: 1,
      color: colors[Math.floor(Math.random() * colors.length)]
    };

    setIsCreating(false);
    onCreateWorkspace(newWorkspace);
    
    // Reset modal
    setStep(1);
    setWorkspaceType(null);
    setWorkspaceName("");
    setLanguage("javascript");
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStep(1);
      setWorkspaceType(null);
      setWorkspaceName("");
      setLanguage("javascript");
    }, 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-[#111114] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Create Workspace</h2>
                  <p className="text-sm text-white/50 mt-1">
                    {step === 1 ? "Choose your editor type" : "Configure your workspace"}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      {/* Real-time Option */}
                      <button
                        onClick={() => { setWorkspaceType("realtime"); setStep(2); }}
                        className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                          workspaceType === "realtime"
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-white/10 hover:border-white/20 bg-white/5"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-2xl shrink-0">
                            ⚡
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">Real-time Collaboration</h3>
                            <p className="text-sm text-white/50 mb-3">
                              Code together with your team in real-time. Includes video calls, multiple cursors, and live sync.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {["Live Sync", "Video Calls", "Multi-cursor", "Chat"].map(tag => (
                                <span key={tag} className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Plain Editor Option */}
                      <button
                        onClick={() => { setWorkspaceType("plain"); setStep(2); }}
                        className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                          workspaceType === "plain"
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-white/10 hover:border-white/20 bg-white/5"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-2xl shrink-0">
                            📝
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">Plain Editor</h3>
                            <p className="text-sm text-white/50 mb-3">
                              Simple, fast, and lightweight. Perfect for solo coding sessions and quick experiments.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {["Lightweight", "Fast", "Offline Ready", "Local Storage"].map(tag => (
                                <span key={tag} className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      {/* Selected Type Badge */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                          workspaceType === "realtime" 
                            ? "bg-emerald-500/20" 
                            : "bg-blue-500/20"
                        }`}>
                          {workspaceType === "realtime" ? "⚡" : "📝"}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">
                            {workspaceType === "realtime" ? "Real-time Collaboration" : "Plain Editor"}
                          </p>
                          <p className="text-xs text-white/40">Selected workspace type</p>
                        </div>
                        <button
                          onClick={() => setStep(1)}
                          className="ml-auto text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Change
                        </button>
                      </div>

                      {/* Workspace Name */}
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Workspace Name
                        </label>
                        <input
                          type="text"
                          value={workspaceName}
                          onChange={(e) => setWorkspaceName(e.target.value)}
                          placeholder="My Awesome Project"
                          className="w-full px-4 py-3 bg-[#0a0a0c] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                          autoFocus
                        />
                      </div>

                      {/* Language */}
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Primary Language
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {languages.map(lang => (
                            <button
                              key={lang.id}
                              onClick={() => setLanguage(lang.id)}
                              className={`p-3 rounded-xl border-2 text-center transition-all ${
                                language === lang.id
                                  ? "border-emerald-500 bg-emerald-500/10"
                                  : "border-white/10 hover:border-white/20 bg-white/5"
                              }`}
                            >
                              <span className="text-xl block mb-1">{lang.icon}</span>
                              <span className="text-xs text-white/70">{lang.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              {step === 2 && (
                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 text-white/60 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <motion.button
                    onClick={handleCreate}
                    disabled={!workspaceName.trim() || isCreating}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isCreating ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Create Workspace</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
