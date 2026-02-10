import { motion } from "framer-motion";
import {
  VscRemote,
  VscSourceControl,
  VscError,
  VscWarning,
  VscCheck,
  VscBell,
  VscSync,
} from "react-icons/vsc";

export default function StatusBar({ 
  language = "JavaScript", 
  line = 1, 
  column = 1,
  connected = true,
  syncing = false,
  errors = 0,
  warnings = 0,
  branch = "main"
}) {
  return (
    <motion.footer
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="h-6 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between px-2 text-[11px] text-neutral-400 select-none"
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <motion.div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer transition-colors ${
            connected 
              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" 
              : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <VscRemote className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </motion.div>

        {/* Sync Status */}
        {syncing && (
          <motion.div
            className="flex items-center gap-1 text-cyan-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <VscSync className="w-3.5 h-3.5" />
            </motion.div>
            <span className="hidden sm:inline">Syncing...</span>
          </motion.div>
        )}

        {/* Branch */}
        <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
          <VscSourceControl className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{branch}</span>
        </div>

        {/* Errors & Warnings */}
        <div className="flex items-center gap-2">
          <motion.div
            className={`flex items-center gap-1 cursor-pointer transition-colors ${
              errors > 0 ? "text-red-400" : "hover:text-white"
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <VscError className="w-3.5 h-3.5" />
            <span>{errors}</span>
          </motion.div>
          
          <motion.div
            className={`flex items-center gap-1 cursor-pointer transition-colors ${
              warnings > 0 ? "text-yellow-400" : "hover:text-white"
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <VscWarning className="w-3.5 h-3.5" />
            <span>{warnings}</span>
          </motion.div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Line & Column */}
        <div className="hover:text-white cursor-pointer transition-colors hidden sm:block">
          Ln {line}, Col {column}
        </div>

        {/* Spaces */}
        <div className="hover:text-white cursor-pointer transition-colors hidden md:block">
          Spaces: 2
        </div>

        {/* Encoding */}
        <div className="hover:text-white cursor-pointer transition-colors hidden md:block">
          UTF-8
        </div>

        {/* Language */}
        <motion.div
          className="hover:text-white cursor-pointer transition-colors"
          whileHover={{ scale: 1.02 }}
        >
          {language}
        </motion.div>

        {/* All Good Indicator */}
        <motion.div
          className="flex items-center gap-1 text-emerald-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <VscCheck className="w-3.5 h-3.5" />
        </motion.div>

        {/* Notifications */}
        <motion.div
          className="relative cursor-pointer hover:text-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <VscBell className="w-3.5 h-3.5" />
        </motion.div>
      </div>
    </motion.footer>
  );
}
