import { motion } from "framer-motion";

const colors = [
  "from-emerald-400 to-cyan-400",
  "from-purple-400 to-pink-400",
  "from-orange-400 to-red-400",
  "from-blue-400 to-indigo-400",
  "from-yellow-400 to-orange-400",
  "from-pink-400 to-rose-400",
];

export default function UserAvatar({ 
  name, 
  index = 0, 
  size = "md", 
  showStatus = true,
  isTyping = false,
  className = "" 
}) {
  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  
  const colorClass = colors[index % colors.length];
  
  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative group ${className}`}
    >
      {/* Avatar */}
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full bg-gradient-to-br ${colorClass}
          flex items-center justify-center font-semibold text-white
          ring-2 ring-neutral-900 shadow-lg cursor-pointer
          transition-all duration-200
        `}
      >
        {initials}
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <motion.div
          className="absolute -bottom-1 -right-1 flex gap-0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-emerald-400 rounded-full"
              animate={{ y: [0, -3, 0] }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Online status */}
      {showStatus && !isTyping && (
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-neutral-900"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {name}
        {isTyping && <span className="text-emerald-400 ml-1">typing...</span>}
      </div>
    </motion.div>
  );
}
