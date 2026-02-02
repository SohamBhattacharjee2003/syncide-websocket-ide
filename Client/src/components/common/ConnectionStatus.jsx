import { motion } from "framer-motion";

export default function ConnectionStatus({ isConnected, users = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-20 left-4 z-40"
    >
      <div
        className={`
          flex items-center gap-3 px-4 py-2 rounded-full backdrop-blur-sm border
          ${isConnected 
            ? "bg-emerald-500/10 border-emerald-500/20" 
            : "bg-red-500/10 border-red-500/20"
          }
        `}
      >
        {/* Connection dot */}
        <motion.div
          className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-400"}`}
          animate={isConnected ? { scale: [1, 1.2, 1] } : { opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* Status text */}
        <span className={`text-xs font-medium ${isConnected ? "text-emerald-400" : "text-red-400"}`}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>

        {/* User count */}
        {isConnected && users > 0 && (
          <>
            <div className="w-px h-3 bg-white/20" />
            <span className="text-xs text-neutral-400">
              {users} online
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
}
