import { motion } from 'framer-motion';

// Control Button Component for video controls
export default function CtrlBtn({ children, active, danger, onClick, title }) {
  return (
    <motion.button
      onClick={onClick}
      title={title}
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
