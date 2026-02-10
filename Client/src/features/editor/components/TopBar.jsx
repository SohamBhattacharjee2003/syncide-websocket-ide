import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  VscCopy,
  VscSignOut,
  VscBroadcast,
  VscChevronDown,
  VscPlay,
  VscSave,
  VscEllipsis,
  VscSplitHorizontal,
  VscAccount,
  VscGear,
  VscFeedback,
  VscQuestion,
  VscRemote,
  VscBell,
  VscDebugAlt,
  VscTerminal,
  VscColorMode,
  VscCheck,
  VscClose,
  VscSync,
  VscCloud,
  VscCloudDownload,
  VscCloudUpload,
  VscHistory,
  VscExtensions,
} from "react-icons/vsc";
import { HiOutlineVideoCamera, HiOutlineVideoCameraSlash } from "react-icons/hi2";
import UserAvatar from "./UserAvatar";
import logoImg from "../../../assets/logo.png";

export default function TopBar({ 
  roomId, 
  users = [], 
  onLeaveRoom,
  onSave,
  onRun,
  language = "JavaScript",
  onLanguageChange,
  fileName = "untitled.js",
  isInCall = false,
  onToggleVideoCall,
  onToggleTerminal,
  isSyncing = false,
  lastSaved = null,
}) {
  const [copied, setCopied] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  const languages = [
    { id: "javascript", label: "JavaScript", ext: ".js" },
    { id: "typescript", label: "TypeScript", ext: ".ts" },
    { id: "python", label: "Python", ext: ".py" },
    { id: "java", label: "Java", ext: ".java" },
    { id: "cpp", label: "C++", ext: ".cpp" },
    { id: "html", label: "HTML", ext: ".html" },
    { id: "css", label: "CSS", ext: ".css" },
    { id: "json", label: "JSON", ext: ".json" },
  ];

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-12 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-3 md:px-4 relative z-30"
    >
      {/* Left Section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            className="w-7 h-7 md:w-8 md:h-8 rounded-lg overflow-hidden flex items-center justify-center"
            animate={{ 
              rotate: 360,
              boxShadow: ["0 0 10px rgba(16,185,129,0.3)", "0 0 20px rgba(16,185,129,0.5)", "0 0 10px rgba(16,185,129,0.3)"]
            }}
            transition={{ 
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              boxShadow: { duration: 2, repeat: Infinity }
            }}
            whileHover={{ rotate: 0, scale: 1.1 }}
          >
            <motion.img 
              src={logoImg} 
              alt="SyncIDE" 
              className="w-full h-full object-contain"
            />
          </motion.div>
          <span className="font-semibold text-white text-sm md:text-base hidden sm:block">
            Sync<span className="text-emerald-400">IDE</span>
          </span>
        </motion.div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        {/* Room Info */}
        <div className="flex items-center gap-2">
          <motion.div
            className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors group"
            onClick={copyRoomId}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs md:text-sm text-neutral-300 font-mono max-w-[80px] md:max-w-[120px] truncate">
              {roomId || "No Room"}
            </span>
            <VscCopy className={`w-3.5 h-3.5 transition-colors ${copied ? "text-emerald-400" : "text-neutral-500 group-hover:text-neutral-300"}`} />
          </motion.div>

          {/* Copy feedback */}
          <AnimatePresence>
            {copied && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-emerald-400 text-xs hidden sm:block"
              >
                Copied!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Center Section - File Info & Actions */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
        {/* File Tab */}
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-t-lg border-b-2 border-emerald-400"
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className="text-sm text-white">{fileName}</span>
          <motion.div
            className="w-2 h-2 rounded-full bg-orange-400"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            title="Unsaved changes"
          />
        </motion.div>

        {/* Language Selector */}
        <div className="relative">
          <motion.button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-400 hover:text-white hover:bg-white/5 rounded transition-colors"
            whileHover={{ scale: 1.02 }}
          >
            {language}
            <VscChevronDown className={`w-3 h-3 transition-transform ${showLanguageMenu ? "rotate-180" : ""}`} />
          </motion.button>

          <AnimatePresence>
            {showLanguageMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-1 left-0 bg-neutral-900 border border-white/10 rounded-lg shadow-xl py-1 min-w-[140px] z-50"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      onLanguageChange?.(lang.id);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-sm hover:bg-white/5 transition-colors ${
                      language === lang.label ? "text-emerald-400" : "text-neutral-300"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Action Buttons - VS Code Style */}
        <div className="hidden md:flex items-center gap-1">
          {/* Save Button with Status */}
          <motion.button
            onClick={onSave}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Save (Ctrl+S)"
          >
            <VscSave className="w-4 h-4" />
            {isSyncing && (
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </motion.button>

          {/* Run Button */}
          <motion.button
            onClick={onRun}
            className="flex items-center gap-1 px-2.5 py-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Run Code (F5)"
          >
            <VscPlay className="w-4 h-4" />
            <span className="text-xs font-medium">Run</span>
          </motion.button>

          {/* Debug Button */}
          <motion.button
            className="p-2 text-neutral-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Debug (Ctrl+Shift+D)"
          >
            <VscDebugAlt className="w-4 h-4" />
          </motion.button>

          {/* Terminal Button */}
          <motion.button
            onClick={onToggleTerminal}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Toggle Terminal (Ctrl+`)"
          >
            <VscTerminal className="w-4 h-4" />
          </motion.button>

          {/* Split View */}
          <motion.button
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Split Editor (Ctrl+\\)"
          >
            <VscSplitHorizontal className="w-4 h-4" />
          </motion.button>

          {/* Video Call Button */}
          <motion.button
            onClick={onToggleVideoCall}
            className={`p-2 rounded-lg transition-colors ${
              isInCall 
                ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" 
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isInCall ? "Leave Video Call" : "Start Video Call"}
          >
            {isInCall ? (
              <HiOutlineVideoCamera className="w-4 h-4" />
            ) : (
              <HiOutlineVideoCameraSlash className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 hidden md:block" />

        {/* Sync Status */}
        <motion.div
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer hover:bg-white/5"
          title={isSyncing ? "Syncing..." : "All changes synced"}
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            animate={isSyncing ? { rotate: 360 } : {}}
            transition={{ duration: 1, repeat: isSyncing ? Infinity : 0, ease: "linear" }}
          >
            {isSyncing ? (
              <VscSync className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VscCloud className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </motion.div>
          <span className="text-[10px] text-neutral-400">
            {isSyncing ? "Syncing..." : lastSaved ? `Saved ${lastSaved}` : "Synced"}
          </span>
        </motion.div>

        {/* Live Indicator */}
        <motion.div
          className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded-full"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <VscBroadcast className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[10px] md:text-xs text-red-400 font-medium hidden sm:inline">LIVE</span>
        </motion.div>

        {/* Users */}
        <div className="flex items-center -space-x-2">
          <AnimatePresence>
            {users.slice(0, 4).map((user, index) => (
              <UserAvatar
                key={user.id || index}
                name={user.name}
                index={index}
                size="sm"
                isTyping={user.isTyping}
              />
            ))}
          </AnimatePresence>
          
          {users.length > 4 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-[10px] text-white font-medium ring-2 ring-neutral-900"
            >
              +{users.length - 4}
            </motion.div>
          )}

          {users.length === 0 && (
            <span className="text-xs text-neutral-500 ml-2 hidden sm:inline">Solo</span>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 hidden md:block" />

        {/* Notifications */}
        <div className="relative">
          <motion.button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <VscBell className="w-4 h-4" />
            {hasNotifications && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
              />
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl w-80 z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Notifications</span>
                  <button 
                    onClick={() => setHasNotifications(false)}
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <NotificationItem
                    icon={VscAccount}
                    title="Emma joined the room"
                    time="2 min ago"
                    color="emerald"
                  />
                  <NotificationItem
                    icon={VscCloudUpload}
                    title="Changes synced successfully"
                    time="5 min ago"
                    color="blue"
                  />
                  <NotificationItem
                    icon={VscExtensions}
                    title="New extension available"
                    time="1 hour ago"
                    color="purple"
                  />
                </div>
                <div className="p-2 border-t border-white/5">
                  <button className="w-full text-center text-xs text-neutral-400 hover:text-white py-1">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Account Menu */}
        <div className="relative">
          <motion.button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
              S
            </div>
            <VscChevronDown className={`w-3 h-3 text-neutral-400 transition-transform hidden md:block ${showAccountMenu ? "rotate-180" : ""}`} />
          </motion.button>

          <AnimatePresence>
            {showAccountMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl w-64 z-50 overflow-hidden"
              >
                {/* User Info */}
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                      SB
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">Soham Bhattacharjee</p>
                      <p className="text-xs text-neutral-400 truncate">soham@example.com</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
                      Pro Plan
                    </span>
                    <span className="text-[10px] text-neutral-500">•</span>
                    <span className="text-[10px] text-neutral-400">{users.length + 1} online</span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link to="/account">
                    <AccountMenuItem icon={VscAccount} label="My Account" />
                  </Link>
                  <AccountMenuItem icon={VscGear} label="Settings" shortcut="Ctrl+," />
                  <AccountMenuItem icon={VscColorMode} label="Theme" shortcut="Ctrl+K T" />
                  <AccountMenuItem icon={VscExtensions} label="Extensions" shortcut="Ctrl+Shift+X" />
                  <AccountMenuItem icon={VscHistory} label="Session History" />
                </div>

                <div className="border-t border-white/5 py-1">
                  <AccountMenuItem icon={VscFeedback} label="Send Feedback" />
                  <AccountMenuItem icon={VscQuestion} label="Help & Documentation" />
                  <AccountMenuItem icon={VscRemote} label="Remote Connection" connected />
                </div>

                <div className="border-t border-white/5 py-1">
                  <button 
                    onClick={onLeaveRoom}
                    className="w-full px-4 py-2 flex items-center gap-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <VscSignOut className="w-4 h-4" />
                    <span>Leave Room</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* More Menu (Mobile) */}
        <div className="relative md:hidden">
          <motion.button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <VscEllipsis className="w-4 h-4" />
          </motion.button>

          <AnimatePresence>
            {showMoreMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full right-0 mt-1 bg-neutral-900 border border-white/10 rounded-lg shadow-xl py-1 min-w-[160px] z-50"
              >
                <button
                  onClick={onSave}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/5 flex items-center gap-2"
                >
                  <VscSave className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={onRun}
                  className="w-full px-3 py-2 text-left text-sm text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2"
                >
                  <VscPlay className="w-4 h-4" />
                  Run
                </button>
                <button
                  onClick={onToggleTerminal}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/5 flex items-center gap-2"
                >
                  <VscTerminal className="w-4 h-4" />
                  Terminal
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button
                  onClick={copyRoomId}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/5 flex items-center gap-2"
                >
                  <VscCopy className="w-4 h-4" />
                  Copy Room ID
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button
                  onClick={onLeaveRoom}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <VscSignOut className="w-4 h-4" />
                  Leave Room
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Background blur effect on menus */}
      {(showLanguageMenu || showMoreMenu || showAccountMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowLanguageMenu(false);
            setShowMoreMenu(false);
            setShowAccountMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </motion.header>
  );
}

// Account Menu Item Component
function AccountMenuItem({ icon: Icon, label, shortcut, connected }) {
  return (
    <button className="w-full px-4 py-2 flex items-center justify-between text-sm text-neutral-300 hover:bg-white/5 transition-colors group">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-neutral-400 group-hover:text-white" />
        <span>{label}</span>
      </div>
      {shortcut && <span className="text-[10px] text-neutral-500 font-mono">{shortcut}</span>}
      {connected && (
        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Connected
        </span>
      )}
    </button>
  );
}

// Notification Item Component
function NotificationItem({ icon: Icon, title, time, color = "neutral" }) {
  const colorClasses = {
    emerald: "text-emerald-400 bg-emerald-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    neutral: "text-neutral-400 bg-white/5",
  };

  return (
    <div className="px-3 py-2.5 hover:bg-white/5 cursor-pointer transition-colors flex items-start gap-3">
      <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{title}</p>
        <p className="text-[10px] text-neutral-500">{time}</p>
      </div>
    </div>
  );
}
