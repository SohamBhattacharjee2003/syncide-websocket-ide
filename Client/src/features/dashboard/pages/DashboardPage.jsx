import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../../assets/logo.png";

// Enhanced mock workspace data
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
    color: "#10b981",
    starred: true,
    description: "Admin dashboard with charts"
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
    color: "#3b82f6",
    starred: false,
    description: "Machine learning experiments"
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
    color: "#8b5cf6",
    starred: true,
    description: "Node.js REST API"
  },
  {
    id: "ws_demo_4",
    name: "Mobile App UI",
    type: "plain",
    language: "javascript",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    lastOpened: new Date(Date.now() - 86400000 * 2).toISOString(),
    collaborators: 2,
    files: 16,
    color: "#f59e0b",
    starred: false,
    description: "React Native components"
  }
];

// Sidebar menu items
const sidebarItems = [
  { id: "workspaces", label: "Workspaces", icon: "folder" },
  { id: "recent", label: "Recent", icon: "clock" },
  { id: "starred", label: "Starred", icon: "star" },
  { id: "shared", label: "Shared with me", icon: "users" },
  { id: "templates", label: "Templates", icon: "template" },
];

const bottomSidebarItems = [
  { id: "settings", label: "Settings", icon: "settings", path: "/settings" },
  { id: "help", label: "Help & Support", icon: "help" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("workspaces");
  const [viewMode, setViewMode] = useState("grid");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    const updated = workspaces.map(ws => 
      ws.id === workspace.id 
        ? { ...ws, lastOpened: new Date().toISOString() }
        : ws
    );
    setWorkspaces(updated);
    localStorage.setItem("syncide_workspaces", JSON.stringify(updated));
    
    if (workspace.type === "realtime") {
      navigate(`/editor/${workspace.id}`);
    } else {
      navigate(`/editor-plain/${workspace.id}`);
    }
  };

  const handleDeleteClick = (workspace) => {
    setWorkspaceToDelete(workspace);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (workspaceToDelete) {
      const updated = workspaces.filter(ws => ws.id !== workspaceToDelete.id);
      setWorkspaces(updated);
      localStorage.setItem("syncide_workspaces", JSON.stringify(updated));
      localStorage.removeItem(`syncide_code_${workspaceToDelete.id}`);
    }
    setShowDeleteModal(false);
    setWorkspaceToDelete(null);
  };

  const toggleStar = (workspaceId) => {
    const updated = workspaces.map(ws => 
      ws.id === workspaceId ? { ...ws, starred: !ws.starred } : ws
    );
    setWorkspaces(updated);
    localStorage.setItem("syncide_workspaces", JSON.stringify(updated));
  };

  const getFilteredWorkspaces = () => {
    let filtered = workspaces.filter(ws => 
      ws.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    switch (activeSection) {
      case "starred":
        return filtered.filter(ws => ws.starred);
      case "recent":
        return [...filtered].sort((a, b) => new Date(b.lastOpened) - new Date(a.lastOpened)).slice(0, 6);
      case "shared":
        return filtered.filter(ws => ws.type === "realtime" && ws.collaborators > 1);
      default:
        return filtered;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  const getSidebarIcon = (icon) => {
    const icons = {
      folder: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />,
      clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
      star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
      users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
      template: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />,
      settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
      help: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    };
    return icons[icon];
  };

  if (!user) return null;

  const filteredWorkspaces = getFilteredWorkspaces();

  return (
    <div className="h-screen flex bg-[#0a0a0c] overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        className={`${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 bg-[#0f0f12] border-r border-white/5 flex flex-col transition-all duration-300`}
        initial={false}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2.5 outline-none">
            <motion.img 
              src={logo} 
              alt="SyncIDE" 
              className="w-8 h-8"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            {!sidebarCollapsed && (
              <span className="text-lg font-bold text-white select-none">
                SyncIDE
              </span>
            )}
          </Link>
          {!sidebarCollapsed && (
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors outline-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* New Workspace Button */}
        <div className="p-3">
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all ${sidebarCollapsed ? 'px-2' : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {!sidebarCollapsed && <span>New Workspace</span>}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeSection === item.id
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {getSidebarIcon(item.icon)}
              </svg>
              {!sidebarCollapsed && <span>{item.label}</span>}
              {!sidebarCollapsed && item.id === "workspaces" && (
                <span className="ml-auto px-2 py-0.5 bg-white/10 rounded-md text-xs text-white/50">
                  {workspaces.length}
                </span>
              )}
              {!sidebarCollapsed && item.id === "starred" && (
                <span className="ml-auto px-2 py-0.5 bg-white/10 rounded-md text-xs text-white/50">
                  {workspaces.filter(w => w.starred).length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Items */}
        <div className="px-3 py-3 border-t border-white/5 space-y-1">
          {bottomSidebarItems.map((item) => (
            <Link
              key={item.id}
              to={item.path || "#"}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {getSidebarIcon(item.icon)}
              </svg>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        {/* User Section */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-white/5">
            <Link 
              to="/account"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
            </Link>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a0c]">
          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workspaces..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-all ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-all ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
                </svg>
              </button>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>

            {/* Account */}
            <Link to="/account" className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-white/5 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">
                {activeSection === "workspaces" ? "My Workspaces" : activeSection}
              </h1>
              <p className="text-sm text-white/50 mt-1">
                {filteredWorkspaces.length} {filteredWorkspaces.length === 1 ? 'workspace' : 'workspaces'}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          {activeSection === "workspaces" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
            >
              {[
                { label: "Total", value: workspaces.length, icon: "📁", color: "emerald" },
                { label: "Real-time", value: workspaces.filter(w => w.type === "realtime").length, icon: "⚡", color: "cyan" },
                { label: "Starred", value: workspaces.filter(w => w.starred).length, icon: "⭐", color: "amber" },
                { label: "Files", value: workspaces.reduce((acc, w) => acc + w.files, 0), icon: "📄", color: "violet" }
              ].map((stat, i) => (
                <div key={i} className="p-4 bg-[#111114] border border-white/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{stat.icon}</span>
                    <span className="text-xs text-white/40">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Templates Section */}
          {activeSection === "templates" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
            >
              {[
                { name: "React Starter", lang: "javascript", icon: "⚛️", desc: "React + Vite template" },
                { name: "Python Script", lang: "python", icon: "🐍", desc: "Basic Python setup" },
                { name: "Node.js API", lang: "typescript", icon: "🟢", desc: "Express REST API" },
                { name: "HTML/CSS", lang: "html", icon: "🌐", desc: "Static website" },
                { name: "Blank", lang: "javascript", icon: "📝", desc: "Empty workspace" },
                { name: "Algorithm Practice", lang: "python", icon: "🧮", desc: "DSA problems" },
              ].map((template, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setShowCreateModal(true)}
                  className="p-5 bg-[#111114] border border-white/5 rounded-xl hover:border-emerald-500/30 hover:bg-[#131316] transition-all text-left group"
                >
                  <span className="text-3xl mb-3 block">{template.icon}</span>
                  <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{template.name}</h3>
                  <p className="text-sm text-white/40 mt-1">{template.desc}</p>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Workspaces Grid/List */}
          {activeSection !== "templates" && (
            <AnimatePresence mode="wait">
              {filteredWorkspaces.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No workspaces found</h3>
                  <p className="text-sm text-white/50 mb-4">
                    {searchQuery ? "Try a different search" : "Create your first workspace"}
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Workspace
                  </button>
                </motion.div>
              ) : viewMode === "grid" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {filteredWorkspaces.map((workspace, i) => (
                    <WorkspaceCard 
                      key={workspace.id} 
                      workspace={workspace} 
                      delay={i * 0.03}
                      onOpen={() => handleOpenWorkspace(workspace)}
                      onDelete={() => handleDeleteClick(workspace)}
                      onToggleStar={() => toggleStar(workspace.id)}
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
                  className="space-y-2"
                >
                  {filteredWorkspaces.map((workspace, i) => (
                    <WorkspaceListItem 
                      key={workspace.id} 
                      workspace={workspace} 
                      delay={i * 0.03}
                      onOpen={() => handleOpenWorkspace(workspace)}
                      onDelete={() => handleDeleteClick(workspace)}
                      onToggleStar={() => toggleStar(workspace.id)}
                      formatDate={formatDate}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && workspaceToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => {
                setShowDeleteModal(false);
                setWorkspaceToDelete(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#111114] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-5">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Delete Workspace</h3>
                <p className="text-sm text-white/60 mb-4">
                  Delete <span className="font-medium text-white">"{workspaceToDelete.name}"</span>? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setWorkspaceToDelete(null);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Workspace Card Component
function WorkspaceCard({ workspace, delay, onOpen, onDelete, onToggleStar, formatDate }) {
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative p-4 bg-[#111114] border border-white/5 rounded-xl hover:border-white/10 transition-all cursor-pointer"
      onClick={onOpen}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
        style={{ background: workspace.color }}
      />

      <div className="flex items-start justify-between mb-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{ background: `${workspace.color}15` }}
        >
          {languageIcons[workspace.language] || "📁"}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
          className={`p-1.5 rounded-lg transition-all ${workspace.starred ? 'text-amber-400' : 'text-white/20 hover:text-white/40'}`}
        >
          <svg className="w-4 h-4" fill={workspace.starred ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>

      <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1 truncate">
        {workspace.name}
      </h3>
      
      {workspace.description && (
        <p className="text-xs text-white/40 mb-3 truncate">{workspace.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-white/40">
        <span className={`px-1.5 py-0.5 rounded ${
          workspace.type === "realtime" 
            ? "bg-emerald-500/10 text-emerald-400" 
            : "bg-blue-500/10 text-blue-400"
        }`}>
          {workspace.type === "realtime" ? "⚡" : "📝"}
        </span>
        <span>{formatDate(workspace.lastOpened)}</span>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute bottom-3 right-3 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </motion.div>
  );
}

// Workspace List Item Component
function WorkspaceListItem({ workspace, delay, onOpen, onDelete, onToggleStar, formatDate }) {
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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="group flex items-center gap-4 p-3 bg-[#111114] border border-white/5 rounded-xl hover:border-white/10 transition-all cursor-pointer"
      onClick={onOpen}
    >
      <div 
        className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xl"
        style={{ background: `${workspace.color}15` }}
      >
        {languageIcons[workspace.language] || "📁"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
            {workspace.name}
          </h3>
          <span className={`px-1.5 py-0.5 rounded text-xs ${
            workspace.type === "realtime" 
              ? "bg-emerald-500/10 text-emerald-400" 
              : "bg-blue-500/10 text-blue-400"
          }`}>
            {workspace.type === "realtime" ? "⚡" : "📝"}
          </span>
        </div>
        {workspace.description && (
          <p className="text-xs text-white/40 truncate">{workspace.description}</p>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-white/40">
        <span>{workspace.files} files</span>
        <span>{formatDate(workspace.lastOpened)}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
          className={`p-1.5 rounded-lg transition-all ${workspace.starred ? 'text-amber-400' : 'text-white/20 hover:text-white/40'}`}
        >
          <svg className="w-4 h-4" fill={workspace.starred ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

// Create Workspace Modal
function CreateWorkspaceModal({ isOpen, onClose, onCreateWorkspace }) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceType, setWorkspaceType] = useState("realtime");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [description, setDescription] = useState("");

  const languages = [
    { id: "javascript", name: "JavaScript", icon: "🟨" },
    { id: "typescript", name: "TypeScript", icon: "🔷" },
    { id: "python", name: "Python", icon: "🐍" },
    { id: "html", name: "HTML", icon: "🌐" },
    { id: "java", name: "Java", icon: "☕" },
    { id: "go", name: "Go", icon: "🔵" },
  ];

  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

  const handleCreate = () => {
    if (!workspaceName.trim()) return;
    
    const newWorkspace = {
      id: `ws_${Date.now()}`,
      name: workspaceName.trim(),
      type: workspaceType,
      language: selectedLanguage,
      createdAt: new Date().toISOString(),
      lastOpened: new Date().toISOString(),
      collaborators: 1,
      files: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      starred: false,
      description: description.trim() || null
    };

    onCreateWorkspace(newWorkspace);
    setWorkspaceName("");
    setDescription("");
    setWorkspaceType("realtime");
    setSelectedLanguage("javascript");
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#111114] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
      >
        <div className="p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Create Workspace</h2>
          <p className="text-sm text-white/50 mt-1">Start a new coding project</p>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Name</label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="My Project"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setWorkspaceType("realtime")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  workspaceType === "realtime"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <span className="text-lg mb-1 block">⚡</span>
                <span className="text-sm font-medium text-white">Real-time</span>
                <p className="text-xs text-white/40 mt-0.5">Collaborate live</p>
              </button>
              <button
                onClick={() => setWorkspaceType("plain")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  workspaceType === "plain"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <span className="text-lg mb-1 block">📝</span>
                <span className="text-sm font-medium text-white">Plain</span>
                <p className="text-xs text-white/40 mt-0.5">Solo editing</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Language</label>
            <div className="grid grid-cols-3 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    selectedLanguage === lang.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="text-lg">{lang.icon}</span>
                  <p className="text-xs text-white/60 mt-1">{lang.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-white/5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!workspaceName.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create
          </button>
        </div>
      </motion.div>
    </>
  );
}
