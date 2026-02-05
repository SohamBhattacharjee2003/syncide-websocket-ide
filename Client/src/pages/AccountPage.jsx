import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  VscAccount,
  VscGear,
  VscKey,
  VscBell,
  VscColorMode,
  VscCode,
  VscGraph,
  VscHistory,
  VscShield,
  VscSignOut,
  VscArrowLeft,
  VscCheck,
  VscEdit,
  VscSave,
  VscClose,
  VscBroadcast,
} from "react-icons/vsc";
import {
  HiOutlineClock,
  HiOutlineFolder,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineCloud,
  HiOutlineLightningBolt,
} from "react-icons/hi";
import logoImg from "../assets/logo.png";

// Mock user data
const mockUser = {
  name: "Soham Bhattacharjee",
  email: "soham@example.com",
  avatar: null,
  plan: "Pro",
  joinedDate: "Jan 2024",
};

// Mock usage data
const mockUsage = {
  totalSessions: 156,
  hoursSpent: 234,
  filesCreated: 89,
  collaborators: 12,
  storageUsed: 2.4, // GB
  storageLimit: 10, // GB
  apiCalls: 8420,
  apiLimit: 10000,
};

// Mock recent sessions
const mockRecentSessions = [
  { id: 1, name: "React Dashboard", room: "ABC123", date: "2 hours ago", collaborators: 3 },
  { id: 2, name: "API Integration", room: "XYZ789", date: "Yesterday", collaborators: 2 },
  { id: 3, name: "Mobile App", room: "DEF456", date: "3 days ago", collaborators: 5 },
  { id: 4, name: "Backend Service", room: "GHI012", date: "1 week ago", collaborators: 1 },
];

// Sidebar navigation
const sidebarItems = [
  { id: "profile", icon: VscAccount, label: "Profile" },
  { id: "usage", icon: VscGraph, label: "Usage & Stats" },
  { id: "sessions", icon: VscHistory, label: "Recent Sessions" },
  { id: "settings", icon: VscGear, label: "Settings" },
  { id: "security", icon: VscShield, label: "Security" },
];

// Usage stat card component
function UsageCard({ icon: Icon, label, value, subtext, color = "emerald" }) {
  const colorClasses = {
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400",
    orange: "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400",
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
    pink: "from-pink-500/20 to-pink-600/5 border-pink-500/20 text-pink-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg bg-white/5 ${colorClasses[color].split(" ").pop()}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="mt-3 text-sm text-neutral-300">{label}</p>
      {subtext && <p className="text-xs text-neutral-500 mt-1">{subtext}</p>}
    </motion.div>
  );
}

// Progress bar component
function ProgressBar({ value, max, color = "emerald" }) {
  const percentage = (value / max) * 100;
  const colorClasses = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full ${colorClasses[color]} rounded-full`}
      />
    </div>
  );
}

// Profile Section
function ProfileSection({ user, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <VscAccount className="text-emerald-400" />
        Profile
      </h2>

      {/* Avatar Section */}
      <div className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/5">
        <div className="relative group">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white">
            {user.name.split(" ").map(n => n[0]).join("")}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-lg text-white shadow-lg"
          >
            <VscEdit className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSave}
                  className="p-2 bg-emerald-500 rounded-lg text-white"
                >
                  <VscSave className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditing(false)}
                  className="p-2 bg-red-500/20 rounded-lg text-red-400"
                >
                  <VscClose className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <VscEdit className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </div>
          <p className="text-neutral-400 mt-1">{user.email}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="px-3 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
              {user.plan} Plan
            </span>
            <span className="text-xs text-neutral-500">Member since {user.joinedDate}</span>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-neutral-400 mb-2">
            <HiOutlineCloud className="w-4 h-4" />
            <span className="text-sm">Storage</span>
          </div>
          <p className="text-lg font-semibold text-white">{mockUsage.storageUsed} GB / {mockUsage.storageLimit} GB</p>
          <ProgressBar value={mockUsage.storageUsed} max={mockUsage.storageLimit} color="emerald" />
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-neutral-400 mb-2">
            <HiOutlineLightningBolt className="w-4 h-4" />
            <span className="text-sm">API Calls</span>
          </div>
          <p className="text-lg font-semibold text-white">{mockUsage.apiCalls.toLocaleString()} / {mockUsage.apiLimit.toLocaleString()}</p>
          <ProgressBar value={mockUsage.apiCalls} max={mockUsage.apiLimit} color="blue" />
        </div>
      </div>
    </motion.div>
  );
}

// Usage Section
function UsageSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <VscGraph className="text-emerald-400" />
        Usage & Statistics
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <UsageCard
          icon={VscCode}
          label="Total Sessions"
          value={mockUsage.totalSessions}
          subtext="Coding sessions started"
          color="emerald"
        />
        <UsageCard
          icon={HiOutlineClock}
          label="Hours Spent"
          value={`${mockUsage.hoursSpent}h`}
          subtext="Active coding time"
          color="blue"
        />
        <UsageCard
          icon={HiOutlineDocumentText}
          label="Files Created"
          value={mockUsage.filesCreated}
          subtext="Across all projects"
          color="purple"
        />
        <UsageCard
          icon={HiOutlineUsers}
          label="Collaborators"
          value={mockUsage.collaborators}
          subtext="Unique team members"
          color="orange"
        />
        <UsageCard
          icon={HiOutlineFolder}
          label="Projects"
          value={24}
          subtext="Active workspaces"
          color="cyan"
        />
        <UsageCard
          icon={HiOutlineLightningBolt}
          label="API Requests"
          value={`${(mockUsage.apiCalls / 1000).toFixed(1)}k`}
          subtext="This month"
          color="pink"
        />
      </div>

      {/* Usage Chart Placeholder */}
      <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
        <h3 className="text-lg font-medium text-white mb-4">Activity This Week</h3>
        <div className="flex items-end justify-between h-40 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
            const height = [60, 80, 45, 90, 70, 30, 50][i];
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg"
                />
                <span className="text-xs text-neutral-500">{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// Sessions Section
function SessionsSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <VscHistory className="text-emerald-400" />
        Recent Sessions
      </h2>

      <div className="space-y-3">
        {mockRecentSessions.map((session, i) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.01, x: 5 }}
            className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center">
                <VscCode className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                  {session.name}
                </h4>
                <p className="text-sm text-neutral-500">
                  Room: <span className="font-mono text-neutral-400">{session.room}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-400">{session.date}</p>
              <p className="text-xs text-neutral-500">
                {session.collaborators} collaborator{session.collaborators !== 1 ? "s" : ""}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 text-sm text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
      >
        View All Sessions →
      </motion.button>
    </motion.div>
  );
}

// Settings Section
function SettingsSection() {
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    autoSave: true,
    fontSize: 14,
    tabSize: 2,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <VscGear className="text-emerald-400" />
        Settings
      </h2>

      {/* Appearance */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Appearance</h3>
        <div className="space-y-3">
          <SettingToggle
            icon={VscColorMode}
            label="Dark Mode"
            description="Use dark theme across the app"
            checked={settings.darkMode}
            onChange={() => toggleSetting("darkMode")}
          />
        </div>
      </div>

      {/* Editor */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Editor</h3>
        <div className="space-y-3">
          <SettingToggle
            icon={VscSave}
            label="Auto Save"
            description="Automatically save changes"
            checked={settings.autoSave}
            onChange={() => toggleSetting("autoSave")}
          />
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <VscCode className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-white">Font Size</p>
                <p className="text-sm text-neutral-500">Editor font size in pixels</p>
              </div>
            </div>
            <select
              value={settings.fontSize}
              onChange={(e) => setSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              {[12, 14, 16, 18, 20].map(size => (
                <option key={size} value={size} className="bg-neutral-900">{size}px</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Notifications</h3>
        <div className="space-y-3">
          <SettingToggle
            icon={VscBell}
            label="Push Notifications"
            description="Get notified about collaboration updates"
            checked={settings.notifications}
            onChange={() => toggleSetting("notifications")}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Setting Toggle Component
function SettingToggle({ icon: Icon, label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-neutral-400" />
        <div>
          <p className="text-white">{label}</p>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? "bg-emerald-500" : "bg-white/10"
        }`}
      >
        <motion.div
          animate={{ x: checked ? 24 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
        />
      </motion.button>
    </div>
  );
}

// Security Section
function SecuritySection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <VscShield className="text-emerald-400" />
        Security
      </h2>

      {/* Password */}
      <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <VscKey className="w-5 h-5 text-neutral-400" />
          <div>
            <p className="text-white font-medium">Password</p>
            <p className="text-sm text-neutral-500">Last changed 3 months ago</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors text-sm"
        >
          Change Password
        </motion.button>
      </div>

      {/* Two Factor */}
      <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VscShield className="w-5 h-5 text-neutral-400" />
            <div>
              <p className="text-white font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-neutral-500">Add an extra layer of security</p>
            </div>
          </div>
          <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
            Not enabled
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm"
        >
          Enable 2FA
        </motion.button>
      </div>

      {/* Active Sessions */}
      <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <VscBroadcast className="w-5 h-5 text-neutral-400" />
          <div>
            <p className="text-white font-medium">Active Sessions</p>
            <p className="text-sm text-neutral-500">Manage your logged-in devices</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-sm text-white">MacBook Pro - Chrome</span>
              <span className="text-xs text-neutral-500">Current session</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-neutral-400" />
              <span className="text-sm text-neutral-400">iPhone - Safari</span>
              <span className="text-xs text-neutral-500">2 days ago</span>
            </div>
            <button className="text-xs text-red-400 hover:text-red-300">Revoke</button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/20 space-y-4">
        <div className="flex items-center gap-3">
          <VscSignOut className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-red-400 font-medium">Danger Zone</p>
            <p className="text-sm text-neutral-500">Irreversible account actions</p>
          </div>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
          >
            Delete Account
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Main Account Page Component
export default function AccountPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const navigate = useNavigate();

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSection user={mockUser} />;
      case "usage":
        return <UsageSection />;
      case "sessions":
        return <SessionsSection />;
      case "settings":
        return <SettingsSection />;
      case "security":
        return <SecuritySection />;
      default:
        return <ProfileSection user={mockUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-neutral-200">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <VscArrowLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center gap-3">
              <motion.img
                src={logoImg}
                alt="SyncIDE"
                className="w-8 h-8"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-lg font-semibold text-white">
                Sync<span className="text-emerald-400">IDE</span>
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm"
          >
            <VscSignOut className="w-4 h-4" />
            <span>Sign Out</span>
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 shrink-0"
          >
            <div className="sticky top-24 space-y-2">
              {sidebarItems.map((item, i) => {
                const isActive = activeSection === item.id;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : ""}`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.aside>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 min-w-0"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
