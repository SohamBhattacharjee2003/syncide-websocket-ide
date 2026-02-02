import { motion } from "framer-motion";

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 bg-[#030303] flex items-center justify-center z-50">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-30"
          style={{
            background: "radial-gradient(ellipse at center, rgba(16,185,129,0.2) 0%, transparent 50%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex flex-col items-center gap-6"
      >
        {/* Logo */}
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <motion.svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </motion.svg>
          </div>
          
          {/* Orbiting dots */}
          <motion.div
            className="absolute -top-2 left-1/2 w-2 h-2 bg-emerald-400 rounded-full"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ transformOrigin: "50% 40px" }}
          />
          <motion.div
            className="absolute -top-2 left-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full"
            animate={{ 
              rotate: [120, 480],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{ transformOrigin: "50% 40px" }}
          />
          <motion.div
            className="absolute -top-2 left-1/2 w-1 h-1 bg-purple-400 rounded-full"
            animate={{ 
              rotate: [240, 600],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ transformOrigin: "50% 40px" }}
          />
        </motion.div>

        {/* Loading Bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Text */}
        <motion.p
          className="text-neutral-500 text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
}
