import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VscTerminal, VscAdd, VscArrowRight } from "react-icons/vsc";

export default function JoinRoomModal({ isOpen, onClose }) {
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const generateRoomId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setIsCreating(true);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      // Store username in localStorage or context
      if (userName.trim()) {
        localStorage.setItem("syncide-username", userName);
      }
      navigate(`/editor/${roomId}`);
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"
              animate={{
                boxShadow: [
                  "0 0 10px rgba(16,185,129,0.3)",
                  "0 0 20px rgba(16,185,129,0.5)",
                  "0 0 10px rgba(16,185,129,0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <VscTerminal className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isCreating ? "Room Created!" : "Join or Create Room"}
              </h2>
              <p className="text-sm text-neutral-500">
                {isCreating
                  ? "Share this code with your team"
                  : "Start collaborating in real-time"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Room ID */}
          <div>
            <label className="block text-sm text-neutral-400 mb-2">
              Room ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                maxLength={6}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-center text-lg tracking-widest placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all uppercase"
              />
              <motion.button
                onClick={handleCreateRoom}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Generate new room"
              >
                <VscAdd className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Created Room Info */}
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-400">
                  Room created successfully!
                </span>
                <motion.button
                  onClick={() => navigator.clipboard.writeText(roomId)}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                  whileTap={{ scale: 0.95 }}
                >
                  Copy Code
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex gap-3">
          <motion.button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/5 text-neutral-400 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={handleJoinRoom}
            disabled={!roomId.trim()}
            className={`
              flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all
              ${roomId.trim()
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90"
                : "bg-white/5 text-neutral-600 cursor-not-allowed"
              }
            `}
            whileHover={roomId.trim() ? { scale: 1.01 } : {}}
            whileTap={roomId.trim() ? { scale: 0.99 } : {}}
          >
            Join Room
            <VscArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
