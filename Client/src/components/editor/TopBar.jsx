import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  VscCopy,
  VscSignOut,
  VscBroadcast,
  VscChevronDown,
  VscPlay,
  VscSave,
  VscEllipsis,
  VscSplitHorizontal,
} from "react-icons/vsc";
import { HiOutlineVideoCamera, HiOutlineVideoCameraSlash } from "react-icons/hi2";
import UserAvatar from "./UserAvatar";
import logoImg from "../../assets/logo.png";

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
}) {
  const [copied, setCopied] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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
        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-1">
          <motion.button
            onClick={onSave}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Save"
          >
            <VscSave className="w-4 h-4" />
          </motion.button>

          <motion.button
            onClick={onRun}
            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Run"
          >
            <VscPlay className="w-4 h-4" />
          </motion.button>

          <motion.button
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Split View"
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
            <span className="text-xs text-neutral-500 ml-2 hidden sm:inline">No collaborators</span>
          )}
        </div>

        {/* More Menu */}
        <div className="relative">
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
      {(showLanguageMenu || showMoreMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowLanguageMenu(false);
            setShowMoreMenu(false);
          }}
        />
      )}
    </motion.header>
  );
}
